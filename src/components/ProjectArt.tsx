import type { Project } from '@/data/projects';

// Drawn placeholder covers, one per project, until real images are added.
// Each is a small diagram of the project's actual idea, in its own colours.

type Tone = Project['tone'];

/* ── Sub-pixel segmentation: a pixel grid shaded by true coverage ─────────── */

const GRID = { cols: 12, rows: 9, size: 20, x: 80, y: 60 };

function blob(): [number, number][] {
  const cx = GRID.x + (GRID.cols * GRID.size) / 2 + 4;
  const cy = GRID.y + (GRID.rows * GRID.size) / 2 - 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const r = 58 * (1 + 0.16 * Math.sin(3 * t + 0.6) + 0.07 * Math.cos(5 * t));
    pts.push([cx + r * Math.cos(t) * 1.25, cy + r * Math.sin(t) * 0.92]);
  }
  return pts;
}

function inside([x, y]: [number, number], poly: [number, number][]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const POLY = blob();
const N = 8;
const CELLS = Array.from({ length: GRID.cols * GRID.rows }, (_, k) => {
  const c = k % GRID.cols;
  const r = Math.floor(k / GRID.cols);
  const x0 = GRID.x + c * GRID.size;
  const y0 = GRID.y + r * GRID.size;
  let n = 0;
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      if (inside([x0 + ((i + 0.5) * GRID.size) / N, y0 + ((j + 0.5) * GRID.size) / N], POLY)) n++;
  return { x: x0, y: y0, cov: n / (N * N) };
});
const LABELS = CELLS.filter(c => c.cov > 0.3 && c.cov < 0.7).filter((_, i, a) => i % Math.ceil(a.length / 3) === 0);

function Subpixel({ tone }: { tone: Tone }) {
  return (
    <>
      {CELLS.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width={GRID.size}
          height={GRID.size}
          fill={tone.accent}
          fillOpacity={c.cov * 0.85}
          stroke={tone.ink}
          strokeOpacity={0.14}
        />
      ))}
      <polygon points={POLY.map(p => p.join(',')).join(' ')} fill="none" stroke={tone.ink} strokeWidth={1.6} />
      {LABELS.map((c, i) => (
        <text
          key={i}
          x={c.x + GRID.size / 2}
          y={c.y + GRID.size / 2 + 2.6}
          fontSize="7"
          textAnchor="middle"
          fill={tone.ink}
        >
          {c.cov.toFixed(2)}
        </text>
      ))}
    </>
  );
}

/* ── PrediCT Studio: a review workstation ─────────────────────────────────── */

function Studio({ tone }: { tone: Tone }) {
  return (
    <>
      <defs>
        <radialGradient id="ct" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8d8f93" />
          <stop offset="70%" stopColor="#4a4c50" />
          <stop offset="100%" stopColor="#2b2d31" />
        </radialGradient>
      </defs>
      <rect x="40" y="42" width="320" height="216" rx="8" fill="#26282c" stroke="#ffffff" strokeOpacity="0.14" />
      <circle cx="58" cy="58" r="3.5" fill="#ffffff" fillOpacity="0.25" />
      <circle cx="70" cy="58" r="3.5" fill="#ffffff" fillOpacity="0.25" />
      <circle cx="82" cy="58" r="3.5" fill="#ffffff" fillOpacity="0.25" />
      <line x1="40" y1="72" x2="360" y2="72" stroke="#ffffff" strokeOpacity="0.1" />
      <rect x="54" y="84" width="160" height="160" rx="4" fill="#111214" />
      <ellipse cx="134" cy="166" rx="66" ry="56" fill="url(#ct)" />
      <ellipse cx="128" cy="160" rx="30" ry="24" fill="#a3a5a9" fillOpacity="0.55" />
      <circle cx="118" cy="150" r="3.2" fill={tone.accent} />
      <circle cx="140" cy="168" r="2.4" fill={tone.accent} />
      <circle cx="122" cy="174" r="1.8" fill={tone.accent} />
      <rect x="226" y="88" width="120" height="10" rx="2" fill="#ffffff" fillOpacity="0.85" />
      <rect x="226" y="106" width="78" height="6" rx="2" fill="#ffffff" fillOpacity="0.3" />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect
          key={i}
          x={226 + i * 20.5}
          y="128"
          width="18"
          height="8"
          rx="2"
          fill={i === 3 ? tone.accent : '#ffffff'}
          fillOpacity={i === 3 ? 1 : 0.16}
        />
      ))}
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <line x1="226" y1={160 + i * 22} x2="346" y2={160 + i * 22} stroke="#ffffff" strokeOpacity="0.1" />
          <rect x="226" y={166 + i * 22} width={30 + ((i * 37) % 60)} height="5" rx="2" fill="#ffffff" fillOpacity="0.35" />
          <circle cx="340" cy={168 + i * 22} r="2.5" fill={tone.accent} fillOpacity={i === 0 ? 1 : 0.5} />
        </g>
      ))}
    </>
  );
}

/* ── Convo-Ease: three channels through one gate ──────────────────────────── */

function Gate({ tone }: { tone: Tone }) {
  const ys = [86, 150, 214];
  return (
    <>
      {ys.map(y => (
        <path
          key={y}
          d={`M128 ${y} C 170 ${y}, 170 150, 200 150`}
          fill="none"
          stroke={tone.ink}
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      ))}
      <rect x="58" y={ys[0] - 20} width="70" height="40" rx="8" fill="#ffffff" />
      <rect x="70" y={ys[0] - 9} width="46" height="4" rx="2" fill={tone.ink} fillOpacity="0.7" />
      <rect x="70" y={ys[0] + 1} width="32" height="4" rx="2" fill={tone.ink} fillOpacity="0.35" />
      <rect x="58" y={ys[1] - 20} width="70" height="40" rx="8" fill="#ffffff" />
      <path d={`M70 ${ys[1] + 12} l14 -16 l10 10 l7 -7 l15 13 z`} fill={tone.ink} fillOpacity="0.55" />
      <circle cx="110" cy={ys[1] - 8} r="4" fill={tone.accent} />
      <rect x="58" y={ys[2] - 20} width="70" height="40" rx="8" fill="#ffffff" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const h = [8, 16, 24, 12, 20, 10, 18, 6][i];
        return <rect key={i} x={70 + i * 6} y={ys[2] - h / 2} width="3" height={h} rx="1.5" fill={tone.ink} fillOpacity="0.6" />;
      })}
      <rect x="200" y="104" width="44" height="92" rx="22" fill={tone.accent} />
      <path d="M222 132 v36" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="222" cy="128" r="6" fill="none" stroke="#ffffff" strokeWidth="3" />
      <path d="M244 150 C 270 150, 270 112, 298 112" fill="none" stroke={tone.accent} strokeWidth="1.5" />
      <path d="M244 150 C 270 150, 270 188, 298 188" fill="none" stroke={tone.ink} strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="316" cy="112" r="18" fill={tone.accent} />
      <path d="M307 112 l6 6 l11 -12" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="316" cy="188" r="18" fill="#ffffff" />
      <path d="M309 181 l14 14 M323 181 l-14 14" stroke={tone.ink} strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

/* ── Copilot for Data Science: question in, chart out ─────────────────────── */

function Copilot({ tone }: { tone: Tone }) {
  const bars = [44, 70, 58, 96, 124];
  return (
    <>
      <path d="M58 70 h120 a12 12 0 0 1 12 12 v42 a12 12 0 0 1 -12 12 h-84 l-18 16 v-16 h-18 a12 12 0 0 1 -12 -12 v-42 a12 12 0 0 1 12 -12 z" fill="#ffffff" />
      <rect x="72" y="88" width="88" height="5" rx="2.5" fill={tone.ink} fillOpacity="0.7" />
      <rect x="72" y="102" width="62" height="5" rx="2.5" fill={tone.ink} fillOpacity="0.35" />
      <rect x="72" y="116" width="74" height="5" rx="2.5" fill={tone.ink} fillOpacity="0.35" />
      <line x1="196" y1="238" x2="348" y2="238" stroke={tone.ink} strokeOpacity="0.35" />
      {bars.map((h, i) => (
        <rect key={i} x={206 + i * 28} y={238 - h} width="18" height={h} rx="3" fill={tone.accent} fillOpacity={0.35 + i * 0.15} />
      ))}
      <polyline
        points={bars.map((h, i) => `${215 + i * 28},${226 - h}`).join(' ')}
        fill="none"
        stroke={tone.ink}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M318 62 l5 13 l13 5 l-13 5 l-5 13 l-5 -13 l-13 -5 l13 -5 z" fill={tone.accent} />
    </>
  );
}

/* ── Heart segmentation: an organ contour with nested masks ───────────────── */

function Heart({ tone }: { tone: Tone }) {
  const d =
    'M200 78 C 236 64, 286 82, 292 128 C 298 172, 262 214, 214 236 C 196 244, 182 240, 170 228 C 134 196, 104 168, 110 128 C 116 90, 160 70, 200 78 Z';
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1="40" y1={46 + i * 16} x2="360" y2={46 + i * 16} stroke="#ffffff" strokeOpacity="0.05" />
      ))}
      <path d={d} fill={tone.accent} fillOpacity="0.22" stroke={tone.accent} strokeWidth="2" />
      <path d={d} fill="none" stroke={tone.accent} strokeOpacity="0.5" transform="translate(200 156) scale(0.72) translate(-200 -156)" />
      <path d={d} fill="none" stroke={tone.accent} strokeOpacity="0.3" transform="translate(200 156) scale(0.45) translate(-200 -156)" />
      <path d="M318 96 h32 M326 112 h24 M334 128 h16" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

/* ── RenAIssance OCR: old lines of script, one being read ─────────────────── */

function Script({ tone }: { tone: Tone }) {
  const line = (y: number, w: number, k: number) => {
    let d = `M70 ${y}`;
    for (let x = 70; x < 70 + w; x += 9) d += ` q 2.5 ${-6 - ((x + k) % 5)} 5 0 t 4 0`;
    return d;
  };
  return (
    <>
      {[0, 1, 2, 3, 5, 6].map(i => (
        <path key={i} d={line(76 + i * 26, 230 - ((i * 23) % 70), i)} fill="none" stroke={tone.ink} strokeOpacity="0.55" strokeWidth="1.4" />
      ))}
      <rect x="62" y="194" width="250" height="24" rx="3" fill="none" stroke={tone.accent} strokeWidth="1.6" />
      <path d={line(210, 236, 9)} fill="none" stroke={tone.ink} strokeWidth="1.6" />
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={70 + i * 22} y="236" width="16" height="16" rx="2" fill={tone.accent} fillOpacity={0.25 + (i % 4) * 0.18} />
      ))}
    </>
  );
}

/* ── Tennis: a court and a predicted arc ──────────────────────────────────── */

function Court({ tone }: { tone: Tone }) {
  return (
    <>
      <path d="M110 250 L150 70 H250 L290 250 Z" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.6" />
      <path d="M128 250 L162 70 M272 250 L238 70" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.2" />
      <path d="M134 142 H266 M200 142 V250" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.2" />
      <path d="M118 194 H282" stroke="#ffffff" strokeWidth="2.4" />
      <path d="M150 236 C 190 40, 260 60, 268 110" fill="none" stroke={tone.accent} strokeWidth="1.6" strokeDasharray="4 6" />
      <circle cx="268" cy="112" r="9" fill={tone.accent} />
      <path d="M261 107 c 5 3, 9 3, 14 0 M261 117 c 5 -3, 9 -3, 14 0" fill="none" stroke="#3e6e52" strokeWidth="1" />
    </>
  );
}

/* ── NexaOS Flow: voice in, command out ───────────────────────────────────── */

function Voice({ tone }: { tone: Tone }) {
  const hs = [10, 26, 44, 30, 62, 40, 22, 50, 28, 14];
  return (
    <>
      {hs.map((h, i) => (
        <rect key={i} x={56 + i * 11} y={150 - h / 2} width="6" height={h} rx="3" fill={tone.accent} fillOpacity={0.5 + (i % 3) * 0.25} />
      ))}
      <path d="M180 150 h28 m-8 -7 l8 7 l-8 7" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.6" />
      <rect x="222" y="92" width="134" height="116" rx="8" fill="#2b2e33" stroke="#ffffff" strokeOpacity="0.14" />
      <circle cx="236" cy="106" r="3" fill="#ffffff" fillOpacity="0.25" />
      <circle cx="246" cy="106" r="3" fill="#ffffff" fillOpacity="0.25" />
      <path d="M236 134 l7 5 l-7 5" fill="none" stroke={tone.accent} strokeWidth="1.8" />
      <rect x="250" y="136" width="70" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.75" />
      <rect x="236" y="156" width="96" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.3" />
      <rect x="236" y="172" width="58" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.3" />
      <rect x="236" y="186" width="8" height="12" fill={tone.accent} />
    </>
  );
}

const ART: Record<string, (p: { tone: Tone }) => JSX.Element> = {
  'subpixel-cac-segmentation': Subpixel,
  'predict-studio': Studio,
  'convo-ease': Gate,
  'copilot-for-data-science': Copilot,
  'heart-segmentation': Heart,
  'renaissance-ocr': Script,
  'tennis-match-predictor': Court,
  'nexaos-flow': Voice,
};

export default function ProjectArt({ project }: { project: Project }) {
  const Art = ART[project.slug];
  return (
    <svg viewBox="0 0 400 300" className="project-art" role="img" aria-label={`${project.title} illustration`}>
      {Art ? <Art tone={project.tone} /> : null}
    </svg>
  );
}
