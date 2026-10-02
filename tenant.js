// Desarrolladora de esta instalación de la app (script plano, como config.js).
// Lo cargan la página y el service worker. Cada desarrolladora nueva tiene su
// propio tenant.js en t/{id}/ con estos mismos campos; la raíz es RSO.
self.TENANT = {
  id: "rso", // prefijo de localStorage y del caché del SW: único por desarrolladora
  nombre: "RSO Arquitectos",
  nombreCorto: "RSO",
  marca: { corto: "RSO", largo: "ARQUITECTOS" },
  app: { nombre: "Aires del Parque" }, // título de la app y de la pantalla de ingreso
  contacto: { email: "info@rsoarquitectos.com" },
  // Antes del multi-desarrolladora las claves eran "adp.*": solo RSO las hereda,
  // para no cruzar códigos entre desarrolladoras del mismo origen.
  legado: { localStorage: "adp", cache: "adp-" },
  // Variables CSS de styles.css. Otra desarrolladora = otros valores.
  tema: {
    "--fondo": "#1e1f2e",
    "--fondo-2": "#2a2c40",
    "--fondo-oscuro": "#111218",
    "--marca": "#8cc63f",
    "--acento": "#f2b441",
    "--texto": "#f4f5f7",
    "--tinte-marca": "#2d3a2a",
    "--tinte-fondo": "#2b2f4a",
  },
};

// En la página (no en el SW): aplicar el tema antes de pintar.
if (typeof document !== "undefined") {
  for (const [k, v] of Object.entries(self.TENANT.tema || {})) document.documentElement.style.setProperty(k, v);
}
