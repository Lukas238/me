// scripts/generate-bidassoa-json.js
// Genera/actualiza _data/bidassoa.json a partir de los JPG en ./assets/bidassoa/
//
// Formato de archivo:
//   YYYY__TitleOrAlias[__INFO1[__INFO2...]].jpg
//
// Reglas de INFO:
//   - Si el PRIMER INFO es "variante" o "variante_#" -> nuevo item separado del base,
//     se incluye en el id y suma keyword "variante" (sin número).
//   - Si el PRIMER INFO es "serigrafia", "serigrafia_#", "serigrafica", etc. -> nuevo item
//     separado del base, se incluye en el id y suma keyword "serigrafia" (normalizada).
//   - El resto de INFO:
//       * Si contiene espacios -> nota (notes).
//       * Si NO contiene espacios (aunque tenga "_" o "-") -> keyword.
//
// Notas:
//   - Si el item ya existe en el JSON y tiene notes no vacías, se respetan tal cual
//     (no se pisan ni se modifican con notas derivadas del nombre de archivo).
//
// Uso:
//   node scripts/generate-bidassoa-json.js

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const INPUT_DIR = path.resolve("assets/bidassoa");
const OUTPUT_FILE = path.resolve("_data/bidassoa.json");

// Normaliza el nombre base para agrupar:
function normalizeBaseName(str) {
  return str
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/['’`´]/g, "")                          // quita apóstrofos
    .replace(/_/g, " ")                              // "_" como espacio
    .replace(/[^a-zA-Z0-9\s]/g, " ")                 // resto de signos -> espacio
    .replace(/\s+/g, " ")                            // colapsa espacios
    .trim()
    .toLowerCase();
}

// Para mostrar como título/alias: "_" -> espacio
function humanizeName(baseName) {
  return baseName.replace(/_/g, " ").trim();
}

function isAllLowercase(str) {
  return str === str.toLowerCase();
}

// ¿Es algo tipo "variante", "variante_1", "variante_2", etc?
function isVariantToken(token) {
  return /^variante(_\d+)?$/i.test(token);
}

// ¿Es algo de serigrafía? ("serigrafia", "serigrafia_2", "serigrafica", etc.)
function isSerigrafiaToken(token) {
  return /^serigrafi[a-z0-9_]*$/i.test(token);
}

// Normaliza cualquier token de serigrafía a la keyword "serigrafia"
function canonicalSerigrafiaKeyword() {
  return "serigrafia";
}

// Normaliza cualquier token de variante ("variante", "variante_2") a "variante"
function canonicalVariantKeyword() {
  return "variante";
}

// Normaliza una keyword cualquiera según reglas de variante/serigrafia
function canonicalizeKeyword(kw) {
  if (!kw) return kw;
  if (isVariantToken(kw)) return canonicalVariantKeyword();
  if (isSerigrafiaToken(kw)) return canonicalSerigrafiaKeyword();
  return kw;
}

// Parseo del nombre de archivo sin extensión
function parseFileName(fileName) {
  const name = fileName.replace(/\.[^.]+$/, ""); // sin extensión

  const match = name.match(/^(\d{4})__(.+)$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const rest = match[2];

  const parts = rest.split("__");
  const baseName = parts[0].normalize("NFC");
  const optionalParts = parts.slice(1).map(p => p.normalize("NFC"));
  const normalizedBaseName = normalizeBaseName(baseName);

  return {
    year,
    baseName,
    normalizedBaseName,
    optionalParts,
    fileName
  };
}

// Deriva la misma groupKey que usa el parse de archivos,
// pero a partir de un item ya existente en el JSON.
function deriveGroupKeyFromItem(item) {
  if (!item.year) return null;

  let baseRaw = (item.title || item.alias || "").normalize("NFC");
  let extraPart = null;

  if (item.id) {
    const m = item.id.match(/^(\d{4})__(.+)$/);
    if (m) {
      const rest = m[2];
      const parts = rest.split("__");
      if (!baseRaw) {
        baseRaw = parts[0];
      }
      if (parts.length > 1) {
        const candidate = parts[1];
        if (isVariantToken(candidate) || isSerigrafiaToken(candidate)) {
          extraPart = candidate.toLowerCase();
        }
      }
    }
  }

  if (!baseRaw) return null;

  const normBase = normalizeBaseName(baseRaw);
  const suffix = extraPart ? "__" + extraPart : "";

  return `${item.year}__${normBase}${suffix}`;
}

// Clasifica un token INFO como nota o keyword (variante/serigrafia ya manejados aparte)
function classifyInfoToken(token) {
  if (!token) return { type: null, value: null };

  // Si tiene espacios -> nota
  if (/\s/.test(token)) {
    return {
      type: "note",
      value: token.replace(/_/g, " ").trim()
    };
  }

  // Si no, es keyword (aunque tenga "_" o "-")
  return {
    type: "keyword",
    value: token
  };
}

// Ordena las imágenes poniendo primero las principales (sin back/detalle/firma)
function sortImagesWithMainFirst(images) {
  if (!Array.isArray(images) || images.length === 0) return images;

  const mainImages = [];
  const additionalImages = [];

  // Palabras clave que identifican fotos adicionales
  const additionalKeywords = ['back', 'detalle', 'firma'];

  for (const img of images) {
    const lowerImg = img.toLowerCase();
    const isAdditional = additionalKeywords.some(keyword => lowerImg.includes(`__${keyword}`));

    if (isAdditional) {
      additionalImages.push(img);
    } else {
      mainImages.push(img);
    }
  }

  // Ordenar cada grupo alfabéticamente
  mainImages.sort((a, b) => a.localeCompare(b));
  additionalImages.sort((a, b) => a.localeCompare(b));

  // Retornar principal primero, luego adicionales
  return [...mainImages, ...additionalImages];
}

// Carga el JSON existente y lo agrupa por groupKey
async function loadExistingJson() {
  try {
    const data = await fsp.readFile(OUTPUT_FILE, "utf8");
    const arr = JSON.parse(data);

    const map = new Map(); // groupKey -> merged item

    for (const item of arr) {
      if (!item) continue;
      const groupKey = deriveGroupKeyFromItem(item);
      if (!groupKey) continue;

      const copy = { ...item };
      if (!Array.isArray(copy.keywords)) copy.keywords = [];
      if (!Array.isArray(copy.images)) copy.images = [];

      // Canonicalizamos las keywords existentes
      copy.keywords = copy.keywords
        .map(canonicalizeKeyword)
        .filter((v) => v && v.trim() !== "");

      if (!map.has(groupKey)) {
        map.set(groupKey, copy);
      } else {
        // Merge de items duplicados con mismo groupKey
        const target = map.get(groupKey);

        if (!target.title && copy.title) target.title = copy.title;
        if (!target.alias && copy.alias) target.alias = copy.alias;

        if (copy.notes && copy.notes !== target.notes) {
          if (!target.notes) target.notes = copy.notes;
          else if (!target.notes.includes(copy.notes)) {
            target.notes += "\n" + copy.notes;
          }
        }

        const kw = new Set([
          ...(Array.isArray(target.keywords) ? target.keywords : []),
          ...copy.keywords
        ].map(canonicalizeKeyword));
        target.keywords = Array.from(kw);

        const imgs = new Set([
          ...(Array.isArray(target.images) ? target.images : []),
          ...copy.images
        ]);
        target.images = Array.from(imgs);
      }
    }

    console.log(
      `Cargado JSON existente: ${OUTPUT_FILE} (${arr.length} items, ${map.size} grupos distintos)`
    );
    return map;
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("No existe _data/bidassoa.json todavía. Se creará desde cero.");
      return new Map();
    }
    console.error("Error leyendo _data/bidassoa.json:", err.message);
    throw err;
  }
}

async function main() {
  console.log("=== generate-bidassoa-json ===");
  console.log("Directorio de trabajo:", process.cwd());
  console.log("Carpeta de imágenes:", INPUT_DIR);
  console.log("Archivo JSON:", OUTPUT_FILE);
  console.log("--------------------------------");

  await fsp.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  const existingByGroupKey = await loadExistingJson();

  // Leer archivos actuales
  let entries;
  try {
    entries = await fsp.readdir(INPUT_DIR, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("ERROR: La carpeta de imágenes no existe:", INPUT_DIR);
      process.exit(1);
    }
    throw err;
  }

  const filesByGroupKey = new Map();
  const existingFilesSet = new Set();

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    // Normalizar a NFC para evitar problemas de encoding con tildes
    const fileName = entry.name.normalize("NFC");
    if (!/\.(jpe?g|png|webp)$/i.test(fileName)) continue;

    existingFilesSet.add(fileName);

    const info = parseFileName(fileName);
    if (!info) {
      console.warn("Nombre no coincide con el formato esperado YYYY__nombre:", fileName);
      continue;
    }

    const { year, baseName, normalizedBaseName, optionalParts } = info;

    const firstOpt = optionalParts[0];
    const isVariant = firstOpt && isVariantToken(firstOpt);
    const isSerigrafia = firstOpt && isSerigrafiaToken(firstOpt);

    // groupKey:
    // - base: "YYYY__base_normalizado"
    // - variante: "YYYY__base_normalizado__variante[_#]"
    // - serigrafia: "YYYY__base_normalizado__serigrafia[_#]"
    let extraSuffix = "";
    if (isVariant || isSerigrafia) {
      extraSuffix = "__" + firstOpt.toLowerCase();
    }

    const groupKey = `${year}__${normalizedBaseName}${extraSuffix}`;

    if (!filesByGroupKey.has(groupKey)) {
      filesByGroupKey.set(groupKey, {
        year,
        normalizedBaseName,
        baseNames: new Set(),
        coverCandidates: [],
        extras: [],
        noteFragments: [],
        keywordSet: new Set()
      });
    }

    const group = filesByGroupKey.get(groupKey);
    group.baseNames.add(baseName);

    // Procesar INFO -> notas y keywords (excepto el primer variant/serigrafia)
    let partsToProcess = optionalParts.slice();

    if (isVariant || isSerigrafia) {
      // El primer bloque es variante/serigrafia: separa item y además es keyword CANONICAL
      if (isVariant) {
        group.keywordSet.add(canonicalVariantKeyword());
      }
      if (isSerigrafia) {
        group.keywordSet.add(canonicalSerigrafiaKeyword());
      }
      partsToProcess = optionalParts.slice(1);
    }

    for (const part of partsToProcess) {
      const { type, value } = classifyInfoToken(part);
      if (!type || !value) continue;

      if (type === "note") {
        if (!group.noteFragments.includes(value)) {
          group.noteFragments.push(value);
        }
      } else if (type === "keyword") {
        // canonicalizamos keywords tipo variante/serigrafia
        const canon = canonicalizeKeyword(value);
        group.keywordSet.add(canon);
      }
    }

    // Determinar covers / extras:
    // - si NO hay optionalParts -> candidato a cover
    // - si es variante/serigrafia y solo tiene ese token -> cover del item
    // - lo demás -> extras
    if (optionalParts.length === 0) {
      group.coverCandidates.push(fileName);
    } else if ((isVariant || isSerigrafia) && optionalParts.length === 1) {
      group.coverCandidates.push(fileName);
    } else {
      group.extras.push(fileName);
    }
  }

  console.log(
    `Grupos de obras detectados (por year + nombre normalizado [+ variante/serigrafia]): ${filesByGroupKey.size}`
  );

  const resultItems = [];

  for (const [groupKey, group] of filesByGroupKey) {
    const existing = existingByGroupKey.get(groupKey) || null;

    const baseNamesArray = Array.from(group.baseNames);
    const preferredBaseName = baseNamesArray[0] || group.normalizedBaseName;
    const human = humanizeName(preferredBaseName);

    let inferredTitle = null;
    let inferredAlias = null;
    if (isAllLowercase(human)) {
      inferredAlias = human;
    } else {
      inferredTitle = human;
    }

    const merged = existing ? { ...existing } : {};

    merged.year = group.year;

    // Detectar sufijo extra (variante/serigrafia) desde groupKey
    let extraPartForId = null;
    const gkParts = groupKey.split("__");
    if (gkParts.length > 2) {
      const candidate = gkParts[2];
      if (isVariantToken(candidate) || isSerigrafiaToken(candidate)) {
        extraPartForId = candidate;
      }
    }

    // id
    if (!merged.id) {
      const baseForId = merged.title || merged.alias || human;
      if (extraPartForId) {
        merged.id = `${group.year}__${baseForId}__${extraPartForId}`;
      } else {
        merged.id = `${group.year}__${baseForId}`;
      }
    }

    // title / alias si no existen ya
    if (!merged.title && inferredTitle) merged.title = inferredTitle;
    if (!merged.alias && inferredAlias) merged.alias = inferredAlias;

    // notes:
    // - Si el item YA existía y tiene notas no vacías, las respetamos
    // - Si no tenía notas, las generamos desde noteFragments
    if (existing && typeof existing.notes === "string" && existing.notes.trim() !== "") {
      merged.notes = existing.notes;
    } else {
      let notes = "";
      for (const nf of group.noteFragments) {
        if (!nf) continue;
        if (!notes) notes = nf;
        else if (!notes.includes(nf)) {
          notes += (notes.endsWith(".") ? " " : "; ") + nf;
        }
      }
      merged.notes = notes;
    }

    // keywords:
    // - Si el item YA existía y tiene keywords, las respetamos
    // - Si no tenía keywords, las generamos desde keywordSet
    if (existing && Array.isArray(existing.keywords) && existing.keywords.length > 0) {
      merged.keywords = existing.keywords;
    } else {
      const kwSet = new Set(
        [...group.keywordSet].map(canonicalizeKeyword).filter((v) => v && v.trim() !== "")
      );
      merged.keywords = Array.from(kwSet);
    }

    // Agregar keyword "notas" si el item tiene notas
    if (merged.notes && merged.notes.trim() !== "") {
      if (!merged.keywords.includes("notas")) {
        merged.keywords.push("notas");
      }
    }

    // imágenes: cover + extras + respetar lo que ya había cuando se pueda
    const newImagesFromFiles = [];

    if (group.coverCandidates.length > 0) {
      newImagesFromFiles.push(...group.coverCandidates);
      newImagesFromFiles.push(...group.extras);
    } else if (group.extras.length > 0) {
      newImagesFromFiles.push(...group.extras);
    }

    const existingImages = Array.isArray(merged.images) ? merged.images : [];
    const finalImages = [];
    const seen = new Set();

    function addIfValid(img) {
      if (!img) return;
      if (!existingFilesSet.has(img)) return;
      if (seen.has(img)) return;
      seen.add(img);
      finalImages.push(img);
    }

    // 1) Nuevas imágenes desde files (cover + extras)
    for (const img of newImagesFromFiles) {
      addIfValid(img);
    }

    // 2) Imágenes preexistentes en el JSON que sigan estando en disco
    for (const img of existingImages) {
      addIfValid(img);
    }

    // Ordenar imágenes: principales primero, luego adicionales
    merged.images = sortImagesWithMainFirst(finalImages);

    resultItems.push(merged);
  }

  // Ordenar por año desc, luego por título, luego por alias
  resultItems.sort((a, b) => {
    // Primero por año (descendente)
    if (b.year !== a.year) {
      return b.year - a.year;
    }

    // Luego por título o alias (el que esté presente)
    const nameA = (a.title || a.alias || "").toLowerCase();
    const nameB = (b.title || b.alias || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  await fsp.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fsp.writeFile(OUTPUT_FILE, JSON.stringify(resultItems, null, 2), "utf8");

  console.log("--------------------------------");
  console.log(`Generado/actualizado: ${OUTPUT_FILE}`);
  console.log("=== FIN generate-bidassoa-json ===");
}

main().catch((err) => {
  console.error("Error general en generate-bidassoa-json:", err);
  process.exit(1);
});
