import { useEffect, useId, useRef } from 'react';
import { geoGraticule10, geoOrthographic, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import land from '@/data/globe-land.json';
import { prefersReducedMotion } from '@/lib/motion';
import '@/styles/globe.css';

/**
 * Orthographic continent projection: all longitudes rotate through the visible hemisphere.
 * `solid`: light ocean, dark land (small badges). `glass`: white land on a see-through
 * ocean with a grid and soft shading, for sitting on a coloured circle.
 */
export default function RotatingGlobe({
  className = '',
  variant = 'solid',
}: {
  className?: string;
  variant?: 'solid' | 'glass';
}) {
  const landPath = useRef<SVGPathElement>(null);
  const gridPath = useRef<SVGPathElement>(null);
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    const projection = geoOrthographic().translate([50, 50]).scale(48).clipAngle(90);
    const draw = geoPath(projection);
    const geography = land as GeoPermissibleObjects;
    const grid = geoGraticule10();
    const render = (angle: number) => {
      projection.rotate([angle, -18, 0]);
      landPath.current?.setAttribute('d', draw(geography) ?? '');
      gridPath.current?.setAttribute('d', draw(grid) ?? '');
    };
    render(20);
    if (prefersReducedMotion()) return;

    let frame = 0;
    let previous = 0;
    let angle = 20;
    const tick = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      angle = (angle + delta * 16) % 360;
      render(angle);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span className={`globe is-${variant} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        {variant === 'glass' && (
          <defs>
            <radialGradient id={`${id}-shade`} cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
              <stop offset="55%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
            </radialGradient>
          </defs>
        )}
        <circle className="globe-ocean" cx="50" cy="50" r="48" />
        {variant === 'glass' && <path className="globe-grid" ref={gridPath} />}
        <path className="globe-land" ref={landPath} />
        {variant === 'glass' && (
          <>
            <circle cx="50" cy="50" r="48" fill={`url(#${id}-shade)`} />
            <circle className="globe-rim" cx="50" cy="50" r="48" />
          </>
        )}
      </svg>
    </span>
  );
}
