/**
 * Cloudflare Worker: Comments inbox
 *
 * POST /  JSON { kind, target, comment, author, rating?, code, website }
 *   kind     which kind of comment this is; must be one of KINDS below
 *   target   id of the thing commented on (validated per kind)
 *   code     shared family code (KV key family_code)
 *   website  honeypot, must stay empty
 *   → commits <kind dir>/<timestamp>-<target>-<rand>.json to GitHub, which rebuilds the site.
 *
 * KV (SITE_CONFIG): family_code, github_token (fine-grained, Contents: read/write on the repo)
 * Vars:    GITHUB_REPO, GITHUB_BRANCH, ALLOWED_ORIGINS (comma separated)
 * Bindings: IP_LIMITER, GLOBAL_LIMITER (rate limiting, optional when running locally)
 *
 * To support a new kind of comment, add an entry to KINDS.
 */

import { safeEqual, clean, commitJson, getConfig } from '../../shared/inbox.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const KINDS = {
  media: { dir: '_data/comments/media', targetField: 'media_id', targetPattern: UUID, rating: true },
  bidassoa: { dir: '_data/comments/bidassoa', targetField: 'photo_id', targetPattern: /^[\w.-]{1,80}$/, rating: false }
};

const MAX = { comment: 1000, author: 50, body: 8 * 1024 };

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);

    // Browsers always send Origin on cross-origin POSTs; reject any that isn't the site
    if (origin && !allowed.includes(origin)) return json({ error: 'Forbidden' }, 403, null);
    const cors = origin;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(cors) });
    }
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/') {
      return json({ error: 'Not found' }, 404, cors);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!(await withinLimits(env, ip))) return json({ error: 'Too many requests' }, 429, cors);

    const length = Number(request.headers.get('Content-Length') || 0);
    if (length > MAX.body) return json({ error: 'Payload too large' }, 413, cors);

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    // Bots fill the hidden field; answer as if it worked and store nothing
    if (clean(data?.website, 100)) return json({ success: true }, 200, cors);

    if (!(await safeEqual(clean(data?.code, 100), await getConfig(env, 'family_code')))) {
      return json({ error: 'Invalid code' }, 401, cors);
    }

    const record = normalize(data);
    if (record.error) return json({ error: record.error }, 400, cors);

    try {
      const kind = KINDS[data.kind];
      const stamp = record.timestamp.replace(/[-:]/g, '').replace('T', '-');
      const rand = crypto.randomUUID().slice(0, 6);
      const path = `${kind.dir}/${stamp}-${record[kind.targetField].slice(0, 8)}-${rand}.json`;
      await commitJson(env, path, record, `Add ${data.kind} comment`);
      return json({ success: true }, 200, cors);
    } catch (error) {
      console.error('GitHub commit failed:', error);
      return json({ error: 'Failed to save comment' }, 502, cors);
    }
  }
};

// Limiter bindings are optional so the worker also runs without them locally
async function withinLimits(env, ip) {
  for (const [limiter, key] of [[env.IP_LIMITER, ip], [env.GLOBAL_LIMITER, 'all']]) {
    if (limiter && !(await limiter.limit({ key })).success) return false;
  }
  return true;
}

function normalize(data) {
  const kind = KINDS[data?.kind];
  if (!kind) return { error: 'Unknown kind' };

  const target = clean(data.target, 100);
  if (!kind.targetPattern.test(target)) return { error: 'Invalid target' };

  const comment = clean(data.comment, MAX.comment);
  if (!comment) return { error: 'comment is required' };

  const record = {
    [kind.targetField]: target,
    comment,
    author: clean(data.author, MAX.author) || 'Anónimo',
    timestamp: localTimestamp()
  };

  if (kind.rating) {
    const rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'rating must be 1-5' };
    record.rating = rating;
  }
  return record;
}

// Same naive local time format as the existing comment files (YYYY-MM-DDTHH:MM:SS)
function localTimestamp() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).format(new Date()).replace(' ', 'T');
}

function corsHeaders(origin) {
  return {
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
  });
}
