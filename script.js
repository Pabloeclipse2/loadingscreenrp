/* GMod Loading Screen – Slideshow (ES5-kompatibel)
   Ziel: funktioniert auch mit älteren GMod/Chromium/Awesomium Builds.
*/

(function () {
  var root = document.getElementById("slideshow");
  if (!root) return;

  var images = (window.LOADING_IMAGES && window.LOADING_IMAGES.length) ? window.LOADING_IMAGES.slice(0) : [];
  if (!images.length) return;

  var CONFIG = {
    durationMs: 7000,
    fadeMs: 1200,
    shuffle: false
  };

  // Optional: Werte aus window.LOADING_CONFIG überschreiben
  if (window.LOADING_CONFIG) {
    if (typeof window.LOADING_CONFIG.durationMs === "number") CONFIG.durationMs = window.LOADING_CONFIG.durationMs;
    if (typeof window.LOADING_CONFIG.fadeMs === "number") CONFIG.fadeMs = window.LOADING_CONFIG.fadeMs;
    if (typeof window.LOADING_CONFIG.shuffle === "boolean") CONFIG.shuffle = window.LOADING_CONFIG.shuffle;
  }

  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  }

  function hasClass(el, cls) {
    return (" " + el.className + " ").indexOf(" " + cls + " ") > -1;
  }
  function addClass(el, cls) {
    if (!hasClass(el, cls)) el.className = (el.className ? el.className + " " : "") + cls;
  }
  function removeClass(el, cls) {
    el.className = (" " + el.className + " ").replace(" " + cls + " ", " ").replace(/^\s+|\s+$/g, "");
  }

  // Bildformate: Wir versuchen bei Fehlern automatisch Alternativen.
  // Hinweis: Wenn ein Format vom GMod-Browser nicht unterstützt wird (z.B. WebP in sehr alten Builds),
  // wird automatisch auf PNG/JPG/GIF etc. ausgewichen – sofern vorhanden.
  var FALLBACK_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];

  function splitUrl(url) {
    // trennt "path/name.ext?query" -> {base:"path/name", ext:"ext", query:"?query"}
    var query = "";
    var qpos = url.indexOf("?");
    if (qpos !== -1) {
      query = url.substring(qpos);
      url = url.substring(0, qpos);
    }
    var dot = url.lastIndexOf(".");
    if (dot === -1) return { base: url, ext: "", query: query };
    return { base: url.substring(0, dot), ext: url.substring(dot + 1), query: query };
  }

  function buildFallbackList(url) {
    var parts = splitUrl(url);
    var extLower = (parts.ext || "").toLowerCase();

    // Wenn keine Extension vorhanden ist, probieren wir alle.
    if (!extLower) {
      var all = [];
      for (var i = 0; i < FALLBACK_EXTS.length; i++) {
        all.push(parts.base + "." + FALLBACK_EXTS[i] + parts.query);
      }
      return all;
    }

    // Erst original, dann Alternativen
    var list = [parts.base + "." + parts.ext + parts.query];
    for (var j = 0; j < FALLBACK_EXTS.length; j++) {
      if (FALLBACK_EXTS[j] !== extLower) {
        list.push(parts.base + "." + FALLBACK_EXTS[j] + parts.query);
      }
    }
    return list;
  }

  function tryLoadImage(urlList, done) {
    var idx = 0;

    function attempt() {
      if (idx >= urlList.length) return done(null);
      var url = urlList[idx++];
      var img = new Image();

      img.onload = function () {
        done(url);
      };
      img.onerror = function () {
        attempt();
      };

      // Wichtig: encodeURI verhindert Probleme mit Leerzeichen/Sonderzeichen in Dateinamen
      img.src = encodeURI(url);
    }

    attempt();
  }

  function resolveImages(list, cb) {
    var resolved = [];
    var i = 0;

    function next() {
      if (i >= list.length) return cb(resolved);
      var original = list[i++];

      tryLoadImage(buildFallbackList(original), function (okUrl) {
        if (okUrl) resolved.push(okUrl);
        next();
      });
    }

    next();
  }

  function createSlide(url) {
    var div = document.createElement("div");
    div.className = "slide";
    div.style.backgroundImage = 'url("' + encodeURI(url) + '")';
    // Transition-Dauer an CONFIG anpassen (CSS-Variablen sind nicht überall zuverlässig)
    div.style.transition = "opacity " + CONFIG.fadeMs + "ms ease-in-out";
    return div;
  }

  function preload(url) {
    var img = new Image();
    img.src = encodeURI(url);
  }

  if (CONFIG.shuffle) shuffleArray(images);

  resolveImages(images, function (finalList) {
    if (!finalList.length) return;

    // DOM aufbauen
    var slides = [];
    for (var k = 0; k < finalList.length; k++) {
      var slide = createSlide(finalList[k]);
      root.appendChild(slide);
      slides.push(slide);
    }

    // Start
    var index = 0;
    addClass(slides[index], "is-active");

    // Preload nächstes
    if (slides.length > 1) preload(finalList[1]);

    setInterval(function () {
      var current = slides[index];
      var nextIndex = (index + 1) % slides.length;
      var next = slides[nextIndex];

      // Preload das darauffolgende
      var preloadIndex = (nextIndex + 1) % slides.length;
      preload(finalList[preloadIndex]);

      addClass(next, "is-active");
      removeClass(current, "is-active");

      index = nextIndex;
    }, CONFIG.durationMs);
  });
})();
