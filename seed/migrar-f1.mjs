// F1 multi-desarrolladora: copia la obra y las tipologías de las colecciones raíz
// a desarrolladoras/{dev}/obras/{obra}/..., tal como están HOY en Firestore (no
// desde demo/data-demo.js, para no pisar lo cambiado en la consola, ej. features).
// Además crea desarrolladoras/{dev} (desde tenant.js) y las unidades (sin precio).
// No borra nada: las colecciones viejas siguen hasta la F7.
// Requiere las reglas temporales firebase/firestore.rules.carga-inicial publicadas.
//
// Uso:  node seed/migrar-f1.mjs [--dry]
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry");

const ctx = { self: {}, window: {} };
for (const f of ["tenant.js", "config.js", "demo/data-demo.js"])
  vm.runInNewContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
const CFG = ctx.self.APP_CONFIG;
const T = ctx.self.TENANT;
const { UNIDADES } = ctx.window;
if (CFG.demo) throw new Error("config.js está en modo demo.");

const BASE = `https://firestore.googleapis.com/v1/projects/${CFG.firebase.projectId}/databases/(default)/documents`;
const KEY = `key=${CFG.firebase.apiKey}`;
const DEV = `desarrolladoras/${T.id}`;
const OBRA = `${DEV}/obras/${CFG.obraId}`;

const val = (v) => {
  if (v === null || v === undefined) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(val) } };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "object") return { mapValue: { fields: campos(v) } };
  return { stringValue: String(v) };
};
const campos = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, val(v)]));

async function leer(ruta) {
  const r = await fetch(`${BASE}/${ruta}?${KEY}`);
  if (!r.ok) throw new Error(`leer ${ruta}: ${r.status} ${await r.text()}`);
  return r.json();
}
// fields ya viene en formato REST cuando se copia un doc tal cual.
async function escribir(ruta, fields) {
  if (dry) return console.log("[dry]", ruta, Object.keys(fields).join(", "));
  const r = await fetch(`${BASE}/${ruta}?${KEY}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!r.ok) throw new Error(`${ruta}: ${r.status} ${await r.text()}`);
  console.log("✓", ruta);
}

// 1. Desarrolladora (pública: marca, contacto, tema; sin datos de inversores)
const { id, legado, ...publico } = T;
await escribir(DEV, campos(publico));

// 2. Obra, copiada tal cual
const obra = await leer(`obras/${CFG.obraId}`);
await escribir(OBRA, obra.fields);

// 3. Tipologías, copiadas tal cual (pasan de globales a ser de la obra)
const { documents: tipos = [] } = await leer("tipologias");
for (const d of tipos) await escribir(`${OBRA}/tipologias/${d.name.split("/").pop()}`, d.fields);

// 4. Unidades: piso y tipología explícitos (antes se adivinaban del nombre "3C"). Sin precio.
for (const [u, { cub, semi }] of Object.entries(UNIDADES)) {
  const piso = Number(u.slice(0, -1));
  const tipologiaId = u.slice(-1);
  await escribir(`${OBRA}/unidades/${u}`, campos({ nombre: `${piso}°${tipologiaId}`, piso, tipologiaId, cub, semi }));
}
console.log(`\nListo: ${DEV}, obra, ${tipos.length} tipologías y ${Object.keys(UNIDADES).length} unidades.`);
