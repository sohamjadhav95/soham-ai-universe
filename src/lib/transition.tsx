import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap, EASE, prefersReducedMotion } from './motion';
import { emitReveal, markCovered } from './reveal';
import { getLenis, lockScroll, resetScroll } from './scroll';
import { getProject } from '@/data/projects';
import '@/styles/curtain.css';

type Ctx = {
  go: (to: string) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

const TransitionContext = createContext<Ctx>({ go: () => {}, menuOpen: false, setMenuOpen: () => {} });

export const useSite = () => useContext(TransitionContext);

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
  const busy = useRef(false);
  const ours = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (to: string) => {
      if (busy.current) return;
      setMenuOpen(false);
      if (to === location.pathname) {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (prefersReducedMotion()) {
        ours.current = true;
        navigate(to);
        resetScroll();
        return;
      }

      busy.current = true;
      setLabel(labelFor(to));
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
          ours.current = true;
          navigate(to);
          resetScroll();
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
        });
    },
    [location.pathname, navigate],
  );

  // Back/forward buttons skip the curtain: just start at the top.
  useEffect(() => {
    if (ours.current) {
      ours.current = false;
      return;
    }
    resetScroll();
  }, [location.pathname]);

  return (
    <TransitionContext.Provider value={{ go, menuOpen, setMenuOpen }}>
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
