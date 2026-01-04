/* ./scripts/bidassoa-dryrun.cjs */
/* CommonJS + local CLIP (zero-shot pipeline) + dry-run suggestions */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const pLimitImport = require("p-limit");
const pLimit = pLimitImport.default ?? pLimitImport;
const sharp = require("sharp");

// =========================
// Config
// =========================
const CONFIG = {
  // All JSON in ./_data
  inputBidassoaJson: path.resolve("./_data/bidassoa.json"),
  keywordsCatalogJson: path.resolve("./_data/keywords.catalog.json"),
  outputSuggestionsJson: path.resolve("./_data/bidassoa.suggestions.json"),

  // Images live here
  assetsDir: path.resolve("./assets/bidassoa"),

  // CLIP local
  clipModel: "Xenova/clip-vit-base-patch32",
  clipTopK: 8,
  clipThreshold: 0.22, // zero-shot scores are often lower than dot-product sims; tune after first run
  clipConcurrency: 2,

  // Heuristic: delineado vs aplat
  outline: {
    resize: 384,
    sobelEdgeThresh: 80,
    blackLumThresh: 60,
    minBlackEdgeRatio: 0.38
  },

  // If true, include a bigger "top" list for debugging
  includeClipTop: true,
  clipTopN: 12
};

// =========================
// Utilities
// =========================
function readJsonSync(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function safeLower(s) {
  return (s || "").toString().trim().toLowerCase();
}

function pickRepresentativeImage(images = []) {
  const preferred = images.find((x) => !/(back|firma|detalle)/i.test(x));
  return preferred || images[0] || null;
}

// =========================
// Heuristic: delineado vs aplat
// =========================
function rgbToLum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function sobelEdgeStrength(gray, w, h) {
  const out = new Uint16Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;

      const a = gray[(y - 1) * w + (x - 1)];
      const b = gray[(y - 1) * w + x];
      const c = gray[(y - 1) * w + (x + 1)];
      const d = gray[y * w + (x - 1)];
      const f = gray[y * w + (x + 1)];
      const g = gray[(y + 1) * w + (x - 1)];
      const h2 = gray[(y + 1) * w + x];
      const i2 = gray[(y + 1) * w + (x + 1)];

      const gx = (-a + c) + (-2 * d + 2 * f) + (-g + i2);
      const gy = (-a - 2 * b - c) + (g + 2 * h2 + i2);

      out[idx] = Math.abs(gx) + Math.abs(gy);
    }
  }
  return out;
}

async function detectDelineadoVsAplat(imagePath) {
  const { resize, sobelEdgeThresh, blackLumThresh, minBlackEdgeRatio } = CONFIG.outline;

  const { data, info } = await sharp(imagePath)
    .rotate()
    .resize(resize, resize, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  const gray = new Float32Array(w * h);
  for (let i = 0, p = 0; i < w * h; i++, p += 3) {
    gray[i] = rgbToLum(data[p], data[p + 1], data[p + 2]);
  }

  const edge = sobelEdgeStrength(gray, w, h);

  let edgeCount = 0;
  let blackEdgeCount = 0;

  for (let i = 0; i < w * h; i++) {
    if (edge[i] >= sobelEdgeThresh) {
      edgeCount++;
      if (gray[i] <= blackLumThresh) blackEdgeCount++;
    }
  }

  const ratio = edgeCount === 0 ? 0 : blackEdgeCount / edgeCount;
  const decision = ratio >= minBlackEdgeRatio ? "delineado" : "aplat";

  return {
    decision,
    blackEdgeRatio: Number(ratio.toFixed(4))
  };
}

// =========================
// Main (zero-shot CLIP + dry-run)
// =========================
async function main() {
  const bidassoa = readJsonSync(CONFIG.inputBidassoaJson);
  const catalog = readJsonSync(CONFIG.keywordsCatalogJson);

  const keywords = Array.isArray(catalog.keywords) ? catalog.keywords : [];
  const clipKeywords = keywords.filter(k => k.detector === "clip");
  const heuristicKeywords = keywords.filter(k => k.detector === "heuristic");

  // Dynamic import for CommonJS
  const { pipeline, RawImage } = await import("@xenova/transformers");

  // Zero-shot CLIP pipeline (ensures image preprocessing => pixel_values)
  const classify = await pipeline("zero-shot-image-classification", CONFIG.clipModel);

  // Candidate labels = description prompts
  // We keep mapping label -> key for clean output
  const candidates = clipKeywords.map(k => ({
    key: k.key,
    label: `${k.key}. ${k.desc || ""}`.trim()
  }));
//   const candidate_labels = candidates.map(x => x.label);
  const candidate_labels = candidates.map(x => x.label);
  const labelToKey = new Map(candidates.map(x => [x.label, x.key]));

  const limit = pLimit(CONFIG.clipConcurrency);
  const results = [];

  const tasks = bidassoa.map((obra) => limit(async () => {
    const repImg = pickRepresentativeImage(obra.images || []);
    const rec = {
      id: obra.id ?? null,
      title: obra.title ?? obra.name ?? null,
      representative_image: repImg,
      clip: { suggestions: [] },
      heuristic: { suggestions: [] },
      errors: []
    };

    if (!repImg) {
      rec.errors.push("Sin imagen representativa (images[] vacío).");
      results.push(rec);
      return;
    }

    const imgPath = path.join(CONFIG.assetsDir, repImg);
    if (!fs.existsSync(imgPath)) {
      rec.errors.push(`No existe archivo: ${imgPath}`);
      results.push(rec);
      return;
    }

    // Heuristic delineado/aplat (only if present in catalog)
    const wantsOutline =
      heuristicKeywords.some(k => k.key === "delineado") ||
      heuristicKeywords.some(k => k.key === "aplat");

    if (wantsOutline) {
      try {
        const h = await detectDelineadoVsAplat(imgPath);
        rec.heuristic.suggestions.push({
          key: h.decision,
          score: h.blackEdgeRatio,
          meta: { blackEdgeRatio: h.blackEdgeRatio }
        });
      } catch (e) {
        rec.errors.push(`Heurística delineado/aplat falló: ${e?.message || e}`);
      }
    }

    // CLIP zero-shot
    try {
      const image = await RawImage.read(imgPath);

      // NOTE: This returns array of { label, score }
      const zs = await classify(image, candidate_labels);

      // Map to {key, score}
      const mapped = zs.map(x => ({
        key: labelToKey.get(x.label) || x.label,
        score: Number((x.score ?? 0).toFixed(4))
      }));

      // Keep top list for calibration
      if (CONFIG.includeClipTop) {
        rec.clip.top = mapped.slice(0, CONFIG.clipTopN);
      }

      rec.clip.suggestions = mapped
        .filter(x => x.score >= CONFIG.clipThreshold)
        .slice(0, CONFIG.clipTopK);
    } catch (e) {
      rec.errors.push(`CLIP zero-shot falló: ${e?.message || e}`);
    }

    results.push(rec);
  }));

  await Promise.all(tasks);

  results.sort((a, b) => safeLower(a.id).localeCompare(safeLower(b.id)));

  const out = {
    meta: {
      generated_at: new Date().toISOString(),
      model: CONFIG.clipModel,
      pipeline: "zero-shot-image-classification",
      clipTopK: CONFIG.clipTopK,
      clipThreshold: CONFIG.clipThreshold,
      heuristic: CONFIG.outline
    },
    suggestions: results
  };

  await fsp.writeFile(CONFIG.outputSuggestionsJson, JSON.stringify(out, null, 2), "utf-8");
  console.log(`OK: ${CONFIG.outputSuggestionsJson}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
