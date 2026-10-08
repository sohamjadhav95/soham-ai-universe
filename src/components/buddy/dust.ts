// "Blow away like dust": snapshot the buddy's SVG, turn its pixels into
// grains, and let a wind sweep them away (or play it backwards to reform).

type Grain = { x: number; y: number; r: number; g: number; b: number; a: number; delay: number; dx: number; dy: number; wob: number };

/** Draw an on-screen SVG into a canvas at device resolution. */
export async function snapshot(svg: SVGSVGElement): Promise<HTMLCanvasElement | null> {
  const box = svg.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(box.width));
  clone.setAttribute('height', String(box.height));
  const markup = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function grainsFrom(src: HTMLCanvasElement, step: number): Grain[] {
  const ctx = src.getContext('2d');
  if (!ctx) return [];
  const { width, height } = src;
  const data = ctx.getImageData(0, 0, width, height).data;
  const grains: Grain[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a < 40) continue;
      grains.push({
        x,
        y,
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: a / 255,
        // The wind comes from the right (the buddy sits by the right edge)
        // and carries the grains up and left, across the page.
        delay: (1 - x / width) * 0.5 + Math.random() * 0.22,
        dx: -(0.6 + Math.random() * 1.1),
        dy: -(0.25 + Math.random() * 0.9),
        wob: Math.random() * Math.PI * 2,
      });
    }
  }
  return grains;
}

/**
 * Play the dust effect over `rect` (where the buddy is on screen).
 * `reverse` plays it backwards, so the grains fly in and reform.
 */
export function dust(
  src: HTMLCanvasElement,
  rect: DOMRect,
  { duration = 1800, reverse = false, tint = '#a48ff0' }: { duration?: number; reverse?: boolean; tint?: string } = {},
): Promise<void> {
  return new Promise(resolve => {
    const dpr = src.width / rect.width;
    const step = Math.max(2, Math.round(2 * dpr));
    const grains = grainsFrom(src, step);
    const reach = 190; // CSS px the wind carries the grains
    const pad = reach + 20;
    const canvas = document.createElement('canvas');
    canvas.className = 'buddy-dust';
    const w = rect.width + pad + 8;
    const h = rect.height + pad + 8;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    Object.assign(canvas.style, {
      left: `${rect.left - pad}px`,
      top: `${rect.top - pad}px`,
      width: `${w}px`,
      height: `${h}px`,
    });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      resolve();
      return;
    }
    const o = pad * dpr; // the buddy's top-left inside the dust canvas
    const size = step * 1.3;
    // Grains take on the character's colour as they fly, so a white
    // character's dust still shows on a white page.
    const tr = parseInt(tint.slice(1, 3), 16);
    const tg = parseInt(tint.slice(3, 5), 16);
    const tb = parseInt(tint.slice(5, 7), 16);
    const life = 0.55; // share of the duration each grain spends travelling
    const start = performance.now();

    const frame = (now: number) => {
      let t = Math.min((now - start) / duration, 1);
      if (reverse) t = 1 - t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const g of grains) {
        const p = Math.min(Math.max((t - g.delay * (1 - life)) / life, 0), 1);
        if (p >= 1) continue;
        const ease = p * p * (3 - 2 * p);
        const dist = ease * reach * dpr;
        const x = o + g.x + g.dx * dist + Math.sin(g.wob + p * 6) * 4 * dpr * p;
        const y = o + g.y + g.dy * dist;
        const s = size * (1 - p * 0.5);
        const m = Math.min(1, p * 2.2) * 0.85;
        const r = Math.round(g.r + (tr - g.r) * m);
        const gg = Math.round(g.g + (tg - g.g) * m);
        const b = Math.round(g.b + (tb - g.b) * m);
        ctx.fillStyle = `rgba(${r},${gg},${b},${g.a * (1 - p * p)})`;
        ctx.fillRect(x, y, s, s);
      }
      if ((reverse && t > 0) || (!reverse && t < 1)) requestAnimationFrame(frame);
      else {
        canvas.remove();
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
