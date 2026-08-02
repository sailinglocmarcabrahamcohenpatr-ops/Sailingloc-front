/* ──────────────────────────────────────────────────────────────
   Audit i18n — garde-fou de synchronisation FR ⇄ EN.

   TypeScript garantit déjà la parité des CLÉS (en.ts est typé
   `: Dictionary`). Ce que le compilateur NE voit pas : une valeur FR
   modifiée laisse sa traduction EN silencieusement périmée (les deux
   restent `string`). Ce script comble ce trou.

   Il fait trois choses :
     1. Vérifie la parité des clés fr ⇄ en (redondant avec tsc, utile en CI).
     2. Détecte les traductions PÉRIMÉES : il mémorise un hash de chaque
        valeur FR au moment où elle a été validée (scripts/i18n-hashes.json).
        Si la valeur FR change, la clé EN est signalée « à revoir ».
     3. `--write` : après avoir rafraîchi les valeurs EN, réenregistre les
        hashes FR courants comme « à jour ».

   Aucune dépendance ajoutée : on transpile fr.ts/en.ts en mémoire via le
   compilateur `typescript` (déjà présent), sans les importer directement.

   Usage :
     node scripts/i18n-audit.mjs          # audit (échoue si problème)
     node scripts/i18n-audit.mjs --write  # valide l'état FR courant
   ────────────────────────────────────────────────────────────── */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DICT_DIR = join(ROOT, "shared", "i18n", "dictionaries");
const HASH_FILE = join(__dirname, "i18n-hashes.json");

/** Transpile un module TS en CJS et l'exécute en isolation pour récupérer
 *  l'objet exporté (les imports de types sont effacés → aucun require réel). */
function loadDict(fileName, exportName) {
  const src = readFileSync(join(DICT_DIR, fileName), "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const module = { exports: {} };
  new Function("module", "exports", "require", outputText)(module, module.exports, () => ({}));
  return module.exports[exportName];
}

/** Aplati un dictionnaire imbriqué en { "a.b.c": valeur }. Les tableaux
 *  deviennent "a.b[0]", "a.b[1]"… pour un suivi clé par clé. */
function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => { out[`${path}[${i}]`] = item; });
    } else if (v && typeof v === "object") {
      flatten(v, path, out);
    } else {
      out[path] = v;
    }
  }
  return out;
}

const hash = (s) => createHash("sha256").update(String(s)).digest("hex").slice(0, 16);

const fr = flatten(loadDict("fr.ts", "fr"));
const en = flatten(loadDict("en.ts", "en"));

const frKeys = new Set(Object.keys(fr));
const enKeys = new Set(Object.keys(en));

const missing = [...frKeys].filter((k) => !enKeys.has(k)); // présent FR, absent EN
const extra = [...enKeys].filter((k) => !frKeys.has(k));   // présent EN, absent FR

const write = process.argv.includes("--write");
const storedHashes = existsSync(HASH_FILE) ? JSON.parse(readFileSync(HASH_FILE, "utf8")) : {};

if (write) {
  const next = {};
  for (const k of frKeys) next[k] = hash(fr[k]);
  writeFileSync(HASH_FILE, JSON.stringify(next, null, 2) + "\n");
  console.log(`✓ ${frKeys.size} hashes FR enregistrés dans ${HASH_FILE.replace(ROOT, ".")}`);
  process.exit(0);
}

// Périmées : la valeur FR a changé depuis le dernier --write.
const stale = [...frKeys].filter(
  (k) => storedHashes[k] !== undefined && storedHashes[k] !== hash(fr[k])
);
// Jamais validées : clés FR sans hash de référence (traduction à confirmer).
const unverified = [...frKeys].filter((k) => storedHashes[k] === undefined);

const report = (title, keys) => {
  if (!keys.length) return;
  console.log(`\n${title} (${keys.length}) :`);
  for (const k of keys.slice(0, 50)) console.log(`  · ${k}`);
  if (keys.length > 50) console.log(`  … +${keys.length - 50}`);
};

report("❌ Clés manquantes en EN", missing);
report("⚠️  Clés EN orphelines (absentes de FR)", extra);
report("🔁 Traductions EN périmées (valeur FR modifiée)", stale);
report("❓ Clés non encore validées (lancer --write après relecture)", unverified);

const blocking = missing.length + extra.length + stale.length;
if (blocking === 0 && unverified.length === 0) {
  console.log(`✓ i18n synchronisé : ${frKeys.size} clés, FR ⇄ EN à jour.`);
}
// Échec CI seulement sur les problèmes bloquants ; « non validées » = info.
process.exit(blocking > 0 ? 1 : 0);
