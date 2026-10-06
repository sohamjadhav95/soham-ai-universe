import { createElement, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion';
import { onReveal } from '@/lib/reveal';

type Props = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  className?: string;
  /** 'scroll' plays when scrolled into view; 'reveal' plays when the page curtain lifts. */
  trigger?: 'scroll' | 'reveal';
  delay?: number;
};

/** Text whose words slide up from behind a mask, one after another. */
export default function SplitWords({ text, as = 'h4', className = '', trigger = 'scroll', delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const inners = ref.current.querySelectorAll('.word-inner');
    const ctx = gsap.context(() => gsap.set(inners, { yPercent: 115 }));
    const play = () =>
      ctx.add(() => gsap.to(inners, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.018, delay }));

    let off = () => {};
    if (trigger === 'reveal') off = onReveal(play);
    else
      ctx.add(() =>
        ScrollTrigger.create({ trigger: ref.current, start: 'top 88%', once: true, onEnter: play }),
      );
    return () => {
      off();
      ctx.revert();
    };
  }, [text, trigger, delay]);

  const words = text.split(' ');
  return createElement(
    as,
    { ref, className: `split-words ${className}`, 'aria-label': text },
    words.map((w, i) => (
      <span key={i} aria-hidden="true">
        <span className="word">
          <span className="word-inner">{w}</span>
        </span>
        {i < words.length - 1 ? ' ' : ''}
      </span>
    )),
  );
}
