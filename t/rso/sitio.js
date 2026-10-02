// Contenido público de la desarrolladora (script plano, como config.js).
// Mismo modelo que el plan multi-desarrolladora: desarrolladora + obras + contenido.
// A futuro sale de Firestore (desarrolladoras/rso/...); las fotos se piden con
// media(ruta), así que mudarlas a otra plataforma es cambiar mediaBase.
// ejemplo: true = dato inventado para el mockup; la página lo marca como EJEMPLO.

self.SITIO = {
  id: "rso",
  mediaBase: "../../media/",
  appInversores: "../../",

  desarrolladora: {
    nombre: "RSO Arquitectos",
    marca: { corto: "RSO", largo: "ARQUITECTOS", socios: "RIGANO.OUBIÑA" },
    lema: ["Diseñamos espacios,", "construimos experiencias."],
    bajada: "Desarrollo, diseño y construcción de vivienda en Buenos Aires desde 2014.",
    mision: "Desarrollar edificios de vivienda que unan diseño, calidad constructiva y valor para quienes invierten con nosotros, con cercanía y transparencia en cada etapa.",
    vision: "Ser el estudio de referencia para invertir con confianza en la ciudad, con obras que sostengan su valor en el tiempo.",
    equipo: [
      { nombre: "Maximiliano Rigano", rol: "Arquitecto · Socio", foto: "rso/equipo/rigano.jpg" },
      { nombre: "María José Oubiña", rol: "Arquitecta · Socia", foto: "rso/equipo/oubina.jpg" },
    ],
    portada: "rso/del-parque-view/obra/2024-01_fachada.jpg",
    contacto: {
      whatsapp: "5491161458770",
      tel: "11 6145-8770",
      email: "info@rsoarquitectos.com",
      instagram: "rso.arquitectos",
      direccion: "Empedrado 2342 9°A, CABA",
    },
    // Tema: variables CSS. Otra desarrolladora = otros valores, mismos componentes.
    tema: {
      "--fondo": "#1e1f2e",
      "--fondo-2": "#262838",
      "--texto": "#f4f5f7",
      "--marca": "#8cc63f",
      "--acento": "#f2b441",
      "--fuente-titulos": '"Roboto Condensed", "Arial Narrow", sans-serif',
      "--fuente-texto": "Inter, system-ui, sans-serif",
    },
    fuentes: "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;600;700&family=Inter:wght@400;500;600&display=swap",
  },

  // ── Obra en curso ──
  enCurso: {
    id: "aires-del-parque",
    nombre: "Aires del Parque",
    direccion: "Baigorria 2432",
    barrio: "Villa del Parque, CABA",
    ubicacion: "A una cuadra y media de Av. San Martín, cerca de Agronomía.",
    render: "rso/aires-del-parque/renders/fachada.jpg",
    composicion: "PB + 9 pisos · 24 departamentos de 2 ambientes · 9 cocheras",
    actualizado: "2026-09-15",
    entregaPlanificada: "2027-12",
    // Avance real desde Firestore si está disponible (ruta F1, con la raíz vieja de respaldo);
    // las fechas planificadas y reales de cada etapa son del mockup.
    enVivo: { proyecto: "rso-arq", doc: "desarrolladoras/rso/obras/aires-del-parque", respaldo: "obras/aires-del-parque" },
    etapas: [
      { nombre: "Demolición y excavación", peso: 5, avance: 100, plan: "2025-09", real: "2025-09", ejemplo: true },
      { nombre: "Fundaciones", peso: 10, avance: 100, plan: "2025-12", real: "2025-11", ejemplo: true },
      { nombre: "Estructura de hormigón", peso: 25, avance: 72, plan: "2026-12", detalle: "Hormigonando losa del 7° piso", ejemplo: true },
      { nombre: "Mampostería", peso: 15, avance: 40, plan: "2027-04", detalle: "PB a 4° piso", ejemplo: true },
      { nombre: "Instalaciones", peso: 15, avance: 18, plan: "2027-06", detalle: "Montantes sanitarias y eléctricas", ejemplo: true },
      { nombre: "Carpinterías y fachada", peso: 15, avance: 0, plan: "2027-08", ejemplo: true },
      { nombre: "Terminaciones", peso: 15, avance: 0, plan: "2027-11", ejemplo: true },
    ],
    tipologias: [
      { id: "A", nombre: "2 ambientes con balcón", ubicacion: "Frente", cub: 39.55, semi: 6, plano: "rso/aires-del-parque/planos/A.png" },
      { id: "B", nombre: "2 ambientes con balcón", ubicacion: "Frente", cub: 40, semi: 5.5, plano: "rso/aires-del-parque/planos/B.png" },
      { id: "C", nombre: "2 ambientes con toilette y balcón", ubicacion: "Contrafrente", cub: 50, semi: 8, plano: "rso/aires-del-parque/planos/C.png" },
    ],
    disponibilidad: { A: 2, B: 4, C: 1, ejemplo: true },
    precioDesde: { usd: 75600, nota: "Valores de preventa, a confirmar con RSO." },
    financiacion: { texto: "30% de anticipo y hasta 36 cuotas en dólares", ejemplo: true },
    visita: { mes: "2026-12", titulo: "Recorrida con la estructura terminada", ejemplo: true },
    terminaciones: [
      "Aberturas Aluar línea A30 con doble vidrio hermético",
      "Sanitarios Roca o Ferrum, grifería monocomando",
      "Mesadas de granito o cuarzo, pileta de acero inoxidable",
      "Ascensor de acero inoxidable con piso de granito",
    ],
  },

  // ── Obras terminadas (de la más nueva a la más vieja) ──
  // plan / real: fecha de entrega prometida y real ("AAAA-MM").
  terminadas: [
    {
      id: "del-parque-view", nombre: "Del Parque View", barrio: "Villa del Parque, CABA", direccion: "Empedrado 2342",
      inicio: 2021, plan: "2023-12", real: "2023-12", fechasEjemplo: true,
      resumen: "1 y 2 ambientes con balcón, cocheras, terraza común y laundry.",
      foto: "rso/del-parque-view/obra/2023-12_terminado.jpg",
      // De la obra a la entrega, con fotos reales de los posts de RSO.
      proceso: [
        { fecha: "2022-01", texto: "Finalizando hormigón armado", foto: "rso/del-parque-view/obra/2022-01_hormigon.jpg" },
        { fecha: "2022-11", texto: "Iniciando terminaciones", foto: "rso/del-parque-view/obra/2022-11_terminaciones.jpg" },
        { fecha: "2023-12", texto: "¡Terminado!", foto: "rso/del-parque-view/obra/2023-12_terminado.jpg" },
      ],
      marcas: ["Aluar A40 + DVH", "BGH", "Domec", "Silestone"],
    },
    {
      id: "huergo-244", nombre: "Huergo 244", barrio: "Las Cañitas, CABA",
      inicio: 2017, plan: "2019-06", real: "2019-05", fechasEjemplo: true,
      resumen: "Semipisos de 2 ambientes.",
      render: "rso/huergo-244/renders/fachada.jpg", foto: "rso/huergo-244/obra/fachada.jpg",
      marcas: ["Aluar", "Roca", "FV"], marcasEjemplo: true,
    },
    {
      id: "devoto", nombre: "Devoto", barrio: "Villa Devoto, CABA",
      inicio: 2016, plan: "2018-12", real: "2018-12", fechasEjemplo: true,
      resumen: "1, 2 y 3 ambientes con cocheras.",
      render: "rso/devoto/renders/fachada.jpg", foto: "rso/devoto/obra/fachada.jpg",
      marcas: ["Aluar", "Ferrum", "Peisa"], marcasEjemplo: true,
    },
    {
      id: "florio", nombre: "Florio", barrio: "San Justo, Bs. As.",
      inicio: 2017, plan: "2019-10", real: "2019-11", fechasEjemplo: true,
      resumen: "8 pisos, 8 unidades.",
      foto: "rso/florio/renders/fachada.jpg", fotoIlustrativa: true,
    },
    {
      id: "mendoza", nombre: "Mendoza", barrio: "San Justo, Bs. As.",
      inicio: 2015, plan: "2022-09", real: "2022-10", fechasEjemplo: true,
      resumen: "5 pisos de semipisos.",
      render: "rso/mendoza/renders/fachada.jpg", foto: "rso/mendoza/obra/fachada.jpg",
      marcas: ["Aluar", "Ferrum", "FV"], marcasEjemplo: true,
    },
    {
      id: "entre-rios", nombre: "Entre Ríos", barrio: "San Justo, Bs. As.",
      inicio: 2015, plan: "2017-12", real: "2017-12", fechasEjemplo: true,
      resumen: "10 pisos de 1, 2 y 3 ambientes.",
      foto: "rso/entre-rios/renders/fachada.jpg", fotoIlustrativa: true,
    },
    {
      id: "eizaguirre", nombre: "Eizaguirre", barrio: "San Justo, Bs. As.",
      inicio: 2014, plan: "2016-06", real: "2016-08", fechasEjemplo: true,
      resumen: "8 pisos de semipisos, dúplex en los dos últimos.",
      foto: "rso/eizaguirre/renders/fachada.jpg", fotoIlustrativa: true,
    },
  ],

  // ── Terminaciones: fotos reales ──
  terminaciones: [
    { foto: "rso/del-parque-view/terminaciones/depto-a.jpg", texto: "Cocina integrada, puerta foliada en madera y cerradura inteligente", obra: "Del Parque View" },
    { foto: "rso/del-parque-view/terminaciones/depto-b.jpg", texto: "Horno y anafe vitrocerámico Domec, mobiliario de cocina completo", obra: "Del Parque View" },
    { foto: "rso/del-parque-view/terminaciones/depto-c.jpg", texto: "Porcelanato en pisos, aire BGH instalado y aberturas Aluar A40 con DVH", obra: "Del Parque View" },
    { foto: "rso/del-parque-view/terminaciones/hall.jpg", texto: "Hall de entrada", obra: "Del Parque View" },
    { foto: "rso/del-parque-view/terminaciones/palier.jpg", texto: "Palier con iluminación ambiental", obra: "Del Parque View" },
    { foto: "rso/del-parque-view/terminaciones/terraza.jpg", texto: "Terraza común", obra: "Del Parque View" },
    { foto: "rso/huergo-244/obra/balcon.jpg", texto: "Balcón con ventanal de piso a techo", obra: "Huergo 244" },
  ],

  // ── Marcas con las que trabajamos ──
  marcas: [
    { rubro: "Aberturas", marca: "Aluar", detalle: "Líneas A30 y A40 con DVH" },
    { rubro: "Climatización", marca: "BGH", detalle: "Frío / calor instalado" },
    { rubro: "Cocina", marca: "Domec", detalle: "Horno y anafe vitrocerámico" },
    { rubro: "Mesadas", marca: "Silestone", detalle: "Cuarzo" },
    { rubro: "Sanitarios", marca: "Roca · Ferrum", detalle: "Línea completa" },
    { rubro: "Grifería", marca: "FV", detalle: "Monocomando", ejemplo: true },
    { rubro: "Calefacción", marca: "Peisa", detalle: "Radiadores", ejemplo: true },
  ],

  // ── Opiniones (todas de ejemplo hasta tener las reales, con permiso) ──
  testimonios: [
    { texto: "Nos entregaron el departamento en la fecha que nos dijeron y con las terminaciones que habíamos visto en los planos. Lo alquilamos al mes.", autor: "M. G.", detalle: "Propietaria en Del Parque View", ejemplo: true },
    { texto: "Es mi segunda inversión con RSO. Lo que más valoro es saber cómo va la obra sin tener que preguntar.", autor: "J. P.", detalle: "Inversor en Huergo 244 y Aires del Parque", ejemplo: true },
    { texto: "Pasaron siete años y las aberturas y los pisos siguen como el primer día.", autor: "C. y L. R.", detalle: "Viven en Devoto desde 2018", ejemplo: true },
    { texto: "Hubo un mes de demora y nos avisaron con tiempo, explicando por qué. Esa transparencia nos hizo volver a invertir.", autor: "D. S.", detalle: "Inversora en Mendoza", ejemplo: true },
  ],
};
