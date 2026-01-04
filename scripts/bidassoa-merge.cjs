/* ./scripts/bidassoa-merge.v2.cjs
 *
 * Merge dry-run suggestions into bidassoa.json using stricter, style-aware rules:
 * - Auto-apply only high-confidence tags, with "margin" vs runner-up for confusable objects.
 * - Context guardrails (e.g., nautical context blocks planes/tractors unless extremely strong).
 * - Filename hints (id tokens) used as priors (boost/guardrails).
 * - Never delete manual keywords; only add. (Except enforce mutual exclusion delineado/aplat when auto-applied.)
 *
 * Inputs (all under ./_data):
 *   - bidassoa.json
 *   - bidassoa.suggestions.json
 *   - keywords.catalog.json (optional)
 *
 * Outputs:
 *   - bidassoa.tagged.v2.json
 *   - bidassoa.tagged.v2.meta.json
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const CONFIG = {
  inputBidassoa: path.resolve('./_data/bidassoa.json'),
  inputSuggestions: path.resolve('./_data/bidassoa.suggestions.json'),
  outputTagged: path.resolve('./_data/bidassoa.tagged.json'),

  clip: {
    suggestThreshold: 0.22,

    // Auto thresholds (stricter than v1 for confusable classes)
    auto: {
      aviones: 0.75,
      automobiles: 0.65,
      barcos: 0.60,
      vehiculos: 0.60,
      'vehiculos-tractor': 0.65,
      iglesia: 0.45,
      bodegon: 0.45,
    },

    // Conditional thresholds
    conditional: {
      'figura-humana': 0.32,
      'escena-de-genero': 0.28, // requires figura-humana >= 0.32
      musical: 0.35,            // requires figura-humana >= 0.32
      autorretrato: 0.55,       // cautious
      puerto: 0.35,             // requires barcos>=0.30 OR paisaje-nautico>=0.30 OR rio>=0.30
      rio: 0.35,                // requires paisaje-nautico>=0.28
    },

    support: {
      escenaFiguraHumana: 0.32,
      puertoAny: 0.30,
      rioPaisajeNautico: 0.28
    },

    // Landscapes are suggest-only unless very high confidence
    landscapeAutoThreshold: 0.45,
    landscapeKeys: new Set([
      'paisaje-nautico','paisaje-urbano','paisaje-rural','paisaje-natural','paisaje-abstracto','vista-aerea'
    ]),

    // Confusable object group: require "margin" when auto-applying
    confusableGroup: new Set([
      'aviones','automobiles','vehiculos','vehiculos-tractor','barcos'
    ]),
    // Require top score to exceed 2nd-best by at least this margin (within confusable group)
    minMargin: 0.20,

    // Nautical guardrail: if nautical context, block these autos unless extreme confidence
    nauticalBlock: new Set(['aviones','vehiculos-tractor','automobiles','vehiculos']),
    nauticalOverride: {
      minScore: 0.85,
      minMargin: 0.25
    }
  },

  heuristic: {
    delineado: { minRatio: 0.40 },
    aplat: { maxRatio: 0.30 },
    greyZone: { min: 0.30, max: 0.40 },
  },

  auditField: 'auto'
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function uniqPreserve(arr) {
  const out = [];
  const seen = new Set();
  for (const v of arr || []) {
    if (!v) continue;
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

function indexById(arr) {
  const m = new Map();
  for (const x of arr) {
    if (x && x.id != null) m.set(String(x.id), x);
  }
  return m;
}

function scoresToMap(clipBlock) {
  const m = new Map();
  const list = (clipBlock && Array.isArray(clipBlock.top) ? clipBlock.top
              : clipBlock && Array.isArray(clipBlock.suggestions) ? clipBlock.suggestions
              : []);
  for (const it of list) {
    if (!it) continue;
    const key = typeof it.key === 'string' ? it.key : (it.label || it.key);
    const score = Number(it.score ?? 0);
    if (!key) continue;
    const prev = m.get(key);
    if (prev == null || score > prev) m.set(key, score);
  }
  return m;
}

function ensureAudit(obj) {
  if (!obj[CONFIG.auditField]) obj[CONFIG.auditField] = {};
  const a = obj[CONFIG.auditField];
  if (!a.applied) a.applied = [];
  if (!a.suggested) a.suggested = [];
  if (!a.blocked) a.blocked = []; // explain blocks (guardrails)
  return a;
}

function pushAudit(list, entry) {
  const key = entry.key;
  const source = entry.source;
  if (!key) return;
  const exists = list.some(x => x && x.key === key && x.source === source);
  if (!exists) list.push(entry);
}

function applyKeyword(work, key) {
  work.keywords = uniqPreserve([...(work.keywords || []), key]);
}

function removeKeyword(work, key) {
  if (!Array.isArray(work.keywords)) return;
  work.keywords = work.keywords.filter(k => k !== key);
}

function bestScore(scores, key) {
  return scores.get(key) ?? 0;
}

function parseIdHints(id) {
  // id format: "2000__barco de juncos y vanderin rojo__variante"
  // Use __ tokens, normalize to slug-ish tokens, keep both raw and slugged.
  if (!id) return new Set();
  const parts = String(id).split('__').map(s => s.trim()).filter(Boolean);
  const hints = new Set();
  for (const p of parts) {
    const slug = p.toLowerCase()
      .replace(/[áàäâ]/g,'a').replace(/[éèëê]/g,'e').replace(/[íìïî]/g,'i')
      .replace(/[óòöô]/g,'o').replace(/[úùüû]/g,'u').replace(/ñ/g,'n')
      .replace(/[^a-z0-9\- ]/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .replace(/ /g,'-');
    if (slug) hints.add(slug);
  }
  // Map common hint variants to canonical keys
  const mapped = new Set();
  for (const h of hints) {
    if (h === 'barco' || h.startsWith('barco-')) mapped.add('barcos');
    if (h.includes('nautico')) mapped.add('paisaje-nautico');
    if (h === 'rio' || h.includes('rio')) mapped.add('rio');
    if (h.includes('puerto')) mapped.add('puerto');
    if (h.includes('avion')) mapped.add('aviones');
    if (h.includes('tractor')) mapped.add('vehiculos-tractor');
    if (h.includes('auto') || h.includes('automovil')) mapped.add('automobiles');
    if (h.includes('vehiculo')) mapped.add('vehiculos');
    if (h.includes('bodegon')) mapped.add('bodegon');
    if (h.includes('iglesia') || h.includes('catedral') || h.includes('parroquia')) mapped.add('iglesia');
    if (h.includes('figura') || h.includes('personas') || h.includes('musicos')) mapped.add('figura-humana');
    if (h.includes('variante')) mapped.add('variante');
    if (h.includes('delineado')) mapped.add('delineado');
    if (h.includes('aplat')) mapped.add('aplat');
  }
  return mapped;
}

function isNauticalContext(workKeywords, hints) {
  const kw = new Set(workKeywords || []);
  return kw.has('barcos') || kw.has('paisaje-nautico') || hints.has('barcos') || hints.has('paisaje-nautico') || kw.has('puerto') || kw.has('rio');
}

function marginWithinGroup(scores, key, groupSet) {
  // Compute margin between key and next best within groupSet
  const entries = [];
  for (const k of groupSet) {
    const s = bestScore(scores, k);
    if (s > 0) entries.push([k, s]);
  }
  entries.sort((a,b) => b[1]-a[1]);
  if (!entries.length) return { topKey: null, topScore: 0, secondScore: 0, margin: 0 };
  const top = entries[0];
  const second = entries[1] || [null, 0];
  const topKey = top[0], topScore = top[1], secondScore = second[1];
  const margin = topScore - secondScore;
  if (key !== topKey) {
    // margin for a non-top candidate is negative/weak by definition
    return { topKey, topScore, secondScore, margin: -(secondScore - topScore) };
  }
  return { topKey, topScore, secondScore, margin };
}

function shouldAutoApplyClip(key, score, scores, nautical, audit) {
  const baseThr = CONFIG.clip.auto[key];
  if (baseThr == null) return false;

  // Nautical guardrail
  if (nautical && CONFIG.clip.nauticalBlock.has(key)) {
    const m = marginWithinGroup(scores, key, CONFIG.clip.confusableGroup);
    const ok = score >= CONFIG.clip.nauticalOverride.minScore && m.margin >= CONFIG.clip.nauticalOverride.minMargin;
    if (!ok) {
      pushAudit(audit.blocked, { key, score, source: 'clip:blocked-nautical', meta: { requiredMinScore: CONFIG.clip.nauticalOverride.minScore, requiredMinMargin: CONFIG.clip.nauticalOverride.minMargin, margin: Number(m.margin.toFixed(4)), topKey: m.topKey }});
      return false;
    }
  }

  // Confusable margin rule
  if (CONFIG.clip.confusableGroup.has(key)) {
    const m = marginWithinGroup(scores, key, CONFIG.clip.confusableGroup);
    if (m.topKey !== key) {
      // Only auto-apply the top class within the confusable set
      pushAudit(audit.blocked, { key, score, source: 'clip:blocked-not-top-confusable', meta: { topKey: m.topKey, topScore: Number(m.topScore.toFixed(4)) }});
      return false;
    }
    if (m.margin < CONFIG.clip.minMargin) {
      pushAudit(audit.blocked, { key, score, source: 'clip:blocked-low-margin', meta: { margin: Number(m.margin.toFixed(4)), secondScore: Number(m.secondScore.toFixed(4)) }});
      return false;
    }
  }

  return score >= baseThr;
}

function main() {
  const bidassoa = readJson(CONFIG.inputBidassoa);
  const suggestions = readJson(CONFIG.inputSuggestions);

  const sugArr = Array.isArray(suggestions.suggestions) ? suggestions.suggestions : [];
  const sugById = indexById(sugArr);

  const out = [];
  let appliedCount = 0;
  let suggestedCount = 0;
  let blockedCount = 0;

  for (const work of bidassoa) {
    const id = String(work.id ?? '');
    const s = sugById.get(id);

    const w = JSON.parse(JSON.stringify(work));
    const audit = ensureAudit(w);

    const hints = parseIdHints(w.id);
    const nautical = isNauticalContext(w.keywords || [], hints);

    if (!s) {
      out.push(w);
      continue;
    }

    const scores = scoresToMap(s.clip);

    // ---------- Heuristic delineado/aplat ----------
    const h = (s.heuristic && Array.isArray(s.heuristic.suggestions)) ? s.heuristic.suggestions : [];
    const outline = h.find(x => x && (x.key === 'delineado' || x.key === 'aplat'));
    if (outline) {
      const ratio = Number(outline.meta?.blackEdgeRatio ?? outline.score ?? 0);
      if (outline.key === 'delineado' && ratio >= CONFIG.heuristic.delineado.minRatio) {
        applyKeyword(w, 'delineado'); removeKeyword(w, 'aplat');
        pushAudit(audit.applied, { key: 'delineado', score: ratio, source: 'heuristic:outline' });
        appliedCount++;
      } else if (outline.key === 'aplat' && ratio <= CONFIG.heuristic.aplat.maxRatio) {
        applyKeyword(w, 'aplat'); removeKeyword(w, 'delineado');
        pushAudit(audit.applied, { key: 'aplat', score: ratio, source: 'heuristic:outline' });
        appliedCount++;
      } else if (ratio >= CONFIG.heuristic.greyZone.min && ratio <= CONFIG.heuristic.greyZone.max) {
        pushAudit(audit.suggested, { key: outline.key, score: ratio, source: 'heuristic:outline' });
        suggestedCount++;
      }
    }

    // ---------- CLIP: autos (direct + guarded) ----------
    for (const [key, thr] of Object.entries(CONFIG.clip.auto)) {
      const sc = bestScore(scores, key);
      if (sc <= 0) continue;

      if (shouldAutoApplyClip(key, sc, scores, nautical, audit)) {
        applyKeyword(w, key);
        pushAudit(audit.applied, { key, score: sc, source: 'clip:auto' });
        appliedCount++;
      } else if (sc >= CONFIG.clip.suggestThreshold) {
        pushAudit(audit.suggested, { key, score: sc, source: 'clip:suggest' });
        suggestedCount++;
      }
    }

    // Count blocked entries (for meta)
    blockedCount += audit.blocked.length;

    // ---------- Landscapes ----------
    for (const key of CONFIG.clip.landscapeKeys) {
      const sc = bestScore(scores, key);
      if (sc >= CONFIG.clip.landscapeAutoThreshold) {
        applyKeyword(w, key);
        pushAudit(audit.applied, { key, score: sc, source: 'clip:auto-landscape' });
        appliedCount++;
      } else if (sc >= CONFIG.clip.suggestThreshold) {
        pushAudit(audit.suggested, { key, score: sc, source: 'clip:suggest-landscape' });
        suggestedCount++;
      }
    }

    // ---------- Conditionals ----------
    const figuraScore = bestScore(scores, 'figura-humana');
    if (figuraScore >= CONFIG.clip.conditional['figura-humana']) {
      applyKeyword(w, 'figura-humana');
      pushAudit(audit.applied, { key: 'figura-humana', score: figuraScore, source: 'clip:conditional' });
      appliedCount++;
    } else if (figuraScore >= CONFIG.clip.suggestThreshold) {
      pushAudit(audit.suggested, { key: 'figura-humana', score: figuraScore, source: 'clip:suggest' });
      suggestedCount++;
    }

    const escenaScore = bestScore(scores, 'escena-de-genero');
    if (escenaScore >= CONFIG.clip.conditional['escena-de-genero'] && figuraScore >= CONFIG.clip.support.escenaFiguraHumana) {
      applyKeyword(w, 'escena-de-genero'); applyKeyword(w, 'figura-humana');
      pushAudit(audit.applied, { key: 'escena-de-genero', score: escenaScore, source: 'clip:conditional' });
      appliedCount++;
    } else if (escenaScore >= CONFIG.clip.suggestThreshold) {
      pushAudit(audit.suggested, { key: 'escena-de-genero', score: escenaScore, source: 'clip:suggest' });
      suggestedCount++;
    }

    const musicalScore = bestScore(scores, 'musical');
    if (musicalScore >= CONFIG.clip.conditional.musical && figuraScore >= CONFIG.clip.support.escenaFiguraHumana) {
      applyKeyword(w, 'musical'); applyKeyword(w, 'figura-humana');
      pushAudit(audit.applied, { key: 'musical', score: musicalScore, source: 'clip:conditional' });
      appliedCount++;
    } else if (musicalScore >= CONFIG.clip.suggestThreshold) {
      pushAudit(audit.suggested, { key: 'musical', score: musicalScore, source: 'clip:suggest' });
      suggestedCount++;
    }

    const autorScore = bestScore(scores, 'autorretrato');
    if (autorScore >= CONFIG.clip.conditional.autorretrato) {
      applyKeyword(w, 'autorretrato');
      pushAudit(audit.applied, { key: 'autorretrato', score: autorScore, source: 'clip:conditional' });
      appliedCount++;
    } else if (autorScore >= CONFIG.clip.suggestThreshold) {
      pushAudit(audit.suggested, { key: 'autorretrato', score: autorScore, source: 'clip:suggest' });
      suggestedCount++;
    }

    const puertoScore = bestScore(scores, 'puerto');
    if (puertoScore >= CONFIG.clip.conditional.puerto) {
      const barcosScore = bestScore(scores, 'barcos');
      const nauticoScore = bestScore(scores, 'paisaje-nautico');
      const rioScore = bestScore(scores, 'rio');
      const ok = (barcosScore >= CONFIG.clip.support.puertoAny) ||
                 (nauticoScore >= CONFIG.clip.support.puertoAny) ||
                 (rioScore >= CONFIG.clip.support.puertoAny) ||
                 hints.has('puerto');
      if (ok) {
        applyKeyword(w, 'puerto');
        pushAudit(audit.applied, { key: 'puerto', score: puertoScore, source: 'clip:conditional' });
        appliedCount++;
      } else {
        pushAudit(audit.suggested, { key: 'puerto', score: puertoScore, source: 'clip:suggest' });
        suggestedCount++;
      }
    } else if (puertoScore >= CONFIG.clip.suggestThreshold) {
      pushAudit(audit.suggested, { key: 'puerto', score: puertoScore, source: 'clip:suggest' });
      suggestedCount++;
    }

    const rioScore = bestScore(scores, 'rio');
    if (rioScore >= CONFIG.clip.conditional.rio) {
      const nauticoScore = bestScore(scores, 'paisaje-nautico');
      if (nauticoScore >= CONFIG.clip.support.rioPaisajeNautico || hints.has('rio')) {
        applyKeyword(w, 'rio');
        pushAudit(audit.applied, { key: 'rio', score: rioScore, source: 'clip:conditional' });
        appliedCount++;
      } else {
        pushAudit(audit.suggested, { key: 'rio', score: rioScore, source: 'clip:suggest' });
        suggestedCount++;
      }
    } else if (rioScore >= CONFIG.clip.suggestThreshold) {
      pushAudit(audit.suggested, { key: 'rio', score: rioScore, source: 'clip:suggest' });
      suggestedCount++;
    }

    w.keywords = uniqPreserve(w.keywords || []);
    out.push(w);
  }

  const meta = {
    generated_at: new Date().toISOString(),
    input_bidassoa: path.relative(process.cwd(), CONFIG.inputBidassoa),
    input_suggestions: path.relative(process.cwd(), CONFIG.inputSuggestions),
    output_tagged: path.relative(process.cwd(), CONFIG.outputTagged),
    applied_events: appliedCount,
    suggested_events: suggestedCount,
    blocked_events: blockedCount,
    rules: {
      clip: {
        suggestThreshold: CONFIG.clip.suggestThreshold,
        auto: CONFIG.clip.auto,
        conditional: CONFIG.clip.conditional,
        landscapeAutoThreshold: CONFIG.clip.landscapeAutoThreshold,
        minMargin: CONFIG.clip.minMargin,
        nauticalOverride: CONFIG.clip.nauticalOverride,
        nauticalBlock: Array.from(CONFIG.clip.nauticalBlock)
      },
      heuristic: CONFIG.heuristic
    }
  };

  return { meta, works: out };
}

async function run() {
  const result = main();
  await fsp.writeFile(CONFIG.outputTagged, JSON.stringify(result.works, null, 2), 'utf-8');
  const metaPath = CONFIG.outputTagged.replace(/\.json$/i, '.meta.json');
  await fsp.writeFile(metaPath, JSON.stringify(result.meta, null, 2), 'utf-8');
  console.log(`OK: ${CONFIG.outputTagged}`);
  console.log(`OK: ${metaPath}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
