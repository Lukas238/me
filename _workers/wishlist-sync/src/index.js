/**
 * Cloudflare Worker: Wishlist inbox
 *
 * POST /  with header `X-Wishlist-Key` and JSON { title, tags, notes, cover, product_url }
 *         → commits it as a new file in _data/wishlist/ on GitHub, which rebuilds the site.
 *
 * KV (SITE_CONFIG): wishlist_key (the bookmarklet's X-Wishlist-Key), github_token (fine-grained, Contents: read/write on the repo)
 * Vars:    GITHUB_REPO ("owner/name"), GITHUB_BRANCH
 */

import { safeEqual, clean, commitJson, getConfig } from '../../shared/inbox.js';

const MAX = { title: 300, notes: 2000, url: 2048, tag: 30, tags: 10 };

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST' || new URL(request.url).pathname !== '/') {
      return json({ error: 'Not found' }, 404);
    }

    if (!(await safeEqual(request.headers.get('X-Wishlist-Key'), await getConfig(env, 'wishlist_key')))) {
      return json({ error: 'Unauthorized' }, 401);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }

    const item = normalize(data);
    if (item.error) return json({ error: item.error }, 400);

    try {
      const slug = item.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50).replace(/-+$/, '');
      const rand = crypto.randomUUID().slice(0, 6);
      const file = `_data/wishlist/${item.date_added}-${slug || 'item'}-${rand}.json`;
      const path = await commitJson(env, file, item, `Add wishlist item: ${item.title.slice(0, 60)}`);
      return json({ success: true, path, item });
    } catch (error) {
      console.error('GitHub commit failed:', error);
      return json({ error: 'Failed to save item' }, 502);
    }
  }
};

function cleanUrl(value) {
  const url = clean(value, MAX.url);
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

// Accepts "a, b; c" or ["a", "b"]; returns unique tags (case-insensitive), keeping the first spelling
function cleanTags(value) {
  const list = Array.isArray(value) ? value : String(value ?? '').split(/[,;]/);
  const seen = new Set();
  const tags = [];
  for (const raw of list) {
    const tag = clean(raw, MAX.tag);
    if (tag && !seen.has(tag.toLowerCase())) {
      seen.add(tag.toLowerCase());
      tags.push(tag);
    }
  }
  return tags.slice(0, MAX.tags);
}

function normalize(data) {
  const title = clean(data?.title, MAX.title);
  if (!title) return { error: 'title is required' };

  const product_url = cleanUrl(data.product_url);
  const cover = cleanUrl(data.cover);
  if (product_url === null || cover === null) return { error: 'URLs must be http(s)' };

  return {
    date_added: new Date().toISOString().slice(0, 10),
    title,
    tags: cleanTags(data.tags),
    notes: clean(data.notes, MAX.notes),
    cover,
    product_url
  };
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Wishlist-Key'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}
