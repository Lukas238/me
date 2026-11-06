// Reads the repo's .env (git-ignored) into an object; real environment variables win.
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const vars = {};
  const file = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match) vars[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...vars, ...process.env };
}

module.exports = { loadEnv };
