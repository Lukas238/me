// Helpers shared by the inbox workers (wishlist, comments).
const enc = new TextEncoder();

// Compares SHA-256 digests so the check is constant-time and length-independent
export async function safeEqual(provided, expected) {
  if (!provided || !expected) return false;
  const [a, b] = (await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(String(provided))),
    crypto.subtle.digest('SHA-256', enc.encode(String(expected)))
  ])).map(buf => new Uint8Array(buf));
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Strips control characters (keeps tab/newline), trims and truncates
export function clean(value, max) {
  // eslint-disable-next-line no-control-regex
  return String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
}

// Shared config lives in the SITE_CONFIG KV namespace (github_token, family_code); edge-cached ~60s
export async function getConfig(env, key) {
  const value = await env.SITE_CONFIG.get(key);
  return value ? value.trim() : null;
}

function toBase64(text) {
  let binary = '';
  for (const byte of enc.encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function contentsUrl(env, path) {
  return `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`;
}

async function githubHeaders(env) {
  const token = await getConfig(env, 'github_token');
  if (!token) throw new Error('KV key "github_token" is missing in SITE_CONFIG');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'site-inbox-worker',
    'Content-Type': 'application/json'
  };
}

async function putFile(env, headers, path, data, message) {
  return fetch(contentsUrl(env, path), {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message,
      content: toBase64(JSON.stringify(data, null, 2) + '\n'),
      branch: env.GITHUB_BRANCH
    })
  });
}

// Creates a new file; a unique path per call means no sha lookup and no write conflicts
export async function commitJson(env, path, data, message) {
  const response = await putFile(env, await githubHeaders(env), path, data, message);
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }
  return path;
}
