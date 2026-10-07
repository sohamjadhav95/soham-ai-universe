import { useRef } from 'react';
import { NAV, SITE } from '@/data/site';
import { TLink, useShownLocation, useSite } from '@/lib/transition';
import { useMagnetic } from '@/lib/useMagnetic';
import '@/styles/header.css';

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref, undefined, 18);
  return (
    <TLink to={to} ref={ref} className={`link-dot${active ? ' is-active' : ''}`}>
      {label}
    </TLink>
  );
}

/** Top bar: logo on the left, page links on the right. `light` = white text. */
export default function Header({ light = false }: { light?: boolean }) {
  const { pathname } = useShownLocation();
  const { setMenuOpen } = useSite();
  const logo = useRef<HTMLAnchorElement>(null);
  useMagnetic(logo, undefined, 18);

  return (
    <header className={`nav-bar once-in${light ? ' is-light' : ''}`}>
      <TLink to="/" className="nav-logo" ref={logo} aria-label={`${SITE.name}, home`}>
        <span className="copyright">©</span>
        <span className="roll">
          <span className="roll-inner">
            <span>{SITE.name}</span>
            <span>{`${SITE.roleTop} ${SITE.roleMain.split(' ')[0]}`}</span>
          </span>
        </span>
      </TLink>
      <nav aria-label="Main">
        <ul className="nav-links">
          {NAV.filter(n => n.to !== '/').map(n => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                label={n.label}
                active={n.to === '/work' ? pathname.startsWith('/work') : pathname === n.to}
              />
            </li>
          ))}
        </ul>
      </nav>
      <button className="nav-menu-text link-dot" onClick={() => setMenuOpen(true)}>
        Menu
      </button>
    </header>
  );
}
