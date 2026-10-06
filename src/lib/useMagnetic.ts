import { useEffect, type RefObject } from 'react';
import { gsap, isTouch } from './motion';

/**
 * Pulls `target` toward the cursor while it hovers `target`, and the optional
 * `inner` element a little further, then springs both back on leave.
 * `strength` is roughly how many px the element can travel.
 */
export function useMagnetic(
  target: RefObject<HTMLElement>,
  inner?: RefObject<HTMLElement>,
  strength = 25,
) {
  useEffect(() => {
    const el = target.current;
    const innerEl = inner?.current;
    if (!el || isTouch()) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'elastic.out(1, 0.35)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'elastic.out(1, 0.35)' });
    const ix = innerEl ? gsap.quickTo(innerEl, 'x', { duration: 1, ease: 'elastic.out(1, 0.35)' }) : null;
    const iy = innerEl ? gsap.quickTo(innerEl, 'y', { duration: 1, ease: 'elastic.out(1, 0.35)' }) : null;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const rx = (e.clientX - r.left) / r.width - 0.5;
      const ry = (e.clientY - r.top) / r.height - 0.5;
      xTo(rx * strength);
      yTo(ry * strength);
      ix?.(rx * strength * 0.5);
      iy?.(ry * strength * 0.5);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
      ix?.(0);
      iy?.(0);
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.set([el, innerEl].filter(Boolean), { x: 0, y: 0 });
    };
  }, [target, inner, strength]);
}
