import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import {
  BUDDY,
  LATER,
  LINES,
  SITE_TOUR,
  SITE_TOUR_ACTION,
  guideFor,
  introFor,
  stepTime,
  suggestionsFor,
  unseenProjects,
  type BuddyAction,
  type Step,
  type Tip,
} from '@/data/buddy';
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

type Bubble = { text: string; actions?: BuddyAction[] };
type Phase = 'live' | 'leaving' | 'gone' | 'arriving';
type RunKind = 'site' | 'page' | 'explain';
/** A tour in progress. `explain` is a one-stop tour: "here it is", with no controls. */
type Run = { kind: RunKind; steps: Step[]; i: number; shown: boolean; paused: boolean; held: boolean; left: number; since: number };
type RunView = { kind: RunKind; i: number; n: number; paused: boolean; held: boolean; ms: number; key: number };
/** What to do once the curtain lifts on the next page. */
type Pending = { to: string; run?: boolean; target?: string; nth?: number };

const safe = (s: () => Storage) => ({
  get(k: string) {
    try {
      return s().getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string | null) {
    try {
      if (v === null) s().removeItem(k);
      else s().setItem(k, v);
    } catch {
      /* private mode: forget silently */
    }
  },
});
const store = safe(() => localStorage);
const session = safe(() => sessionStorage);
const readList = (raw: string | null): string[] => {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const seenList = () => readList(store.get('buddy:seen'));

// `?buddyfast` shortens the idle timers, for testing.
const FAST = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('buddyfast');
const SAD_AFTER = FAST ? 2500 : 20000;
const SLEEP_AFTER = FAST ? 6000 : 60000;
const DIM_MS = 2600; // how long the page stays dimmed around a tour stop
const TOUR_BAR = 42; // room under the buddy for the tour controls

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

const hourInIndia = () =>
  Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(new Date()));

const angleTo = (from: DOMRect, to: { x: number; y: number }) =>
  (Math.atan2(to.y - (from.top + from.height / 2), to.x - (from.left + from.width / 2)) * 180) / Math.PI;

const findEl = (target: string, nth = 0) => document.querySelectorAll(target)[nth] ?? null;

/** Centre of the part of an element that is on screen. */
const visibleCentre = (r: DOMRect) => {
  const top = Math.max(r.top, 0);
  const bottom = Math.min(r.bottom, window.innerHeight);
  return { x: r.left + r.width / 2, y: bottom > top ? (top + bottom) / 2 : r.top + r.height / 2 };
};

/** Where the buddy stands to present an element: beside it, else below, above, or just inside its top-right corner. */
function placeNear(r: DOMRect, W: number, H: number, mobile: boolean) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const m = mobile ? 12 : 24;
  const gap = 12;
  const minY = mobile ? 72 : 96;
  const maxY = vh - H - m - TOUR_BAR;
  const top = Math.max(r.top, 0);
  const bottom = Math.min(r.bottom, vh);
  const midY = clamp((top + bottom) / 2 - H / 2, minY, maxY);
  if (r.right + gap + W <= vw - m) return { x: r.right + gap, y: midY };
  if (r.left - gap - W >= m) return { x: r.left - gap - W, y: midY };
  const x = clamp(Math.min(r.right, vw) - W - m, m, vw - W - m);
  if (bottom + gap <= maxY) return { x, y: bottom + gap };
  if (top - gap - H >= minY) return { x, y: top - gap - H };
  return { x, y: clamp(top + m, minY, maxY) }; // just inside its top-right corner, clear of left-aligned text
}

/** The tour stop for a part of a page, so "take me there" explains what it is. */
const stepAt = (to: string, target: string, nth?: number): Step => {
  const same = (s: Step) => s.target === target && (s.nth ?? 0) === (nth ?? 0);
  return guideFor(to).tour.find(same) ?? SITE_TOUR.find(s => s.to === to && same(s)) ?? { to, target, nth, text: LINES.landed };
};

function PauseIcon({ paused }: { paused: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      {paused ? <path d="M5 3.5v9l7-4.5z" fill="currentColor" /> : <path d="M5 3.5v9M11 3.5v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 3.5v9l6-4.5zM12 3.5v9" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** The site buddy: lives in the corner, follows you, suggests things, gives tours and takes you there. */
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
  const slot = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>(() => (store.get('buddy:closed') === '1' ? 'gone' : 'live'));
  const [base, setBase] = useState<Feeling>('idle');
  const [flashF, setFlashF] = useState<Feeling | null>(null);
  const [gesture, setGesture] = useState<Gesture>('rest');
  const [point, setPoint] = useState(0);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [riding, setRiding] = useState(false);
  const [runView, setRunView] = useState<RunView | null>(null);

  // Mirrors of state for event handlers and the animation loop.
  const live = useRef({ path, bubble, phase, mobile, base, ready, hovering: false });
  live.current = { ...live.current, path, bubble, phase, mobile, base, ready };
  const mode = useRef<'follow' | 'drag' | 'free'>('follow');
  const run = useRef<Run | null>(null);
  const focus = useRef<Element | null>(null); // what the buddy is presenting
  const aim = useRef<'focus' | 'bubble' | null>(null); // what its hand points at
  const dimUntil = useRef(0);
  const pending = useRef<Pending | null>(null);
  const timers = useRef<Record<string, number>>({});
  const bag = useRef<{ path: string; tips: Tip[]; i: number; last?: string }>({ path: '', tips: [], i: 0 });
  const once = useRef(new Set<string>());
  const firstPath = useRef(true);

  const later = (key: string, fn: () => void, ms: number) => {
    window.clearTimeout(timers.current[key]);
    timers.current[key] = window.setTimeout(fn, ms);
  };
  const cancel = (...keys: string[]) => keys.forEach(k => window.clearTimeout(timers.current[k]));

  /* ── feelings & speech ─────────────────────────────── */

  const flash = (f: Feeling, ms: number) => {
    setFlashF(f);
    later('flash', () => setFlashF(null), ms);
  };

  const pose = (g: Gesture, angle = 0, ms = 0) => {
    if (aim.current) aim.current = null;
    setGesture(g);
    setPoint(angle);
    if (ms) later('pose', () => setGesture('rest'), ms);
    else cancel('pose');
  };

  const say = (text: string, opts: { actions?: BuddyAction[]; ms?: number; sticky?: boolean } = {}) => {
    if (live.current.phase !== 'live') return;
    setBubble({ text, actions: opts.actions?.length ? opts.actions : undefined });
    flash('talking', Math.min(3200, 900 + text.length * 28));
    // Point at the bubble's buttons, unless presenting something on the page.
    if (opts.actions?.length && !focus.current) {
      cancel('pose');
      aim.current = 'bubble';
      setGesture('point');
    }
    if (opts.sticky) cancel('bubble');
    else later('bubble', () => !live.current.hovering && setBubble(null), opts.ms ?? 5000);
  };

  useEffect(() => {
    if (!bubble && aim.current === 'bubble') {
      aim.current = null;
      setGesture('rest');
    }
  }, [bubble]);

  const scrollToEl = (el: Element) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // Centre it if it fits, otherwise show its top part.
    const offset = r.height < vh * 0.7 ? -(vh - r.height) / 2 : -vh * 0.12;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset, duration: 1.1 });
    else window.scrollTo({ top: window.scrollY + r.top + offset, behavior: 'smooth' });
  };

  /* ── presenting a part of the page ─────────────────── */

  const present = (el: Element) => {
    focus.current = el;
    cancel('pose');
    aim.current = 'focus';
    setGesture('point');
  };

  const clearFocus = () => {
    focus.current = null;
    dimUntil.current = 0;
    if (aim.current === 'focus') {
      aim.current = null;
      setGesture('rest');
    }
  };

  /* ── tours ─────────────────────────────────────────── */

  const view = (patch: Partial<RunView>) => setRunView(v => (v ? { ...v, ...patch } : v));

  const armTimer = (ms: number) => {
    const r = run.current;
    if (!r) return;
    r.shown = true;
    r.left = ms;
    r.since = performance.now();
    if (!r.paused && !r.held) later('step', nextStep, ms);
    setRunView(v => (v ? { ...v, ms, key: v.key + 1 } : v));
  };

  const showStep = () => {
    const r = run.current;
    if (!r) return;
    const s = r.steps[r.i];
    r.shown = false;
    const el = findEl(s.target, s.nth);
    if (!el) {
      say(s.text, { actions: s.actions, sticky: true });
      armTimer(stepTime(s));
      return;
    }
    present(el);
    scrollToEl(el);
    flash('excited', 900);
    later(
      'show',
      () => {
        if (run.current !== r) return;
        dimUntil.current = performance.now() + DIM_MS;
        say(s.text, { actions: s.actions, sticky: true });
        armTimer(stepTime(s));
      },
      1000,
    );
  };

  const travel = (to: string, p: Pending) => {
    pending.current = p;
    clearFocus();
    setBubble(null);
    setRiding(true);
    flash('excited', 1600);
    pose('cheer', 0, 1600);
    go(to);
  };

  const goStep = (i: number) => {
    const r = run.current;
    if (!r) return;
    cancel('step', 'show');
    if (i >= r.steps.length) {
      finishRun();
      return;
    }
    r.i = i;
    r.shown = false;
    view({ i, ms: 0 });
    clearFocus();
    setBubble(null);
    const s = r.steps[i];
    if (s.to !== live.current.path) travel(s.to, { to: s.to, run: true });
    else showStep();
  };

  function nextStep() {
    const r = run.current;
    if (r) goStep(r.i + 1);
  }

  const stopRun = () => {
    run.current = null;
    setRunView(null);
    cancel('step', 'show');
    clearFocus();
  };

  const startRun = (kind: RunKind, steps: Step[]) => {
    if (!steps.length) return;
    stopRun();
    run.current = { kind, steps, i: -1, shown: false, paused: false, held: false, left: 0, since: 0 };
    setRunView(kind === 'explain' ? null : { kind, i: 0, n: steps.length, paused: false, held: false, ms: 0, key: 0 });
    setBase('idle');
    goStep(0);
  };

  function finishRun() {
    const r = run.current;
    if (!r) return;
    stopRun();
    if (r.kind === 'explain') {
      later('bubble', () => !live.current.hovering && setBubble(null), 1500);
      return;
    }
    flash('proud', 2600);
    if (r.kind === 'site') {
      say(LINES.siteTourDone, { ms: 5000 });
      return;
    }
    const here = live.current.path;
    const next = suggestionsFor(here, seenList())
      .map(t => t.actions?.[0])
      .filter((a): a is BuddyAction => a?.kind === 'go' && a.to !== here)
      .slice(0, 2);
    say(LINES.pageTourDone, { actions: next, ms: 9000 });
  }

  const endRun = (quietly = false) => {
    if (!run.current) return;
    if (pending.current?.run) pending.current = null;
    stopRun();
    setBubble(null);
    if (!quietly) {
      flash('happy', 1200);
      say(LINES.later, { ms: 2200 });
    }
  };

  const pauseRun = (why?: string) => {
    const r = run.current;
    if (!r || r.paused || r.kind === 'explain') return;
    if (r.shown && !r.held) r.left -= performance.now() - r.since;
    r.paused = true;
    cancel('step', 'show');
    view({ paused: true });
    if (why) say(why, { sticky: true });
  };

  const resumeRun = () => {
    const r = run.current;
    if (!r || !r.paused) return;
    r.paused = false;
    view({ paused: false });
    const s = r.steps[r.i];
    if (!s || s.to !== live.current.path) {
      goStep(r.i);
      return;
    }
    if (!r.shown) {
      showStep();
      return;
    }
    // Bring the stop back into view and carry on where it left off.
    const el = findEl(s.target, s.nth);
    if (el) {
      present(el);
      scrollToEl(el);
      dimUntil.current = performance.now() + DIM_MS;
    }
    say(s.text, { actions: s.actions, sticky: true });
    r.left = Math.max(r.left, 2500);
    r.since = performance.now();
    if (!r.held) later('step', nextStep, r.left);
  };

  /** Hovering the buddy or its bubble holds the current stop, so there's time to read and click. */
  const holdRun = (on: boolean) => {
    const r = run.current;
    if (!r || r.held === on) return;
    r.held = on;
    if (!r.paused && r.shown) {
      if (on) {
        r.left -= performance.now() - r.since;
        cancel('step');
      } else {
        r.left = Math.max(r.left, 1200);
        r.since = performance.now();
        later('step', nextStep, r.left);
      }
    }
    view({ held: on });
  };

  /* ── suggestions ───────────────────────────────────── */

  /** Each hover or click shows the next suggestion from a shuffled pool for this page. */
  const nextTip = () => {
    const p = live.current.path;
    const b = bag.current;
    if (b.path !== p || b.i >= b.tips.length) {
      let tips = suggestionsFor(p, seenList());
      if (tips.length > 1 && tips[0].text === b.last) tips = [...tips.slice(1), tips[0]];
      bag.current = { path: p, tips, i: 0, last: b.last };
    }
    const tip = bag.current.tips[bag.current.i++];
    bag.current.last = tip.text;
    say(tip.text, { actions: tip.actions, ms: 7000 });
  };

  /** A few words about the page, a tour of it, and somewhere else worth going. Once per page per visit. */
  const introduce = (force: boolean) => {
    if (live.current.phase !== 'live' || run.current) return;
    const p = live.current.path;
    const done = readList(session.get('buddy:intros'));
    if (!force && done.includes(p)) return;
    session.set('buddy:intros', JSON.stringify([...new Set([...done, p])]));
    const tip = introFor(p, seenList());
    pose('wave', 0, 1600);
    say(tip.text, { actions: tip.actions, ms: 8000 });
  };

  const act = (a: BuddyAction) => {
    const here = live.current.path;
    const touring = !!run.current && run.current.kind !== 'explain';
    switch (a.kind) {
      case 'go':
        if (run.current) endRun(true);
        if (a.to === here) {
          if (a.target) startRun('explain', [stepAt(a.to, a.target, a.nth)]);
          else setBubble(null);
        } else travel(a.to, { to: a.to, target: a.target, nth: a.nth });
        return;
      case 'tour':
        startRun(a.tour, a.tour === 'site' ? SITE_TOUR : guideFor(here).tour);
        return;
      case 'link':
        window.open(a.href, '_blank', 'noopener,noreferrer');
        if (touring) pauseRun(LINES.watching);
        else setBubble(null);
        return;
      case 'play': {
        const el = findEl(a.target, a.nth);
        const frame = el?.closest('.video-frame') ?? el;
        if (!frame) return;
        if (a.fullscreen) frame.querySelector<HTMLButtonElement>('.video-fullscreen')?.click();
        else {
          const v = frame.querySelector('video');
          const sound = frame.querySelector<HTMLButtonElement>('.video-sound');
          if (v?.muted && sound) sound.click();
          else v?.play().catch(() => {});
        }
        if (touring) pauseRun(LINES.watching);
        else setBubble(null);
        return;
      }
      case 'close':
        setBubble(null);
        flash('happy', 900);
    }
  };

  // Latest versions of the handlers, for listeners set up once.
  const api = useRef({ endRun, pauseRun, holdRun, introduce, say, flash, startRun, showStep, clearFocus });
  api.current = { endRun, pauseRun, holdRun, introduce, say, flash, startRun, showStep, clearFocus };

  /* ── page changes: landing after the curtain ───────── */

  useEffect(() => {
    const seen = seenList();
    if (path.startsWith('/work/') && getProject(path.slice(6)) && !seen.includes(path.slice(6))) {
      store.set('buddy:seen', JSON.stringify([...seen, path.slice(6)]));
    }
    once.current.delete('papers');
    once.current.delete('film');
    once.current.delete('typing');
    const first = firstPath.current;
    firstPath.current = false;
    const p = pending.current;
    pending.current = null;
    // Went somewhere on their own in the middle of a tour: the tour is over.
    if (!p && run.current) api.current.endRun(true);
    return onReveal(() => {
      setRiding(false);
      if (p?.run) {
        if (run.current) later('land', () => api.current.showStep(), 450);
      } else if (p?.target) {
        const target = p.target;
        later('land', () => api.current.startRun('explain', [stepAt(p.to, target, p.nth)]), 450);
      } else if (p) {
        later('land', () => api.current.introduce(true), 500);
      } else if (!first) {
        later('intro', () => api.current.introduce(false), 1100);
      }
    });
  }, [path]);

  /* ── first appearance & greeting ───────────────────── */

  useEffect(
    () =>
      onReveal(() => {
        setReady(true);
        if (live.current.phase !== 'live') return;
        if (root.current) gsap.fromTo(root.current.querySelector('.buddy-figure'), { scale: 0 }, { scale: 1, duration: 0.7, ease: 'back.out(1.8)', delay: 0.3 });
        const greeted = session.get('buddy:greeted') === '1';
        session.set('buddy:greeted', '1');
        if (greeted) {
          later('intro', () => api.current.introduce(false), 1200);
          return;
        }
        const here = live.current.path;
        session.set('buddy:intros', JSON.stringify([here]));
        const visits = Number(store.get('buddy:visits') || '0');
        store.set('buddy:visits', String(visits + 1));
        later(
          'greet',
          () => {
            pose('wave', 0, 2200);
            if (visits === 0) {
              say(LINES.greet(hourInIndia(), BUDDY.name), { actions: [SITE_TOUR_ACTION, LATER], ms: 10000 });
              return;
            }
            const next = unseenProjects(seenList()).find(p => `/work/${p.slug}` !== here);
            if (next) say(LINES.unseen(next.title), { actions: [{ kind: 'go', label: `${next.title} →`, to: `/work/${next.slug}` }, SITE_TOUR_ACTION], ms: 9000 });
            else say(LINES.welcomeBack, { actions: [SITE_TOUR_ACTION, LATER], ms: 8000 });
          },
          1200,
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ── page events (bus) and page reactions ──────────── */

  useEffect(
    () =>
      buddy.on(e => {
        if (e.type === 'say') api.current.say(e.text, { actions: e.actions, ms: e.ms });
        else api.current.flash(e.feeling, e.ms);
      }),
    [],
  );

  useEffect(() => {
    let lastRow = 0;
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest || live.current.phase !== 'live' || run.current) return;
      // Papers get a cheer; the blog rows under Writings share the look but aren't papers.
      if (t.closest('.paper-row') && !t.closest('.writing-list') && !once.current.has('papers')) {
        once.current.add('papers');
        api.current.flash('excited', 1800);
        api.current.say(LINES.papers, { ms: 2200 });
      } else if (t.closest('.row-link, .table-row') && Date.now() - lastRow > 2500) {
        lastRow = Date.now();
        api.current.flash('happy', 900);
      }
    };
    const input = (e: Event) => {
      const t = e.target as Element | null;
      if (!t?.closest?.('.contact-form') || once.current.has('typing') || run.current) return;
      once.current.add('typing');
      api.current.flash('excited', 1400);
      api.current.say(LINES.typing, { ms: 2200 });
    };
    window.addEventListener('pointerover', over);
    window.addEventListener('input', input);
    return () => {
      window.removeEventListener('pointerover', over);
      window.removeEventListener('input', input);
    };
  }, []);

  // "Psst, it has sound" once the About film is on screen.
  useEffect(() => {
    if (path !== '/about') return;
    let io: IntersectionObserver | null = null;
    const off = onReveal(() => {
      const film = document.querySelector('.about-film');
      if (!film) return;
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || once.current.has('film') || run.current || live.current.bubble) return;
          once.current.add('film');
          api.current.say(LINES.film, { ms: 3500 });
          const frame = film.querySelector('.video-frame');
          if (frame && figure.current) pose('point', angleTo(figure.current.getBoundingClientRect(), visibleCentre(frame.getBoundingClientRect())), 3500);
        },
        { threshold: 0.5 },
      );
      io.observe(film);
    });
    return () => {
      off();
      io?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  /* ── the visitor scrolls during a tour: pause it (or drop a one-stop explanation) ── */

  useEffect(() => {
    let amount = 0;
    let since = 0;
    let lastY = 0;
    const nudge = (n: number) => {
      const r = run.current;
      if (!r || r.paused) return;
      const now = performance.now();
      if (now - since > 1200) {
        amount = 0;
        since = now;
      }
      amount += n;
      if (amount < 150) return;
      amount = 0;
      if (r.kind === 'explain') api.current.endRun(true);
      else api.current.pauseRun(LINES.paused);
    };
    const wheel = (e: WheelEvent) => nudge(Math.abs(e.deltaY));
    const touchStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0;
    };
    const touchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? lastY;
      nudge(Math.abs(y - lastY) * 3);
      lastY = y;
    };
    const keys = ['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', ' ', 'Home', 'End'];
    const key = (e: KeyboardEvent) => {
      const t = e.target as Element | null;
      if (keys.includes(e.key) && !t?.closest?.('input, textarea, select, button, [contenteditable], [role="slider"]')) nudge(200);
    };
    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchmove', touchMove, { passive: true });
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('keydown', key);
    };
  }, []);

  /* ── idle: sad, then asleep ────────────────────────── */

  useEffect(() => {
    let lastActive = Date.now();
    const wake = () => {
      lastActive = Date.now();
      if (live.current.base !== 'idle') {
        setBase('idle');
        api.current.flash('happy', 1300);
        setBubble(b => (b && b.text === LINES.bored ? null : b));
      }
    };
    const id = window.setInterval(() => {
      // Only count time the visitor can actually see the buddy, and never mid-tour.
      if (!live.current.ready || live.current.phase !== 'live' || run.current) {
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
        if (atBottom) api.current.say(LINES.boredBottom, { actions: [{ kind: 'tour', label: 'Show me around', tour: 'page' }], ms: 6000 });
        else {
          api.current.say(LINES.bored, { ms: 6000 });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── position: dock, follow, present, tilt, throw ──── */

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' });
    const tiltTo = tilt.current ? gsap.quickTo(tilt.current, 'rotation', { duration: 0.6, ease: 'power2.out' }) : null;
    const reduced = prefersReducedMotion();
    let footer: Element | null = null;
    let footerAt = '';
    let frame = 0;
    let lastTilt = 0;
    let lastX = 0;
    let lastY = 0;
    let lastAngle = 999;
    let lastMove = -1e9;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') lastMove = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    // Is the cursor really on the buddy, its bubble or its tour controls? (Not just
    // resting where the buddy happened to float by.)
    const pointerOnBuddy = () => {
      if (performance.now() - lastMove > 6000) return false;
      return [el, slot.current?.firstElementChild, el.querySelector('.buddy-tour')].some(node => {
        const r = node?.getBoundingClientRect();
        return !!r && pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
      });
    };

    const dock = () => {
      const m = live.current.mobile ? 14 : 26;
      let y = window.innerHeight - H - m - (run.current && run.current.kind !== 'explain' ? TOUR_BAR : 0);
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
    lastX = d0.x;
    lastY = d0.y;

    const tick = () => {
      frame++;
      const now = performance.now();
      let f = focus.current;
      if (f && !f.isConnected) {
        api.current.clearFocus(); // its page is gone
        f = null;
      }
      const fr = f?.getBoundingClientRect() ?? null;

      if (mode.current === 'follow') {
        const d = dock();
        let tx = d.x;
        let ty = d.y;
        if (fr) ({ x: tx, y: ty } = placeNear(fr, W, H, live.current.mobile));
        else if (!live.current.mobile && !reduced && !live.current.hovering && !live.current.bubble && !run.current) {
          tx += Math.max(-window.innerWidth * 0.18, Math.min(0, (pointer.x - (d.x + W / 2)) * 0.12));
          ty += Math.max(-window.innerHeight * 0.18, Math.min(0, (pointer.y - (d.y + H / 2)) * 0.12));
        }
        xTo(tx);
        yTo(ty);
      }

      const x = Number(gsap.getProperty(el, 'x'));
      const y = Number(gsap.getProperty(el, 'y'));
      const vx = x - lastX;
      const moving = Math.hypot(vx, y - lastY) > 1.4;
      lastX = x;
      lastY = y;
      el.classList.toggle('is-moving', moving && mode.current === 'follow');
      if (moving && tiltTo && !reduced && mode.current === 'follow') {
        tiltTo(clamp(vx * 1.3, -12, 12));
        lastTilt = now;
      }

      // Keep the bubble on screen: open to the right near the left edge, and below near
      // the top (or under the menu button in the top-right corner).
      if (slot.current) {
        const vw = window.innerWidth;
        const top = y - slot.current.offsetHeight;
        el.classList.toggle('bubble-start', x + W / 2 < Math.min(330, vw * 0.45));
        el.classList.toggle('bubble-below', top < 18 || (x + W > vw - 160 && top < 130));
      }

      // Eyes follow the cursor, or what it is presenting.
      if (frame % 3 === 0) {
        const target = fr ? visibleCentre(fr) : pointer;
        const nx = clamp((target.x - (x + W / 2)) / 320, -1, 1);
        const ny = clamp((target.y - (y + H / 2)) / 320, -1, 1);
        setLook(l => (Math.abs(l.x - nx) > 0.06 || Math.abs(l.y - ny) > 0.06 ? { x: nx, y: ny } : l));
      }

      // Point with a hand at what it is presenting (or at its bubble's buttons).
      if (frame % 5 === 0 && aim.current && figure.current) {
        let target: { x: number; y: number } | null = null;
        if (aim.current === 'focus' && fr) target = visibleCentre(fr);
        else if (aim.current === 'bubble') {
          const b = slot.current?.firstElementChild?.getBoundingClientRect();
          if (b) target = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
        }
        if (target) {
          const a = angleTo(figure.current.getBoundingClientRect(), target);
          if (Math.abs(a - lastAngle) > 5) {
            lastAngle = a;
            setPoint(a);
          }
        }
      }

      // Spotlight: a ring around the stop, with the rest of the page dimmed for a moment.
      const s = spot.current;
      if (s) {
        if (fr) {
          const pad = 12;
          s.style.transform = `translate(${fr.left - pad}px, ${fr.top - pad}px)`;
          s.style.width = `${fr.width + pad * 2}px`;
          s.style.height = `${fr.height + pad * 2}px`;
          s.classList.add('is-on');
          s.classList.toggle('is-dim', now < dimUntil.current);
        } else if (s.classList.contains('is-on')) s.classList.remove('is-on', 'is-dim');
      }

      // Hovering the buddy during a tour holds the current stop.
      if (run.current && frame % 6 === 0) api.current.holdRun(pointerOnBuddy());

      if (tiltTo && now - lastTilt > 180) tiltTo(0);
    };
    gsap.ticker.add(tick);

    // Lean into the scroll; very fast scrolling makes it dizzy (not when the tour scrolls).
    const lenis = getLenis();
    let lastDizzy = 0;
    const offScroll = lenis?.on('scroll', ({ velocity }: { velocity: number }) => {
      if (!tiltTo || reduced || focus.current || run.current) return;
      lastTilt = performance.now();
      tiltTo(clamp(-velocity * 0.5, -12, 12));
      if (Math.abs(velocity) > 85 && performance.now() - lastDizzy > 5000 && live.current.phase === 'live') {
        lastDizzy = performance.now();
        api.current.flash('dizzy', 1800);
        api.current.say(LINES.dizzy, { ms: 1800 });
      }
    });

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onMove);
      offScroll?.();
    };
  }, [W, H]);

  /* ── pointer play: drag & throw, rub, clicks ───────── */

  const drag = useRef({ down: false, moved: false, ox: 0, oy: 0, sx: 0, sy: 0, hist: [] as { x: number; y: number; t: number }[], flips: 0, lastDx: 0 });
  const justDragged = useRef(false);
  const rub = useRef({ flips: 0, lastDx: 0, since: 0, cool: 0 });
  const clicks = useRef<number[]>([]);

  const onPointerDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (live.current.mobile || prefersReducedMotion() || e.button !== 0 || run.current || focus.current) return;
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
    if (r.flips >= 6 && now > r.cool && !run.current) {
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
        x = clamp(x, 0, maxX);
        vx = -vx * 0.62;
      }
      if (y < 0 || y > maxY) {
        y = clamp(y, 0, maxY);
        vy = -vy * 0.62;
        vx *= 0.9;
      }
      gsap.set(el, { x, y });
      if (Math.hypot(vx, vy) < 0.8 && y >= maxY - 1) {
        gsap.ticker.remove(step);
        later('home', () => (mode.current = 'follow'), 700);
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

  /** Click: during a tour, pause or carry on; otherwise show the next suggestion. */
  const onClick = () => {
    if (justDragged.current || live.current.phase !== 'live') return;
    const now = Date.now();
    clicks.current = [...clicks.current.filter(t => now - t < 2500), now];
    const n = clicks.current.length;
    if (n >= 7) {
      clicks.current = [];
      pixelEgg();
      return;
    }
    if (n === 5) {
      flash('dizzy', 1200);
      say(LINES.poke, { ms: 1600 });
      return;
    }
    const r = run.current;
    if (r && r.kind !== 'explain') {
      if (r.paused) resumeRun();
      else pauseRun(LINES.paused);
      return;
    }
    if (r) endRun(true);
    nextTip();
  };

  /* ── close (blow away like dust) and bring back ────── */

  const close = async () => {
    if (live.current.phase !== 'live') return;
    endRun(true);
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
    later(
      'back',
      () => {
        setFlashF(null);
        pose('rest');
      },
      1800,
    );
    say(LINES.back, { ms: 2400 });
  };

  // Esc ends a tour, or closes the bubble.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (run.current) api.current.endRun(run.current.kind === 'explain');
      else setBubble(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => () => Object.values(timers.current).forEach(t => window.clearTimeout(t)), []);

  const feeling = flashF ?? base;
  const hidden = phase === 'gone' || phase === 'arriving';
  const touring = runView && runView.kind !== 'explain' ? runView : null;

  return (
    <>
      <PixelFilters />
      <div className="buddy-spot" ref={spot} aria-hidden="true" />
      <div
        ref={root}
        className={`buddy${ready ? ' is-ready' : ''}${riding ? ' is-riding' : ''}${hidden ? ' is-hidden' : ''}${phase === 'leaving' ? ' is-leaving' : ''}${mobile ? ' is-mobile' : ''}${touring ? ' has-tour' : ''}`}
        style={{ width: W, height: H }}
        onPointerEnter={e => {
          if (e.pointerType !== 'mouse') return;
          live.current.hovering = true;
          cancel('bubble');
          if (!run.current && !live.current.bubble && phase === 'live' && mode.current === 'follow') nextTip();
        }}
        onPointerLeave={e => {
          if (e.pointerType !== 'mouse') return;
          live.current.hovering = false;
          if (!run.current) later('bubble', () => setBubble(null), 1400);
        }}
      >
        <div className="buddy-bubble-slot" ref={slot} aria-live="polite">
          {bubble && phase === 'live' && (
            <div className="buddy-bubble" key={bubble.text}>
              <p>{bubble.text}</p>
              {bubble.actions && (
                <div className="buddy-bubble-actions">
                  {bubble.actions.map(a => (
                    <button key={a.label} className={`buddy-bubble-action${a.kind === 'close' ? ' is-quiet' : ''}`} onClick={() => act(a)}>
                      {a.label}
                    </button>
                  ))}
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
          aria-label={`${BUDDY.name}, your guide to this site. ${touring ? (touring.paused ? 'Click to carry on the tour.' : 'Click to pause the tour.') : 'Click for a suggestion.'}`}
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
        {touring && (
          <div className={`buddy-tour${touring.paused ? ' is-paused' : ''}${touring.held ? ' is-held' : ''}`} role="group" aria-label="Tour">
            <span className="buddy-tour-track" aria-hidden="true">
              {touring.ms > 0 && <span key={touring.key} className="buddy-tour-fill" style={{ animationDuration: `${touring.ms}ms` }} />}
            </span>
            <button className="buddy-tour-btn" onClick={() => (touring.paused ? resumeRun() : pauseRun(LINES.paused))} aria-label={touring.paused ? 'Carry on the tour' : 'Pause the tour'}>
              <PauseIcon paused={touring.paused} />
            </button>
            <span className="buddy-tour-count" aria-label={`Stop ${touring.i + 1} of ${touring.n}`}>
              {touring.i + 1}/{touring.n}
            </span>
            <button className="buddy-tour-btn" onClick={nextStep} aria-label="Next stop">
              <NextIcon />
            </button>
            <button className="buddy-tour-end" onClick={() => endRun()}>
              End tour
            </button>
          </div>
        )}
      </div>
      {phase === 'gone' && ready && (
        <button className={`buddy-dot${mobile ? ' is-mobile' : ''}`} onClick={bringBack} aria-label={`Bring ${BUDDY.name} back`} data-label={`Bring ${BUDDY.name} back`}>
          {BUDDY.character === 'nimbus' ? (
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9 24h14.5a5.5 5.5 0 0 0 .9-10.9A7.5 7.5 0 0 0 10 12.4 5.8 5.8 0 0 0 9 24Z" fill="#f3eefe" stroke="#c9b8f3" strokeWidth="1.4" />
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
