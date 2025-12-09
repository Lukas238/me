#!/usr/bin/env node
/**
 * prefix_and_thumb_final.js
 *
 * Source: source  directory as first argument. If there is a local assets/backgrounds folder, it will be used.
 * Optional Thumbnails destination folder as second argument. If there is a local assets/backgrounds/_thumbs folder, it will be used.
 * Optional flag: --dry
 *
 * If skiped thumbnails destination folder path, no thumbnails will be created. Except if there is a local assets/backgrounds/ folder, then assets/backgrounds/_thumbs will be used.
 *
 *
 * Flow:
 * 1. Use date from filename if prefixed
 * 2. Otherwise, determine earliest valid date (EXIF / mtime)
 * 3. Compute prefixed filename
 * 4. Check/create thumbnail in _thumbs using prefixed filename
 * 5. Rename source file if missing prefix
 */

const fs = require('fs').promises;
const path = require('path');
const exifr = require('exifr');
const sharp = require('sharp');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry');
if (dryRun) {
  console.log('*** DRY RUN MODE - No files will be modified ***\n');
}

// Determine source directory
const srcDir = args[0] ? path.resolve(args[0]) : path.join(__dirname, 'assets', 'backgrounds');

// The command is: node prefix_and_thumb.js [source_directory] [--dry]

// The thumbnails should be stored in the local assets/backgrounds/_thumbs subdirectory.
const thumbsDir = args[1] ? path.resolve(args[1]) : path.join(srcDir, '_thumbs');
// const thumbsDir = path.join(__dirname, 'assets', 'backgrounds', '_thumbs');
const thumbWidth = 800;


const VALID_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.bmp']);
const MIN_DATE = new Date('1980-01-01T00:00:00Z');

function formatDateForPrefix(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function findDateInExif(exifObj) {
  if (!exifObj) return null;
  for (const k of Object.keys(exifObj)) {
    const v = exifObj[k];
    if (v instanceof Date && !isNaN(v)) return v;
    if (typeof v === 'string') {
      const parsed = Date.parse(v);
      if (!isNaN(parsed)) return new Date(parsed);
    }
  }
  return null;
}

function isValidDate(d) {
  if (!(d instanceof Date) || isNaN(d)) return false;
  if (d < MIN_DATE) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d > tomorrow) return false;
  return true;
}

function alreadyPrefixed(name) {
  // Matches YYYY-MM-DD_ at the start of the filename
  return /^\d{4}-\d{2}-\d{2}_/.test(name);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function safeRename(oldP, newP) {
  try {
    await fs.access(newP);
    const parsed = path.parse(newP);
    let counter = 1;
    let candidate;
    do {
      candidate = path.join(parsed.dir, `${parsed.name}_${counter}${parsed.ext}`);
      try { await fs.access(candidate); break; } catch(e) { counter++; continue; }
    } while(true);
    await fs.rename(oldP, candidate);
    return candidate;
  } catch (e) {
    await fs.rename(oldP, newP);
    return newP;
  }
}

async function processFile(filePath, destThumbDir) {
  const stat = await fs.stat(filePath);
  const origName = path.basename(filePath);
  const ext = path.extname(origName).toLowerCase();

  if (!VALID_EXTS.has(ext)) return { skipped: true, reason: 'unsupported extension', name: origName };

  let dateToUse;
  let prefixedName;
  const needsPrefix = !alreadyPrefixed(origName);

  if (alreadyPrefixed(origName)) {
    // Extract date from filename
    const match = origName.match(/^(\d{4}-\d{2}-\d{2})_/);
    if (match) {
      const dateStr = match[1];
      const [yyyy, mm, dd] = dateStr.split('-').map(n => parseInt(n, 10));
      dateToUse = new Date(yyyy, mm - 1, dd);
      prefixedName = origName; // already prefixed
    } else {
      dateToUse = stat.mtime;
      prefixedName = `${formatDateForPrefix(dateToUse)}_${origName}`;
    }
  } else {
    // Determine earliest valid date
    let exif = null;
    try { exif = await exifr.parse(filePath).catch(()=>null); } catch(e) { exif=null; }
    let exifDate = findDateInExif(exif);
    let modDate = stat.mtime;
    if (!isValidDate(exifDate)) exifDate = null;
    if (!isValidDate(modDate)) modDate = null;
    if (exifDate && modDate) dateToUse = exifDate < modDate ? exifDate : modDate;
    else if (exifDate) dateToUse = exifDate;
    else if (modDate) dateToUse = modDate;
    else dateToUse = new Date();
    prefixedName = `${formatDateForPrefix(dateToUse)}_${origName}`;
  }

  // Step 1: create thumbnail if not exists
  await ensureDir(destThumbDir);
  const thumbPath = path.join(destThumbDir, prefixedName);
  let thumbCreated = false;
  try {
    await fs.access(thumbPath);
  } catch(e) {
    try {
      if (!dryRun) {
        await sharp(filePath)
          .resize({ width: thumbWidth, withoutEnlargement: true })
          .toFile(thumbPath);
      }
      thumbCreated = true;
    } catch(err) {
      return { skipped: true, reason: 'sharp cannot process', name: origName };
    }
  }

  // Step 2: rename source file if needed
  let finalOriginalPath = filePath;
  let renamed = false;
  if (needsPrefix) {
    const targetPath = path.join(srcDir, prefixedName);
    if (!dryRun) {
      finalOriginalPath = await safeRename(filePath, targetPath);
    } else {
      finalOriginalPath = targetPath;
    }
    renamed = true;
  }

  return {
    name: origName,
    finalName: path.basename(finalOriginalPath),
    thumbCreated,
    renamed,
    dateUsed: dateToUse.toISOString()
  };
}

(async () => {
  await ensureDir(thumbsDir);

  let entries;
  try { entries = await fs.readdir(srcDir, { withFileTypes:true }); } catch(e){ console.error('Error reading folder', srcDir); process.exit(1); }
  const files = entries.filter(en => en.isFile()).map(en => path.join(srcDir, en.name));
  if (files.length === 0) { console.log('No files found in', srcDir); process.exit(0); }

  console.log(`\nProcessing ${files.length} files in ./assets/backgrounds\n`);

  for(const f of files){
    const result = await processFile(f, thumbsDir);
    if(result.skipped) {
      console.log(`[SKIP] ${result.name} (${result.reason})`);
    } else {
      let msg = `[OK] ${result.finalName}`;
      if(result.renamed) msg += ' (Renamed)';
      msg += result.thumbCreated ? ' -> Thumbnail created' : ' (Thumbnail exists)';
      console.log(msg);
    }
  }

  console.log('\nProcessing completed.\n');
})();
