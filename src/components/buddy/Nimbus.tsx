import { useId } from 'react';
import type { CharacterProps, Feeling } from './types';
import { Arm, Extras, Shadow } from './parts';
import { arcDown, arcUp, spiral, star4 } from './shapes';

// Nimbus: a soft floating cloud-bean in white and lilac, with glowing cheeks,
// puff hands and an antenna orb whose colour follows its mood.

const INK = '#2b2440';
const EYES: [number, number][] = [
  [58, 81],
  [82, 81],
];
const ORB: Record<Feeling, string> = {
  idle: '#b79cff',
  happy: '#ffd36b',
  talking: '#8fd0ff',
  excited: '#ff8fc8',
  proud: '#ffd36b',
  shy: '#ff9fb8',
  sad: '#7fb2ff',
  sleepy: '#c9c3dd',
  dizzy: '#8fe6c4',
};

const BODY =
  'M33 96 C25 80 34 62 50 60 C51 45 69 38 80 47 C90 39 109 46 106 63 C119 69 119 98 101 108 ' +
  'C88 117 52 117 40 109 C35 105 32 101 33 96 Z';

function Eye({ f, cx, cy, side }: { f: Feeling; cx: number; cy: number; side: -1 | 1 }) {
  if (f === 'happy' || f === 'proud')
    return <path d={arcUp(cx, cy + 1, 5.5, 6)} stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />;
  if (f === 'sleepy')
    return <path d={arcDown(cx, cy + 1, 5.5, 4)} stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />;
  if (f === 'dizzy')
    return (
      <g className="buddy-spin">
        <path d={spiral(cx, cy, 6.5)} stroke={INK} strokeWidth="1.9" fill="none" strokeLinecap="round" />
      </g>
    );
  if (f === 'shy')
    return (
      <path
        d={`M${cx - 4.5 * side} ${cy - 4} L${cx + 3 * side} ${cy} L${cx - 4.5 * side} ${cy + 4}`}
        stroke={INK}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  const ry = f === 'sad' ? 7.5 : f === 'excited' ? 9.6 : 8.6;
  return (
    <g className="buddy-blink">
      <ellipse cx={cx} cy={cy} rx="6.2" ry={ry} fill={INK} />
      <path d={star4(cx - 1.8, cy - 3.2, f === 'excited' ? 3.4 : 2.6)} fill="#fff" />
      <circle cx={cx + 2} cy={cy + 3} r="1.15" fill="#fff" />
      {/* lashes */}
      <path
        d={`M${cx + 5.2 * side} ${cy - 5.5} l${2.6 * side} -2.2`}
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );
}

function Mouth({ f }: { f: Feeling }) {
  const s = { stroke: INK, strokeWidth: 2.1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (f) {
    case 'talking':
      return <ellipse className="buddy-talk" cx="70" cy="95" rx="3.6" ry="3.2" fill={INK} />;
    case 'happy':
    case 'excited':
      return (
        <g>
          <path d={f === 'excited' ? 'M63 92 Q70 105 77 92 Z' : 'M64.5 93 Q70 102 75.5 93 Z'} fill={INK} />
          <ellipse cx="70" cy={f === 'excited' ? 99.5 : 98} rx="2.8" ry="1.7" fill="#ff7f98" />
        </g>
      );
    case 'sad':
      return <path d={arcUp(70, 97, 4.5, 3.6)} {...s} />;
    case 'sleepy':
      return <circle cx="70" cy="96" r="2" fill={INK} />;
    case 'dizzy':
      return <path d="M62 95 q2 -2.6 4 0 t4 0 t4 0 t4 0" {...s} strokeWidth={1.8} />;
    case 'proud':
      return <path d="M64.5 94 Q71 98.5 76.5 92" {...s} />;
    default:
      // little "w" smile
      return <path d="M64 93 q3 3.2 6 0 q3 3.2 6 0" {...s} />;
  }
}

export default function Nimbus({ feeling, gesture, point = 0, look = { x: 0, y: 0 } }: CharacterProps) {
  const id = useId().replace(/:/g, '');
  const g = feeling === 'shy' ? 'cover' : gesture;
  const pointing = g === 'point';
  const [l, r] = (() => {
    const right = pointing && Math.abs(((point + 540) % 360) - 180) <= 90;
    const a = { rest: [125, 55], wave: [125, -62], cheer: [-130, -50], cover: [-30, -150] } as Record<string, number[]>;
    if (pointing) return right ? [125, point] : [point, 55];
    return a[g] ?? a.rest;
  })();
  const glow = feeling === 'shy' || feeling === 'excited' ? 1 : 0.7;

  return (
    <svg className="buddy-svg is-floating" viewBox="0 0 140 150" aria-hidden="true" style={{ color: '#9c86e8' }}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2d6fd" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <Shadow cx={70} cy={137} rx={26} />
      <g className="buddy-float">
        <g
          style={{ transform: `rotate(${look.x * 4}deg)`, transformOrigin: '70px 112px', transition: 'transform .35s ease-out' }}
        >
          <g className={feeling === 'dizzy' ? 'buddy-wobble' : feeling === 'happy' || feeling === 'excited' ? 'buddy-hop' : 'buddy-breathe'}>
            <path d="M74 47 Q72 33 82 26" stroke="#cdbdf6" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <circle className="buddy-glow" cx="83" cy="24" r="6" fill={ORB[feeling]} filter={`url(#${id}-glow)`} />
            <circle cx="81.4" cy="22.2" r="1.8" fill="#fff" fillOpacity="0.8" />
            <path d={BODY} fill={`url(#${id}-body)`} stroke="#ddd0fb" strokeWidth="1.2" />
            <ellipse cx="54" cy="64" rx="9" ry="4.5" fill="#fff" fillOpacity="0.9" transform="rotate(-18 54 64)" />
            <circle cx="48.5" cy="93" r="6.5" fill="#ffb0c8" fillOpacity={glow} filter={`url(#${id}-soft)`} />
            <circle cx="91.5" cy="93" r="6.5" fill="#ffb0c8" fillOpacity={glow} filter={`url(#${id}-soft)`} />
            <g className="buddy-look" style={{ transform: `translate(${look.x * 2.2}px, ${look.y * 1.8}px)` }}>
              <Eye f={feeling} cx={EYES[0][0]} cy={EYES[0][1]} side={-1} />
              <Eye f={feeling} cx={EYES[1][0]} cy={EYES[1][1]} side={1} />
            </g>
            <Mouth f={feeling} />
            <Arm shoulder={[33, 92]} angle={l} length={13} thickness={11} color="#f1eafe" handColor="#f6f0ff" handStroke="#d6c7fa" hand="puff" pointing={pointing && l !== 125} />
            <Arm shoulder={[107, 92]} angle={r} length={13} thickness={11} color="#f1eafe" handColor="#f6f0ff" handStroke="#d6c7fa" hand="puff" pointing={pointing && r !== 55} waving={g === 'wave'} />
          </g>
        </g>
      </g>
      <g fill="#c7b5ff">
        <path className="buddy-sparkle" d={star4(22, 62, 3.6)} />
        <path className="buddy-sparkle s3" d={star4(118, 106, 3)} />
      </g>
      <Extras feeling={feeling} head={[70, 42]} eye={EYES[1]} sparkle="#ffd36b" />
    </svg>
  );
}
