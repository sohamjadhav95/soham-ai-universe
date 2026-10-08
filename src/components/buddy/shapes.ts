// Small SVG path helpers shared by every buddy character.

/** "^" arc: closed happy eye. */
export const arcUp = (cx: number, cy: number, w: number, h: number) =>
  `M${cx - w} ${cy + h / 2} Q${cx} ${cy - h} ${cx + w} ${cy + h / 2}`;

/** "‿" arc: smile, or a sleeping eye. */
export const arcDown = (cx: number, cy: number, w: number, h: number) =>
  `M${cx - w} ${cy - h / 2} Q${cx} ${cy + h} ${cx + w} ${cy - h / 2}`;

/** Spiral for dizzy eyes, about 2.5 turns. */
export function spiral(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  const turns = 2.5;
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const rr = (r * i) / steps;
    pts.push(`${(cx + rr * Math.cos(t)).toFixed(2)} ${(cy + rr * Math.sin(t)).toFixed(2)}`);
  }
  return `M${pts.join(' L')}`;
}

export const heart = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + s * 0.9} C${cx - s * 1.6} ${cy - s * 0.1}, ${cx - s * 0.7} ${cy - s * 1.3}, ${cx} ${cy - s * 0.35} ` +
  `C${cx + s * 0.7} ${cy - s * 1.3}, ${cx + s * 1.6} ${cy - s * 0.1}, ${cx} ${cy + s * 0.9} Z`;

/** Four-point sparkle. */
export const star4 = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy} Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r} ` +
  `Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy} Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r} Z`;

export const tear = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy - s} C${cx + s * 0.9} ${cy + s * 0.1}, ${cx + s * 0.7} ${cy + s}, ${cx} ${cy + s} ` +
  `C${cx - s * 0.7} ${cy + s}, ${cx - s * 0.9} ${cy + s * 0.1}, ${cx} ${cy - s} Z`;

/** Angles (degrees) for each arm given a gesture. Left arm rests down-left, right arm down-right. */
export function armAngles(gesture: string, point = 0): { left: number; right: number } {
  switch (gesture) {
    case 'wave':
      return { left: 118, right: -62 };
    case 'cheer':
      return { left: -128, right: -52 };
    case 'cover':
      return { left: -32, right: -148 };
    case 'point': {
      const a = ((point + 540) % 360) - 180; // normalise to -180..180
      return Math.abs(a) <= 90 ? { left: 118, right: a } : { left: a, right: 62 };
    }
    default:
      return { left: 118, right: 62 };
  }
}
