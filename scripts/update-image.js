const fs = require('fs');
const path = require('path');

const [imageId, keywords, keywordsAi, keywordsAiExtra] = process.argv.slice(2);

if (!imageId || !keywords || !keywordsAi || !keywordsAiExtra) {
  console.log('Usage: node update-image.js "image__id" "kw1,kw2" "kw_ai1,kw_ai2" "extra1,extra2"');
  process.exit(1);
}

const dataPath = path.join(__dirname, '..', '_data', 'bidassoa.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const entry = data.find(item => item.id === imageId);
if (entry) {
  entry.keywords = keywords.split(',');
  entry.keywords_ai = keywordsAi.split(',');
  entry.keywords_ai_extra = keywordsAiExtra.split(',');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ ${entry.id}`);
} else {
  console.log(`✗ No encontrado: ${imageId}`);
  process.exit(1);
}
