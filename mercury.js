/* ===========================================================================
   MERCURY — the living-metal résumé.
   One raymarched pool of liquid chrome performs the whole site. Between
   chapters it is liquid; when a chapter settles it SOLIDIFIES into an IT
   artifact — a headset for the person, keyboard + mouse for the craft, a
   spinning CD for the career orbit, a dentable terminal for the proof,
   floppy disk + USB stick for the credentials — then melts back into a
   mirror puddle at contact. SDF metaballs + object models, blended by a
   scroll-driven "form" factor, on a Three.js fullscreen ShaderMaterial quad.
   =========================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  if (!html.classList.contains("js")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (navigator.connection && navigator.connection.saveData) return;
  var probe = document.createElement("canvas");
  var glOK = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
  if (!glOK) return;

  var chapters = document.querySelectorAll("main [data-chapter]");
  if (chapters.length < 1) return; // any page that declares a chapter gets the machine

  var script = document.createElement("script");
  script.src = "vendor/three.mercury.min.js";
  script.async = true;
  script.onload = init;
  document.head.appendChild(script);

  var MAXB = 10;
  var MAXI = 3; // concurrent click impacts

  /* Chapter choreography, keyed by data-chapter NAME so every page composes
     its own sequence from the same vocabulary. Liquid bodies are [x, y, z, r];
     shape: -1 liquid only · 0 headset · 1 keyboard+mouse · 2 CD ·
            3 terminal · 4 floppy+USB · 5 the machine.  op: artifact position. */
  function ring(n, rad, r, cx, cy) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      out.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.72, 0, r]);
    }
    return out;
  }
  var CONFIG_BY_NAME = {
    "Arrival":    { b: [[0.46, 0.12, 0, 1.05], [-2.5, -1.9, 0, 0.3], [2.25, 1.3, 0, 0.24]], k: 0.9, ripple: 0.0, off: [0, 0], puddle: 0, shape: 5, op: [0.6, 0.1] },   // the machine, drafted in the cover's open column
    "Contents":   { b: [[-1.8, 0.2, 0, 0.7], [1.6, -0.5, 0, 0.6], [0.2, 0.9, 0, 0.45], [2.6, 1.2, 0, 0.3]], k: 0.65, ripple: 0.014, off: [0, 0], puddle: 0, shape: -1, op: [0, 0] },
    "Signal":     { b: [[2.3, 0.3, 0, 0.75], [1.3, -0.6, 0, 0.4], [3.0, 1.2, 0, 0.28]], k: 0.55, ripple: 0.02, off: [0, 0], puddle: 0, shape: -1, op: [2.3, 0.3] },
    "The Person": { b: [[1.9, 0.1, 0, 0.9], [1.1, -0.7, 0, 0.5], [2.7, 0.9, 0, 0.35]], k: 0.7, ripple: 0.022, off: [0, 0], puddle: 0, shape: 0, op: [1.9, 0.15] },
    "The Craft":  { b: [[0, 0.1, 0, 1.1], [-1.6, -0.4, 0, 0.55], [1.7, 0.5, 0, 0.55], [0.4, 1.0, 0, 0.4]], k: 0.5, ripple: 0.0, off: [0, 0], puddle: 0, shape: 1, op: [0.2, 0.15] },
    "The Orbit":  { b: ring(6, 2.35, 0.4, 0, 0.1).concat([[0, 0.1, 0, 0.78]]), k: 0.34, ripple: 0.0, off: [0, 0], puddle: 0, shape: 2, op: [0, 0.1] },
    "The Bench":  { b: [[-2.0, 0.3, 0, 0.8], [-1.0, -0.5, 0, 0.5], [-2.8, 1.1, 0, 0.3]], k: 0.6, ripple: 0.016, off: [0, 0], puddle: 0, shape: -1, op: [-2.0, 0.3] },
    "The Proof":  { b: [[2.2, 0.45, 0, 1.1], [1.2, -0.5, 0, 0.45], [3.0, 1.3, 0, 0.3]], k: 0.75, ripple: 0.012, off: [0, 0], puddle: 0, shape: 3, op: [2.2, 0.45] },
    "The Seals":  { b: [[-1.0, 0.1, 0, 0.7], [1.2, 0.0, 0, 0.6], [0.1, 0.6, 0, 0.45]], k: 0.4, ripple: 0.0, off: [0, 0.2], puddle: 0, shape: 4, op: [0, 0.15] },
    "Connect":    { b: [[0, -1.9, 0, 1.7]], k: 0.9, ripple: 0.05, off: [0, 0], puddle: 1, shape: -1, op: [0, -1.9] }
  };
  var DEFAULT_CFG = { b: [[0, 0.2, 0, 1.0], [-1.9, -1.2, 0, 0.35], [2.1, 1.1, 0, 0.28]], k: 0.8, ripple: 0.01, off: [0, 0], puddle: 0, shape: -1, op: [0, 0.2] };
  // Phones: the cover machine rides higher so the thesis line and portrait
  // keep clear paper under them.
  if (window.matchMedia("(max-width: 820px)").matches && CONFIG_BY_NAME["Arrival"]) {
    CONFIG_BY_NAME["Arrival"].op = [0.4, 0.9];
  }
  // The page's sequence, in DOM order. Unknown chapter names stay liquid.
  var CONFIGS = Array.prototype.map.call(chapters, function (s) {
    return CONFIG_BY_NAME[s.getAttribute("data-chapter")] || DEFAULT_CFG;
  });

  function init() {
    var T = window.THREE;
    if (!T) return;

    var small = window.matchMedia("(max-width: 820px)").matches;
    var renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch (e) { return; }
    // Hatching is line art: it needs more resolution than chrome blur did, and
    // the sketch shader is cheaper per fragment than the old env shading, so
    // phones can afford the bump.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.4 : 1.6) * (small ? 0.9 : 0.82));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.className = "mercury";
    renderer.domElement.setAttribute("aria-hidden", "true");
    document.body.appendChild(renderer.domElement);

    var STEPS = small ? 40 : 56;

    // Flat float array for the vec4 blob uniform — no struct plumbing needed.
    var bArr = new Float32Array(MAXB * 4);
    var uniforms = {
      uTime: { value: 0 },
      uRes: { value: new T.Vector2(window.innerWidth, window.innerHeight) },
      uBlobs: { value: bArr },
      uN: { value: 3 },
      uK: { value: 0.9 },
      uOff: { value: new T.Vector2(0, 0) },
      uPuddle: { value: 0 },
      uRipple: { value: 0 },
      uStretch: { value: new T.Vector2(1, 1) },
      uImpacts: { value: new Float32Array(MAXI * 4) }, // [x, y, strength, age] per slot
      uMouse: { value: new T.Vector2(0, 0) },
      uForm: { value: 0 },
      uShape: { value: -1 },
      uObj: { value: new T.Vector2(0, 0) },
      uScale: { value: small ? 0.6 : 1 },
      // Divergence: how far the timelines have drifted apart, and which two
      // shapes are haunting the one that got chosen (-1 = no ghost).
      uSplit: { value: 0 },
      uGhostA: { value: -1 },
      uGhostB: { value: -1 },
      uGhostOff: { value: new T.Vector2(0, 0) },
      uAlpha: { value: 0 }
    };

    var frag = [
      "precision highp float;",
      "uniform float uTime, uK, uPuddle, uRipple, uAlpha, uN, uForm, uShape, uScale;",
      "uniform float uSplit, uGhostA, uGhostB;",
      "uniform vec2 uRes, uOff, uStretch, uMouse, uObj, uGhostOff;",
      "uniform vec4 uBlobs[" + MAXB + "];",
      "uniform vec4 uImpacts[" + MAXI + "];",
      "float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0); return mix(b, a, h) - k*h*(1.0-h); }",
      "mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }",
      "float sdBox(vec3 p, vec3 b){ vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }",
      "float sdRBox(vec3 p, vec3 b, float r){ return sdBox(p, b) - r; }",
      "float sdEll(vec3 p, vec3 r){ float k0 = length(p/r); float k1 = length(p/(r*r)); return k0*(k0 - 1.0)/max(k1, 1e-4); }",

      /* ---- The artifacts. Local space, roughly 4 units wide, facing +z. ---- */
      "float sdObject(vec3 p, float shape){",
      "  p /= uScale;",
      "  p.xz *= rot(sin(uTime*0.30)*mix(0.30, 0.18, uForm));", // turntable sway, calmest when fully cast
      "  float d = 1e9;",
      "  if (shape < 0.5) {", // 0 — headset
      "    float band = length(vec2(length(p.xy) - 1.15, p.z)) - 0.18;",
      "    band = max(band, -p.y + 0.05);",
      "    float cups = min(sdEll(p - vec3(-1.18, -0.1, 0.0), vec3(0.32, 0.52, 0.44)),",
      "                     sdEll(p - vec3( 1.18, -0.1, 0.0), vec3(0.32, 0.52, 0.44)));",
      "    d = smin(band, cups, 0.15);",
      "  } else if (shape < 1.5) {", // 1 — keyboard + mouse
      "    vec3 q = p - vec3(-0.6, 0.0, 0.0);",
      "    q.yz *= rot(-0.5);",
      "    float base = sdRBox(q, vec3(1.7, 0.07, 0.68), 0.05);",
      "    vec3 kq = q - vec3(0.0, 0.13, 0.0);",
      "    vec2 id = clamp(floor(kq.xz/0.24 + 0.5), vec2(-6.0, -2.0), vec2(6.0, 2.0));",
      "    kq.xz -= id*0.24;",
      "    float keys = sdRBox(kq, vec3(0.082, 0.045, 0.082), 0.018);",
      "    vec3 mq = p - vec3(2.05, -0.12, 0.0);",
      "    mq.yz *= rot(-0.25);",
      "    float ms = sdEll(mq, vec3(0.48, 0.38, 0.7));",
      "    ms = max(ms, -mq.y - 0.24);",
      "    d = min(min(base, keys), ms);",
      "  } else if (shape < 2.5) {", // 2 — CD
      "    vec3 q = p;",
      "    q.yz *= rot(0.55);",
      "    q.xy *= rot(uTime*0.7);", // the disc spins
      "    float disc = max(length(q.xy) - 1.5, abs(q.z) - 0.035);",
      "    disc = max(disc, 0.24 - length(q.xy));", // spindle hole
      "    d = disc - 0.012;",
      "  } else if (shape < 3.5) {", // 3 — terminal
      "    float scr = sdRBox(p - vec3(0.0, 0.42, 0.0), vec3(1.42, 0.92, 0.14), 0.07);",
      "    scr = max(scr, -sdBox(p - vec3(0.0, 0.46, 0.18), vec3(1.12, 0.64, 0.07)));", // screen inset
      "    float neck = sdBox(p - vec3(0.0, -0.72, -0.06), vec3(0.18, 0.3, 0.12));",
      "    float base = sdRBox(p - vec3(0.0, -1.06, 0.06), vec3(0.75, 0.07, 0.46), 0.04);",
      "    d = smin(scr, smin(neck, base, 0.09), 0.09);",
      "  } else if (shape < 4.5) {", // 4 — floppy disk + USB stick
      "    vec3 q = p - vec3(-0.85, 0.05, 0.0);",
      "    float fl = sdRBox(q, vec3(0.95, 0.95, 0.07), 0.03);",
      "    fl = min(fl, sdRBox(q - vec3(0.18, 0.56, 0.075), vec3(0.42, 0.28, 0.015), 0.01));", // shutter
      "    fl = min(fl, sdRBox(q - vec3(0.0, -0.56, 0.075), vec3(0.58, 0.3, 0.015), 0.01));",  // label
      "    vec3 uq = p - vec3(1.6, -0.15, 0.0);",
      "    uq.xy *= rot(-0.45);",
      "    float usb = sdRBox(uq + vec3(0.32, 0.0, 0.0), vec3(0.6, 0.3, 0.16), 0.07);",
      "    usb = min(usb, sdBox(uq - vec3(0.56, 0.0, 0.0), vec3(0.3, 0.2, 0.11)));",
      "    d = min(fl, usb);",
      "  } else {", // 5 — THE MACHINE: a gyroscopic stabiliser, three nested rings live-spinning around a core
      "    vec3 q1 = p; q1.xy *= rot(uTime*0.22);",
      "    float r1 = length(vec2(length(q1.xy) - 1.5, q1.z)) - 0.085;",
      "    vec3 q2 = p; q2.yz *= rot(1.05); q2.xy *= rot(-uTime*0.31);",
      "    float r2 = length(vec2(length(q2.xy) - 1.08, q2.z)) - 0.065;",
      "    vec3 q3 = p; q3.xz *= rot(0.8); q3.yz *= rot(uTime*0.27);",
      "    float r3 = length(vec2(length(q3.yz) - 0.66, q3.x)) - 0.05;",
      "    float core = length(p) - 0.36;",
      "    float mast = sdBox(p - vec3(0.0, 0.85, 0.0), vec3(0.028, 0.5, 0.028));", // antenna
      "    float tip = length(p - vec3(0.0, 1.42, 0.0)) - 0.07;",
      "    d = min(min(r1, r2), min(r3, min(tip, smin(core, mast, 0.08))));",
      "  }",
      "  return d * uScale;",
      "}",

      "float map(vec3 p){",
      "  p.xy -= uOff;",
      "  p.xy /= uStretch;",
      "  float d = 1e9;",
      "  for (int i = 0; i < " + MAXB + "; i++) {",
      "    if (float(i) >= uN) break;",
      "    vec4 b = uBlobs[i];",
      "    d = smin(d, length(p - b.xyz) - b.w, uK);",
      "  }",
      "  if (uForm > 0.001) {",
      "    float dO = sdObject(p - vec3(uObj - uOff, 0.0), uShape);",
      "    d = mix(d, dO, uForm);",
      "  }",
      "  d *= min(uStretch.x, uStretch.y);",
      "  if (uPuddle > 0.001) {",
      "    vec3 q = p - vec3(0.0, -1.9, 0.0);",
      "    float pd = (length(q / vec3(3.3, 0.34, 1.6)) - 1.0) * 0.28;",
      "    pd += sin(q.x*4.5 - uTime*1.4)*cos(q.z*4.0 + uTime)*0.012;",
      "    float mr = length(q.xz - uMouse) ;",
      "    pd += 0.05 * sin(mr*9.0 - uTime*5.0) * exp(-mr*1.6) * uPuddle;",
      "    d = mix(d, pd, uPuddle);",
      "  }",
      "  if (uRipple > 0.001) d += sin(p.x*7.0 + uTime*1.1)*sin(p.y*6.0 - uTime*0.8)*uRipple*(1.0 - uForm*0.7);",
      /* Click impacts. Measured in SCREEN-FACING xy distance (not full 3D) so
         the deformation lands on the visible front face instead of the hidden
         core. Each impact is a deep crater that heals, wrapped in an expanding
         shockwave ring that races outward across the metal. */
      "  for (int i = 0; i < " + MAXI + "; i++) {",
      "    vec4 im = uImpacts[i];",
      "    if (im.z <= 0.001) continue;",
      "    float age = im.w;",
      "    float r = length(p.xy - im.xy);",
      "    float fade = exp(-age*1.5);",
      "    float cw = 0.42 + age*0.7;",                          // crater widens as it relaxes
      "    d += im.z * 0.95 * fade * exp(-(r*r)/(cw*cw));",       // central punch (inward)
      "    float ringR = age * 4.2;",                            // shock ring travels outward
      "    float env = exp(-pow((r - ringR)*1.15, 2.0));",
      "    d += im.z * 0.22 * fade * sin((r - ringR)*8.0) * env;", // wavefront ripple (in + out)
      "  }",
      "  return d;",
      "}",
      /* Ghost sweep. A short fixed-step walk through the slab the artifacts
         occupy, rather than riding the main march's positions: those steps grow
         huge in open space and smear a silhouette into a blob. Fixed spacing
         samples the shape evenly, so the outline stays readable. */
      "float ghostDist(vec3 ro, vec3 rd, float shape, vec2 off){",
      "  float m = 1e9;",
      "  for (int i = 0; i < 14; i++) {",
      "    vec3 p = ro + rd * (3.2 + float(i) * 0.26);",
      "    p.xy = (p.xy - uOff) / uStretch;",
      "    m = min(m, sdObject(p - vec3(uObj - uOff + off, 0.0), shape));",
      "  }",
      "  return m;",
      "}",
      "vec3 normalAt(vec3 p){",
      "  vec2 e = vec2(0.004, -0.004);",
      "  return normalize(e.xyy*map(p+e.xyy) + e.yyx*map(p+e.yyx) + e.yxy*map(p+e.yxy) + e.xxx*map(p+e.xxx));",
      "}",
      /* GRAPHITE SHADING. The canvas is transparent and the page is the paper,
         so this outputs pencil pigment with alpha — never a background fill.
         Tone comes from one key light plus AO; shade is laid down as three
         cross-hatch passes that wake one by one as the tone deepens, exactly
         the way a hand builds it. The silhouette is re-inked by a contour on
         both sides of the edge: fresnel inside the hit, distance-field
         proximity outside it. */
      "void main(){",
      "  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;",
      "  vec3 ro = vec3(0.0, 0.0, 5.0);",
      "  vec3 rd = normalize(vec3(uv, -1.6));",
      "  float t = 0.0; float d; vec3 p; bool hit = false; float glow = 1e9;",
      "  for (int i = 0; i < " + STEPS + "; i++) {",
      "    p = ro + rd * t;",
      "    d = map(p);",
      "    glow = min(glow, d);",
      "    if (d < 0.0025 * t) { hit = true; break; }",
      "    t += d * 0.85;",
      "    if (t > 14.0) break;",
      "  }",
      "  vec3 GRAPH = vec3(0.155, 0.145, 0.125);", // 2B graphite
      "  vec3 NEON_A = vec3(0.05, 0.72, 0.82);",   // cyan — the timeline just left
      "  vec3 NEON_B = vec3(1.0, 0.26, 0.60);",    // magenta — the timeline ahead
      "  if (!hit) {",
      "    float edge = smoothstep(0.09, 0.012, glow) * 0.7;", // the drawn outline, just outside the surface
      /* The shapes this chapter did NOT settle on, as neon interference. Only
         the miss path runs them, so the chosen shape occludes its own ghosts;
         outlines, never fills, so they cannot park a mass behind body copy. */
      "    vec3 gcol = vec3(0.0); float galpha = 0.0;",
      "    if (uSplit > 0.001) {",
      "      if (uGhostA > -0.5) {",
      "        float e = exp(-abs(ghostDist(ro, rd, uGhostA, uGhostOff))*11.0) * uSplit * 0.62;",
      "        gcol += NEON_A * e; galpha += e;",
      "      }",
      "      if (uGhostB > -0.5) {",
      "        float e = exp(-abs(ghostDist(ro, rd, uGhostB, -uGhostOff))*11.0) * uSplit * 0.62;",
      "        gcol += NEON_B * e; galpha += e;",
      "      }",
      "    }",
      // Un-premultiplied blend by relative weight, so galpha == 0 reproduces the
      // plain contour exactly rather than tinting it.
      "    vec3 hc = mix(GRAPH, gcol / max(galpha, 1e-4), galpha / (galpha + edge + 1e-4));",
      "    gl_FragColor = vec4(hc, (edge + galpha) * uAlpha);",
      "    return;",
      "  }",
      "  vec3 n = normalAt(p);",
      "  float ao = clamp(map(p + n*0.22) / 0.22, 0.0, 1.0);",
      "  float fre = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);",
      "  float tone = clamp(0.5 + 0.5*dot(n, normalize(vec3(0.55, 0.75, 0.35))), 0.0, 1.0);",
      "  float density = clamp((1.0 - tone) + (1.0 - ao)*0.4, 0.0, 1.0);",
      /* Hand wobble, stepped to ~5 fps so the drawing boils like a pencil test
         instead of swimming continuously. */
      "  float tq = floor(uTime*5.0)/5.0;",
      "  vec2 px = gl_FragCoord.xy / uRes.y;",
      "  float wob = sin(px.y*46.0 + tq*6.0)*0.5 + sin(px.x*38.0 - tq*4.0)*0.5;",
      /* Different frequency per pass — equal-frequency crossings read as
         gingham cloth, not pencil. */
      "  float s1 = smoothstep(0.25, 0.8, 0.5 + 0.5*sin((px.x + px.y)*230.0 + wob));",
      "  float s2 = smoothstep(0.3, 0.82, 0.5 + 0.5*sin((px.x - px.y)*317.0 - wob));",
      "  float s3 = smoothstep(0.3, 0.85, 0.5 + 0.5*sin(px.y*287.0 + wob*0.7));",
      "  float ink = 0.07;",                                     // the form's faint overall wash
      "  ink += s1 * smoothstep(0.16, 0.34, density) * 0.5;",    // first hatch pass: mid-tones
      "  ink += s2 * smoothstep(0.4, 0.6, density) * 0.55;",     // cross pass: shadow
      "  ink += s3 * smoothstep(0.64, 0.82, density) * 0.6;",    // third pass: core dark
      "  ink += smoothstep(0.5, 0.95, fre) * 0.75;",             // interior contour re-ink
      "  ink = clamp(ink, 0.0, 1.0);",
      /* Divergence on the surface: while the timelines are apart, alternate
         strokes trade graphite for the two neons — the drawing itself loses
         colour registration. */
      "  vec3 col = GRAPH;",
      "  if (uSplit > 0.001) col = mix(GRAPH, mix(NEON_A, NEON_B, step(s2, s1)), uSplit * 0.6);",
      "  gl_FragColor = vec4(col, ink * uAlpha);",
      "}"
    ].join("\n");

    var mat = new T.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    var scene = new T.Scene();
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
    var cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    /* ---------- Choreography state ---------- */
    var pos = new Float32Array(MAXB * 3);
    var vel = new Float32Array(MAXB * 3);
    for (var i = 0; i < MAXB; i++) { pos[i * 3] = 0; pos[i * 3 + 1] = 8 + i * 0.7; } // parked above: the splash drop
    var released = false;
    setTimeout(function () { released = true; }, html.classList.contains("is-entering") ? 300 : 1750);

    var secs = Array.prototype.slice.call(chapters);
    var centers = [];
    function measure() {
      centers = secs.map(function (s) {
        var r = s.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2;
      });
    }
    measure();
    window.addEventListener("resize", function () {
      measure();
      uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Blend chapter configs by document position. The metal is liquid while
    // travelling (form dips to 0 at the midpoint between chapters) and
    // solidifies into the chapter's artifact as you settle (form -> 1).
    var target = { b: [], k: 0.9, ripple: 0, off: [0, 0], puddle: 0, form: 0, shape: -1, op: [0, 0], ghostA: -1, ghostB: -1 };
    // Ghost shapes cost an SDF evaluation per march step, so phones keep the
    // channel split (three cheap env lookups) and skip the ghosts.
    var GHOSTS = !small;
    function lerp(a, b, t) { return a + (b - a) * t; }
    function smoothstep(e0, e1, x) { var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
    function blendConfigs(sc) {
      var mid = sc + window.innerHeight * 0.5;
      var i = 0;
      while (i < centers.length - 1 && mid > centers[i + 1]) i++;
      var A = CONFIGS[Math.min(i, CONFIGS.length - 1)];
      var B = CONFIGS[Math.min(i + 1, CONFIGS.length - 1)];
      var span = Math.max(1, (centers[Math.min(i + 1, centers.length - 1)] - centers[i]));
      var f = Math.min(1, Math.max(0, (mid - centers[i]) / span));
      f = f * f * (3 - 2 * f);
      var n = Math.max(A.b.length, B.b.length);
      target.b.length = 0;
      for (var j = 0; j < n; j++) {
        var a = A.b[Math.min(j, A.b.length - 1)];
        var bb = B.b[Math.min(j, B.b.length - 1)];
        var ra = j < A.b.length ? a[3] : 0;
        var rb = j < B.b.length ? bb[3] : 0;
        target.b.push([lerp(a[0], bb[0], f), lerp(a[1], bb[1], f), lerp(a[2], bb[2], f), lerp(ra, rb, f)]);
      }
      target.k = lerp(A.k, B.k, f);
      target.ripple = lerp(A.ripple, B.ripple, f);
      target.off[0] = lerp(A.off[0], B.off[0], f);
      target.off[1] = lerp(A.off[1], B.off[1], f);
      target.puddle = lerp(A.puddle, B.puddle, f);
      // Each artifact HOLDS a defined plateau around its chapter centre and the
      // metal only goes liquid for a brief handoff at the midpoint: leaving a
      // chapter (near A) the shape clings to full form across [0, 0.36] then
      // melts decisively over [0.36, 0.46]; approaching the next (near B) it is
      // liquid across [0.46, 0.54], solidifies over [0.54, 0.64], then holds
      // across [0.64, 1.0]. Both branches read 0 at f=0.5, so the seam is clean.
      if (f < 0.5) {
        target.shape = A.shape;
        target.op = A.op;
        target.form = A.shape < 0 ? 0 : (1 - smoothstep(0.36, 0.46, f));
      } else {
        target.shape = B.shape;
        target.op = B.op;
        target.form = B.shape < 0 ? 0 : smoothstep(0.54, 0.64, f);
      }
      // The ghosts are the chapters either side of the one that won: the shape
      // the metal just left and the one it is about to take. At the ends of the
      // run the neighbour is the chosen chapter itself, which simply doubles
      // that timeline instead of inventing one.
      var chosen = f < 0.5 ? i : Math.min(i + 1, CONFIGS.length - 1);
      target.ghostA = CONFIGS[Math.max(0, chosen - 1)].shape;
      target.ghostB = CONFIGS[Math.min(CONFIGS.length - 1, chosen + 1)].shape;
      return n;
    }

    /* ---------- Interaction ---------- */
    var VIEW = 3.125; // world units per NDC unit at the z=0 plane
    function worldX(cx) { return ((cx / window.innerWidth) * 2 - 1) * VIEW * (window.innerWidth / window.innerHeight); }
    function worldY(cy) { return -(((cy / window.innerHeight) * 2 - 1) * VIEW); }
    var mx = 0, my = 0;
    window.addEventListener("pointermove", function (e) {
      mx = worldX(e.clientX); my = worldY(e.clientY);
      uniforms.uMouse.value.set(mx * 0.35, 0);
    }, { passive: true });

    // Click impacts. Each slot is {x, y, str, age}; the shader reads them as a
    // flat vec4 array. The front face of the metal sits closer to the camera
    // than the z=0 plane, so map the click with a shorter throw (VIEWI) than
    // the plane's VIEW — that lands the crater under the cursor, on the metal.
    var VIEWI = 2.4;
    function impX(cx) { return ((cx / window.innerWidth) * 2 - 1) * VIEWI * (window.innerWidth / window.innerHeight); }
    function impY(cy) { return -(((cy / window.innerHeight) * 2 - 1) * VIEWI); }
    var impacts = [];
    for (var ii = 0; ii < MAXI; ii++) impacts.push({ x: 0, y: 0, str: 0, age: 0 });
    var lab = document.querySelector(".lab");
    var lastBreak = 0;
    function fireImpact(cx, cy) {
      var now = performance.now();
      if (now - lastBreak < 130) return;
      lastBreak = now;
      // Reuse a free slot, else recycle the oldest.
      var slot = 0, oldest = -1;
      for (var i = 0; i < MAXI; i++) {
        if (impacts[i].str <= 0.001) { slot = i; oldest = -1; break; }
        if (impacts[i].age > oldest) { oldest = impacts[i].age; slot = i; }
      }
      impacts[slot].x = impX(cx) - uniforms.uOff.value.x;
      impacts[slot].y = impY(cy) - uniforms.uOff.value.y;
      impacts[slot].str = 1;
      impacts[slot].age = 0;
    }
    if (lab) lab.addEventListener("click", function (e) {
      var s = window.getSelection && window.getSelection();
      if (s && s.type === "Range") return; // don't fire while selecting text
      fireImpact(e.clientX, e.clientY);
    });

    var hushed = false;
    window.addEventListener("mt:hush", function (e) { hushed = !!(e.detail && e.detail.on); });

    /* ---------- Frame loop ---------- */
    var lastSc = -1, lastT = performance.now(), running = true, shown = false;
    document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running) { lastT = performance.now(); lastSc = -1; tick(); } });

    function tick() {
      if (!running) return;
      requestAnimationFrame(tick);
      var now = performance.now();
      var dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      var timeScale = hushed ? 0.25 : 1;
      uniforms.uTime.value += dt * timeScale;

      var sc = window.scrollY;
      var v = lastSc < 0 ? 0 : (sc - lastSc) / Math.max(dt, 0.001);
      lastSc = sc;

      var n = blendConfigs(sc);
      uniforms.uN.value = n;
      uniforms.uK.value += (target.k - uniforms.uK.value) * Math.min(1, dt * 6);
      uniforms.uRipple.value += (target.ripple - uniforms.uRipple.value) * Math.min(1, dt * 4);
      uniforms.uPuddle.value += (target.puddle - uniforms.uPuddle.value) * Math.min(1, dt * 3);
      uniforms.uOff.value.x += (target.off[0] - uniforms.uOff.value.x) * Math.min(1, dt * 4);
      uniforms.uOff.value.y += (target.off[1] - uniforms.uOff.value.y) * Math.min(1, dt * 4);
      // Solidify promptly, melt fast — the artifact "sets" as the page settles.
      // The melt-fast/set-firm character comes from the rate asymmetry now that
      // the form curve holds a plateau.
      var fRate = target.form > uniforms.uForm.value ? 2.8 : 6;
      if (!released) target.form = 0;
      uniforms.uForm.value += (target.form - uniforms.uForm.value) * Math.min(1, dt * fRate);
      uniforms.uShape.value = target.shape;
      // Lock the object into place a touch faster than it becomes visible, so a
      // freshly cast shape reads as planted rather than drifting into position.
      uniforms.uObj.value.x += (target.op[0] - uniforms.uObj.value.x) * Math.min(1, dt * 5);
      uniforms.uObj.value.y += (target.op[1] - uniforms.uObj.value.y) * Math.min(1, dt * 5);

      // Scroll velocity stretches the metal — but a HELD solid should stay crisp,
      // not smear vertically. Gate the stretch by form: full smear while liquid
      // (form 0), near-rigid when cast (form 1). Volume is still conserved.
      // Divergence. The timelines separate when the outcome is genuinely
      // undecided (the metal is between shapes) and when you scroll fast enough
      // to outrun it. They collapse back to one as the artifact sets, which is
      // the whole argument: many possible forms, one standard result.
      // "Undecided" only counts where a shape was actually on the table. The
      // arrival and contact chapters are liquid by design, not mid-choice, so
      // they get no standing divergence and the first screen stays clean.
      var undecided = target.shape >= 0 ? 1 - uniforms.uForm.value : 0;
      var splitTarget = Math.min(0.92, undecided * 0.20 + Math.min(1, Math.abs(v) * 0.00055) * 0.80);
      uniforms.uSplit.value += (splitTarget - uniforms.uSplit.value) * Math.min(1, dt * 5);
      uniforms.uGhostA.value = GHOSTS ? target.ghostA : -1;
      uniforms.uGhostB.value = GHOSTS ? target.ghostB : -1;
      uniforms.uGhostOff.value.set(uniforms.uSplit.value * 0.9, uniforms.uSplit.value * 0.2);

      var stretchGain = 1 - 0.9 * uniforms.uForm.value;
      var sy = 1 + Math.min(0.5, Math.abs(v) * 0.00035) * stretchGain;
      uniforms.uStretch.value.y += (sy - uniforms.uStretch.value.y) * Math.min(1, dt * 7);
      uniforms.uStretch.value.x = 1 / Math.sqrt(uniforms.uStretch.value.y);

      // Springy bodies: they lag their targets, so every chapter change sloshes.
      for (var i = 0; i < MAXB; i++) {
        var tx = 0, ty = -9, r = 0;
        if (i < target.b.length) { tx = target.b[i][0]; ty = target.b[i][1]; r = target.b[i][3]; }
        if (!released) { tx = pos[i * 3]; ty = pos[i * 3 + 1]; }
        // The cursor tugs the smaller droplets a little.
        if (released && r > 0.01 && r < 0.6) {
          var dx = mx - tx, dy = my - ty, q = Math.max(0.4, dx * dx + dy * dy);
          tx += dx / q * 0.14; ty += dy / q * 0.14;
        }
        // The main body leans toward the pointer while the metal is liquid,
        // saturating at a quarter of a unit so it reads as attention rather
        // than drift. Never while a shape is cast: a solidified artifact that
        // followed the cursor would undo the "this has set" reading.
        if (released && r >= 0.6 && uniforms.uForm.value < 0.05) {
          var lx = mx - tx, ly = my - ty, ld = Math.sqrt(lx * lx + ly * ly) || 1;
          var lean = Math.min(0.26, ld * 0.06);
          tx += lx / ld * lean; ty += ly / ld * lean;
        }
        var k = 26, damp = Math.exp(-5.2 * dt);
        vel[i * 3] = (vel[i * 3] + (tx - pos[i * 3]) * k * dt) * damp;
        vel[i * 3 + 1] = (vel[i * 3 + 1] + (ty - pos[i * 3 + 1]) * k * dt) * damp;
        pos[i * 3] += vel[i * 3] * dt;
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
        var wob = Math.sin(uniforms.uTime.value * 1.3 + i * 2.1) * 0.045;
        bArr[i * 4] = pos[i * 3];
        bArr[i * 4 + 1] = pos[i * 3 + 1] + wob;
        bArr[i * 4 + 2] = 0;
        bArr[i * 4 + 3] += (r - bArr[i * 4 + 3]) * Math.min(1, dt * 5);
      }

      // Age each impact; the shader's fade envelope does the visual healing,
      // and a slot is freed once its wave has run its course.
      var impArr = uniforms.uImpacts.value;
      for (var im = 0; im < MAXI; im++) {
        var it = impacts[im];
        if (it.str > 0.001) {
          it.age += dt;
          if (it.age > 2.8) it.str = 0;
        }
        impArr[im * 4] = it.x;
        impArr[im * 4 + 1] = it.y;
        impArr[im * 4 + 2] = it.str;
        impArr[im * 4 + 3] = it.age;
      }

      if (released && uniforms.uAlpha.value < 1) uniforms.uAlpha.value = Math.min(1, uniforms.uAlpha.value + dt * 1.4);

      renderer.render(scene, cam);
      if (!shown) {
        shown = true;
        renderer.domElement.classList.add("is-live");
        html.classList.add("has-scene");
      }
    }
    tick();

    renderer.domElement.addEventListener("webglcontextlost", function (e) { e.preventDefault(); running = false; });
    renderer.domElement.addEventListener("webglcontextrestored", function () { running = true; lastT = performance.now(); tick(); });
  }
})();
