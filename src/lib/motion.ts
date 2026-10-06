import { useLayoutEffect, type DependencyList, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// The two easings used everywhere: a balanced in-out and a soft settle.
export const EASE = CustomEase.create('site-ease', '0.7,0,0.3,1');
export const EASE_OUT = CustomEase.create('site-ease-out', '0.34,1,0.64,1');

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;

/** Runs GSAP code scoped to `scope` and reverts every tween/trigger on unmount. */
export function useGsap(
  cb: (self: gsap.Context) => void | (() => void),
  scope: RefObject<HTMLElement>,
  deps: DependencyList = [],
) {
  useLayoutEffect(() => {
    const ctx = gsap.context(cb, scope.current ?? undefined);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export { gsap, ScrollTrigger };
