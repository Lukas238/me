// Builds the bookmarklet with your WISHLIST_KEY and prints it, ready to paste as a bookmark URL.
// Usage: node scripts/build-bookmarklet.js
// The key comes from WISHLIST_KEY in the env or in .env (git-ignored); if missing it is asked for.
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');
const { loadEnv } = require('./lib/env');

async function getKey() {
  const fromEnv = loadEnv().WISHLIST_KEY;
  if (fromEnv) return fromEnv.trim();
  // Prompt goes to stderr so stdout carries only the bookmarklet
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  const key = await new Promise(resolve => rl.question('WISHLIST_KEY: ', resolve));
  rl.close();
  return key.trim();
}

(async () => {
  const key = await getKey();
  if (!key) {
    console.error('A key is required.');
    process.exit(1);
  }

  const file = path.join(__dirname, '..', '_workers', 'bookmarklet-source.js');
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('__WISHLIST_KEY__')) {
    console.error('Placeholder __WISHLIST_KEY__ not found in bookmarklet-source.js');
    process.exit(1);
  }

  const code = source.replace('__WISHLIST_KEY__', () => key.replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
  const bookmarklet = 'javascript:' + encodeURIComponent(code);

  console.log(bookmarklet);

  // Convenience on macOS when printing to a terminal
  if (process.stdout.isTTY && spawnSync('pbcopy', { input: bookmarklet }).status === 0) {
    console.error('\nCopied to the clipboard. Paste it as the URL of a new bookmark.');
  }
})();
