import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/motion';
import type { Feeling, Gesture } from './types';
import { heart, star4, tear } from './shapes';

type HandStyle = 'mitten' | 'puff' | 'claw';

/**
 * One arm, drawn pointing right from its shoulder and rotated into place with
 * GSAP (svgOrigin keeps the pivot exact). Waving swings it back and forth.
 */
export function Arm({
  shoulder,
  angle,
  length,
  thickness,
  color,
  handColor,
  hand,
  handStroke,
  pointing = false,
  waving = false,
}: {
  shoulder: [number, number];
  angle: number;
  length: number;
  thickness: number;
  color: string;
  handColor: string;
  hand: HandStyle;
  /** Soft outline so the hand still shows against a same-coloured face (e.g. when shy). */
  handStroke?: string;
  pointing?: boolean;
  waving?: boolean;
}) {
  const ref = useRef<SVGGElement>(null);
  const [sx, sy] = shoulder;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const origin = `${sx} ${sy}`;
    gsap.killTweensOf(el);
    if (waving) {
      gsap.set(el, { svgOrigin: origin });
      gsap
        .timeline()
        .to(el, { rotation: angle, duration: 0.35, ease: 'back.out(1.6)', svgOrigin: origin })
        .to(el, { rotation: angle - 28, duration: 0.28, ease: 'sine.inOut', yoyo: true, repeat: -1, svgOrigin: origin });
    } else {
      gsap.to(el, { rotation: angle, duration: 0.5, ease: 'back.out(1.7)', svgOrigin: origin });
    }
  }, [angle, waving, sx, sy]);

  const hx = sx + length;
  const outline = handStroke ? { stroke: handStroke, strokeWidth: 0.9 } : {};
  return (
    <g ref={ref}>
      <rect x={sx - thickness / 2} y={sy - thickness / 2} width={length + thickness / 2} height={thickness} rx={thickness / 2} fill={color} />
      {hand === 'mitten' && (
        <>
          <ellipse cx={hx + 1} cy={sy} rx={thickness * 0.78} ry={thickness * 0.72} fill={handColor} {...outline} />
          {pointing ? (
            <ellipse cx={hx + thickness * 0.95} cy={sy - 0.5} rx={thickness * 0.42} ry={thickness * 0.24} fill={handColor} {...outline} />
          ) : (
            <ellipse cx={hx - 1} cy={sy - thickness * 0.55} rx={thickness * 0.28} ry={thickness * 0.24} fill={handColor} {...outline} />
          )}
        </>
      )}
      {hand === 'puff' && (
        <>
          <circle cx={hx} cy={sy} r={thickness * 0.72} fill={handColor} {...outline} />
          {pointing && <circle cx={hx + thickness * 0.85} cy={sy} r={thickness * 0.34} fill={handColor} {...outline} />}
        </>
      )}
      {hand === 'claw' && (
        <>
          <circle cx={hx} cy={sy} r={thickness * 0.95} fill={handColor} />
          {pointing ? (
            <>
              <rect x={hx} y={sy - 1.3} width={thickness * 1.9} height={2.6} rx={1.3} fill={handColor} />
              <rect x={hx - 1} y={sy + 1.2} width={thickness * 0.9} height={2.4} rx={1.2} fill={handColor} transform={`rotate(35 ${hx} ${sy})`} />
            </>
          ) : (
            <>
              <rect x={hx} y={sy - 3.6} width={thickness * 1.2} height={2.4} rx={1.2} fill={handColor} transform={`rotate(-22 ${hx} ${sy})`} />
              <rect x={hx} y={sy - 1.2} width={thickness * 1.3} height={2.4} rx={1.2} fill={handColor} />
              <rect x={hx} y={sy + 1.2} width={thickness * 1.2} height={2.4} rx={1.2} fill={handColor} transform={`rotate(22 ${hx} ${sy})`} />
            </>
          )}
        </>
      )}
    </g>
  );
}

/** Feeling props that float around the head: tears, Zzz, hearts, sparkles, orbiting stars. */
export function Extras({
  feeling,
  head,
  eye,
  sparkle = '#ffd36b',
}: {
  feeling: Feeling;
  head: [number, number];
  eye: [number, number];
  sparkle?: string;
}) {
  const [hx, hy] = head;
  if (feeling === 'sad')
    return (
      <g className="buddy-tear">
        <path d={tear(eye[0] + 1, eye[1] + 10, 2.6)} fill="#7cc4ff" />
      </g>
    );
  if (feeling === 'sleepy')
    return (
      <g fill="currentColor" fontWeight={600} className="buddy-zs">
        <text x={hx + 18} y={hy + 2} fontSize="9" className="buddy-z">z</text>
        <text x={hx + 18} y={hy + 2} fontSize="11" className="buddy-z z2">z</text>
        <text x={hx + 18} y={hy + 2} fontSize="13" className="buddy-z z3">Z</text>
      </g>
    );
  if (feeling === 'shy')
    return (
      <g fill="#ff7fa6">
        <path className="buddy-rise" d={heart(hx + 22, hy + 6, 4)} />
        <path className="buddy-rise r2" d={heart(hx - 24, hy + 12, 3.2)} />
      </g>
    );
  if (feeling === 'excited' || feeling === 'proud')
    return (
      <g fill={sparkle}>
        <path className="buddy-sparkle" d={star4(hx - 30, hy + 6, 5)} />
        <path className="buddy-sparkle s2" d={star4(hx + 30, hy - 2, 6)} />
        <path className="buddy-sparkle s3" d={star4(hx + 24, hy + 30, 3.5)} />
        <path className="buddy-sparkle s4" d={star4(hx - 26, hy + 34, 3)} />
      </g>
    );
  if (feeling === 'dizzy')
    return (
      <g className="buddy-orbit" style={{ transformOrigin: `${hx}px ${hy - 2}px` }} fill={sparkle}>
        <path d={star4(hx + 22, hy - 2, 4)} />
        <path d={star4(hx - 11, hy - 21, 3.4)} />
        <path d={star4(hx - 11, hy + 17, 3.4)} />
      </g>
    );
  return null;
}

/** Shadow under a character; shrinks while it floats up. */
export function Shadow({ cx, cy, rx }: { cx: number; cy: number; rx: number }) {
  return <ellipse className="buddy-shadow" cx={cx} cy={cy} rx={rx} ry={rx * 0.16} fill="#000" fillOpacity="0.13" />;
}

/** SVG filters for the "pixelate" move, one per block size. Render once per page. */
export const PIXEL_SIZES = [4, 8, 12, 16];
export function PixelFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {PIXEL_SIZES.map(n => (
          <filter key={n} id={`buddy-px-${n}`} x="0" y="0" width="1" height="1">
            <feFlood x={n / 2 - 1} y={n / 2 - 1} width="2" height="2" />
            <feComposite width={n} height={n} />
            <feTile result="grid" />
            <feComposite in="SourceGraphic" in2="grid" operator="in" />
            <feMorphology operator="dilate" radius={n / 2} />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

/** Play the signature move: shatter into pixels, hold, then snap back smooth. */
export function pixelate(set: (n: number) => void, done?: () => void) {
  const seq = [4, 8, 12, 16, 16, 16, 16, 12, 8, 4, 0];
  seq.forEach((n, i) => window.setTimeout(() => {
    set(n);
    if (i === seq.length - 1) done?.();
  }, i * 75));
}

export type { Gesture };
