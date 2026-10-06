import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap, isTouch } from '@/lib/motion';
import { pointer } from '@/lib/pointer';
import '@/styles/hover.css';

/** A round label that trails the cursor and pops in while `active` is true. */
export default function FollowBall({ active, label }: { active: boolean; label: string }) {
  const ball = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ball.current;
    if (!el || isTouch()) return;
    gsap.set(el, { xPercent: -50, yPercent: -50, x: pointer.x, y: pointer.y, scale: 0 });
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useEffect(() => {
    if (isTouch()) return;
    gsap.to(ball.current, {
      scale: active ? 1 : 0,
      duration: 0.4,
      ease: active ? 'site-ease-out' : 'power2.in',
      overwrite: 'auto',
    });
  }, [active]);

  if (typeof document === 'undefined' || isTouch()) return null;

  return createPortal(
    <div className="follow-ball" ref={ball} aria-hidden="true">
      {label}
    </div>,
    document.body,
  );
}
