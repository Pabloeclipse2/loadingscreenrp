/* Slideshow mit Fade (Fullscreen)
   Hinweis für GMod:
   GMod hängt intern oft /loading.html an – dadurch brechen relative Pfade.
   Deshalb normalisieren wir alle Bildpfade auf eine saubere Base-URL.
*/

const root = document.getElementById("slideshow");

// Basis-URL bestimmen (funktioniert bei /, /index.html und /loading.html)
function getBaseUrl() {
  const { origin, pathname } = window.location;

  // Wenn URL auf eine Datei endet (z.B. /loading.html oder /index.html),
  // entfernen wir den letzten Teil. Wenn es bereits mit / endet, lassen wir es.
  const basePath = pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname.replace(/\/[^\/]*$/, "");

  // basePath kann leer sein -> dann ist base = origin
  return origin + basePath;
}

const BASE = getBaseUrl();

// Bilderliste aus index.html (falls vorhanden)
const rawImages = Array.isArray(window.LOADING_IMAGES) ? window.LOADING_IMAGES : [];

// Pfade normalisieren:
// - http(s) bleibt
// - /foo -> origin + /foo
// - assets/foo -> BASE + /assets/foo
const images = rawImages.map((src) => {
  if (typeof src !== "string") return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return window.location.origin + src;
  return BASE + "/" + src.replace(/^\.\//, "");
});

// Konfiguration
const CONFIG = {
  durationMs: 7000,
  fadeMs: 1200,
  shuffle: false,
};

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function preload(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

async function init() {
  if (!root || images.length === 0) return;

  document.documentElement.style.setProperty("--fade-ms", `${CONFIG.fadeMs}ms`);
  const list = CONFIG.shuffle ? shuffleArray([...images]) : [...images];

  await preload(list[0]);
  if (list[1]) preload(list[1]);

  const slides = list.map((src) => {
    const el = document.createElement("div");
    el.className = "slide";
    el.style.backgroundImage = `url('${String(src).replace(/'/g, "\\'")}')`;
    root.appendChild(el);
    return el;
  });

  let i = 0;
  slides[i].classList.add("is-active");

  setInterval(() => {
    const current = slides[i];
    const nextIndex = (i + 1) % slides.length;
    const next = slides[nextIndex];

    const preloadIndex = (nextIndex + 1) % slides.length;
    preload(list[preloadIndex]);

    next.classList.add("is-active");
    current.classList.remove("is-active");

    i = nextIndex;
  }, CONFIG.durationMs);
}

init();
