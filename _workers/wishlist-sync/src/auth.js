/**
 * Owner auth via WebAuthn passkey (Touch ID / Face ID / Windows Hello).
 *
 * Stateless: challenges and session tokens are HMAC-signed with env.SESSION_SECRET.
 * Registered passkeys live in env.PASSKEYS as JSON: [{ "id": "<b64url>", "publicKey": "<b64url SPKI>" }]
 * Allowed site origins live in env.ALLOWED_ORIGINS (comma separated).
 */

const enc = new TextEncoder();
const CHALLENGE_TTL_MS = 2 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function b64uEncode(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64uDecode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)), c => c.charCodeAt(0));
}

async function hmacKey(secret, usages) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usages);
}

async function sign(secret, data) {
  const key = await hmacKey(secret, ['sign']);
  return b64uEncode(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

async function isValidSignature(secret, data, sig) {
  try {
    const key = await hmacKey(secret, ['verify']);
    return await crypto.subtle.verify('HMAC', key, b64uDecode(sig), enc.encode(data));
  } catch {
    return false;
  }
}

// WebAuthn returns ASN.1 DER ECDSA signatures; WebCrypto expects raw r||s
function derToRaw(der) {
  let offset = 2; // 0x30 len
  if (der[1] & 0x80) offset += der[1] & 0x7f;
  const readInt = () => {
    const len = der[offset + 1];
    let int = der.slice(offset + 2, offset + 2 + len);
    offset += 2 + len;
    while (int.length > 32 && int[0] === 0) int = int.slice(1);
    const out = new Uint8Array(32);
    out.set(int, 32 - int.length);
    return out;
  };
  const r = readInt();
  const s = readInt();
  return Uint8Array.from([...r, ...s]);
}

export async function createChallenge(env) {
  const payload = `${Date.now()}.${b64uEncode(crypto.getRandomValues(new Uint8Array(12)))}`;
  return `${payload}.${await sign(env.SESSION_SECRET, payload)}`;
}

async function isFreshChallenge(env, challenge) {
  const [ts, nonce, sig] = (challenge || '').split('.');
  if (!ts || !nonce || !sig) return false;
  if (!(await isValidSignature(env.SESSION_SECRET, `${ts}.${nonce}`, sig))) return false;
  return Date.now() - Number(ts) < CHALLENGE_TTL_MS;
}

/**
 * Verify a WebAuthn assertion and return a session token, or null.
 * @param {object} body - { challenge, credentialId, clientDataJSON, authenticatorData, signature } (b64url except challenge)
 */
export async function loginWithPasskey(env, body) {
  try {
    if (!env.SESSION_SECRET) return null;
    const passkey = JSON.parse(env.PASSKEYS || '[]').find(p => p.id === body.credentialId);
    if (!passkey || !(await isFreshChallenge(env, body.challenge))) return null;

    const clientDataBytes = b64uDecode(body.clientDataJSON);
    const clientData = JSON.parse(new TextDecoder().decode(clientDataBytes));
    const origins = (env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);

    if (clientData.type !== 'webauthn.get') return null;
    if (clientData.challenge !== b64uEncode(enc.encode(body.challenge))) return null;
    if (!origins.includes(clientData.origin)) return null;

    const authData = b64uDecode(body.authenticatorData);
    const rpIdHash = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(new URL(clientData.origin).hostname)));
    if (!rpIdHash.every((b, i) => b === authData[i])) return null;
    // User present (0x01) and user verified (0x04): the fingerprint/PIN was actually checked
    if ((authData[32] & 0x05) !== 0x05) return null;

    const clientDataHash = new Uint8Array(await crypto.subtle.digest('SHA-256', clientDataBytes));
    const signedData = new Uint8Array([...authData, ...clientDataHash]);
    const publicKey = await crypto.subtle.importKey(
      'spki', b64uDecode(passkey.publicKey), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']
    );
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' }, publicKey, derToRaw(b64uDecode(body.signature)), signedData
    );
    if (!valid) return null;

    return await issueSession(env);
  } catch (error) {
    console.error('Passkey login error:', error);
    return null;
  }
}

async function issueSession(env) {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${await sign(env.SESSION_SECRET, exp)}`;
}

async function digest(value) {
  return crypto.subtle.digest('SHA-256', enc.encode(String(value)));
}

/**
 * Check user/password against secrets OWNER_USER and OWNER_PASSWORD; returns a session token or null.
 */
export async function loginWithPassword(env, { username, password }) {
  if (!env.SESSION_SECRET || !env.OWNER_USER || !env.OWNER_PASSWORD) return null;
  const [u, p, eu, ep] = await Promise.all([
    digest(username), digest(password), digest(env.OWNER_USER), digest(env.OWNER_PASSWORD)
  ]);
  // Compare both fields before deciding so timing doesn't reveal which one failed
  const okUser = crypto.subtle.timingSafeEqual(u, eu);
  const okPass = crypto.subtle.timingSafeEqual(p, ep);
  return okUser && okPass ? issueSession(env) : null;
}

/** Check the session token in `Authorization: Bearer ...`. */
export async function verifyOwner(request, env) {
  if (!env.SESSION_SECRET) return false;
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return isValidSignature(env.SESSION_SECRET, exp, sig);
}
