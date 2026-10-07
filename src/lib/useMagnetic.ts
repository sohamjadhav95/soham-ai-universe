import { useEffect, type RefObject } from 'react';
import { gsap, isTouch } from './motion';
import { pointer } from './pointer';

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

    let isHovering = false;

    const move = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      // Check if cursor is still actually over the element during scroll
      if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) {
        if (isHovering) leave();
        return;
      }
      isHovering = true;
      const rx = (cx - r.left) / r.width - 0.5;
      const ry = (cy - r.top) / r.height - 0.5;
      xTo(rx * strength);
      yTo(ry * strength);
      ix?.(rx * strength * 0.5);
      iy?.(ry * strength * 0.5);
    };

    const handlePointerMove = (e: PointerEvent) => move(e.clientX, e.clientY);
    const handleScroll = () => {
      if (isHovering) move(pointer.x, pointer.y);
    };

    const leave = () => {
      isHovering = false;
      xTo(0);
      yTo(0);
      ix?.(0);
      iy?.(0);
    };

    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', handleScroll);
      gsap.set([el, innerEl].filter(Boolean), { x: 0, y: 0 });
    };
  }, [target, inner, strength]);
}
