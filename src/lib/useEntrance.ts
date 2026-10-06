import { useLayoutEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion';
import { onReveal } from './reveal';

/**
 * Page entrance: every `.once-in` element inside `scope` rises into place when
 * the curtain lifts. Also refreshes ScrollTrigger once the new page is laid out.
 */
export function useEntrance(scope: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const els = scope.current?.querySelectorAll('.once-in') ?? [];
    const ctx = gsap.context(() => {
      if (!prefersReducedMotion() && els.length) gsap.set(els, { y: '18vh', opacity: 0 });
    }, scope.current ?? undefined);

    const off = onReveal(() => {
      ctx.add(() => {
        if (els.length)
          gsap.to(els, { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.04, delay: 0.1 });
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => {
      off();
      window.removeEventListener('load', onLoad);
      ctx.revert();
    };
  }, [scope]);
}

export function useTitle(title: string) {
  useLayoutEffect(() => {
    document.title = title;
  }, [title]);
}
