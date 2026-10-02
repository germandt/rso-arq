// Página pública de una desarrolladora: obra en curso, obras terminadas,
// terminaciones, marcas y opiniones. La misma para cualquier desarrolladora:
// todo sale de self.SITIO (t/{dev}/sitio.js) y el tema son variables CSS.
(() => {
  const S = self.SITIO;
  const D = S.desarrolladora;
  const $ = (sel) => document.querySelector(sel);

  // Único punto que arma la URL de una foto: mudar las fotos = cambiar mediaBase.
  const media = (ruta) => S.mediaBase + ruta;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const MESES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."];
  const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const mes = (am) => { const [a, m] = am.split("-"); return `${MESES[+m - 1]} ${a}`; };
  const mesLargo = (am) => { const [a, m] = am.split("-"); return `${MESES_LARGOS[+m - 1]} ${a}`; };
  const meses = (am) => { const [a, m] = am.split("-"); return +a * 12 + +m; };
  const desvio = (o) => meses(o.real) - meses(o.plan);
  const usd = (n) => "USD " + Math.round(n).toLocaleString("es-AR");
  const m2 = (n) => n.toLocaleString("es-AR", { maximumFractionDigits: 2 }) + " m²";
  const ej = (cond) => (cond ? '<span class="ej" title="Dato de ejemplo del mockup">Ejemplo</span>' : "");

  const wa = (texto) => `https://wa.me/${D.contacto.whatsapp}?text=${encodeURIComponent(texto)}`;
  const ICONO = {
    wa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>',
    llave: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/></svg>',
    ok: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
    flecha: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };

  // ── Tema ──
  for (const [k, v] of Object.entries(D.tema)) document.documentElement.style.setProperty(k, v);
  if (D.fuentes) {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = D.fuentes;
    document.head.appendChild(l);
  }
  document.title = `${D.nombre} · Obras`;

  // ── Secciones ──
  const marca = () => `
    <span class="marca"><b>${esc(D.marca.corto)}</b><span>${esc(D.marca.largo)}<br>${esc(D.marca.socios)}</span></span>`;

  const encabezado = () => `
    <div class="aviso-mock">Prototipo: lo marcado como <span class="ej">Ejemplo</span> es ilustrativo.</div>
    <header class="barra">
      <div class="contenedor barra-in">
        ${marca()}
        <nav class="nav" aria-label="Secciones">
          <a href="#en-obra">En obra</a><a href="#entregadas">Entregadas</a><a href="#calidad">Calidad</a><a href="#opiniones">Opiniones</a>
        </nav>
        <a class="btn btn-borde" href="${esc(S.appInversores)}">${ICONO.llave} Soy inversor</a>
      </div>
    </header>`;

  // De la más nueva a la más vieja, por fecha real de entrega.
  const entregas = [...S.terminadas].sort((a, b) => meses(b.real) - meses(a.real));
  const enFecha = entregas.filter((o) => desvio(o) <= 0).length;
  const desvioProm = entregas.reduce((s, o) => s + Math.max(0, desvio(o)), 0) / entregas.length;

  const portada = () => `
    <section class="portada" style="--foto:url('${esc(media(D.portada))}')">
      <div class="contenedor portada-in">
        <h1>${esc(D.lema[0])}<br><span class="verde">${esc(D.lema[1])}</span></h1>
        <p class="bajada">${esc(D.bajada)}</p>
        <dl class="cifras">
          <div><dt>Edificios entregados</dt><dd>${entregas.length}</dd></div>
          <div><dt>En fecha o antes ${ej(entregas.some((o) => o.fechasEjemplo))}</dt><dd>${enFecha} de ${entregas.length}</dd></div>
          <div><dt>Demora promedio</dt><dd>${desvioProm < 1 ? "< 1 mes" : desvioProm.toFixed(1) + " meses"}</dd></div>
        </dl>
        <div class="acciones">
          <a class="btn btn-lleno" href="#en-obra">Ver la obra en curso</a>
          <a class="btn btn-borde" href="#entregadas">Lo que ya entregamos</a>
        </div>
      </div>
    </section>`;

  const enObra = (o) => {
    const total = o.etapas.reduce((s, e) => s + e.peso, 0);
    const avance = Math.round(o.etapas.reduce((s, e) => s + e.peso * e.avance, 0) / total);
    const disp = o.disponibilidad || {};
    const msj = `Hola, quiero información para invertir en ${o.nombre}.`;
    return `
    <section id="en-obra" class="seccion">
      <div class="contenedor">
        <p class="eb">En obra</p>
        <h2>${esc(o.nombre)}</h2>
        <p class="sub">${esc(o.direccion)} · ${esc(o.barrio)}. ${esc(o.ubicacion)}</p>
        <div class="obra-grid">
          <figure class="obra-render">
            <img src="${esc(media(o.render))}" alt="Render de ${esc(o.nombre)}" loading="lazy">
            <figcaption>Imagen ilustrativa del proyecto</figcaption>
          </figure>
          <div class="obra-datos">
            <div class="avance-total">
              <div class="fila"><span>Avance general</span><b class="ambar" data-avance>${avance}%</b></div>
              <div class="barra-av"><i style="width:${avance}%"></i></div>
              <p class="nota">Actualizado el ${esc(new Date(o.actualizado + "T12:00").toLocaleDateString("es-AR"))} · Entrega planificada: ${esc(mesLargo(o.entregaPlanificada))}</p>
            </div>
            <ol class="etapas">
              ${o.etapas.map((e) => {
                const estado = e.avance >= 100 ? "hecha" : e.avance > 0 ? "curso" : "";
                const fechas = e.real
                  ? `Plan ${mes(e.plan)} · <b class="verde">real ${mes(e.real)}</b>`
                  : `Plan ${mes(e.plan)}`;
                return `<li class="${estado}">
                  <span class="punto">${e.avance >= 100 ? ICONO.ok : ""}</span>
                  <div><div class="fila"><b>${esc(e.nombre)}</b><span>${e.avance}%</span></div>
                  <div class="barra-av fina"><i style="width:${e.avance}%"></i></div>
                  <p class="nota">${e.detalle ? esc(e.detalle) + " · " : ""}${fechas} ${ej(e.ejemplo)}</p></div>
                </li>`;
              }).join("")}
            </ol>
          </div>
        </div>

        <h3>Tipologías</h3>
        <div class="tipos">
          ${o.tipologias.map((t) => `
            <article class="tipo">
              <img src="${esc(media(t.plano))}" alt="Plano de la tipología ${esc(t.id)}" loading="lazy">
              <div class="tipo-txt">
                <div class="fila"><b class="titulo">Tipología ${esc(t.id)}</b>${disp[t.id] != null ? `<span class="chip">Quedan ${disp[t.id]} ${ej(disp.ejemplo)}</span>` : ""}</div>
                <p>${esc(t.nombre)} · ${esc(t.ubicacion)}</p>
                <p class="nota">${m2(t.cub)} cubiertos + ${m2(t.semi)} semicubiertos = <b>${m2(t.cub + t.semi)}</b></p>
                <a class="link" href="${esc(wa(`${msj} Me interesa la tipología ${t.id}.`))}" target="_blank" rel="noopener">Consultar por la ${esc(t.id)} ${ICONO.flecha}</a>
              </div>
            </article>`).join("")}
        </div>

        <div class="invertir">
          <div>
            <p class="eb">Invertí en pozo</p>
            <p class="precio">Desde ${usd(o.precioDesde.usd)}</p>
            <p class="nota">${esc(o.precioDesde.nota)} ${esc(o.financiacion.texto)} ${ej(o.financiacion.ejemplo)}</p>
            <ul class="lista">${o.terminaciones.map((t) => `<li>${ICONO.ok}<span>${esc(t)}</span></li>`).join("")}</ul>
          </div>
          <div class="invertir-cta">
            <div class="visita">
              <p class="eb ambar">Obra abierta ${ej(o.visita.ejemplo)}</p>
              <p><b>${esc(o.visita.titulo)}</b><br>${esc(mesLargo(o.visita.mes))}. Vení a ver cómo construimos.</p>
              <a class="link" href="${esc(wa(`Hola, quiero anotarme a la recorrida de ${o.nombre} de ${mesLargo(o.visita.mes)}.`))}" target="_blank" rel="noopener">Quiero ir ${ICONO.flecha}</a>
            </div>
            <a class="btn btn-lleno grande" href="${esc(wa(msj))}" target="_blank" rel="noopener">${ICONO.wa} Quiero invertir</a>
          </div>
        </div>
      </div>
    </section>`;
  };

  const etiquetaPlazo = (o) => {
    const d = desvio(o);
    if (d < 0) return `<span class="plazo ok">${-d} ${-d === 1 ? "mes" : "meses"} antes</span>`;
    if (d === 0) return `<span class="plazo ok">En fecha</span>`;
    return `<span class="plazo tarde">+${d} ${d === 1 ? "mes" : "meses"}</span>`;
  };

  const comparador = (o) => `
    <div class="comp" style="--pos:50%">
      <img src="${esc(media(o.foto))}" alt="${esc(o.nombre)} terminado" loading="lazy">
      <img class="comp-arriba" src="${esc(media(o.render))}" alt="Render de venta de ${esc(o.nombre)}" loading="lazy">
      <span class="comp-et izq">Así lo proyectamos</span><span class="comp-et der">Así quedó</span>
      <input type="range" min="0" max="100" value="50" aria-label="Comparar render y foto real de ${esc(o.nombre)}">
    </div>`;

  const entregadas = () => `
    <section id="entregadas" class="seccion alt">
      <div class="contenedor">
        <p class="eb">Lo que ya entregamos</p>
        <h2>Lo que prometimos, y cuándo lo entregamos</h2>
        <p class="sub">Cada obra con su fecha de entrega comprometida y la real. ${ej(entregas.some((o) => o.fechasEjemplo))}</p>
        <div class="obras">
          ${entregas.map((o) => `
            <article class="obra">
              ${o.render ? comparador(o) : `<figure class="obra-foto"><img src="${esc(media(o.foto))}" alt="${esc(o.nombre)}" loading="lazy">${o.fotoIlustrativa ? "<figcaption>Imagen ilustrativa</figcaption>" : ""}</figure>`}
              <div class="obra-txt">
                <div class="fila"><h3>${esc(o.nombre)}</h3>${etiquetaPlazo(o)}</div>
                <p class="nota">${esc(o.barrio)} · ${esc(o.resumen)}</p>
                <dl class="plazos">
                  <div><dt>Inicio</dt><dd>${o.inicio}</dd></div>
                  <div><dt>Prometida</dt><dd>${mes(o.plan)}</dd></div>
                  <div><dt>Entregada</dt><dd>${mes(o.real)}</dd></div>
                </dl>
                ${o.marcas ? `<p class="marcas-obra">${o.marcas.map((m) => `<span>${esc(m)}</span>`).join("")} ${ej(o.marcasEjemplo)}</p>` : ""}
                ${o.proceso ? `<ol class="proceso">${o.proceso.map((p) => `<li><img src="${esc(media(p.foto))}" alt="" loading="lazy"><span><b>${mes(p.fecha)}</b> ${esc(p.texto)}</span></li>`).join("")}</ol>` : ""}
              </div>
            </article>`).join("")}
        </div>
      </div>
    </section>`;

  const calidad = () => `
    <section id="calidad" class="seccion">
      <div class="contenedor">
        <p class="eb">Calidad</p>
        <h2>Así se terminan nuestros edificios</h2>
        <p class="sub">Fotos reales de unidades entregadas, sin retoques de render.</p>
        <div class="galeria">
          ${S.terminaciones.map((t) => `
            <figure><img src="${esc(media(t.foto))}" alt="${esc(t.texto)}" loading="lazy"><figcaption>${esc(t.texto)}<span>${esc(t.obra)}</span></figcaption></figure>`).join("")}
        </div>
        <h3>Con qué construimos</h3>
        <ul class="marcas">
          ${S.marcas.map((m) => `<li><span class="rubro">${esc(m.rubro)}</span><b>${esc(m.marca)}</b><span class="nota">${esc(m.detalle)} ${ej(m.ejemplo)}</span></li>`).join("")}
        </ul>
      </div>
    </section>`;

  const opiniones = () => `
    <section id="opiniones" class="seccion alt">
      <div class="contenedor">
        <p class="eb">Opiniones</p>
        <h2>Lo que dicen quienes ya invirtieron</h2>
        <div class="testimonios">
          ${S.testimonios.map((t) => `
            <blockquote class="testimonio">
              <p>“${esc(t.texto)}”</p>
              <footer><b>${esc(t.autor)}</b> · ${esc(t.detalle)} ${ej(t.ejemplo)}</footer>
            </blockquote>`).join("")}
        </div>
      </div>
    </section>`;

  const nosotros = () => `
    <section class="seccion">
      <div class="contenedor nosotros">
        <div>
          <p class="eb">Quiénes somos</p>
          <h2>${esc(D.nombre)}</h2>
          <p><b>Misión.</b> ${esc(D.mision)}</p>
          <p><b>Visión.</b> ${esc(D.vision)}</p>
        </div>
        <div class="equipo">
          ${D.equipo.map((p) => `<figure><img src="${esc(media(p.foto))}" alt="${esc(p.nombre)}" loading="lazy"><figcaption><b>${esc(p.nombre)}</b><span>${esc(p.rol)}</span></figcaption></figure>`).join("")}
        </div>
      </div>
    </section>`;

  const pie = () => `
    <footer class="pie">
      <div class="contenedor pie-in">
        ${marca()}
        <ul>
          <li><a href="${esc(wa("Hola, quiero información sobre sus obras."))}" target="_blank" rel="noopener">WhatsApp ${esc(D.contacto.tel)}</a></li>
          <li><a href="mailto:${esc(D.contacto.email)}">${esc(D.contacto.email)}</a></li>
          <li><a href="https://www.instagram.com/${esc(D.contacto.instagram)}/" target="_blank" rel="noopener">@${esc(D.contacto.instagram)}</a></li>
          <li>${esc(D.contacto.direccion)}</li>
        </ul>
      </div>
    </footer>
    <a class="btn btn-lleno flotante" href="${esc(wa(`Hola, quiero información para invertir en ${S.enCurso.nombre}.`))}" target="_blank" rel="noopener">${ICONO.wa} Quiero invertir</a>`;

  const pintar = () => {
    $("#app").innerHTML = encabezado() + "<main>" + portada() + enObra(S.enCurso) + entregadas() + calidad() + opiniones() + nosotros() + "</main>" + pie();
    document.querySelectorAll(".comp input").forEach((r) =>
      r.addEventListener("input", () => r.parentElement.style.setProperty("--pos", r.value + "%")));
  };
  pintar();

  // ── Avance en vivo desde Firestore (lectura pública de obras/{id}) ──
  // Pisa avance, detalle y fecha de actualización; las fechas planificadas quedan.
  const fsValor = (v) => {
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return +v.integerValue;
    if ("doubleValue" in v) return v.doubleValue;
    if ("booleanValue" in v) return v.booleanValue;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(fsValor);
    if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fsValor(x)]));
    return null;
  };
  const cfg = self.APP_CONFIG;
  const vivo = S.enCurso.enVivo;
  if (vivo && cfg && !cfg.demo) {
    fetch(`https://firestore.googleapis.com/v1/projects/${vivo.proyecto}/databases/(default)/documents/${vivo.doc}?key=${cfg.firebase.apiKey}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((doc) => {
        const obra = fsValor({ mapValue: doc });
        if (!Array.isArray(obra.etapas)) return;
        for (const e of S.enCurso.etapas) {
          const x = obra.etapas.find((y) => y.nombre === e.nombre);
          if (x) { e.avance = x.avance; e.detalle = x.detalle || e.detalle; }
        }
        if (obra.actualizado) S.enCurso.actualizado = obra.actualizado;
        $("#en-obra").outerHTML = enObra(S.enCurso);
      })
      .catch(() => {});
  }
})();
