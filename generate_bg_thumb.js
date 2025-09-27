#!/usr/bin/env node
/**
 * Generate thumbnails for all images in assets/backgrounds/
 * Thumbnails will be stored in assets/backgrounds/thumbs/
 * Only creates thumbs for images that don't already exist
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const backgroundsDir = path.join(__dirname, "assets/backgrounds");
const thumbsDir = path.join(backgroundsDir, "_thumbs");

// Ensure thumbs directory exists
if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

// Supported image extensions
const exts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

fs.readdirSync(backgroundsDir).forEach(async (file) => {
  const ext = path.extname(file).toLowerCase();
  if (!exts.includes(ext)) return; // skip non-images

  const srcPath = path.join(backgroundsDir, file);
  const thumbPath = path.join(thumbsDir, file);

  // Skip if thumb already exists
  if (fs.existsSync(thumbPath)) {
    console.log(`✅ Thumb exists: ${file}`);
    return;
  }

  try {
    await sharp(srcPath)
      .resize(400) // width = 400px, auto height
      .toFile(thumbPath);

    console.log(`📸 Created thumb: ${file}`);
  } catch (err) {
    console.error(`❌ Failed on ${file}:`, err);
  }
});
