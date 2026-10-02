// Arranque de la app: decide de dónde salen los datos, maneja el código
// personal del inversor y las notificaciones push.
const CFG = self.APP_CONFIG;
const T = self.TENANT;
const $ = (id) => document.getElementById(id);
const CODE_KEY = "codigo";

// localStorage con prefijo por desarrolladora ("rso.codigo"): todas comparten el
// origen de GitHub Pages. Si la desarrolladora tiene claves viejas (legado, solo
// RSO: "adp.codigo"), se leen una vez y se pasan al nombre nuevo.
const ls = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};
const viejo = T.legado?.localStorage;
const store = {
  get: (k) => {
    const v = ls.get(`${T.id}.${k}`);
    if (v !== null || !viejo) return v;
    const antes = ls.get(`${viejo}.${k}`);
    if (antes !== null) ls.set(`${T.id}.${k}`, antes);
    return antes;
  },
  set: (k, v) => ls.set(`${T.id}.${k}`, v),
  del: (k) => { ls.del(`${T.id}.${k}`); if (viejo) ls.del(`${viejo}.${k}`); },
};

// ---------- Marca y textos de la desarrolladora ----------
document.title = T.app.nombre;
document.querySelectorAll("[data-marca]").forEach((el) => {
  el.innerHTML = "";
  const b = document.createElement("b");
  b.textContent = T.marca.corto;
  el.append(b, T.marca.largo);
});
$("gate-titulo").textContent = T.app.nombre;
$("gate-contacto").textContent = `¿No lo tenés? Escribinos a ${T.contacto.email}`;

// ---------- Service worker (instalable + offline + push) ----------
let swReg = null;
if ("serviceWorker" in navigator) {
  swReg = navigator.serviceWorker.register("./firebase-messaging-sw.js", { scope: "./" }).catch((e) => {
    console.warn("SW no registrado", e);
    return null;
  });
}

// ---------- Firebase (carga perezosa desde el CDN) ----------
const sdk = (m) => `https://www.gstatic.com/firebasejs/${CFG.firebaseSdk}/firebase-${m}.js`;
let fb = null;
async function firebase() {
  if (fb) return fb;
  const [{ initializeApp }, fs] = await Promise.all([import(sdk("app")), import(sdk("firestore"))]);
  const app = initializeApp(CFG.firebase);
  fb = { app, fs, db: fs.getFirestore(app) };
  return fb;
}

// ---------- Datos ----------
async function cargarDemo() {
  await new Promise((ok, err) => {
    const s = document.createElement("script");
    s.src = "demo/data-demo.js";
    s.onload = ok;
    s.onerror = err;
    document.head.appendChild(s);
  });
  const pedida = (new URLSearchParams(location.search).get("unidad") || "").toUpperCase();
  const cod = window.UNIDADES[pedida] ? pedida : window.BOLETO.unidad;
  return {
    OBRA: window.OBRA,
    TIPOLOGIAS: window.TIPOLOGIAS,
    INVERSOR: { ...window.BOLETO, ...window.UNIDADES[cod], unidad: cod },
  };
}

// Obra, tipologías y unidad: primero en desarrolladoras/{dev}/obras/{obra}/... (F1);
// si no está (o las reglas nuevas no están publicadas), en las colecciones raíz viejas.
async function cargarObra(fs, db, unidadId) {
  const base = ["desarrolladoras", T.id, "obras", CFG.obraId];
  try {
    const obra = await fs.getDoc(fs.doc(db, ...base));
    if (obra.exists()) {
      const [tipos, unidad] = await Promise.all([
        fs.getDocs(fs.collection(db, ...base, "tipologias")),
        fs.getDoc(fs.doc(db, ...base, "unidades", String(unidadId))),
      ]);
      return { obra, tipos, UNIDAD: unidad.exists() ? unidad.data() : null };
    }
  } catch (e) {
    console.warn("Ruta nueva no disponible, uso la anterior", e.code || e);
  }
  const [obra, tipos] = await Promise.all([
    fs.getDoc(fs.doc(db, "obras", CFG.obraId)),
    fs.getDocs(fs.collection(db, "tipologias")),
  ]);
  return { obra, tipos, UNIDAD: null };
}

async function cargarFirestore(codigo) {
  const { fs, db } = await firebase();
  const comp = await fs.getDoc(fs.doc(db, "compradores", codigo));
  if (!comp.exists()) throw new Error("codigo");
  const INVERSOR = comp.data();
  const { obra, tipos, UNIDAD } = await cargarObra(fs, db, INVERSOR.unidad);
  if (!obra.exists()) throw new Error("obra");
  const TIPOLOGIAS = {};
  tipos.forEach((d) => (TIPOLOGIAS[d.id] = d.data()));
  return { OBRA: obra.data(), TIPOLOGIAS, INVERSOR, UNIDAD };
}

const normalizar = (c) => (c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

// ---------- Pantalla de ingreso con código ----------
function pedirCodigo(error) {
  document.body.classList.add("gate-on");
  $("gate-error").textContent = error || "";
  $("gate-form").onsubmit = (e) => {
    e.preventDefault();
    const c = normalizar($("gate-input").value);
    if (c.length < 6) return ($("gate-error").textContent = "Revisá el código: es más largo.");
    store.set(CODE_KEY, c);
    location.reload();
  };
}

async function iniciar() {
  let datos, codigo;
  if (CFG.demo) {
    datos = await cargarDemo();
    document.body.classList.add("is-demo");
  } else {
    const url = new URL(location.href);
    const deLink = normalizar(url.searchParams.get("c"));
    if (deLink) {
      store.set(CODE_KEY, deLink);
      url.searchParams.delete("c"); // no dejar el código a la vista
      history.replaceState(null, "", url);
    }
    codigo = store.get(CODE_KEY);
    if (!codigo) return pedirCodigo();
    try {
      datos = await cargarFirestore(codigo);
    } catch (e) {
      if (e.message === "codigo") {
        store.del(CODE_KEY);
        return pedirCodigo(`Ese código no existe. Revisalo o pedilo a ${T.nombreCorto}.`);
      }
      console.error(e);
      return pedirCodigo("No pudimos cargar los datos. Probá de nuevo en un rato.");
    }
  }
  window.renderApp(datos, accionesVisitas(codigo));
  prepararAvisos();
}

// ---------- Visitas a obra: "Quiero ir" ----------
// Se guarda en inscripciones/{codigo}__{visita} (solo creación, ver firestore.rules)
// y se recuerda en el celular para mostrar "Anotado".
function accionesVisitas(codigo) {
  const clave = (id) => `visita.${id}`;
  return {
    visitaAnotada: (id) => store.get(clave(id)) === "ok",
    anotarVisita: async (v) => {
      try {
        if (!CFG.demo) {
          const { fs, db } = await firebase();
          await fs.setDoc(fs.doc(db, "inscripciones", `${codigo}__${v.id}`), {
            obra: CFG.obraId,
            visita: v.id,
            codigo,
            creado: fs.serverTimestamp(),
          });
        }
        store.set(clave(v.id), "ok");
        aviso(CFG.demo ? "Modo demo: quedaría anotado para la visita." : "Listo: te anotamos. Te avisamos la fecha exacta con tiempo.");
        return true;
      } catch (e) {
        console.error(e);
        aviso("No pudimos anotarte. Probá de nuevo en un rato.");
        return false;
      }
    },
  };
}

// ---------- Notificaciones push ----------
const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const instalada = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

function prepararAvisos() {
  const btn = $("avisos");
  if (!btn) return;
  const estado = typeof Notification !== "undefined" ? Notification.permission : "unsupported";
  if (estado === "granted" && store.get("push") === "ok") btn.classList.add("on");
  btn.hidden = false;
  btn.onclick = activarAvisos;
  if (!CFG.demo && estado === "granted" && store.get("push") === "ok") primerPlanoAlAbrir();
}

// Con la app abierta FCM no muestra la notificación solo: la mostramos nosotros.
let escuchando = false;
function escucharEnPrimerPlano(messaging, onMessage, reg) {
  if (escuchando) return;
  escuchando = true;
  onMessage(messaging, ({ notification = {} }) => {
    reg?.showNotification(notification.title || T.app.nombre, {
      body: notification.body || "",
      icon: "icons/icon-192.png",
    });
  });
}

async function primerPlanoAlAbrir() {
  try {
    const reg = await swReg;
    const { app } = await firebase();
    const { getMessaging, onMessage, isSupported } = await import(sdk("messaging"));
    if (await isSupported()) escucharEnPrimerPlano(getMessaging(app), onMessage, reg);
  } catch (e) {
    console.warn("Avisos en primer plano no disponibles", e);
  }
}

function aviso(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(aviso.t);
  aviso.t = setTimeout(() => t.classList.remove("show"), 4200);
}

async function activarAvisos() {
  const btn = $("avisos");
  if (CFG.demo) return aviso("Modo demo: los avisos se activan cuando esté conectado Firebase.");
  if (esIOS && !instalada)
    return aviso("En iPhone: tocá Compartir → “Agregar a inicio”, abrí la app desde el ícono y activá los avisos ahí.");
  if (typeof Notification === "undefined" || !("serviceWorker" in navigator))
    return aviso("Este navegador no admite notificaciones.");

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return aviso("Sin permiso no podemos avisarte. Podés cambiarlo en los ajustes del navegador.");

  try {
    btn.classList.add("busy");
    const reg = await swReg;
    const { app, fs, db } = await firebase();
    const { getMessaging, getToken, onMessage, isSupported } = await import(sdk("messaging"));
    if (!(await isSupported())) return aviso("Este navegador no admite notificaciones push.");
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: CFG.vapidKey, serviceWorkerRegistration: reg });
    await fs.setDoc(fs.doc(db, "fcmTokens", token), {
      obra: CFG.obraId,
      creado: fs.serverTimestamp(),
      plataforma: esIOS ? "ios" : /android/i.test(navigator.userAgent) ? "android" : "otro",
    });
    store.set("push", "ok");
    btn.classList.add("on");
    aviso("Listo: te vamos a avisar cuando haya novedades de la obra.");

    escucharEnPrimerPlano(messaging, onMessage, reg);
  } catch (e) {
    console.error(e);
    aviso("No pudimos activar los avisos. Probá de nuevo.");
  } finally {
    btn.classList.remove("busy");
  }
}

iniciar();
