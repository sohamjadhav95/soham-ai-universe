import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger } from '@/lib/motion';
import { useSite, TLink } from '@/lib/transition';
import { lockScroll } from '@/lib/scroll';
import { NAV, SITE } from '@/data/site';
import Button from './Button';
import '@/styles/menu.css';

/** Fixed round menu button (appears after scrolling) and the curved side panel it opens. */
export default function Menu() {
  const { menuOpen, setMenuOpen } = useSite();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const curve = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const links = useRef<HTMLUListElement>(null);
  const tl = useRef<gsap.core.Timeline>();

  // Show the round button once the top bar is out of view.
  useEffect(() => {
    const threshold = () => Math.min(window.innerHeight * 0.12, 120);
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: self => setVisible(self.scroll() > threshold()),
    });
    setVisible(st.scroll() > threshold());
    return () => st.kill();
  }, [pathname]);

  useEffect(() => {
    tl.current = gsap
      .timeline({ paused: true, defaults: { ease: 'site-ease' } })
      .to(backdrop.current, { opacity: 0.35, duration: 0.8 }, 0)
      .to(panel.current, { x: 0, duration: 0.8, ease: 'power4.inOut' }, 0)
      .fromTo(curve.current, { scaleX: 1 }, { scaleX: 0, duration: 0.8, ease: 'power3.inOut' }, 0)
      .from(links.current?.querySelectorAll('a') ?? [], { x: 80, duration: 0.8, stagger: 0.05 }, 0.08);
    return () => {
      tl.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (!tl.current) return;
    if (menuOpen) tl.current.timeScale(1).play();
    else tl.current.timeScale(1.4).reverse();
    lockScroll(menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, setMenuOpen]);

  return (
    <>
      <Button
        variant="round"
        className={`menu-btn${visible ? ' is-visible' : ''}${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        label={menuOpen ? 'Close menu' : 'Open menu'}
        strength={40}
      >
        <span className="menu-bars" />
      </Button>

      <div className={`side-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="side-menu-backdrop" ref={backdrop} onClick={() => setMenuOpen(false)} />
        <div className="side-menu-panel" ref={panel} role="dialog" aria-label="Menu">
          <div className="side-menu-curve" ref={curve}>
            <div className="shape" />
          </div>
          <div className="side-menu-inner">
            <div>
              <h5>Navigation</h5>
              <div className="stripe" />
              <ul className="side-menu-links" ref={links}>
                {NAV.map(n => {
                  const active = n.to === '/' ? pathname === '/' : pathname.startsWith(n.to);
                  return (
                    <li key={n.to}>
                      <TLink to={n.to} className={active ? 'is-active' : ''} tabIndex={menuOpen ? 0 : -1}>
                        {n.label}
                      </TLink>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="side-menu-socials">
              <h5>Socials</h5>
              <ul>
                {SITE.socials.map(s => (
                  <li key={s.href}>
                    <a className="link-line" href={s.href} target="_blank" rel="noopener noreferrer" tabIndex={menuOpen ? 0 : -1}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
