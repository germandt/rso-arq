// Carga inicial de datos en Firestore por REST (sin credenciales secretas).
// Requiere que estén publicadas las reglas temporales firebase/firestore.rules.carga-inicial.
//
// Uso:  node seed/cargar.mjs [--dry] [--solo-obra]
//   --solo-obra: actualiza solo obras/{obraId} (avance, features, visitas) y no toca compradores
//   - obra, tipologías y precios salen de demo/data-demo.js
//   - compradores salen de seed/compradores.json (si no existe, usa compradores.ejemplo.json)
//   - genera un código por comprador y los guarda en seed/codigos.csv (NO se sube al repo)
//   - obra y tipologías se escriben en las colecciones raíz y en desarrolladoras/{dev}/obras/{obra}/
//     (F1; las raíz quedan hasta la F7). Las unidades, solo en la ruta nueva y sin precio.
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry");
const soloObra = process.argv.includes("--solo-obra");

// --- Config pública y datos demo (se evalúan los scripts tal cual) ---
const ctx = { self: {}, window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "tenant.js"), "utf8"), ctx);
vm.runInNewContext(fs.readFileSync(path.join(root, "config.js"), "utf8"), ctx);
vm.runInNewContext(fs.readFileSync(path.join(root, "demo/data-demo.js"), "utf8"), ctx);
const CFG = ctx.self.APP_CONFIG;
const OBRA_NUEVA = `desarrolladoras/${ctx.self.TENANT.id}/obras/${CFG.obraId}`;
const { OBRA, UNIDADES, TIPOLOGIAS } = ctx.window;
if (CFG.demo && !dry) throw new Error("Primero completá config.js con el firebaseConfig real.");

const compFile = fs.existsSync(path.join(root, "seed/compradores.json"))
  ? "seed/compradores.json"
  : "seed/compradores.ejemplo.json";
const compradores = JSON.parse(fs.readFileSync(path.join(root, compFile), "utf8"));

// --- Códigos: 8 caracteres sin letras/números confundibles ---
const ALFA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const nuevoCodigo = () => Array.from(crypto.randomBytes(8), (b) => ALFA[b % ALFA.length]).join("");
const lindo = (c) => c.slice(0, 4) + "-" + c.slice(4);

// --- Codificación de valores al formato REST de Firestore ---
const val = (v) => {
  if (v === null || v === undefined) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(val) } };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "object") return { mapValue: { fields: campos(v) } };
  return { stringValue: String(v) };
};
const campos = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, val(v)]));

async function escribir(col, id, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${CFG.firebase.projectId}/databases/(default)/documents/${col}/${encodeURIComponent(id)}?key=${CFG.firebase.apiKey}`;
  if (dry) return console.log("[dry]", col, id);
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: campos(data) }),
  });
  if (!r.ok) throw new Error(`${col}/${id}: ${r.status} ${await r.text()}`);
  console.log("✓", col, id);
}

await escribir("obras", CFG.obraId, OBRA);
await escribir(OBRA_NUEVA.split("/").slice(0, -1).join("/"), CFG.obraId, OBRA);
if (soloObra) process.exit(0);
// Firestore no admite listas dentro de listas: [["Baño", "2.25 × 1.65 m"]] → [{ nombre, medida }]
for (const [id, t] of Object.entries(TIPOLOGIAS)) {
  const ambientesDetalle = (t.ambientesDetalle || []).map(([nombre, medida]) => ({ nombre, medida }));
  await escribir("tipologias", id, { ...t, ambientesDetalle });
  await escribir(`${OBRA_NUEVA}/tipologias`, id, { ...t, ambientesDetalle });
}
for (const [u, { cub, semi }] of Object.entries(UNIDADES)) {
  const piso = Number(u.slice(0, -1));
  const tipologiaId = u.slice(-1);
  await escribir(`${OBRA_NUEVA}/unidades`, u, { nombre: `${piso}°${tipologiaId}`, piso, tipologiaId, cub, semi });
}

const csv = (x) => (/[",\n]/.test(x) ? `"${String(x).replace(/"/g, '""')}"` : x);
const filas = ["cliente,unidad,codigo,link"];
for (const c of compradores) {
  const u = UNIDADES[c.unidad];
  if (!u) throw new Error(`La unidad ${c.unidad} no está en la tabla de precios`);
  const { codigo: fijo, ...datos } = c;
  const codigo = fijo || nuevoCodigo();
  await escribir("compradores", codigo, { ...u, ...datos });
  filas.push([c.cliente, c.unidad, lindo(codigo), `?c=${codigo}`].map(csv).join(","));
}
fs.writeFileSync(path.join(root, "seed/codigos.csv"), filas.join("\n") + "\n");
console.log(`\nCódigos guardados en seed/codigos.csv (${compradores.length}). No subir al repo.`);
