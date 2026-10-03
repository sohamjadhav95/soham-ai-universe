/*
 * HFKit: shared, deterministic helpers for "Soham, the product".
 * Loaded once by index.html (after lib/cues.js) before any scene script runs.
 * Everything is a pure function of its inputs: no clocks, no Math.random.
 */
(function () {
  "use strict";

  var C = {
    canvas: "#F3F2EE",
    card: "#FFFFFF",
    ink: "#141518",
    ink2: "#4A4F57",
    mute: "#6E737B",
    hot: "#FF5A1F",
    hotDeep: "#D9400B",
    hotSoft: "#FFE6DB",
    villain: "#6E56CF",
    bad: "#E5484D",
    good: "#2FB36B",
    night: "#0F1013",
    line: "rgba(20,21,24,0.08)",
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

  var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var ease = {
    clamp01: clamp01,
    lerp: function (a, b, t) { return a + (b - a) * t; },
    expoOut: function (x) { x = clamp01(x); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); },
    cubicOut: function (x) { x = clamp01(x); return 1 - Math.pow(1 - x, 3); },
    cubicInOut: function (x) { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    backOut: function (x, s) {
      x = clamp01(x); s = s == null ? 1.6 : s;
      var u = x - 1;
      return 1 + (s + 1) * u * u * u + s * u * u;
    },
  };

  /* ---------------- voiceover cues (lib/cues.js, written by scripts/make_vo.py) ---------------- */

  function norm(w) { return String(w).toLowerCase().replace(/[^a-z0-9'-]/g, ""); }

  /**
   * Scene-relative cue lookups. Q.dur is the scene length, Q.l(id) = {t0, t1}, Q.w(id, word[, n]) = onset
   * of the n-th (0-based) word matching `word` in line `id`, Q.we(...) its end.
   */
  function cue(sceneId) {
    var CU = window.CUES, S = CU.scenes[sceneId];
    function line(id) { return CU.lines[id]; }
    function find(id, word, n) {
      var ws = line(id).words, k = 0, want = norm(word);
      for (var i = 0; i < ws.length; i++) {
        if (norm(ws[i].w) === want) { if (k === (n || 0)) return ws[i]; k++; }
      }
      throw new Error("[kit] cue: no word '" + word + "' in " + id);
    }
    return {
      start: S.start,
      dur: S.dur,
      l: function (id) { var L = line(id); return { t0: L.t0 - S.start, t1: L.t1 - S.start }; },
      w: function (id, word, n) { return find(id, word, n).t0 - S.start; },
      we: function (id, word, n) { return find(id, word, n).t1 - S.start; },
      words: function (id) { return line(id).words; },
    };
  }

  /**
   * Spoken-fragment caption: fills `el` with the line's words; each rises in on its own onset.
   * accent: words (any case/punctuation) set in Instrument Serif italic, hot orange.
   * opts.lead: seconds before the onset (default 0.05). opts.only: [from, to) word index range.
   */
  function caption(tl, el, Q, id, accent, opts) {
    opts = opts || {};
    var acc = (accent || []).map(norm);
    var ws = Q.words(id);
    var from = opts.only ? opts.only[0] : 0, to = opts.only ? opts.only[1] : ws.length;
    el.innerHTML = "";
    for (var i = from; i < to; i++) {
      var w = ws[i];
      var box = document.createElement("span");
      box.className = "kw" + (acc.indexOf(norm(w.w)) >= 0 ? " acc" : "") +
        ((opts.bold || []).map(norm).indexOf(norm(w.w)) >= 0 ? " nm" : "");
      var inner = document.createElement("span");
      inner.textContent = w.w;
      box.appendChild(inner);
      el.appendChild(box);
      if (i < to - 1) el.appendChild(document.createTextNode(" "));
      var at = Math.max(0, w.t0 - Q.start - (opts.lead == null ? 0.05 : opts.lead));
      tl.fromTo(inner, { opacity: 0, y: 18, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.28, ease: "power3.out" }, at);
    }
  }

  /* ---------------- Pix, the mascot ---------------- */

  var MOODS = {
    neutral: { bl: [0, 0], br: [0, 0], eye: 1, eyeO: 1, hap: 0, flat: 0, smile: 0.62, o: 0 },
    worried: { bl: [-16, -6], br: [16, -6], eye: 1, eyeO: 1, hap: 0, flat: 1, smile: 0, o: 0 },
    shock: { bl: [8, -16], br: [-8, -16], eye: 1.18, eyeO: 1, hap: 0, flat: 0, smile: 0, o: 1 },
    happy: { bl: [0, -6], br: [0, -6], eye: 1, eyeO: 0, hap: 1, flat: 0, smile: 1, o: 0 },
    proud: { bl: [-6, -8], br: [6, -8], eye: 1, eyeO: 0, hap: 1, flat: 0, smile: 1.12, o: 0 },
  };

  /**
   * Build Pix inside `host` (a positioned element). size in px. Returns an API that adds seek-safe
   * tweens to a timeline. Mood changes must be added in chronological order.
   */
  function pix(host, size, initial) {
    var s = size / 200;
    host.innerHTML =
      '<div class="pix" style="width:' + size + "px;height:" + size + 'px">' +
      '<div class="pix-shadow"></div>' +
      '<div class="pix-body"><div class="pix-shine"></div>' +
      '<div class="pix-face" style="transform:scale(' + s + ')">' +
      '<div class="pix-brow l"></div><div class="pix-brow r"></div>' +
      '<div class="pix-eye l"><div class="pix-pupil"></div></div><div class="pix-eye r"><div class="pix-pupil"></div></div>' +
      '<div class="pix-hap l"></div><div class="pix-hap r"></div>' +
      '<div class="pix-mouth flat"></div><div class="pix-mouth smile"></div><div class="pix-mouth o"></div>' +
      "</div></div></div>";
    var q = function (sel) { return host.querySelectorAll(sel); };
    var el = {
      root: host.querySelector(".pix"), body: host.querySelector(".pix-body"), shadow: host.querySelector(".pix-shadow"),
      bl: host.querySelector(".pix-brow.l"), br: host.querySelector(".pix-brow.r"),
      eyes: q(".pix-eye"), pupils: q(".pix-pupil"), hap: q(".pix-hap"),
      flat: host.querySelector(".pix-mouth.flat"), smile: host.querySelector(".pix-mouth.smile"), o: host.querySelector(".pix-mouth.o"),
    };
    var cur = initial || "neutral";
    function apply(m) {
      gsap.set(el.bl, { rotation: m.bl[0], y: m.bl[1] });
      gsap.set(el.br, { rotation: m.br[0], y: m.br[1] });
      gsap.set(el.eyes, { scale: m.eye, opacity: m.eyeO });
      gsap.set(el.hap, { opacity: m.hap });
      gsap.set(el.flat, { opacity: m.flat });
      gsap.set(el.smile, { opacity: m.smile > 0 ? 1 : 0, scale: Math.max(0.01, m.smile) });
      gsap.set(el.o, { opacity: m.o, scale: m.o ? 1 : 0.4 });
    }
    apply(MOODS[cur]);
    var api = {
      el: el,
      mood: function (tl, at, name, dur) {
        var a = MOODS[cur], b = MOODS[name];
        dur = dur || 0.18;
        var o = { duration: dur, ease: "power2.out", immediateRender: false };
        tl.fromTo(el.bl, { rotation: a.bl[0], y: a.bl[1] }, Object.assign({ rotation: b.bl[0], y: b.bl[1] }, o), at);
        tl.fromTo(el.br, { rotation: a.br[0], y: a.br[1] }, Object.assign({ rotation: b.br[0], y: b.br[1] }, o), at);
        tl.fromTo(el.eyes, { scale: a.eye, opacity: a.eyeO }, Object.assign({ scale: b.eye, opacity: b.eyeO }, o), at);
        tl.fromTo(el.hap, { opacity: a.hap }, Object.assign({ opacity: b.hap }, o), at);
        tl.fromTo(el.flat, { opacity: a.flat }, Object.assign({ opacity: b.flat }, o), at);
        tl.fromTo(el.smile, { opacity: a.smile > 0 ? 1 : 0, scale: Math.max(0.01, a.smile) },
          Object.assign({ opacity: b.smile > 0 ? 1 : 0, scale: Math.max(0.01, b.smile) }, o), at);
        tl.fromTo(el.o, { opacity: a.o, scale: a.o ? 1 : 0.4 }, Object.assign({ opacity: b.o, scale: b.o ? 1 : 0.4 }, o), at);
        cur = name;
        return api;
      },
      look: function (tl, at, fromXY, toXY, dur) {
        tl.fromTo(el.pupils, { x: fromXY[0], y: fromXY[1] },
          { x: toXY[0], y: toXY[1], duration: dur || 0.2, ease: "power2.out", immediateRender: false }, at);
        return api;
      },
      blink: function (tl, at) {
        tl.fromTo(el.eyes, { scaleY: MOODS[cur].eye }, { scaleY: 0.08, duration: 0.06, ease: "power1.in", yoyo: true, repeat: 1, immediateRender: false }, at);
        return api;
      },
      squash: function (tl, at, amt) {
        amt = amt || 0.16;
        tl.fromTo(el.body, { scaleX: 1, scaleY: 1 }, { scaleX: 1 + amt, scaleY: 1 - amt, duration: 0.08, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false }, at);
        return api;
      },
      hop: function (tl, at, h) {
        h = h || 60;
        tl.fromTo(el.body, { y: 0 }, { y: -h, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false }, at);
        tl.fromTo(el.shadow, { scaleX: 1, opacity: 1 }, { scaleX: 0.7, opacity: 0.5, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false }, at);
        api.squash(tl, at + 0.4, 0.12);
        return api;
      },
    };
    return api;
  }

  /** Blocky ("snapped") Pix drawn on a canvas: a rounded square rasterised to `n`×`n` whole pixels. */
  function drawBlockyPix(ctx, x0, y0, size, n) {
    var cell = size / n, r = 0.28 * n;
    function inside(px, py) {
      var cx = Math.min(Math.max(px, r), n - r), cy = Math.min(Math.max(py, r), n - r);
      return (px - cx) * (px - cx) + (py - cy) * (py - cy) <= r * r;
    }
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
      if (!inside(i + 0.5, j + 0.5)) continue;
      ctx.fillStyle = j < n * 0.35 && i < n * 0.45 ? "#FF7A45" : C.hot;
      ctx.fillRect(x0 + i * cell, y0 + j * cell, cell + 0.5, cell + 0.5);
    }
    // block eyes + flat mouth
    var e = Math.max(1, Math.round(n * 0.16));
    var ey = Math.round(n * 0.36), exl = Math.round(n * 0.28), exr = Math.round(n * 0.56);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x0 + exl * cell, y0 + ey * cell, e * cell, (e + 1) * cell);
    ctx.fillRect(x0 + exr * cell, y0 + ey * cell, e * cell, (e + 1) * cell);
    ctx.fillStyle = C.ink;
    ctx.fillRect(x0 + (exl + e / 2) * cell, y0 + (ey + 1) * cell, Math.ceil(e / 2) * cell, Math.ceil(e / 2) * cell);
    ctx.fillRect(x0 + (exr + e / 2) * cell, y0 + (ey + 1) * cell, Math.ceil(e / 2) * cell, Math.ceil(e / 2) * cell);
    ctx.fillRect(x0 + Math.round(n * 0.36) * cell, y0 + Math.round(n * 0.72) * cell, Math.round(n * 0.28) * cell, cell);
  }

  var PIX_CSS =
    ".pix{position:relative}" +
    ".pix-shadow{position:absolute;left:12%;right:12%;bottom:-9%;height:12%;border-radius:50%;background:radial-gradient(closest-side,rgba(20,21,24,.28),rgba(20,21,24,0));}" +
    ".pix-body{position:absolute;inset:0;border-radius:28%;transform-origin:50% 100%;" +
    "background:radial-gradient(120% 120% at 30% 22%,#FF9566 0%,#FF5A1F 46%,#E0400A 100%);" +
    "box-shadow:inset 0 -10px 24px rgba(150,30,0,.35),inset 0 8px 16px rgba(255,220,200,.45),0 30px 50px -24px rgba(200,60,10,.55);}" +
    ".pix-shine{position:absolute;left:14%;top:9%;width:34%;height:16%;border-radius:50%;background:rgba(255,255,255,.45);filter:blur(3px);transform:rotate(-14deg)}" +
    ".pix-face{position:absolute;left:0;top:0;width:200px;height:200px;transform-origin:0 0}" +
    ".pix-eye{position:absolute;top:66px;width:36px;height:44px;border-radius:50%;background:#fff;box-shadow:inset 0 -3px 0 rgba(0,0,0,.08)}" +
    ".pix-eye.l{left:52px}.pix-eye.r{left:112px}" +
    ".pix-pupil{position:absolute;left:10px;top:13px;width:17px;height:20px;border-radius:50%;background:#141518;box-shadow:inset 4px 4px 0 -1px rgba(255,255,255,.0)}" +
    ".pix-pupil:after{content:'';position:absolute;left:3px;top:3px;width:6px;height:6px;border-radius:50%;background:#fff}" +
    ".pix-brow{position:absolute;top:46px;width:34px;height:8px;border-radius:5px;background:#5a1a03}" +
    ".pix-brow.l{left:53px}.pix-brow.r{left:113px}" +
    ".pix-hap{position:absolute;top:78px;width:34px;height:22px;border-top:8px solid #141518;border-radius:50% 50% 0 0}" +
    ".pix-hap.l{left:53px}.pix-hap.r{left:113px}" +
    ".pix-mouth{position:absolute;left:82px;top:126px;width:36px}" +
    ".pix-mouth.flat{top:136px;height:7px;border-radius:4px;background:#5a1a03}" +
    ".pix-mouth.smile{height:18px;border-bottom:8px solid #5a1a03;border-radius:0 0 50% 50%}" +
    ".pix-mouth.o{left:88px;top:126px;width:24px;height:28px;border-radius:50%;background:#5a1a03}" +
    // spoken-fragment captions
    ".cap{position:absolute;left:96px;right:96px;text-align:center;font-family:'Inter';font-weight:400;font-size:54px;" +
    "line-height:1.25;letter-spacing:-0.02em;color:#4A4F57;white-space:nowrap}" +
    ".cap .kw{display:inline-block}.cap .kw>span{display:inline-block}" +
    ".cap .acc{font-family:'Instrument Serif';font-style:italic;font-size:1.34em;line-height:0.9;color:#E2470F;letter-spacing:-0.005em}" +
    ".cap .nm>span{font-weight:700;color:#141518}" +
    ".cap.dark{color:#C9CCD3}.cap.dark .acc{color:#FF6A33}";
  var st = document.createElement("style");
  st.textContent = PIX_CSS;
  document.head.appendChild(st);

  /* ---------------- exact polygon / pixel coverage (Approach 3) ---------------- */

  function clipToRect(poly, r) {
    var edges = [
      function (p) { return p[0] >= r[0]; }, function (p) { return p[0] <= r[2]; },
      function (p) { return p[1] >= r[1]; }, function (p) { return p[1] <= r[3]; },
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
        var cur = input[i], prev = input[(i + input.length - 1) % input.length];
        var cin = edges[e](cur), pin = edges[e](prev);
        if (cin) { if (!pin) out.push(hit[e](prev, cur)); out.push(cur); } else if (pin) out.push(hit[e](prev, cur));
      }
    }
    return out;
  }
  function area(poly) {
    var s = 0;
    for (var i = 0; i < poly.length; i++) { var a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; }
    return Math.abs(s) / 2;
  }
  function coverage(poly, cx, cy) { return area(clipToRect(poly, [cx, cy, cx + 1, cy + 1])); }

  /** A calcium-deposit-like outline in cell units, centred on (cx, cy). */
  function lesion(cx, cy, rx, ry, n) {
    var poly = [];
    n = n || 96;
    for (var i = 0; i < n; i++) {
      var th = (i / n) * Math.PI * 2;
      var r = 1 + 0.16 * Math.sin(3 * th + 0.4) + 0.08 * Math.cos(5 * th + 1.1) + 0.05 * Math.sin(2 * th);
      poly.push([cx + rx * r * Math.cos(th), cy + ry * r * Math.sin(th)]);
    }
    return poly;
  }

  /* ---------------- fonts, readiness, motion helpers ---------------- */

  var fontFaces = [
    ["Inter", "vendor/fonts/Inter-400.woff2", { weight: "400" }],
    ["Inter", "vendor/fonts/Inter-700.woff2", { weight: "700" }],
    ["Instrument Serif", "vendor/fonts/InstrumentSerif-400.woff2", { weight: "400", style: "normal" }],
    ["Instrument Serif", "vendor/fonts/InstrumentSerif-400-italic.woff2", { weight: "400", style: "italic" }],
    ["Archivo Black", "vendor/fonts/ArchivoBlack-400.woff2", { weight: "400" }],
    ["JetBrains Mono", "vendor/fonts/JetBrainsMono-400.woff2", { weight: "400" }],
  ];
  var fontsReady = Promise.all(fontFaces.map(function (f) {
    var face = new FontFace(f[0], "url(" + f[1] + ")", f[2]);
    return face.load().then(function (l) { document.fonts.add(l); }, function (err) { console.error("[kit] font failed", f[1], err); });
  }));

  function buildReady(id, promise) {
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady[id] = promise;
    return promise;
  }

  /** Seek-safe camera shake: decaying jitter from time since impact; x/y return to 0 at the end. */
  function shake(tl, target, at, amp, dur) {
    var el = typeof target === "string" ? document.querySelector(target) : target;
    var p = { u: 0 };
    dur = dur || 0.12;
    tl.fromTo(p, { u: 0 }, {
      u: 1, duration: dur, ease: "none",
      onUpdate: function () {
        var f = p.u * dur * 60, decay = 1 - p.u;
        gsap.set(el, { x: p.u >= 1 ? 0 : amp * decay * Math.sin(f * 2.4 + 0.6), y: p.u >= 1 ? 0 : amp * 0.55 * decay * Math.cos(f * 3.1) });
      },
    }, at);
  }

  /** Scene hand-off on an inner wrapper: quick rise + unblur in, lift + blur out (light scenes). */
  function sceneIO(tl, target, D, opts) {
    opts = opts || {};
    if (!opts.noIn) {
      tl.fromTo(target, { opacity: 0, y: 30, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: opts.inDur || 0.32, ease: "power3.out" }, 0);
    }
    if (!opts.noOut) {
      tl.fromTo(target, { opacity: 1, y: 0, filter: "blur(0px)" },
        { opacity: 0, y: -24, filter: "blur(6px)", duration: 0.24, ease: "power2.in", immediateRender: false }, D - 0.24);
    }
  }

  /** Deterministic number roll into `el` over [at, at + dur]. */
  function countUp(tl, el, from, to, at, dur, fmt, ez) {
    var p = { v: from };
    tl.fromTo(p, { v: from }, {
      v: to, duration: dur, ease: ez || "power2.out",
      onUpdate: function () { el.textContent = fmt ? fmt(p.v) : String(Math.round(p.v)); },
    }, at);
  }

  /** Per-frame driver: calls fn(t) with scene time for the whole scene (for canvas / computed layouts). */
  function drive(tl, D, fn) {
    var clock = { t: 0 };
    tl.fromTo(clock, { t: 0 }, { t: D, duration: D, ease: "none", onUpdate: function () { fn(clock.t); } }, 0);
    fn(0);
  }

  window.HFKit = {
    C: C, prng: prng, ease: ease, cue: cue, caption: caption, pix: pix, drawBlockyPix: drawBlockyPix,
    clipToRect: clipToRect, area: area, coverage: coverage, lesion: lesion,
    fontsReady: fontsReady, buildReady: buildReady, shake: shake, sceneIO: sceneIO, countUp: countUp, drive: drive,
  };
})();
