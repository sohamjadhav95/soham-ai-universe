import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { BUDDY, LINES, TOUR, tipsFor, unseenProjects, type BuddyAction, type Tip } from '@/data/buddy';
import { getProject } from '@/data/projects';
import { buddy } from '@/lib/buddy';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { pointer } from '@/lib/pointer';
import { onReveal } from '@/lib/reveal';
import { getLenis } from '@/lib/scroll';
import { useShownLocation, useSite } from '@/lib/transition';
import { useIsMobile } from '@/lib/useIsMobile';
import { CHARACTERS, DUST_TINT } from './index';
import { PixelFilters, pixelate } from './parts';
import { dust, snapshot } from './dust';
import type { Feeling, Gesture } from './types';
import '@/styles/buddy.css';

type Bubble = { text: string; action?: BuddyAction; tour?: number };
type Phase = 'live' | 'leaving' | 'gone' | 'arriving';
type Pending = { target?: string; tour?: number };

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string | null) {
    try {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch {
      /* private mode: forget silently */
    }
  },
};

// `?buddyfast` shortens the idle timers, for testing.
const FAST = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('buddyfast');
const SAD_AFTER = FAST ? 2500 : 20000;
const SLEEP_AFTER = FAST ? 6000 : 60000;
const POINT_AT_BUBBLE = -118;

const hourInIndia = () =>
  Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(new Date()));

const angleTo = (from: DOMRect, to: DOMRect) =>
  (Math.atan2(to.top + to.height / 2 - (from.top + from.height / 2), to.left + to.width / 2 - (from.left + from.width / 2)) *
    180) /
  Math.PI;

/** The site buddy: lives in the corner, follows you, suggests things and takes you there. */
export default function Buddy() {
  const { go } = useSite();
  const path = useShownLocation().pathname;
  const mobile = useIsMobile();
  const Character = CHARACTERS[BUDDY.character];
  const W = mobile ? 62 : 110;
  const H = Math.round((W * 150) / 140);

  const root = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>(() => (store.get('buddy:closed') === '1' ? 'gone' : 'live'));
  const [base, setBase] = useState<Feeling>('idle');
  const [flashF, setFlashF] = useState<Feeling | null>(null);
  const [gesture, setGesture] = useState<Gesture>('rest');
  const [point, setPoint] = useState(0);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [tour, setTour] = useState<number | null>(null);
  const [riding, setRiding] = useState(false);

  // Mirrors of state for event handlers and the animation loop.
  const live = useRef({ path, bubble, tour, phase, mobile, base, ready, hovering: false });
  live.current = { ...live.current, path, bubble, tour, phase, mobile, base, ready };
  const mode = useRef<'follow' | 'drag' | 'free'>('follow');
  const pending = useRef<Pending | null>(null);
  const spotEl = useRef<Element | null>(null);
  const timers = useRef<Record<string, number>>({});
  const tipIndex = useRef(-1);
  const once = useRef(new Set<string>());

  const later = (key: string, fn: () => void, ms: number) => {
    window.clearTimeout(timers.current[key]);
    timers.current[key] = window.setTimeout(fn, ms);
  };
  const cancel = (key: string) => window.clearTimeout(timers.current[key]);

  /* ── feelings & speech ─────────────────────────────── */

  const flash = useCallback((f: Feeling, ms: number) => {
    setFlashF(f);
    later('flash', () => setFlashF(null), ms);
  }, []);

  const pose = useCallback((g: Gesture, angle = 0, ms = 0) => {
    setGesture(g);
    setPoint(angle);
    if (ms) later('pose', () => setGesture('rest'), ms);
    else cancel('pose');
  }, []);

  const say = useCallback(
    (text: string, opts: { action?: BuddyAction; ms?: number; tour?: number } = {}) => {
      if (live.current.phase !== 'live') return;
      setBubble({ text, action: opts.action, tour: opts.tour });
      flash('talking', 1200);
      if (opts.action) pose('point', POINT_AT_BUBBLE, opts.tour === undefined ? opts.ms ?? 5000 : 0);
      if (opts.tour === undefined) later('bubble', () => !live.current.hovering && setBubble(null), opts.ms ?? 5000);
      else cancel('bubble');
    },
    [flash, pose],
  );

  const pointAtEl = useCallback(
    (el: Element | null, ms = 3000) => {
      if (!el || !figure.current) return;
      pose('point', angleTo(figure.current.getBoundingClientRect(), el.getBoundingClientRect()), ms);
    },
    [pose],
  );

  const scrollToEl = (el: Element) => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -window.innerHeight * 0.22, duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ── travel, tour ──────────────────────────────────── */

  const travel = useCallback(
    (to: string, p: Pending) => {
      pending.current = p;
      setBubble(null);
      setRiding(true);
      flash('excited', 1600);
      pose('cheer', 0, 1600);
      go(to);
    },
    [go, flash, pose],
  );

  const showStop = useCallback(
    (i: number) => {
      const stop = TOUR[i];
      const el = document.querySelector(stop.target);
      setTour(i);
      if (!el) {
        say(stop.text, { tour: i });
        return;
      }
      spotEl.current = el;
      scrollToEl(el);
      later('stop', () => {
        say(stop.text, { tour: i });
        pointAtEl(el, 0);
      }, 1300);
    },
    [say, pointAtEl],
  );

  const goStop = useCallback(
    (i: number) => {
      const stop = TOUR[i];
      spotEl.current = null;
      setBubble(null);
      if (stop.to !== live.current.path) travel(stop.to, { tour: i });
      else showStop(i);
    },
    [travel, showStop],
  );

  const endTour = useCallback(
    (skipped: boolean) => {
      setTour(null);
      spotEl.current = null;
      setBubble(null);
      pose('rest');
      if (!skipped) {
        flash('proud', 2600);
        later('done', () => say(LINES.tourDone, { ms: 3500 }), 200);
      }
    },
    [flash, pose, say],
  );

  const run = useCallback(
    (action?: BuddyAction) => {
      if (!action) return;
      if ('tour' in action) {
        goStop(0);
        return;
      }
      if (action.to === live.current.path) {
        setBubble(null);
        const el = action.target ? document.querySelector(action.target) : null;
        if (el) {
          scrollToEl(el);
          later('point', () => pointAtEl(el), 1200);
        }
        flash('happy', 1400);
      } else travel(action.to, { target: action.target });
    },
    [goStop, travel, pointAtEl, flash],
  );

  const currentTip = (): Tip => {
    const tips = tipsFor(live.current.path);
    return tips[tipIndex.current % tips.length];
  };

  const openTip = useCallback(() => {
    const tips = tipsFor(live.current.path);
    tipIndex.current = (tipIndex.current + 1) % tips.length;
    const tip = tips[tipIndex.current];
    say(tip.text, { action: tip.action, ms: 6000 });
  }, [say]);

  /* ── landing after the curtain ─────────────────────── */

  useEffect(() => {
    const seen: string[] = JSON.parse(store.get('buddy:seen') || '[]');
    if (path.startsWith('/work/') && getProject(path.slice(6)) && !seen.includes(path.slice(6))) {
      store.set('buddy:seen', JSON.stringify([...seen, path.slice(6)]));
    }
    once.current.delete('papers');
    once.current.delete('film');
    once.current.delete('typing');
    if (!pending.current) return;
    return onReveal(() => {
      const p = pending.current;
      pending.current = null;
      setRiding(false);
      if (!p) return;
      if (p.tour !== undefined) {
        later('land', () => showStop(p.tour as number), 500);
        return;
      }
      const el = p.target ? document.querySelector(p.target) : null;
      later('land', () => {
        if (el) {
          scrollToEl(el);
          later('point', () => pointAtEl(el), 1100);
        }
        flash('happy', 1600);
        say(LINES.landed, { ms: 2600 });
      }, 500);
    });
  }, [path, showStop, pointAtEl, flash, say]);

  /* ── first appearance & greeting ───────────────────── */

  useEffect(
    () =>
      onReveal(() => {
        setReady(true);
        if (live.current.phase !== 'live') return;
        if (root.current) gsap.fromTo(root.current.querySelector('.buddy-figure'), { scale: 0 }, { scale: 1, duration: 0.7, ease: 'back.out(1.8)', delay: 0.3 });
        let greeted = false;
        try {
          greeted = sessionStorage.getItem('buddy:greeted') === '1';
          sessionStorage.setItem('buddy:greeted', '1');
        } catch {
          /* ignore */
        }
        if (greeted) return;
        const visits = Number(store.get('buddy:visits') || '0');
        store.set('buddy:visits', String(visits + 1));
        later('greet', () => {
          pose('wave', 0, 2200);
          if (visits > 0) {
            const seen: string[] = JSON.parse(store.get('buddy:seen') || '[]');
            const next = unseenProjects(seen)[0];
            if (next) say(LINES.unseen(next.title), { action: { label: `${next.title} →`, to: `/work/${next.slug}` }, ms: 7000 });
            else say(LINES.welcomeBack, { ms: 4000 });
          } else say(LINES.greet(hourInIndia(), BUDDY.name), { action: { label: 'Show me around', tour: true }, ms: 7000 });
        }, 1200);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ── page events (bus) and page reactions ──────────── */

  useEffect(
    () =>
      buddy.on(e => {
        if (e.type === 'say') say(e.text, { action: e.action, ms: e.ms });
        else flash(e.feeling, e.ms);
      }),
    [say, flash],
  );

  useEffect(() => {
    let lastRow = 0;
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest || live.current.phase !== 'live') return;
      if (t.closest('.paper-row') && !once.current.has('papers')) {
        once.current.add('papers');
        flash('excited', 1800);
        say(LINES.papers, { ms: 2200 });
      } else if (t.closest('.row-link, .table-row') && Date.now() - lastRow > 2500) {
        lastRow = Date.now();
        flash('happy', 900);
      }
    };
    const input = (e: Event) => {
      const t = e.target as Element | null;
      if (!t?.closest?.('.contact-form') || once.current.has('typing')) return;
      once.current.add('typing');
      flash('excited', 1400);
      say(LINES.typing, { ms: 2200 });
    };
    window.addEventListener('pointerover', over);
    window.addEventListener('input', input);
    return () => {
      window.removeEventListener('pointerover', over);
      window.removeEventListener('input', input);
    };
  }, [flash, say]);

  // "Psst, it has sound" once the About film is on screen.
  useEffect(() => {
    if (path !== '/about') return;
    let io: IntersectionObserver | null = null;
    const off = onReveal(() => {
      const film = document.querySelector('.about-film');
      if (!film) return;
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || once.current.has('film') || live.current.tour !== null) return;
          once.current.add('film');
          say(LINES.film, { ms: 3500 });
          pointAtEl(film.querySelector('.video-frame') ?? film, 3500);
        },
        { threshold: 0.5 },
      );
      io.observe(film);
    });
    return () => {
      off();
      io?.disconnect();
    };
  }, [path, say, pointAtEl]);

  /* ── idle: sad, then asleep ────────────────────────── */

  useEffect(() => {
    let lastActive = Date.now();
    const wake = () => {
      lastActive = Date.now();
      if (live.current.base !== 'idle') {
        setBase('idle');
        flash('happy', 1300);
        setBubble(b => (b && b.text === LINES.bored ? null : b));
      }
    };
    const id = window.setInterval(() => {
      // Only count time the visitor can actually see the buddy.
      if (!live.current.ready || live.current.phase !== 'live' || live.current.tour !== null) {
        lastActive = Date.now();
        return;
      }
      const idle = Date.now() - lastActive;
      if (idle > SLEEP_AFTER && live.current.base !== 'sleepy') {
        setBase('sleepy');
        setBubble(null);
        pose('rest');
      } else if (idle > SAD_AFTER && idle <= SLEEP_AFTER && live.current.base === 'idle') {
        setBase('sad');
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
        if (atBottom) say(LINES.boredBottom, { action: { label: 'Show me around', tour: true }, ms: 6000 });
        else {
          say(LINES.bored, { ms: 6000 });
          pose('point', 100, 6000);
        }
      }
    }, 1000);
    const events = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, wake, { passive: true }));
    return () => {
      window.clearInterval(id);
      events.forEach(ev => window.removeEventListener(ev, wake));
    };
  }, [flash, pose, say]);

  /* ── position: dock, follow, tilt, throw ───────────── */

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 1.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 1.6, ease: 'power3.out' });
    const tiltTo = tilt.current ? gsap.quickTo(tilt.current, 'rotation', { duration: 0.6, ease: 'power2.out' }) : null;
    const reduced = prefersReducedMotion();
    let footer: Element | null = null;
    let footerAt = '';
    let lookFrame = 0;
    let lastTilt = 0;

    const dock = () => {
      const m = live.current.mobile ? 14 : 26;
      let y = window.innerHeight - H - m;
      if (footerAt !== live.current.path) {
        footer = document.querySelector('.footer-bottom');
        footerAt = live.current.path;
      }
      if (footer) {
        const r = footer.getBoundingClientRect();
        if (r.top < window.innerHeight) y = Math.min(y, r.top - H - 12);
      }
      return { x: window.innerWidth - W - m, y };
    };

    const d0 = dock();
    gsap.set(el, { x: d0.x, y: d0.y });

    const tick = () => {
      const d = dock();
      if (mode.current === 'follow') {
        let tx = d.x;
        let ty = d.y;
        const still = live.current.hovering || live.current.bubble || live.current.tour !== null;
        if (!live.current.mobile && !reduced && !still) {
          const cx = d.x + W / 2;
          const cy = d.y + H / 2;
          tx += Math.max(-window.innerWidth * 0.18, Math.min(0, (pointer.x - cx) * 0.12));
          ty += Math.max(-window.innerHeight * 0.18, Math.min(0, (pointer.y - cy) * 0.12));
        }
        xTo(tx);
        yTo(ty);
      }

      // Eyes follow the cursor (or the tour stop).
      if (++lookFrame % 3 === 0) {
        const x = Number(gsap.getProperty(el, 'x')) + W / 2;
        const y = Number(gsap.getProperty(el, 'y')) + H / 2;
        let tx = pointer.x;
        let ty = pointer.y;
        if (spotEl.current) {
          const r = spotEl.current.getBoundingClientRect();
          tx = r.left + r.width / 2;
          ty = r.top + r.height / 2;
        }
        const nx = Math.max(-1, Math.min(1, (tx - x) / 320));
        const ny = Math.max(-1, Math.min(1, (ty - y) / 320));
        setLook(l => (Math.abs(l.x - nx) > 0.06 || Math.abs(l.y - ny) > 0.06 ? { x: nx, y: ny } : l));
      }

      // Tour spotlight follows its target while the page scrolls.
      if (spot.current && !spotEl.current) spot.current.style.opacity = '0';
      else if (spot.current && spotEl.current) {
        const r = spotEl.current.getBoundingClientRect();
        const pad = 14;
        Object.assign(spot.current.style, {
          left: `${r.left - pad}px`,
          top: `${r.top - pad}px`,
          width: `${r.width + pad * 2}px`,
          height: `${r.height + pad * 2}px`,
          opacity: '1',
        });
      }

      if (tiltTo && performance.now() - lastTilt > 160) tiltTo(0);
    };
    gsap.ticker.add(tick);

    // Lean into the scroll; very fast scrolling makes it dizzy.
    const lenis = getLenis();
    let lastDizzy = 0;
    const offScroll = lenis?.on('scroll', ({ velocity }: { velocity: number }) => {
      if (!tiltTo || reduced) return;
      lastTilt = performance.now();
      tiltTo(Math.max(-12, Math.min(12, -velocity * 0.5)));
      if (Math.abs(velocity) > 85 && performance.now() - lastDizzy > 5000 && live.current.phase === 'live') {
        lastDizzy = performance.now();
        flash('dizzy', 1800);
        say(LINES.dizzy, { ms: 1800 });
      }
    });

    return () => {
      gsap.ticker.remove(tick);
      offScroll?.();
    };
  }, [W, H, flash, say]);

  /* ── pointer play: drag & throw, rub, clicks ───────── */

  const drag = useRef({ down: false, moved: false, ox: 0, oy: 0, sx: 0, sy: 0, hist: [] as { x: number; y: number; t: number }[], flips: 0, lastDx: 0 });
  const justDragged = useRef(false);
  const rub = useRef({ flips: 0, lastDx: 0, since: 0, cool: 0 });
  const clicks = useRef<number[]>([]);

  const onPointerDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (live.current.mobile || prefersReducedMotion() || e.button !== 0) return;
    const el = root.current;
    if (!el) return;
    const x = Number(gsap.getProperty(el, 'x'));
    const y = Number(gsap.getProperty(el, 'y'));
    drag.current = { down: true, moved: false, ox: e.clientX - x, oy: e.clientY - y, sx: e.clientX, sy: e.clientY, hist: [], flips: 0, lastDx: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (d.down) {
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) {
        d.moved = true;
        mode.current = 'drag';
        gsap.killTweensOf(root.current);
        setBubble(null);
        flash('excited', 60000);
      }
      if (d.moved) {
        gsap.set(root.current, { x: e.clientX - d.ox, y: e.clientY - d.oy });
        const now = performance.now();
        d.hist.push({ x: e.clientX, y: e.clientY, t: now });
        d.hist = d.hist.filter(h => now - h.t < 120);
        const dx = e.movementX;
        if (dx && Math.sign(dx) !== Math.sign(d.lastDx) && Math.abs(dx) > 4) d.flips++;
        if (dx) d.lastDx = dx;
      }
      return;
    }
    // Rubbing: lots of quick left-right moves while hovering.
    const r = rub.current;
    const now = performance.now();
    if (now - r.since > 900) {
      r.flips = 0;
      r.since = now;
    }
    const dx = e.movementX;
    if (dx && Math.sign(dx) !== Math.sign(r.lastDx) && Math.abs(dx) > 2) r.flips++;
    if (dx) r.lastDx = dx;
    if (r.flips >= 6 && now > r.cool) {
      r.cool = now + 4000;
      r.flips = 0;
      flash('shy', 2400);
      say(LINES.tickle, { ms: 2400 });
    }
  };

  const onPointerUp = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (!d.moved) return;
    justDragged.current = true;
    window.setTimeout(() => (justDragged.current = false), 50);
    const el = root.current;
    if (!el) return;
    const h = d.hist;
    let vx = 0;
    let vy = 0;
    if (h.length > 1) {
      const a = h[0];
      const b = h[h.length - 1];
      const dt = Math.max(b.t - a.t, 16) / 16.7;
      vx = (b.x - a.x) / dt;
      vy = (b.y - a.y) / dt;
    }
    const dizzy = d.flips >= 4;
    flash(dizzy ? 'dizzy' : 'excited', dizzy ? 2200 : 1400);
    if (dizzy) say(LINES.dizzy, { ms: 2000 });
    mode.current = 'free';
    let x = e.clientX - d.ox;
    let y = e.clientY - d.oy;
    const step = () => {
      vy += 0.35; // floaty gravity
      vx *= 0.985;
      vy *= 0.985;
      x += vx;
      y += vy;
      const maxX = window.innerWidth - W;
      const maxY = window.innerHeight - H;
      if (x < 0 || x > maxX) {
        x = Math.max(0, Math.min(maxX, x));
        vx = -vx * 0.62;
      }
      if (y < 0 || y > maxY) {
        y = Math.max(0, Math.min(maxY, y));
        vy = -vy * 0.62;
        vx *= 0.9;
      }
      gsap.set(el, { x, y });
      if (Math.hypot(vx, vy) < 0.8 && y >= maxY - 1) {
        gsap.ticker.remove(step);
        later('home', () => {
          mode.current = 'follow';
        }, 700);
      }
    };
    gsap.ticker.add(step);
  };

  const pixelEgg = () => {
    const main = document.querySelector('main') as HTMLElement | null;
    flash('proud', 2600);
    say(LINES.egg, { ms: 2800 });
    if (!main || prefersReducedMotion()) return;
    pixelate(n => {
      main.style.filter = n ? `url(#buddy-px-${n})` : '';
    });
  };

  const onClick = () => {
    if (justDragged.current || live.current.phase !== 'live') return;
    const now = Date.now();
    clicks.current = [...clicks.current.filter(t => now - t < 2500), now];
    const n = clicks.current.length;
    if (n >= 7) {
      clicks.current = [];
      cancel('go');
      pixelEgg();
      return;
    }
    if (n >= 2) {
      cancel('go');
      if (n === 3) {
        flash('dizzy', 1200);
        say(LINES.poke, { ms: 1600 });
      }
      return;
    }
    if (live.current.mobile || !live.current.bubble) {
      // First tap shows the suggestion; tap the button in the bubble to go.
      if (live.current.bubble && live.current.mobile) setBubble(null);
      else openTip();
      return;
    }
    const action = live.current.bubble.action ?? currentTip().action;
    later('go', () => run(action), 380);
  };

  /* ── close (blow away like dust) and bring back ────── */

  const close = async () => {
    if (live.current.phase !== 'live') return;
    setTour(null);
    spotEl.current = null;
    setBubble(null);
    setFlashF('sad');
    pose('wave', 0, 0);
    setPhase('leaving');
    store.set('buddy:closed', '1');
    await new Promise(r => window.setTimeout(r, 450));
    const svg = figure.current?.querySelector('svg');
    const rect = figure.current?.getBoundingClientRect();
    const canvas = svg && !prefersReducedMotion() ? await snapshot(svg) : null;
    if (figure.current) figure.current.style.visibility = 'hidden';
    if (canvas && rect) await dust(canvas, rect, { duration: 1800, tint: DUST_TINT[BUDDY.character] });
    else if (figure.current) await new Promise(r => window.setTimeout(r, 300));
    setPhase('gone');
    setFlashF(null);
    pose('rest');
  };

  const bringBack = async () => {
    if (live.current.phase !== 'gone') return;
    setPhase('arriving');
    store.set('buddy:closed', null);
    mode.current = 'follow';
    setBase('idle');
    setFlashF('happy');
    pose('wave', 0, 0);
    await new Promise(r => window.setTimeout(r, 120));
    const svg = figure.current?.querySelector('svg');
    const rect = figure.current?.getBoundingClientRect();
    const canvas = svg && !prefersReducedMotion() ? await snapshot(svg) : null;
    if (canvas && rect) await dust(canvas, rect, { duration: 1200, reverse: true, tint: DUST_TINT[BUDDY.character] });
    if (figure.current) figure.current.style.visibility = '';
    setPhase('live');
    live.current.phase = 'live';
    later('back', () => {
      setFlashF(null);
      pose('rest');
    }, 1800);
    say(LINES.back, { ms: 2400 });
  };

  // Esc closes the bubble, or skips the tour.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (live.current.tour !== null) endTour(true);
      else setBubble(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [endTour]);

  useEffect(() => () => Object.values(timers.current).forEach(t => window.clearTimeout(t)), []);

  const feeling = flashF ?? base;
  const hidden = phase === 'gone' || phase === 'arriving';
  const tourLast = tour !== null && tour === TOUR.length - 1;

  return (
    <>
      <PixelFilters />
      {tour !== null && <div className="buddy-spot" ref={spot} aria-hidden="true" />}
      <div
        ref={root}
        className={`buddy${ready ? ' is-ready' : ''}${riding ? ' is-riding' : ''}${hidden ? ' is-hidden' : ''}${phase === 'leaving' ? ' is-leaving' : ''}${mobile ? ' is-mobile' : ''}`}
        style={{ width: W, height: H }}
        onPointerEnter={() => {
          if (mobile) return;
          live.current.hovering = true;
          cancel('bubble');
          if (!live.current.bubble && phase === 'live' && mode.current === 'follow') openTip();
        }}
        onPointerLeave={() => {
          if (mobile) return;
          live.current.hovering = false;
          if (live.current.tour === null) later('bubble', () => setBubble(null), 1400);
        }}
      >
        <div className="buddy-bubble-slot" aria-live="polite">
          {bubble && phase === 'live' && (
            <div className="buddy-bubble" key={bubble.text}>
              <p>{bubble.text}</p>
              {bubble.action && (
                <button className="buddy-bubble-action" onClick={() => run(bubble.action)}>
                  {bubble.action.label}
                </button>
              )}
              {bubble.tour !== undefined && (
                <div className="buddy-bubble-tour">
                  <span>
                    {bubble.tour + 1} / {TOUR.length}
                  </span>
                  <button onClick={() => endTour(true)}>Skip</button>
                  <button
                    className="buddy-bubble-action"
                    onClick={() => (tourLast ? endTour(false) : goStop((bubble.tour as number) + 1))}
                  >
                    {tourLast ? 'Done' : 'Next →'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="buddy-tilt" ref={tilt}>
          <div className="buddy-figure" ref={figure}>
            <Character feeling={feeling} gesture={gesture} point={point} look={feeling === 'sleepy' ? { x: 0, y: 0 } : look} />
          </div>
        </div>
        <button
          className="buddy-hit"
          aria-label={`${BUDDY.name}, your guide to this site. ${bubble ? bubble.text : 'Click for a suggestion.'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={onClick}
          tabIndex={hidden ? -1 : 0}
        />
        <button className="buddy-close" aria-label={`Close ${BUDDY.name}`} onClick={close} tabIndex={hidden ? -1 : 0}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 2.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {phase === 'gone' && ready && (
        <button className={`buddy-dot${mobile ? ' is-mobile' : ''}`} onClick={bringBack} aria-label={`Bring ${BUDDY.name} back`} data-label={`Bring ${BUDDY.name} back`}>
          {BUDDY.character === 'nimbus' ? (
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path
                d="M9 24h14.5a5.5 5.5 0 0 0 .9-10.9A7.5 7.5 0 0 0 10 12.4 5.8 5.8 0 0 0 9 24Z"
                fill="#f3eefe"
                stroke="#c9b8f3"
                strokeWidth="1.4"
              />
              <circle cx="13.5" cy="18" r="1.2" fill="#2b2440" />
              <circle cx="18.5" cy="18" r="1.2" fill="#2b2440" />
            </svg>
          ) : (
            <span className="buddy-dot-mini">
              <Character feeling="idle" gesture="rest" look={{ x: 0, y: 0 }} />
            </span>
          )}
        </button>
      )}
    </>
  );
}
