import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { gsap, EASE, prefersReducedMotion } from './motion';
import { emitReveal, markCovered } from './reveal';
import { getLenis, lockScroll, resetScroll } from './scroll';
import { getProject } from '@/data/projects';
import '@/styles/curtain.css';

type Ctx = {
  go: (to: string) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  /** The location currently on screen. Lags the URL while the curtain is covering. */
  shown: Location | null;
};

const TransitionContext = createContext<Ctx>({ go: () => {}, menuOpen: false, setMenuOpen: () => {}, shown: null });

export const useSite = () => useContext(TransitionContext);

/** Location of the page on screen; use this instead of `useLocation` for rendering. */
export function useShownLocation() {
  const real = useLocation();
  return useContext(TransitionContext).shown ?? real;
}

export function labelFor(path: string) {
  if (path === '/') return 'Home';
  if (path.startsWith('/work/')) return getProject(path.slice(6))?.title ?? 'Work';
  const name = path.replace(/^\//, '');
  return name ? name[0].toUpperCase() + name.slice(1) : 'Home';
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [shown, setShown] = useState<Location>(location);
  const shownRef = useRef<Location>(location);
  const latest = useRef<Location>(location);
  latest.current = location;
  const busy = useRef(false);
  const ours = useRef(false);
  const syncRef = useRef<() => void>(() => {});
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);

  // We restore scroll ourselves; the browser's own restore would jump the old page before the curtain covers it.
  useEffect(() => {
    if (!('scrollRestoration' in history)) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  /** Swap the page on screen (called while the curtain is covering). */
  const show = useCallback((loc: Location) => {
    shownRef.current = loc;
    setShown(loc);
    resetScroll();
  }, []);

  /** The curtain: cover, run `onCovered` (swap the page), then lift and reveal. */
  const play = useCallback((nextLabel: string, onCovered: () => void) => {
    busy.current = true;
    setLabel(nextLabel);
    lockScroll(true);
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.set(root.current, { className: 'curtain is-active' })
      .set(panel.current, { yPercent: 100 })
      .set(top.current, { height: '10vh' })
      .set(bottom.current, { height: 0 })
      .set(text.current, { opacity: 0, y: 30 })
      .to(panel.current, { yPercent: 0, duration: 0.6 }, 0)
      .to(top.current, { height: 0, duration: 0.6 }, 0)
      .to(text.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.25)
      .add(() => {
        markCovered();
        onCovered();
      })
      .set(bottom.current, { height: '10vh' }, '+=0.3')
      .add(() => {
        lockScroll(false);
        emitReveal();
      })
      .to(text.current, { opacity: 0, y: -40, duration: 0.35, ease: 'power2.in' })
      .to(panel.current, { yPercent: -100, duration: 0.8 }, '<')
      .to(bottom.current, { height: '2vh', duration: 0.8 }, '<')
      .set(root.current, { className: 'curtain' })
      .add(() => {
        busy.current = false;
        // Back/forward pressed mid-transition: catch up to wherever the URL is now.
        syncRef.current();
      });
  }, []);

  // Bring the screen in line with the URL after a browser back/forward.
  syncRef.current = () => {
    if (latest.current.key === shownRef.current.key) return;
    setMenuOpen(false);
    if (prefersReducedMotion()) {
      show(latest.current);
      return;
    }
    play(labelFor(latest.current.pathname), () => show(latest.current));
  };

  const go = useCallback(
    (to: string) => {
      if (busy.current) return;
      setMenuOpen(false);
      if (to === shownRef.current.pathname) {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (prefersReducedMotion()) {
        ours.current = true;
        navigate(to);
        return;
      }
      play(labelFor(to), () => {
        ours.current = true;
        navigate(to);
      });
    },
    [navigate, play],
  );

  // Clicks navigate under the curtain, so show them at once. Back/forward
  // (and any other URL change) plays the same curtain before swapping the page.
  useLayoutEffect(() => {
    if (location.key === shownRef.current.key) return;
    if (ours.current) {
      ours.current = false;
      show(location);
      return;
    }
    if (!busy.current) syncRef.current();
  }, [location, show]);

  return (
    <TransitionContext.Provider value={{ go, menuOpen, setMenuOpen, shown }}>
      {children}
      <div className="curtain" ref={root} aria-hidden="true">
        <div className="curtain-panel" ref={panel}>
          <div className="curtain-curve top" ref={top}>
            <div className="shape" />
          </div>
          <div className="curtain-label" ref={text}>
            <span className="dot" />
            <span>{label}</span>
          </div>
          <div className="curtain-curve bottom" ref={bottom}>
            <div className="shape" />
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

type TLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

/** Internal link that plays the page-transition curtain before navigating. */
export const TLink = forwardRef<HTMLAnchorElement, TLinkProps>(function TLink({ to, onClick, children, ...rest }, ref) {
  const { go } = useSite();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    go(to);
  };
  return (
    <a href={to} onClick={handle} ref={ref} {...rest}>
      {children}
    </a>
  );
});
