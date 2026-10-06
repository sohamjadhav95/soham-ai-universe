import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion';

// One smooth-scroll instance for the whole site, driven by GSAP's ticker so
// ScrollTrigger and Lenis always agree on the scroll position.
let lenis: Lenis | null = null;

export function initScroll() {
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.body.classList.toggle('is-locked', locked);
}

export function resetScroll() {
  lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

/** -1 when scrolling up, 1 when scrolling down. Remembers the last direction. */
let lastY = 0;
let direction = 1;
export function scrollDirection() {
  const y = lenis ? lenis.scroll : window.scrollY;
  if (y > lastY) direction = 1;
  else if (y < lastY) direction = -1;
  lastY = y;
  return lenis?.direction ? lenis.direction : direction;
}
