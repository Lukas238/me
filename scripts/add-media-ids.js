// Assigns a UUID to every entry in _data/media/ that has no id. Run by .github/workflows/media-complete.yml.
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const dir = path.join(__dirname, '..', '_data', 'media');

let added = 0;
for (const name of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const file = path.join(dir, name);
  const item = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!item.id) {
    item.id = randomUUID();
    fs.writeFileSync(file, JSON.stringify(item, null, 2) + '\n');
    added++;
  }
}

console.log(`Assigned ${added} new id(s)`);
