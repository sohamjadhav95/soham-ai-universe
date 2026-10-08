import { useId } from 'react';
import type { CharacterProps, Feeling } from './types';
import { Arm, Extras, Shadow } from './parts';
import { arcDown, arcUp, heart, spiral, tear } from './shapes';

// Pico: a small round robot with a peach shell and a glossy screen face. Its
// glowing eyes and mouth change shape with its mood; three-finger hands point.

const GLOW = '#8ff7e2';
const PINK = '#ff8fb3';
const EYES: [number, number][] = [
  [60, 80],
  [80, 80],
];

function Eye({ f, cx, cy, side }: { f: Feeling; cx: number; cy: number; side: -1 | 1 }) {
  const s = { stroke: GLOW, strokeWidth: 2.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  if (f === 'happy' || f === 'proud') return <path d={arcUp(cx, cy + 1, 4.6, 5)} {...s} />;
  if (f === 'sleepy') return <path d={`M${cx - 4} ${cy + 1} h8`} {...s} />;
  if (f === 'excited') return <path d={heart(cx, cy, 3.4)} fill={PINK} />;
  if (f === 'dizzy')
    return (
      <g className="buddy-spin">
        <path d={spiral(cx, cy, 5.5)} {...s} strokeWidth={1.8} />
      </g>
    );
  if (f === 'shy') return <path d={`M${cx - 4 * side} ${cy - 3.5} L${cx + 2.5 * side} ${cy} L${cx - 4 * side} ${cy + 3.5}`} {...s} />;
  if (f === 'sad')
    return (
      <g className="buddy-blink">
        <rect x={cx - 2.8} y={cy - 3} width="5.6" height="7" rx="2.8" fill={GLOW} transform={`rotate(${side * -14} ${cx} ${cy})`} />
      </g>
    );
  return (
    <g className="buddy-blink">
      <rect x={cx - 2.8} y={cy - 4.6} width="5.6" height="9.2" rx="2.8" fill={GLOW} />
    </g>
  );
}

function Mouth({ f }: { f: Feeling }) {
  const s = { stroke: GLOW, strokeWidth: 2.2, strokeLinecap: 'round' as const, fill: 'none' };
  switch (f) {
    case 'talking':
      return (
        <g fill={GLOW}>
          <rect className="buddy-talk" x="64.5" y="89" width="2.4" height="5" rx="1.2" />
          <rect className="buddy-talk" x="68.8" y="88" width="2.4" height="7" rx="1.2" style={{ animationDelay: '-0.12s' }} />
          <rect className="buddy-talk" x="73.1" y="89" width="2.4" height="5" rx="1.2" style={{ animationDelay: '-0.06s' }} />
        </g>
      );
    case 'happy':
    case 'proud':
      return <path d={arcDown(70, 90, 5, 4)} {...s} />;
    case 'excited':
      return <path d="M64.5 88.5 Q70 97 75.5 88.5 Z" fill={GLOW} />;
    case 'sad':
      return <path d={arcUp(70, 92, 4.5, 3.4)} {...s} />;
    case 'sleepy':
      return <circle cx="70" cy="91" r="1.8" fill={GLOW} />;
    case 'dizzy':
      return <path d="M63 91 q1.75 -2.4 3.5 0 t3.5 0 t3.5 0 t3.5 0" {...s} strokeWidth={1.7} />;
    case 'shy':
      return <path d="M66.5 91 q1.75 -1.6 3.5 0 t3.5 0" {...s} strokeWidth={1.9} />;
    default:
      return <path d={arcDown(70, 90, 3.6, 2.6)} {...s} />;
  }
}

export default function Pico({ feeling, gesture, point = 0, look = { x: 0, y: 0 } }: CharacterProps) {
  const id = useId().replace(/:/g, '');
  const g = feeling === 'shy' ? 'cover' : gesture;
  const pointing = g === 'point';
  const [l, r] = (() => {
    const right = pointing && Math.abs(((point + 540) % 360) - 180) <= 90;
    const a = { rest: [116, 64], wave: [116, -60], cheer: [-126, -54], cover: [-30, -150] } as Record<string, number[]>;
    if (pointing) return right ? [116, point] : [point, 64];
    return a[g] ?? a.rest;
  })();
  const motion =
    feeling === 'happy' || feeling === 'excited' || feeling === 'proud'
      ? 'buddy-hop'
      : feeling === 'dizzy'
        ? 'buddy-wobble'
        : feeling === 'sad'
          ? 'buddy-droop'
          : 'buddy-breathe';

  return (
    <svg className="buddy-svg" viewBox="0 0 140 150" aria-hidden="true" style={{ color: '#d0673d' }}>
      <defs>
        <radialGradient id={`${id}-shell`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffd2b8" />
          <stop offset="60%" stopColor="#ffa173" />
          <stop offset="100%" stopColor="#f07d4c" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <Shadow cx={70} cy={137} rx={28} />
      <g style={{ transform: `rotate(${look.x * 4}deg)`, transformOrigin: '70px 124px', transition: 'transform .35s ease-out' }}>
        <g className={motion}>
          <rect x="53" y="117" width="13" height="8" rx="4" fill="#e46c3f" />
          <rect x="74" y="117" width="13" height="8" rx="4" fill="#e46c3f" />
          <g className="buddy-bob">
            <path d="M59 48 L53 30" stroke="#f3d9c8" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="52.5" cy="28" r="4.6" fill="#ffd166" />
          </g>
          <g className="buddy-bob b2">
            <path d="M81 48 L88 32" stroke="#f3d9c8" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="88.5" cy="30" r="4" fill={GLOW} />
          </g>
          <ellipse cx="28" cy="80" rx="5.5" ry="9.5" fill="#e8743f" />
          <ellipse cx="112" cy="80" rx="5.5" ry="9.5" fill="#e8743f" />
          <circle cx="70" cy="82" r="41" fill={`url(#${id}-shell)`} />
          <ellipse cx="51" cy="56" rx="11" ry="5.5" fill="#fff" fillOpacity="0.5" transform="rotate(-28 51 56)" />
          <rect x="42.5" y="62" width="55" height="40" rx="15" fill="#16181e" stroke="#ffe0cf" strokeOpacity="0.55" strokeWidth="1.4" />
          <path d="M48 67 h16 q-12 4 -16 13 z" fill="#fff" fillOpacity="0.07" />
          <g filter={`url(#${id}-glow)`}>
            <g className="buddy-look" style={{ transform: `translate(${look.x * 3}px, ${look.y * 2}px)` }}>
              <Eye f={feeling} cx={EYES[0][0]} cy={EYES[0][1]} side={-1} />
              <Eye f={feeling} cx={EYES[1][0]} cy={EYES[1][1]} side={1} />
            </g>
            {(feeling === 'shy' || feeling === 'excited') && (
              <g fill={PINK} fillOpacity="0.85">
                <rect x="52" y="86.5" width="5.5" height="1.8" rx="0.9" />
                <rect x="82.5" y="86.5" width="5.5" height="1.8" rx="0.9" />
              </g>
            )}
            {feeling === 'sad' && (
              <g className="buddy-tear">
                <path d={tear(82, 88, 1.8)} fill="#7cc4ff" />
              </g>
            )}
            <Mouth f={feeling} />
          </g>
          <Arm shoulder={[33, 98]} angle={l} length={17} thickness={5.2} color="#f4e3d7" handColor="#f4e3d7" hand="claw" pointing={pointing && l !== 116} />
          <Arm shoulder={[107, 98]} angle={r} length={17} thickness={5.2} color="#f4e3d7" handColor="#f4e3d7" hand="claw" pointing={pointing && r !== 64} waving={g === 'wave'} />
        </g>
      </g>
      {feeling !== 'sad' && <Extras feeling={feeling} head={[70, 40]} eye={EYES[1]} sparkle="#ffd166" />}
    </svg>
  );
}
