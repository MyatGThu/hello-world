/* ===========================================================================
   EDITION — motion
   Lenis inertia + GSAP triggers. One entrance system (data-a), one parallax
   vocabulary (data-px / data-px-x / data-px-z with pointer depth on the
   poster), tickers, counters, magnetic CTAs, the credential overlay, a
   square difference cursor. Monochrome by design; everything degrades to a
   fully readable static page without JS or under reduced motion.
   =========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  function initLenis() {
    if (reduceMotion || typeof window.Lenis === "undefined") return;
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on("scroll", function () { if (hasGSAP) ScrollTrigger.update(); });
    if (hasGSAP) {
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }

  /* ---------- Boot (cover only) ---------- */
  function runBoot(done) {
    var boot = document.getElementById("boot");
    var pct = document.getElementById("bootPct");
    if (!boot || !pct) { done(); return; }
    var html = document.documentElement;
    if (html.classList.contains("is-arrived") || reduceMotion || !hasGSAP) {
      boot.style.display = "none"; done(); return;
    }
    html.classList.add("is-booting");
    if (lenis) lenis.stop();
    var o = { v: 0 };
    gsap.timeline({
      onComplete: function () {
        html.classList.remove("is-booting");
        if (lenis) lenis.start();
        done();
      }
    })
      .to(o, { v: 100, duration: 1.1, ease: "power3.inOut", onUpdate: function () { pct.textContent = Math.round(o.v); } })
      .to(boot, { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, "+=0.1")
      .set(boot, { display: "none" });
  }

  /* ---------- Entrances: data-a="up" | "mask" ----------
     One class flip; CSS owns the easing. Re-arms in both directions so each
     pass through the page performs again. */
  function initEntrances() {
    var els = document.querySelectorAll("[data-a]");
    if (!els.length) return;
    if (reduceMotion || !hasGSAP) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    els.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: "top 92%", end: "bottom top",
        onEnter: function () { el.classList.add("is-in"); },
        onEnterBack: function () { el.classList.add("is-in"); },
        onLeaveBack: function () { el.classList.remove("is-in"); }
      });
    });
  }

  /* ---------- Parallax: scroll xyz + pointer xyz on posters ---------- */
  function initParallax() {
    if (!hasGSAP || reduceMotion) return;
    gsap.utils.toArray("[data-px], [data-px-x], [data-px-z]").forEach(function (el) {
      var y = parseFloat(el.getAttribute("data-px")) || 0;
      var x = parseFloat(el.getAttribute("data-px-x")) || 0;
      var z = parseFloat(el.getAttribute("data-px-z")) || 0;
      var to = {
        yPercent: y * 100, xPercent: x * 100, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
      };
      if (z) gsap.fromTo(el, { z: z, transformPerspective: 900 }, Object.assign({ z: 0 }, to));
      else gsap.to(el, to);
    });

    // pointer depth: the poster's floating geometry leans with the mouse
    if (!fine) return;
    document.querySelectorAll(".poster").forEach(function (poster) {
      var geos = poster.querySelectorAll(".geo");
      if (!geos.length) return;
      var setters = Array.prototype.map.call(geos, function (g, i) {
        return {
          x: gsap.quickTo(g, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(g, "y", { duration: 0.9, ease: "power3.out" }),
          depth: (i + 1) * 14
        };
      });
      poster.addEventListener("pointermove", function (e) {
        var r = poster.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        setters.forEach(function (s) { s.x(nx * s.depth * 2); s.y(ny * s.depth); });
      });
    });
  }

  /* ---------- Overlay menu ---------- */
  function initMenu() {
    var btn = document.getElementById("burger");
    var ov = document.getElementById("ov");
    if (!btn || !ov) return;
    var open = false;
    function setOpen(state) {
      open = state;
      btn.classList.toggle("is-x", open);
      btn.setAttribute("aria-expanded", String(open));
      ov.classList.toggle("is-open", open);
      ov.setAttribute("aria-hidden", String(!open));
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      else document.body.style.overflow = open ? "hidden" : "";
    }
    btn.addEventListener("click", function () { setOpen(!open); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) setOpen(false); });
  }

  /* ---------- Tickers ---------- */
  function initTickers() {
    if (!hasGSAP || reduceMotion) return;
    document.querySelectorAll(".tick__t").forEach(function (t) {
      var loop = gsap.to(t, { xPercent: -50, repeat: -1, duration: 22, ease: "none" });
      loop.totalTime(22 * 1000); // park deep so reversing never hits time 0
      if (!lenis) return;
      var ts = gsap.quickTo(loop, "timeScale", { duration: 0.4, ease: "power2.out" });
      var dir = 1;
      lenis.on("scroll", function (e) {
        var v = e.velocity || 0;
        if (v > 0.5) dir = 1; else if (v < -0.5) dir = -1;
        ts(dir * (1 + Math.min(Math.abs(v), 30) * 0.1));
      });
    });
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    if (!hasGSAP) return;
    gsap.utils.toArray("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 88%", once: true,
        onEnter: function () {
          gsap.to(o, { v: target, duration: 1.4, ease: "power2.out",
            onUpdate: function () { el.textContent = Math.round(o.v) + suffix; } });
        }
      });
    });
  }

  /* ---------- Word reveal (lead paragraphs) ---------- */
  function initWords() {
    document.querySelectorAll("[data-words]").forEach(function (lead) {
      var text = lead.textContent.trim().split(/\s+/);
      lead.textContent = "";
      var frag = document.createDocumentFragment();
      text.forEach(function (w, i) {
        var s = document.createElement("span");
        s.className = "w"; s.textContent = w;
        frag.appendChild(s);
        if (i < text.length - 1) frag.appendChild(document.createTextNode(" "));
      });
      lead.appendChild(frag);
      var words = lead.querySelectorAll(".w");
      if (!hasGSAP || reduceMotion) { words.forEach(function (w) { w.classList.add("on"); }); return; }
      ScrollTrigger.create({
        trigger: lead, start: "top 78%", end: "bottom 55%", scrub: true,
        onUpdate: function (self) {
          var n = Math.floor(self.progress * words.length);
          words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
        }
      });
    });
  }

  /* ---------- Magnetic CTAs ---------- */
  function initMagnetic() {
    if (reduceMotion || !fine || !hasGSAP) return;
    document.querySelectorAll("[data-mag]").forEach(function (el) {
      var pull = parseFloat(el.getAttribute("data-mag")) || 0.2;
      var xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * pull);
        yTo((e.clientY - r.top - r.height / 2) * pull);
      });
      el.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- Cursor: flat square, difference blend ---------- */
  function initDot() {
    var dot = document.querySelector(".dot");
    if (!dot || !fine) return;
    var label = dot.querySelector(".dot__label");
    var x = 0, y = 0, cx = 0, cy = 0, raf = null, seen = false;
    function render() {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      dot.style.transform = "translate(" + (cx - dot.offsetWidth / 2).toFixed(1) + "px," + (cy - dot.offsetHeight / 2).toFixed(1) + "px)";
      raf = (Math.abs(x - cx) + Math.abs(y - cy) > 0.4) ? requestAnimationFrame(render) : null;
    }
    window.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; cx = x; cy = y; document.documentElement.classList.add("has-dot"); }
      if (!raf) raf = requestAnimationFrame(render);
    }, { passive: true });
    document.querySelectorAll("a, button, [data-cur]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        dot.classList.add("is-hot");
        if (label) label.textContent = el.getAttribute("data-cur") || "";
      });
      el.addEventListener("mouseleave", function () {
        dot.classList.remove("is-hot");
        if (label) label.textContent = "";
      });
    });
  }

  /* ---------- Credential overlay ---------- */
  function initCertModal() {
    var seals = document.querySelectorAll(".seal");
    if (!seals.length) return;

    var modal = document.createElement("div");
    modal.className = "cmodal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML =
      '<div class="cmodal__bg"></div>' +
      '<div class="cmodal__card">' +
        '<button class="cmodal__x" type="button" aria-label="Close">✕</button>' +
        '<p class="cmodal__code"></p><h2 class="cmodal__t"></h2>' +
        '<div class="cmodal__body"></div>' +
      '</div>';
    document.body.appendChild(modal);
    var codeEl = modal.querySelector(".cmodal__code");
    var titleEl = modal.querySelector(".cmodal__t");
    var bodyEl = modal.querySelector(".cmodal__body");
    var closeBtn = modal.querySelector(".cmodal__x");
    var source = null;

    function open(seal) {
      source = seal;
      var info = seal.querySelector(".seal__info");
      codeEl.textContent = seal.querySelector("b") ? seal.querySelector("b").textContent : "";
      titleEl.textContent = seal.querySelector("h3") ? seal.querySelector("h3").textContent : "";
      bodyEl.innerHTML = info ? info.innerHTML : "";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      if (lenis) lenis.stop(); else document.body.style.overflow = "hidden";
      closeBtn.focus();
    }
    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      if (lenis) lenis.start(); else document.body.style.overflow = "";
      if (source) source.focus();
      source = null;
    }
    seals.forEach(function (seal) {
      seal.addEventListener("click", function (e) {
        // the official-page link inside the card must still act as a link
        if (e.target.closest && e.target.closest("a")) return;
        open(seal);
      });
      seal.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(seal); }
      });
    });
    modal.querySelector(".cmodal__bg").addEventListener("click", close);
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }

  /* ---------- Scroll progress (fallback where scroll timelines miss) ---------- */
  function initProg() {
    var bar = document.createElement("div");
    bar.className = "prog";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    if (window.CSS && CSS.supports && CSS.supports("animation-timeline", "scroll()")) return;
    var raf = null;
    function update() {
      raf = null;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
    }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---------- In-page cue links + nav marker for the boot skip ---------- */
  function initLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var t = document.querySelector(a.getAttribute("href"));
        if (!t) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(t); else t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
    // any page-to-page navigation marks the arrival so the boot never replays
    window.addEventListener("pagehide", function () {
      try { sessionStorage.setItem("nav", "1"); } catch (e) {}
    });
  }

  /* ---------- Boot sequence ---------- */
  function start() {
    initLenis();
    initMenu();
    initLinks();
    initParallax();
    initTickers();
    initCounters();
    initWords();
    initMagnetic();
    initCertModal();
    initDot();
    initProg();
    runBoot(function () {
      initEntrances();
      if (hasGSAP) ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
