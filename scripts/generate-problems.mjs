// scripts/generate-problems.mjs
// One-time/rerunnable data export: reads src/data/problemPools.ts (TS source
// of truth, used by the main app) and snapshots it as JSON under
// public/problems/, one file per captcha type plus an aggregated all.json.
// The backend API (backend/data/loadProblems.js) reads those JSON files at
// startup. Run again with `npm run generate-problems` whenever
// problemPools.ts changes and the API's data needs to be refreshed.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_POOLS = path.resolve(__dirname, "../src/data/problemPools.ts");
const OUT_DIR = path.resolve(__dirname, "../public/problems");

const pools = await import(`file://${SOURCE_POOLS}`);

// pool export name -> JSON file name (matches each problem's own `type` field)
const POOL_TO_FILE = {
  sentenceOrderPool: "sentence_order",
  contextBlankPool: "context_blank",
  spellingPool: "spelling",
  wordMatchPool: "word_match",
  factOpinionPool: "fact_opinion",
  spacingDictationPool: "spacing_dictation",
  idiomPool: "idiom",
  characterFeelingPool: "character_feeling",
  expressionPool: "expression",
  sentenceStructurePool: "sentence_structure",
  mainIdeaPool: "main_idea",
  punctuationPool: "punctuation",
  crosswordPool: "crossword",
};

await mkdir(OUT_DIR, { recursive: true });

const all = [];
for (const [exportName, fileName] of Object.entries(POOL_TO_FILE)) {
  const pool = pools[exportName];
  if (!pool) throw new Error(`Missing export "${exportName}" in problemPools.ts`);
  await writeFile(path.join(OUT_DIR, `${fileName}.json`), JSON.stringify(pool, null, 2), "utf8");
  all.push(...pool);
  console.log(`wrote ${fileName}.json (${pool.length} problems)`);
}

await writeFile(path.join(OUT_DIR, "all.json"), JSON.stringify(all, null, 2), "utf8");
console.log(`wrote all.json (${all.length} problems total)`);
