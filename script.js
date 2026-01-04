/* Slideshow mit Fade (Fullscreen) */

const images = Array.isArray(window.LOADING_IMAGES) ? window.LOADING_IMAGES : [];
const root = document.getElementById("slideshow");

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
    el.style.backgroundImage = `url('${src.replace(/'/g, "\\'")}')`;
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
