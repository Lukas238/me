// Assigns a UUID to every entry in _data/media.json that has no id. Run by .github/workflows/media-ids.yml.
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const file = path.join(__dirname, '..', '_data', 'media.json');
const items = JSON.parse(fs.readFileSync(file, 'utf8'));

let added = 0;
for (const item of items) {
  if (!item.id) {
    item.id = randomUUID();
    added++;
  }
}

if (added > 0) {
  fs.writeFileSync(file, JSON.stringify(items, null, 2) + '\n');
}
console.log(`Assigned ${added} new id(s)`);
