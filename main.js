/* ============================================================================
   THE MELBOURNE ENDPOINT — one sheet, top to bottom.
   Modules: the press (spin-in), smooth scroll, entrances, counters, parallax,
   sections menu, running head, notice overlay, cursor.
   Every module degrades: without JS the paper is simply printed and readable.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var lenis = null;

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------ smooth scroll --------------------------- */
  function initLenis() {
    if (reduce || typeof window.Lenis === "undefined") return;
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    root.style.scrollBehavior = "auto";
    lenis.stop();
    lenis.on("scroll", function () { if (hasGSAP) ScrollTrigger.update(); });
    if (hasGSAP) {
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }

  function scrollTo(target) {
    var el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    var pad = window.innerWidth > 680 ? 56 : 46;
    if (lenis) lenis.scrollTo(el, { offset: -pad });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - pad, behavior: reduce ? "auto" : "smooth" });
  }

  /* ------------------------------- the press ------------------------------ */
  /* The front page spins off the press, lands square, then dissolves into the
     live page. Reduced motion skips straight to the paper.                   */
  function runPress(done) {
    var spin = document.getElementById("spin");
    var skip = document.getElementById("spinSkip");
    var fired = false;

    function finish() {
      if (fired) return;
      fired = true;
      if (spin) {
        spin.classList.add("is-done");
        window.setTimeout(function () { if (spin.parentNode) spin.parentNode.removeChild(spin); }, 700);
      }
      root.classList.remove("is-press");
      if (lenis) lenis.start();
      done();
    }

    if (!spin || reduce) { finish(); return; }

    var paper = spin.querySelector(".spin__paper");
    if (paper) paper.addEventListener("animationend", function () { window.setTimeout(finish, 170); });
    if (skip) skip.addEventListener("click", finish);
    window.setTimeout(finish, 3200);            // never trap the reader
  }

  /* ------------------------------- entrances ------------------------------ */
  function initEntrances() {
    var els = document.querySelectorAll("[data-a]");
    if (reduce || !hasGSAP) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add("is-in"); });
      return;
    }
    Array.prototype.forEach.call(els, function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        onEnter: function () { el.classList.add("is-in"); },
        onEnterBack: function () { el.classList.add("is-in"); },
        onLeaveBack: function () { el.classList.remove("is-in"); }
      });
    });
  }

  /* -------------------------------- counters ------------------------------ */
  function initCounters() {
    if (!hasGSAP || reduce) return;
    gsap.utils.toArray("[data-count]").forEach(function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 86%", once: true,
        onEnter: function () {
          gsap.to(o, {
            v: end, duration: 1.5, ease: "power2.out",
            onUpdate: function () { el.textContent = Math.round(o.v) + suffix; }
          });
        }
      });
    });
  }

  /* -------------------------------- parallax ------------------------------ */
  /* Plates ride a little deeper than the type they illustrate. */
  function initParallax() {
    if (!hasGSAP || reduce) return;
    gsap.utils.toArray("[data-px], [data-px-z]").forEach(function (el) {
      var y = parseFloat(el.getAttribute("data-px") || 0);
      var z = parseFloat(el.getAttribute("data-px-z") || 0);
      var tw = { ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } };
      if (z) gsap.fromTo(el, { z: z, transformPerspective: 900 }, Object.assign({ z: 0 }, tw));
      if (y) gsap.fromTo(el, { yPercent: y * -8 }, Object.assign({ yPercent: y * 8 }, tw));
    });
  }

  /* ------------------------------ sections menu --------------------------- */
  function initMenu() {
    var btn = document.getElementById("burger");
    var ov = document.getElementById("ov");
    if (!btn || !ov) return;
    var open = false;

    function setOpen(state) {
      open = state;
      ov.classList.toggle("is-open", open);
      ov.setAttribute("aria-hidden", open ? "false" : "true");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (lenis) open ? lenis.stop() : lenis.start();
      root.classList.toggle("is-press", open);
    }

    btn.addEventListener("click", function () { setOpen(!open); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) setOpen(false); });

    // Anchors anywhere on the sheet scroll rather than jump.
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id === "#" || !document.querySelector(id)) return;
      e.preventDefault();
      if (open) setOpen(false);
      window.setTimeout(function () { scrollTo(id); }, open ? 280 : 0);
    });
  }

  /* --------------------- running head + the live margins ------------------ */
  /* One scroll pass drives three things: the sticky head, the section ticks in
     the left margin, and the section name, page number and progress running
     down the right margin. Each section carries its own ink.                  */
  var MARKS = [
    ["front", "Front page", "P.1", "--red"],
    ["record", "The record", "P.2", "--blue"],
    ["reports", "Field reports", "P.3", "--green"],
    ["notices", "Public notices", "P.4", "--plum"],
    ["desk", "At the desk", "P.5", "--ochre"],
    ["wanted", "Situations wanted", "P.6", "--teal"]
  ];

  function initRail() {
    var rail = document.getElementById("rail");
    var prog = document.getElementById("prog");
    var label = document.getElementById("railSec");
    var gutSec = document.getElementById("gutSec");
    var gutPage = document.getElementById("gutPage");
    var gutBar = document.getElementById("gutBar");
    var gutPct = document.getElementById("gutPct");
    var ticks = document.getElementById("gutTicks");
    var tick = ticks ? ticks.querySelectorAll("li") : [];
    var tinted = [rail, document.querySelector(".gut--l"), document.querySelector(".gut--r")]
      .filter(function (el) { return el; });
    if (!rail) return;

    var marks = MARKS.map(function (m) {
      return { el: document.getElementById(m[0]), name: m[1], page: m[2], ink: m[3] };
    }).filter(function (m) { return m.el; });
    if (!marks.length) return;

    var at = -1;
    function setSection(i) {
      if (i === at) return;
      at = i;
      var m = marks[i];
      tinted.forEach(function (el) { el.style.setProperty("--accent", "var(" + m.ink + ")"); });
      if (label) label.textContent = m.name;
      if (gutPage) gutPage.textContent = m.page;
      for (var t = 0; t < tick.length; t++) tick[t].classList.toggle("on", t === i);
      if (gutSec) {
        gutSec.classList.add("is-out");
        window.setTimeout(function () {
          gutSec.textContent = m.name;
          gutSec.classList.remove("is-out");
        }, 200);
      }
    }

    function update() {
      var y = window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;

      rail.classList.toggle("is-stuck", y > 260);
      if (prog) prog.style.transform = "scaleX(" + p + ")";
      if (gutBar) gutBar.style.setProperty("--p", p.toFixed(3));
      if (gutPct) gutPct.textContent = Math.round(p * 100) + "%";

      var i = 0;
      for (var k = 0; k < marks.length; k++) {
        if (marks[k].el.getBoundingClientRect().top <= 130) i = k;
      }
      setSection(i);
    }

    if (lenis) lenis.on("scroll", update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ----------------------------- notice overlay --------------------------- */
  /* Each seal opens a framed notice: what the certificate covers and where it
     earns its keep across the roles on the record.                           */
  function initNotices() {
    var seals = document.querySelectorAll(".seal");
    if (!seals.length) return;

    var modal = document.createElement("div");
    modal.className = "cmodal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Certification detail");
    modal.innerHTML =
      '<div class="cmodal__bg" data-close></div>' +
      '<div class="cmodal__card"><div class="cmodal__in">' +
      '<button class="cmodal__x" type="button" data-close aria-label="Close">&#10005;</button>' +
      '<p class="cmodal__code"></p><h2 class="cmodal__t"></h2>' +
      '<div class="cmodal__body"></div></div></div>';
    document.body.appendChild(modal);

    var code = modal.querySelector(".cmodal__code");
    var title = modal.querySelector(".cmodal__t");
    var body = modal.querySelector(".cmodal__body");
    var closeBtn = modal.querySelector(".cmodal__x");
    var source = null;

    function open(seal) {
      var info = seal.querySelector(".seal__info");
      var svgCode = seal.querySelector(".s-c");
      var h3 = seal.querySelector("h3");
      if (!info) return;
      code.textContent = svgCode ? svgCode.textContent.replace(/ /g, " ") : "";
      title.textContent = h3 ? h3.textContent : "";
      body.innerHTML = info.innerHTML;
      modal.classList.add("is-open");
      root.classList.add("is-press");
      if (lenis) lenis.stop();
      source = seal;
      closeBtn.focus();
    }

    function close() {
      modal.classList.remove("is-open");
      root.classList.remove("is-press");
      if (lenis) lenis.start();
      if (source) { source.focus(); source = null; }
    }

    Array.prototype.forEach.call(seals, function (seal) {
      seal.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;          // let real links through
        open(seal);
      });
      seal.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(seal); }
      });
    });

    modal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }

  /* -------------------------------- cursor -------------------------------- */
  function initCursor() {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var dot = document.querySelector(".dot");
    if (!dot) return;
    var label = dot.querySelector(".dot__label");
    var x = 0, y = 0, tx = 0, ty = 0, live = false, raf = 0;

    document.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!live) { live = true; root.classList.add("has-dot"); x = tx; y = ty; loop(); }
    });
    document.addEventListener("pointerleave", function () { root.classList.remove("has-dot"); });

    function loop() {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      dot.style.transform = "translate(" + x + "px," + y + "px)";
      if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) { live = false; cancelAnimationFrame(raf); return; }
      raf = requestAnimationFrame(loop);
    }

    document.querySelectorAll("[data-cur]").forEach(function (el) {
      el.addEventListener("pointerenter", function () {
        label.textContent = el.getAttribute("data-cur");
        dot.classList.add("is-wide");
      });
      el.addEventListener("pointerleave", function () { dot.classList.remove("is-wide"); });
    });
  }

  /* ------------------------------- dateline ------------------------------- */
  function initDateline() {
    var el = document.getElementById("dateline");
    if (!el) return;
    try {
      el.textContent = new Date().toLocaleDateString("en-AU", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
    } catch (e) { /* keep the printed date */ }
  }

  /* --------------------------------- boot --------------------------------- */
  function boot() {
    initLenis();
    initDateline();
    initParallax();
    initMenu();
    initRail();
    initNotices();
    initCursor();
    runPress(function () {
      initEntrances();
      initCounters();
      if (hasGSAP) ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
