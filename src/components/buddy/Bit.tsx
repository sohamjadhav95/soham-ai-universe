import { useId } from 'react';
import type { CharacterProps, Feeling } from './types';
import { Arm, Extras, Shadow } from './parts';
import { arcDown, arcUp, spiral, star4 } from './shapes';

// Bit: a chubby blue plush with a cream face, glossy eyes, mitten hands and a
// tuft of three bouncy square pixels.

const INK = '#1d2140';
const EYES: [number, number][] = [
  [58, 80],
  [82, 80],
];

const bodyMotion = (f: Feeling) =>
  f === 'happy' || f === 'excited' || f === 'proud'
    ? 'buddy-hop'
    : f === 'dizzy'
      ? 'buddy-wobble'
      : f === 'sad'
        ? 'buddy-droop'
        : 'buddy-breathe';

function Eye({ f, cx, cy, side }: { f: Feeling; cx: number; cy: number; side: -1 | 1 }) {
  if (f === 'happy' || f === 'proud')
    return <path d={arcUp(cx, cy + 1, 6, 6)} stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />;
  if (f === 'sleepy')
    return <path d={arcDown(cx, cy + 1, 6, 4)} stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />;
  if (f === 'dizzy')
    return (
      <g className="buddy-spin">
        <path d={spiral(cx, cy, 7)} stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    );
  if (f === 'shy')
    return (
      <path
        d={`M${cx - 5 * side} ${cy - 4} L${cx + 3 * side} ${cy} L${cx - 5 * side} ${cy + 4}`}
        stroke={INK}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  const big = f === 'excited';
  const ry = f === 'sad' ? 8 : big ? 10.2 : 9;
  const rx = big ? 8.4 : 7.5;
  return (
    <g className="buddy-blink">
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={INK} />
      {big ? (
        <path d={star4(cx - 2, cy - 3, 3.6)} fill="#fff" />
      ) : (
        <circle cx={cx - 2.6} cy={cy - 3.4} r="2.6" fill="#fff" />
      )}
      <circle cx={cx + 2.4} cy={cy + 2.8} r="1.2" fill="#fff" />
    </g>
  );
}

function Mouth({ f }: { f: Feeling }) {
  const s = { stroke: INK, strokeWidth: 2.4, strokeLinecap: 'round' as const, fill: 'none' };
  switch (f) {
    case 'talking':
      return <ellipse className="buddy-talk" cx="70" cy="97" rx="4.2" ry="3.6" fill={INK} />;
    case 'happy':
    case 'excited':
      return (
        <g>
          <path d={f === 'excited' ? 'M62 93 Q70 108 78 93 Z' : 'M63.5 94 Q70 105 76.5 94 Z'} fill={INK} />
          <ellipse cx="70" cy={f === 'excited' ? 101.5 : 100} rx="3.2" ry="2" fill="#ff7f98" />
        </g>
      );
    case 'proud':
      return <path d="M64 96 Q71 100.5 77 93.5" {...s} />;
    case 'sad':
      return <path d={arcUp(70, 99, 5, 4)} {...s} />;
    case 'sleepy':
      return <circle cx="70" cy="98" r="2.2" fill={INK} />;
    case 'dizzy':
      return <path d="M61 97 q2.25 -3 4.5 0 t4.5 0 t4.5 0 t4.5 0" {...s} strokeWidth={2} />;
    case 'shy':
      return <path d="M65 97 q2.5 -2.2 5 0 t5 0" {...s} strokeWidth={2.2} />;
    default:
      return <path d={arcDown(70, 96, 5, 4)} {...s} />;
  }
}

function Brows({ f }: { f: Feeling }) {
  const s = { stroke: INK, strokeWidth: 2.2, strokeLinecap: 'round' as const, fill: 'none' };
  if (f === 'sad')
    return (
      <g>
        <path d="M51 69 L61 65.5" {...s} />
        <path d="M79 65.5 L89 69" {...s} />
      </g>
    );
  if (f === 'excited')
    return (
      <g>
        <path d={arcUp(58, 66, 5, 3)} {...s} />
        <path d={arcUp(82, 66, 5, 3)} {...s} />
      </g>
    );
  return null;
}

export default function Bit({ feeling, gesture, point = 0, look = { x: 0, y: 0 } }: CharacterProps) {
  const id = useId().replace(/:/g, '');
  const g = feeling === 'shy' ? 'cover' : gesture;
  const pointing = g === 'point';
  const [l, r] = (() => {
    const right = pointing && Math.abs(((point + 540) % 360) - 180) <= 90;
    const a = { rest: [118, 62], wave: [118, -62], cheer: [-128, -52], cover: [-34, -146] } as Record<string, number[]>;
    if (pointing) return right ? [118, point] : [point, 62];
    return a[g] ?? a.rest;
  })();
  const blush = feeling === 'shy' || feeling === 'excited' ? 0.95 : 0.5;

  return (
    <svg className="buddy-svg" viewBox="0 0 140 150" aria-hidden="true" style={{ color: INK }}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7d8eff" />
          <stop offset="100%" stopColor="#3f55e0" />
        </linearGradient>
      </defs>
      <Shadow cx={70} cy={137} rx={30} />
      <g
        style={{ transform: `rotate(${look.x * 4}deg)`, transformOrigin: '70px 128px', transition: 'transform .35s ease-out' }}
      >
        <g className={bodyMotion(feeling)}>
          <ellipse cx="55" cy="125" rx="10" ry="5.5" fill="#2f42c0" />
          <ellipse cx="85" cy="125" rx="10" ry="5.5" fill="#2f42c0" />
          <rect className="buddy-bob" x="61.5" y="31" width="9" height="9" rx="2.5" fill="#8fa0ff" />
          <rect className="buddy-bob b2" x="70" y="23" width="9" height="9" rx="2.5" fill="#ff9a6b" />
          <rect className="buddy-bob b3" x="72" y="33" width="8" height="8" rx="2.3" fill="#6f84ff" />
          <rect x="30" y="40" width="80" height="86" rx="31" fill={`url(#${id}-body)`} />
          <ellipse cx="47" cy="54" rx="12" ry="5.5" fill="#fff" fillOpacity="0.35" transform="rotate(-24 47 54)" />
          <rect x="39" y="59" width="62" height="52" rx="24" fill="#fff6ea" />
          <ellipse cx="46.5" cy="94" rx="6.2" ry="3.6" fill="#ff9fb2" fillOpacity={blush} />
          <ellipse cx="93.5" cy="94" rx="6.2" ry="3.6" fill="#ff9fb2" fillOpacity={blush} />
          <Brows f={feeling} />
          <g className="buddy-look" style={{ transform: `translate(${look.x * 2.4}px, ${look.y * 2}px)` }}>
            <Eye f={feeling} cx={EYES[0][0]} cy={EYES[0][1]} side={-1} />
            <Eye f={feeling} cx={EYES[1][0]} cy={EYES[1][1]} side={1} />
          </g>
          <Mouth f={feeling} />
          <Arm shoulder={[33, 93]} angle={l} length={19} thickness={9.5} color="#4d63ea" handColor="#ffeedd" handStroke="#e3c7a8" hand="mitten" pointing={pointing && l !== 118} />
          <Arm shoulder={[107, 93]} angle={r} length={19} thickness={9.5} color="#4d63ea" handColor="#ffeedd" handStroke="#e3c7a8" hand="mitten" pointing={pointing && r !== 62} waving={g === 'wave'} />
        </g>
      </g>
      <Extras feeling={feeling} head={[70, 40]} eye={EYES[1]} sparkle="#ffc94d" />
    </svg>
  );
}
