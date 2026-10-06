import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, EASE, prefersReducedMotion } from '@/lib/motion';
import { emitReveal } from '@/lib/reveal';
import { lockScroll } from '@/lib/scroll';
import { GREETINGS } from '@/data/site';

/** First-visit loader: greetings flash by, then the curtain lifts with a curved edge. */
export default function Preloader() {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setDone(true);
      emitReveal();
      return;
    }
    lockScroll(true);
    const timers: number[] = [];
    // First word holds a moment, the rest flash quickly.
    let t = 900;
    GREETINGS.slice(1).forEach((_, i) => {
      timers.push(window.setTimeout(() => setIndex(i + 1), t));
      t += 160;
    });

    const tl = gsap.timeline({ delay: (t + 450) / 1000, defaults: { ease: EASE } });
    gsap.fromTo(text.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 });
    tl.add(() => {
      lockScroll(false);
      emitReveal();
    })
      .to(text.current, { opacity: 0, y: -40, duration: 0.4, ease: 'power2.in' })
      .set(bottom.current, { height: '12vh' }, 0)
      .to(panel.current, { yPercent: -100, duration: 0.85 }, 0.15)
      .to(bottom.current, { height: '2vh', duration: 0.85 }, 0.15)
      .add(() => setDone(true));

    return () => {
      timers.forEach(clearTimeout);
      tl.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div className="curtain is-active" aria-hidden="true">
      <div className="curtain-panel" ref={panel}>
        <div className="curtain-label" ref={text} style={{ opacity: 0 }}>
          <span className="dot" />
          <span lang={/[ऀ-ॿ]/.test(GREETINGS[index]) ? 'mr' : undefined}>{GREETINGS[index]}</span>
        </div>
        <div className="curtain-curve bottom" ref={bottom}>
          <div className="shape" />
        </div>
      </div>
    </div>
  );
}
