/* Slideshow mit Fade (Fullscreen) - ES5 safe for GMod Awesomium */

(function () {
  // --- GMod safe scaling (letterbox, stable UI) ---
  var STAGE_W = 1920;
  var STAGE_H = 1080;
  var stage = document.getElementById("stage");

  function applyScale() {
    if (!stage) return;
    var w = window.innerWidth || STAGE_W;
    var h = window.innerHeight || STAGE_H;
    var scale = Math.min(w / STAGE_W, h / STAGE_H);
    stage.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
  }

  if (window.addEventListener) {
    window.addEventListener("resize", applyScale);
    window.addEventListener("load", applyScale);
  }
  applyScale();

  // --- Slideshow ---
  var images = (window.LOADING_IMAGES && window.LOADING_IMAGES.length) ? window.LOADING_IMAGES : [];
  var root = document.getElementById("slideshow");

  var CONFIG = {
    durationMs: 7000,
    fadeMs: 1200,
    shuffle: false
  };

  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function preload(url) {
    var img = new Image();
    img.src = url;
  }

  function makeSlide(url) {
    var el = document.createElement("div");
    el.className = "slide";
    // Ensure url() is quoted for older parsers
    el.style.backgroundImage = "url(\"" + url + "\")";
    return el;
  }

  function init() {
    if (!root || !images || images.length === 0) return;

    var list = images.slice ? images.slice() : images;
    if (CONFIG.shuffle) shuffleArray(list);

    // expose fade duration to CSS if needed
    root.style.setProperty ? root.style.setProperty("--fade-ms", CONFIG.fadeMs + "ms") : 0;

    // Build slides
    var slides = [];
    for (var k = 0; k < list.length; k++) {
      var slide = makeSlide(list[k]);
      slides.push(slide);
      root.appendChild(slide);
    }

    // Awesomium: ensure first slide visible immediately
    slides[0].className = "slide is-active";
    preload(list[1 % list.length]);

    var i = 0;
    window.setInterval(function () {
      var current = slides[i];
      var nextIndex = (i + 1) % slides.length;
      var next = slides[nextIndex];

      var preloadIndex = (nextIndex + 1) % slides.length;
      preload(list[preloadIndex]);

      // toggle classes (avoid classList in very old builds)
      current.className = "slide";
      next.className = "slide is-active";

      i = nextIndex;
    }, CONFIG.durationMs);
  }

  init();
})();
