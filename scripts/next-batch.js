const fs = require('fs');
const path = require('path');

const BIDASSOA_JSON = path.join(__dirname, '../_data/bidassoa.json');
const BATCH_DIR = path.join(__dirname, 'batch');
const BATCH_STATE = path.join(__dirname, 'batch-state.json');
const IMAGES_DIR = path.join(__dirname, '../assets/bidassoa/');
const BATCH_SIZE = 8;

// Crear directorio batch si no existe
if (!fs.existsSync(BATCH_DIR)) {
  fs.mkdirSync(BATCH_DIR, { recursive: true });
}

// Cargar o crear estado de batches
function loadBatchState() {
  if (fs.existsSync(BATCH_STATE)) {
    return JSON.parse(fs.readFileSync(BATCH_STATE, 'utf8'));
  }

  // Crear estado inicial
  const bidassoa = JSON.parse(fs.readFileSync(BIDASSOA_JSON, 'utf8'));
  const pending = bidassoa.filter(item => !item.keywords_ai || item.keywords_ai.length === 0);

  const batches = [];
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    batches.push({
      id: Math.floor(i / BATCH_SIZE) + 1,
      items: pending.slice(i, i + BATCH_SIZE),
      status: 'pending' // pending | in-progress | completed
    });
  }

  const state = {
    batches,
    currentBatchIndex: 0,
    totalImages: pending.length
  };

  fs.writeFileSync(BATCH_STATE, JSON.stringify(state, null, 2));
  return state;
}

// Guardar estado
function saveBatchState(state) {
  fs.writeFileSync(BATCH_STATE, JSON.stringify(state, null, 2));
}

// Main
function nextBatch() {
  const state = loadBatchState();

  console.log('\n' + '='.repeat(60));
  console.log('📦 BATCH MANAGER');
  console.log('='.repeat(60));
  console.log(`Total imágenes pendientes: ${state.totalImages}`);
  console.log(`Total batches: ${state.batches.length}`);
  console.log(`Batch actual: ${state.currentBatchIndex + 1}/${state.batches.length}\n`);

  // Buscar el batch actual
  const currentBatch = state.batches[state.currentBatchIndex];

  if (!currentBatch) {
    console.log('✅ ¡Todos los batches completados!');
    return;
  }

  // Si el batch actual está "in-progress", verificar si ya se completó
  if (currentBatch.status === 'in-progress') {
    const bidassoa = JSON.parse(fs.readFileSync(BIDASSOA_JSON, 'utf8'));

    // Verificar si todos los items del batch tienen keywords_ai
    const allCompleted = currentBatch.items.every(item => {
      const found = bidassoa.find(b => b.id === item.id);
      return found && found.keywords_ai && found.keywords_ai.length > 0;
    });

    if (allCompleted) {
      console.log(`✅ Batch ${currentBatch.id} completado!`);
      currentBatch.status = 'completed';
      state.currentBatchIndex++;
      saveBatchState(state);

      // Limpiar carpeta batch
      const files = fs.readdirSync(BATCH_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(BATCH_DIR, file));
      });
      console.log('🗑️  Carpeta batch limpiada\n');

      // Recursión para siguiente batch
      return nextBatch();
    } else {
      console.log(`⏳ Batch ${currentBatch.id} aún en progreso...`);
      console.log('\n💡 INSTRUCCIONES:');
      console.log('1. Las imágenes están en: scripts/batch/');
      console.log('2. Adjunta las 8 imágenes al chat de Copilot');
      console.log('3. Copilot analizará y guardará keywords_ai');
      console.log('4. Vuelve a ejecutar: node scripts/next-batch.js\n');
      return;
    }
  }

  // Si llegamos aquí, preparar el batch
  console.log(`📂 Preparando Batch ${currentBatch.id}...`);
  console.log('-'.repeat(60));

  currentBatch.items.forEach((item, index) => {
    const imageName = item.images[0];
    const sourcePath = path.join(IMAGES_DIR, imageName);
    const destPath = path.join(BATCH_DIR, imageName);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ [${index + 1}/${currentBatch.items.length}] ${imageName}`);
    } else {
      console.log(`✗ [${index + 1}/${currentBatch.items.length}] NO ENCONTRADA: ${imageName}`);
    }
  });

  currentBatch.status = 'in-progress';
  saveBatchState(state);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Batch preparado en: scripts/batch/');
  console.log('='.repeat(60));
  console.log('\n💡 SIGUIENTE PASO:');
  console.log('1. Ve a scripts/batch/ y adjunta las 8 imágenes al chat');
  console.log('2. Copilot las analizará y guardará keywords_ai automáticamente');
  console.log('3. Ejecuta nuevamente: node scripts/next-batch.js\n');
}

nextBatch();
