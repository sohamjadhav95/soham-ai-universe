import { useEffect, useRef } from 'react';
import { geoOrthographic, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import land from '@/data/globe-land.json';
import { prefersReducedMotion } from '@/lib/motion';
import '@/styles/globe.css';

/**
 * Orthographic continent projection: all longitudes rotate through the visible hemisphere.
 * `solid`: light ocean, dark land (small badges). `dark`: a black sphere with white
 * continents, for sitting on a coloured circle.
 */
export default function RotatingGlobe({
  className = '',
  variant = 'solid',
}: {
  className?: string;
  variant?: 'solid' | 'dark';
}) {
  const landPath = useRef<SVGPathElement>(null);

  useEffect(() => {
    const projection = geoOrthographic().translate([50, 50]).scale(48).clipAngle(90);
    const draw = geoPath(projection);
    const geography = land as GeoPermissibleObjects;
    const render = (angle: number) => {
      projection.rotate([angle, -18, 0]);
      landPath.current?.setAttribute('d', draw(geography) ?? '');
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
        <circle className="globe-ocean" cx="50" cy="50" r="48" />
        <path className="globe-land" ref={landPath} />
      </svg>
    </span>
  );
}
