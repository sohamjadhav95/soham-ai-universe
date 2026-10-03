/*
 * HFKit — shared, deterministic helpers for the "Keynote" scenes.
 * Loaded once by index.html before any sub-composition script runs.
 * Everything here is a pure function of its inputs: no clocks, no Math.random.
 */
(function () {
  "use strict";

  var C = {
    paper: "#F6F6F3",     // studio white (never pure #fff)
    paper2: "#ECECE7",    // soft floor / secondary surface
    ink: "#111317",       // primary type
    ink2: "#454A52",      // secondary type
    mute: "#767B83",      // tertiary labels (>= 22px only)
    accent: "#2747F5",    // the single vivid accent — cobalt
    accentSoft: "#E6EBFF",
    line: "rgba(17,19,23,0.10)",
  };

  /** Seeded PRNG (mulberry32). */
  function prng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var clamp01 = function (x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
  };
  var ease = {
    clamp01: clamp01,
    lerp: function (a, b, t) {
      return a + (b - a) * t;
    },
    expoOut: function (x) {
      x = clamp01(x);
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    },
    cubicOut: function (x) {
      x = clamp01(x);
      return 1 - Math.pow(1 - x, 3);
    },
    cubicInOut: function (x) {
      x = clamp01(x);
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    },
    backOut: function (x, s) {
      x = clamp01(x);
      s = s == null ? 1.6 : s;
      var u = x - 1;
      return 1 + (s + 1) * u * u * u + s * u * u;
    },
    /** 0 → 1 over [a, b] seconds, eased. */
    win: function (t, a, b, fn) {
      return (fn || ease.cubicOut)((t - a) / (b - a));
    },
  };

  /**
   * One heartbeat of an ECG lead-II trace as a sum of Gaussians, phase in [0, 1).
   * QRS (the "lub" spike) peaks at phase 0.30. Returns roughly -0.3 .. 1.0.
   */
  function ecg(phase) {
    var p = phase - Math.floor(phase);
    function g(mu, sigma, amp) {
      var d = (p - mu) / sigma;
      return amp * Math.exp(-0.5 * d * d);
    }
    return (
      g(0.18, 0.026, 0.12) + // P wave
      g(0.283, 0.007, -0.14) + // Q
      g(0.3, 0.0085, 1.0) + // R
      g(0.318, 0.009, -0.3) + // S
      g(0.52, 0.045, 0.27) // T wave
    );
  }

  /**
   * Draw a glowing oscilloscope beam along points [[x,y],...] with per-point brightness [0..1].
   * Additive blending: a wide soft halo, a mid glow, then a hot core.
   */
  function drawBeam(ctx, pts, alpha, opts) {
    opts = opts || {};
    var color = opts.color || C.signal;
    var core = opts.core || "#FFE2C2";
    var width = opts.width || 4;
    if (pts.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    var passes = [
      { w: width * 7, a: 0.08, c: color },
      { w: width * 3, a: 0.22, c: color },
      { w: width, a: 0.9, c: color },
      { w: Math.max(1.2, width * 0.4), a: 0.75, c: core },
    ];
    for (var p = 0; p < passes.length; p++) {
      ctx.strokeStyle = passes[p].c;
      ctx.lineWidth = passes[p].w;
      for (var i = 1; i < pts.length; i++) {
        var a = alpha ? alpha[i] : 1;
        if (a <= 0.003) continue;
        ctx.globalAlpha = passes[p].a * a;
        ctx.beginPath();
        ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
        ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /** Radial glow dot (beam head / bloom). */
  function glowDot(ctx, x, y, r, color, a) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  /* ---------------- exact polygon / pixel coverage (Approach 3) ---------------- */

  /** Sutherland–Hodgman: clip polygon [[x,y]...] to axis-aligned rect [x0,y0,x1,y1]. */
  function clipToRect(poly, r) {
    var edges = [
      function (p) { return p[0] >= r[0]; },
      function (p) { return p[0] <= r[2]; },
      function (p) { return p[1] >= r[1]; },
      function (p) { return p[1] <= r[3]; },
    ];
    var hit = [
      function (a, b) { var t = (r[0] - a[0]) / (b[0] - a[0]); return [r[0], a[1] + t * (b[1] - a[1])]; },
      function (a, b) { var t = (r[2] - a[0]) / (b[0] - a[0]); return [r[2], a[1] + t * (b[1] - a[1])]; },
      function (a, b) { var t = (r[1] - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), r[1]]; },
      function (a, b) { var t = (r[3] - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), r[3]]; },
    ];
    var out = poly;
    for (var e = 0; e < 4 && out.length; e++) {
      var input = out;
      out = [];
      for (var i = 0; i < input.length; i++) {
        var cur = input[i];
        var prev = input[(i + input.length - 1) % input.length];
        var cin = edges[e](cur);
        var pin = edges[e](prev);
        if (cin) {
          if (!pin) out.push(hit[e](prev, cur));
          out.push(cur);
        } else if (pin) {
          out.push(hit[e](prev, cur));
        }
      }
    }
    return out;
  }

  /** Shoelace area (absolute). */
  function area(poly) {
    var s = 0;
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i];
      var b = poly[(i + 1) % poly.length];
      s += a[0] * b[1] - b[0] * a[1];
    }
    return Math.abs(s) / 2;
  }

  /** Fraction of the unit cell (cx, cy) covered by poly (poly in cell units). */
  function coverage(poly, cx, cy) {
    return area(clipToRect(poly, [cx, cy, cx + 1, cy + 1]));
  }

  /* ---------------- fonts + build readiness ---------------- */

  var fontFaces = [
    ["Geist", "vendor/fonts/geist-sans-300.woff2", { weight: "300" }],
    ["Geist", "vendor/fonts/geist-sans-400.woff2", { weight: "400" }],
    ["Geist", "vendor/fonts/geist-sans-500.woff2", { weight: "500" }],
    ["Geist", "vendor/fonts/geist-sans-600.woff2", { weight: "600" }],
    ["Geist", "vendor/fonts/geist-sans-700.woff2", { weight: "700" }],
    ["Geist", "vendor/fonts/geist-sans-800.woff2", { weight: "800" }],
    ["Geist Mono", "vendor/fonts/geist-mono-400.woff2", { weight: "400" }],
    ["Geist Mono", "vendor/fonts/geist-mono-500.woff2", { weight: "500" }],
  ];
  var fontsReady = Promise.all(
    fontFaces.map(function (f) {
      var face = new FontFace(f[0], "url(" + f[1] + ")", f[2]);
      return face.load().then(
        function (loaded) {
          document.fonts.add(loaded);
        },
        function (err) {
          console.error("[kit] font failed", f[1], err);
        },
      );
    }),
  );

  /** Register an async setup with the HyperFrames runtime (frame capture waits on it). */
  function buildReady(id, promise) {
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady[id] = promise;
    return promise;
  }

  /**
   * Seek-safe camera shake: a decaying jitter computed purely from time since impact.
   * Adds a proxy tween to `tl` at `at`; the element's x/y return to 0 when it ends.
   */
  function shake(tl, target, at, amp, dur) {
    var el = typeof target === "string" ? document.querySelector(target) : target;
    var p = { u: 0 };
    dur = dur || 0.1;
    tl.fromTo(p, { u: 0 }, {
      u: 1, duration: dur, ease: "none",
      onUpdate: function () {
        var f = p.u * dur * 60;
        var decay = 1 - p.u;
        gsap.set(el, {
          x: p.u >= 1 ? 0 : amp * decay * Math.sin(f * 2.4 + 0.6),
          y: p.u >= 1 ? 0 : amp * 0.55 * decay * Math.cos(f * 3.1),
        });
      },
    }, at);
  }

  /**
   * Keynote chapter transition on an inner wrapper (never the .clip itself): eases in over the
   * first 0.5 s (rise + unblur) and out over the last 0.3 s (lift + blur), so chapters hand off softly.
   */
  function sceneIO(tl, target, D, opts) {
    opts = opts || {};
    var inDur = opts.inDur || 0.5;
    if (!opts.noIn) {
      tl.fromTo(target, { opacity: 0, y: 36, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: inDur, ease: "power3.out" }, 0);
    }
    if (!opts.noOut) {
      tl.fromTo(target, { opacity: 1, y: 0, filter: "blur(0px)" },
        { opacity: 0, y: -28, filter: "blur(6px)", duration: 0.3, ease: "power2.in", immediateRender: false }, D - 0.3);
    }
  }

  /** Deterministic number roll: writes a formatted value into `el` over [at, at+dur]. */
  function countUp(tl, el, from, to, at, dur, fmt, ease) {
    var p = { v: from };
    tl.fromTo(p, { v: from }, {
      v: to, duration: dur, ease: ease || "power2.out",
      onUpdate: function () { el.textContent = fmt ? fmt(p.v) : String(Math.round(p.v)); },
    }, at);
  }

  window.HFKit = {
    sceneIO: sceneIO,
    countUp: countUp,
    shake: shake,
    C: C,
    prng: prng,
    ease: ease,
    ecg: ecg,
    drawBeam: drawBeam,
    glowDot: glowDot,
    clipToRect: clipToRect,
    area: area,
    coverage: coverage,
    fontsReady: fontsReady,
    buildReady: buildReady,
  };
})();
