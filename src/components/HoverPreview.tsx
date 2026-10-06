import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { gsap, isTouch } from '@/lib/motion';
import { pointer } from '@/lib/pointer';
import '@/styles/hover.css';

type Slide = { key: string; bg: string; content: ReactNode };

/**
 * The floating preview + round "View" cursor shown while hovering a list row.
 * `active` is the hovered row index (null when the pointer leaves the list).
 */
export default function HoverPreview({
  slides,
  active,
  label = 'View',
  square = false,
}: {
  slides: Slide[];
  active: number | null;
  label?: string;
  square?: boolean;
}) {
  const modal = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const last = useRef(0);
  if (active !== null) last.current = active;

  useEffect(() => {
    if (isTouch()) return;
    const els = [modal.current, cursor.current, text.current];
    gsap.set(els, { xPercent: -50, yPercent: -50, x: pointer.x, y: pointer.y });
    const movers = [
      [modal.current, 0.8],
      [cursor.current, 0.5],
      [text.current, 0.45],
    ].map(([el, d]) => ({
      x: gsap.quickTo(el as Element, 'x', { duration: d as number, ease: 'power3' }),
      y: gsap.quickTo(el as Element, 'y', { duration: d as number, ease: 'power3' }),
    }));
    const move = (e: PointerEvent) => movers.forEach(m => (m.x(e.clientX), m.y(e.clientY)));
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useEffect(() => {
    if (isTouch()) return;
    const open = active !== null;
    gsap.to([modal.current, cursor.current, text.current], {
      scale: open ? 1 : 0,
      duration: 0.4,
      ease: open ? 'site-ease-out' : 'power2.in',
      overwrite: 'auto',
    });
  }, [active]);

  if (typeof document === 'undefined' || isTouch()) return null;

  return createPortal(
    <>
      <div className={`hover-modal${square ? ' is-square' : ''}`} ref={modal} aria-hidden="true">
        <div className="hover-slider" style={{ transform: `translateY(${-last.current * 100}%)` }}>
          {slides.map(s => (
            <div className="hover-slide" key={s.key} style={{ background: s.bg }}>
              {s.content}
            </div>
          ))}
        </div>
      </div>
      <div className="hover-cursor" ref={cursor} aria-hidden="true" />
      <div className="hover-label" ref={text} aria-hidden="true">
        {label}
      </div>
    </>,
    document.body,
  );
}
