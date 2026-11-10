#!/usr/bin/env node
// Completes the entries of _data/media.json that are missing TMDb data (tmdb_id, poster, tags, rating).
// Add { "title": "...", "year": "1984" } (optionally "type": "series") and run this script.
//
//   node scripts/fetch-tmdb.js [--dry-run] [--limit N] [--file path/to/media.json]
//
// --limit N stops after N entries are completed (not-found ones don't count), so a big list can be done in batches.
//
// Token: a TMDb "API Read Access Token" in the TMDB_TOKEN env var or in a .env file at the repo root.

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { loadEnv } = require('./lib/env');

const LANG = loadEnv().TMDB_LANG || 'en-US';
const COUNTRY = 'US'; // certification source for the age rating
const FIELD_ORDER = ['id', 'type', 'status', 'watched', 'favorite', 'title', 'title_es', 'year', 'rating', 'tags', 'tmdb_id', 'tmdb_poster_url'];

const MOVIE_AGE = { G: '0+', PG: '7+', 'PG-13': '13+', R: '17+', 'NC-17': '18+' };
const TV_AGE = { 'TV-Y': '0+', 'TV-Y7': '7+', 'TV-G': '0+', 'TV-PG': '10+', 'TV-14': '14+', 'TV-MA': '17+' };

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fileArg = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
const limitArg = args.find(a => a.startsWith('--limit'));
const limit = limitArg ? Number(limitArg.includes('=') ? limitArg.split('=')[1] : args[args.indexOf('--limit') + 1]) : Infinity;
if (!(limit >= 1) || (limit !== Infinity && !Number.isInteger(limit))) {
  console.error('--limit needs a positive whole number, e.g. --limit 20');
  process.exit(1);
}
const mediaFile = path.resolve(fileArg || path.join(__dirname, '..', '_data', 'media.json'));

const isEmpty = value => value === undefined || value === null || value === '';
const norm = text => String(text || '').trim().toLowerCase();

const env = loadEnv();
const token = (env.TMDB_TOKEN || '').trim();

async function tmdb(pathname, params = {}, retry = true) {
  const url = new URL('https://api.themoviedb.org/3' + pathname);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, accept: 'application/json' } });
  if (res.status === 401) throw new Error('TMDb rejected the token (401). Check TMDB_TOKEN.');
  if (res.status === 404) return null;
  if (res.status === 429 && retry) {
    await new Promise(resolve => setTimeout(resolve, (Number(res.headers.get('retry-after')) || 2) * 1000));
    return tmdb(pathname, params, false);
  }
  if (!res.ok) throw new Error(`TMDb answered ${res.status} for ${pathname}`);
  return res.json();
}

const kindOf = type => {
  const t = norm(type);
  if (['series', 'tv', 'show'].includes(t)) return 'tv';
  if (t === 'movie') return 'movie';
  return null;
};

const yearOf = result => Number(String(result.release_date || result.first_air_date || '').slice(0, 4)) || null;

// Best search hit: exact title first, otherwise TMDb's top result
function pickResult(results, title) {
  const wanted = norm(title);
  const names = r => [r.title, r.original_title, r.name, r.original_name].map(norm);
  return results.find(r => names(r).includes(wanted)) || results[0] || null;
}

async function search(kind, title, year) {
  const base = { query: title, language: LANG, include_adult: 'false' };
  const withYear = await tmdb(`/search/${kind}`, year ? { ...base, [kind === 'tv' ? 'first_air_date_year' : 'year']: year } : base);
  if (withYear && withYear.results.length) return pickResult(withYear.results, title);

  // The year in the list may be off by one (festival vs release): retry without it, but only accept a close year
  if (!year) return null;
  const loose = await tmdb(`/search/${kind}`, base);
  const close = (loose ? loose.results : []).filter(r => Math.abs((yearOf(r) || 0) - Number(year)) <= 1);
  return close.length ? pickResult(close, title) : null;
}

async function details(kind, id) {
  return tmdb(`/${kind}/${encodeURIComponent(id)}`, {
    language: LANG,
    append_to_response: kind === 'tv' ? 'content_ratings' : 'release_dates'
  });
}

function ageRating(kind, data) {
  if (kind === 'tv') {
    const entry = (data.content_ratings?.results || []).find(r => r.iso_3166_1 === COUNTRY);
    return TV_AGE[(entry?.rating || '').toUpperCase()] || '';
  }
  const entry = (data.release_dates?.results || []).find(r => r.iso_3166_1 === COUNTRY);
  const cert = (entry?.release_dates || []).map(r => (r.certification || '').trim()).find(Boolean);
  return MOVIE_AGE[(cert || '').toUpperCase()] || '';
}

// An entry needs a lookup while any of the TMDb fields is missing
const needsLookup = item => isEmpty(item.tmdb_id) || isEmpty(item.tmdb_poster_url) || isEmpty(item.tags);

// Finds the TMDb entry: by id when the list already has one, otherwise by title + year (movie first when the type is not given)
async function resolve(item) {
  const known = kindOf(item.type);
  const kinds = known ? [known] : ['movie', 'tv'];

  for (const kind of kinds) {
    if (!isEmpty(item.tmdb_id)) {
      const data = await details(kind, item.tmdb_id);
      if (data) return { kind, data };
      continue;
    }
    const hit = await search(kind, item.title, item.year);
    if (hit) return { kind, data: await details(kind, hit.id) };
  }
  return null;
}

// Only empty fields are filled, so anything edited by hand is kept
function fill(item, kind, data) {
  const next = { ...item };
  const set = (field, value) => { if (isEmpty(next[field]) && !isEmpty(value)) next[field] = value; };

  set('id', randomUUID());
  set('type', kind === 'tv' ? 'series' : 'movie');
  if (next.status === undefined) next.status = '';
  if (next.watched === undefined) next.watched = false;
  if (next.favorite === undefined) next.favorite = false;
  set('rating', ageRating(kind, data));
  set('tags', (data.genres || []).map(g => g.name).join('; '));
  set('tmdb_id', String(data.id));
  set('tmdb_poster_url', (data.poster_path || '').replace(/^\/+/, ''));

  const ordered = {};
  FIELD_ORDER.forEach(field => { if (field in next) ordered[field] = next[field]; });
  Object.keys(next).forEach(field => { if (!(field in ordered)) ordered[field] = next[field]; });
  return ordered;
}

async function main() {
  if (!token) {
    console.error('Missing TMDB_TOKEN. Set it as an env var or in .env (TMDB_TOKEN=...).');
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(mediaFile, 'utf8'));
  const pending = items.filter(item => !isEmpty(item.title) && needsLookup(item));
  if (!pending.length) {
    console.log('Nothing to complete.');
    return;
  }

  let updated = 0;
  const notFound = [];

  for (const item of pending) {
    if (updated >= limit) break;
    const label = `${item.title} (${item.year || '?'})`;
    if (isEmpty(item.year) && isEmpty(item.tmdb_id)) {
      console.log(`- ${label}: needs a year or a tmdb_id, skipped`);
      notFound.push(label);
      continue;
    }

    const found = await resolve(item);
    if (!found) {
      console.log(`x ${label}: not found on TMDb`);
      notFound.push(label);
      continue;
    }

    const next = fill(item, found.kind, found.data);
    const duplicate = items.find(other => other !== item && String(other.tmdb_id) === next.tmdb_id && kindOf(other.type) === kindOf(next.type));
    items[items.indexOf(item)] = next;
    updated++;

    console.log(`+ ${label} -> ${next.type} #${next.tmdb_id} | ${next.tags || 'no genres'} | ${next.rating || 'no rating'}`);
    if (!next.rating) console.log('    no US certification on TMDb, rating left empty');
    if (!next.tmdb_poster_url) console.log('    no poster on TMDb');
    if (duplicate) console.log(`    already in the list as "${duplicate.title}"`);
  }

  if (updated && !dryRun) fs.writeFileSync(mediaFile, JSON.stringify(items, null, 2) + '\n');
  console.log(`\n${updated} completed, ${notFound.length} not found${dryRun ? ' (dry run, nothing written)' : ''}`);
  const left = pending.length - updated - notFound.length;
  if (updated >= limit && left > 0) console.log(`${left} still pending, run it again for the next batch`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
