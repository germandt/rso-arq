// Pinta la app a partir de los datos (vienen de Firestore o del modo demo).
// INVERSOR = { cliente, unidad, cub, semi, precio, fechaBoleto, anticipoPct,
//               cuotas, primeraCuota, cuotasPagadas? }
// acciones = { visitaAnotada(id) → bool, anotarVisita(visita) → Promise<bool> } (las pone main.js)
window.renderApp = ({ OBRA, TIPOLOGIAS, INVERSOR }, acciones = {}) => {
  const BOLETO = INVERSOR;
  const $ = (id) => document.getElementById(id);

  const usd = (n) =>
    "USD " + Math.round(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
  const m2 = (n) => n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fecha = (iso, opts = { day: "numeric", month: "short", year: "numeric" }) =>
    new Date(iso + "T12:00:00").toLocaleDateString("es-AR", opts);

  const codigo = String(INVERSOR.unidad).toUpperCase();
  const unidad = INVERSOR;
  const piso = Number(codigo.slice(0, -1));
  const letra = codigo.slice(-1);
  const tipo = TIPOLOGIAS[letra];

  // ---------- 1 · Obra ----------
  $("obra-nombre").textContent = OBRA.nombre;
  $("obra-dir").textContent = `${OBRA.direccion} · ${OBRA.barrio}`;
  $("actualizado").textContent = "Act. " + fecha(OBRA.actualizado, { day: "numeric", month: "short" });
  $("entrega").textContent = OBRA.entregaEstimada;

  const pesoTotal = OBRA.etapas.reduce((s, e) => s + e.peso, 0);
  const avance = Math.round(OBRA.etapas.reduce((s, e) => s + e.peso * e.avance, 0) / pesoTotal);
  const enCurso = OBRA.etapas.find((e) => e.avance > 0 && e.avance < 100);
  $("etapa-actual").innerHTML = enCurso ? `<b>${enCurso.nombre}</b>` : "";

  const frame = $("frame");
  document.querySelectorAll("#render img").forEach((img) => (img.src = OBRA.render.src));
  const H = OBRA.render.h;
  const pct = (y) => (y / H) * 100;
  const nivel = (id) => OBRA.niveles.find((n) => n.id === id);

  const terminado = nivel(OBRA.nivelTerminado);
  const curso = nivel(OBRA.nivelEnCurso);
  const cutY = pct(terminado.top);
  // La franja en ejecución se pinta proporcional a su avance, de abajo hacia arriba.
  const wipTop = pct(curso.bottom - (curso.bottom - curso.top) * OBRA.avanceNivelEnCurso);

  $("cutlabel").textContent = `Estructura hasta ${terminado.nombre} piso`;
  const miPiso = nivel(piso);
  if (miPiso) {
    $("pin").style.top = pct((miPiso.top + miPiso.bottom) / 2) + "%";
    $("pin").querySelector("span").textContent = `Tu piso · ${miPiso.nombre}`;
  } else {
    $("pin").remove();
  }

  function playObra() {
    frame.querySelector(".color").style.clipPath = `inset(${cutY}% 0 0 0)`;
    frame.querySelector(".wip").style.clipPath = `inset(${wipTop}% 0 ${100 - cutY}% 0)`;
    $("cutline").style.top = cutY + "%";
    $("avance-bar").style.width = avance + "%";
    countUp($("avance-num"), avance, 1400);
  }

  // ---------- 2 · Etapas ----------
  $("etapas").innerHTML = OBRA.etapas
    .map((e, i) => {
      const cls = e.avance >= 100 ? "done" : e.avance > 0 ? "doing" : "";
      const icon = e.avance >= 100 ? "✓" : i + 1;
      return `<li class="${cls}">
        <span class="dot">${icon}</span>
        <span class="n">${e.nombre}</span>
        <span class="p">${e.avance}%</span>
        <div class="bar"><i data-w="${e.avance}"></i></div>
        ${e.detalle && e.avance < 100 ? `<span class="d">${e.detalle}</span>` : ""}
      </li>`;
    })
    .join("");

  // ---------- 2b · Visitas a obra (feature por proyecto) ----------
  // OBRA.features.visitas prende la tarjeta de próxima visita y los chips.
  // OBRA.visitas = [{ id, corto, titulo, etapa, fecha: "AAAA-MM", realizada? }]
  const visitas = (OBRA.features?.visitas && OBRA.visitas) || [];
  if (visitas.length) {
    const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const mes = (f) => {
      const [a, m] = f.split("-").map(Number);
      return `${MESES[m - 1]} ${a}`;
    };
    const rombo = (cls) => `<svg class="rombo ${cls}" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.5L12.5 7L7 12.5L1.5 7Z"/></svg>`;
    const proxima = visitas.find((v) => !v.realizada);

    $("slide-etapas").classList.add("con-visitas");
    $("visitas").hidden = false;
    $("visitas").innerHTML = visitas
      .map((v) => {
        const cls = v.realizada ? "ok" : v === proxima ? "next" : "";
        return `<div class="chip-visita ${cls}">${rombo(cls)}<b>${v.corto}</b><span>${v.realizada ? "realizada" : mes(v.fecha)}</span></div>`;
      })
      .join("");

    if (proxima) {
      const [a, m] = proxima.fecha.split("-").map(Number);
      const dias = Math.round((new Date(a, m - 1, 15) - new Date()) / 864e5);
      const falta =
        dias < 7 ? "en las próximas semanas"
        : dias <= 84 ? `faltan ~${Math.round(dias / 7)} semanas`
        : `faltan ~${Math.round(dias / 30.4)} meses`;
      const etapa = OBRA.etapas.find((e) => e.nombre === proxima.etapa);
      const card = $("visita");
      card.hidden = false;
      card.innerHTML = `
        <div class="row">${rombo("next")}<span class="eyebrow ambar">Próxima visita a obra</span></div>
        <h3>${proxima.titulo}</h3>
        <div class="row between">
          <div><span class="muted small">Fecha estimada</span><div class="mid">${mes(proxima.fecha)}</div></div>
          <span class="muted small">${falta}</span>
        </div>
        ${etapa ? `<div class="habilita">
          <div class="row between small"><span class="muted">Se habilita con: ${etapa.nombre}</span><b>${etapa.avance}%</b></div>
          <div class="bar"><i data-w="${etapa.avance}"></i></div>
        </div>` : ""}
        <button type="button" class="cta" id="visita-cta"></button>`;

      const cta = $("visita-cta");
      const pintar = (anotado) => {
        cta.textContent = anotado ? "Anotado ✓ · te avisamos la fecha" : "Quiero ir";
        cta.classList.toggle("done", anotado);
        cta.disabled = anotado;
      };
      pintar(!!acciones.visitaAnotada?.(proxima.id));
      cta.onclick = async () => {
        cta.disabled = true;
        const ok = await acciones.anotarVisita?.(proxima);
        pintar(!!ok);
      };
    }
  }

  function playEtapas() {
    document.querySelectorAll("#etapas .bar i, #visita .bar i").forEach((el, i) => {
      setTimeout(() => (el.style.width = el.dataset.w + "%"), i * 90);
    });
  }

  // ---------- 3 · Unidad ----------
  const total = unidad.cub + unidad.semi;
  $("u-eyebrow").textContent = `Tu unidad · ${OBRA.nombre}`;
  $("u-titulo").textContent = `${piso}° ${letra}`;
  $("u-sub").textContent = `${tipo.ubicacion} · ${tipo.ambientes}`;
  $("u-plano").src = tipo.plano;
  $("u-cub").innerHTML = `${m2(unidad.cub)}<small>m²</small>`;
  $("u-semi").innerHTML = `${m2(unidad.semi)}<small>m²</small>`;
  $("u-total").innerHTML = `${m2(total)}<small>m²</small>`;
  $("u-precio").textContent = usd(unidad.precio);
  $("u-m2precio").textContent = `${usd(unidad.precio / total)} por m² total · Boleto del ${fecha(BOLETO.fechaBoleto)}`;

  // ---------- 4 · Pagos ----------
  const anticipo = unidad.precio * BOLETO.anticipoPct;
  const cuota = (unidad.precio - anticipo) / BOLETO.cuotas;
  const hoy = new Date();
  const primera = new Date(BOLETO.primeraCuota + "T12:00:00");
  const vencida = (k) => {
    const d = new Date(primera);
    d.setMonth(d.getMonth() + k);
    return d;
  };
  // Si hay registro real de pagos se usa; si no, se asume pago todo lo vencido.
  let pagas = 0;
  if (Number.isInteger(BOLETO.cuotasPagadas)) pagas = Math.min(BOLETO.cuotasPagadas, BOLETO.cuotas);
  else while (pagas < BOLETO.cuotas && vencida(pagas) <= hoy) pagas++;
  const pagado = anticipo + pagas * cuota;
  const pctPago = Math.round((pagado / unidad.precio) * 100);

  $("p-anticipo").textContent = `${usd(anticipo)}`;
  $("p-anticipo-fecha").textContent = `Pagado · ${fecha(BOLETO.fechaBoleto, { month: "short", year: "numeric" })}`;
  $("p-cuotas-n").textContent = `${pagas} de ${BOLETO.cuotas}`;
  $("p-cuota-monto").textContent = `· ${usd(cuota)} c/u`;
  $("p-pagado").innerHTML = `${usd(pagado)}<br>de ${usd(unidad.precio)}`;
  $("p-saldo").textContent = usd(unidad.precio - pagado);
  $("p-proxima").textContent =
    pagas < BOLETO.cuotas ? fecha(vencida(pagas).toISOString().slice(0, 10), { day: "numeric", month: "short" }) : "—";
  $("ticks").innerHTML = Array.from({ length: BOLETO.cuotas }, (_, i) =>
    `<i class="${i < pagas ? "paid" : i === pagas ? "next" : ""}" style="transition-delay:${i * 25}ms"></i>`
  ).join("");
  $("contacto").innerHTML =
    `¿Consultas? <a href="mailto:${OBRA.contacto.email}">${OBRA.contacto.email}</a> · ${OBRA.contacto.tel}`;

  function playPagos() {
    const C = 2 * Math.PI * 52;
    $("ring").style.strokeDashoffset = C * (1 - pctPago / 100);
    countUp($("p-pct"), pctPago, 1400);
  }

  // ---------- Feed / navegación ----------
  function countUp(el, to, ms) {
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const feed = $("feed");
  const slides = [...document.querySelectorAll(".slide")];
  const plays = [playObra, playEtapas, null, playPagos];
  const dots = $("dots");
  slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Ir a sección ${i + 1}`);
    b.onclick = () => s.scrollIntoView({ behavior: "smooth" });
    dots.appendChild(b);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const i = slides.indexOf(en.target);
        [...dots.children].forEach((d, j) => d.classList.toggle("on", i === j));
        if (!en.target.classList.contains("on")) {
          en.target.classList.add("on");
          plays[i]?.();
        }
      });
    },
    { root: feed, threshold: 0.6 }
  );
  slides.forEach((s) => io.observe(s));

  // Teclado en desktop
  addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : -1;
    feed.scrollBy({ top: dir * feed.clientHeight, behavior: "smooth" });
  });
};
