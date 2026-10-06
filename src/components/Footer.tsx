import { useRef } from 'react';
import { SITE } from '@/data/site';
import { gsap, useGsap } from '@/lib/motion';
import { useLocalTime } from '@/lib/useLocalTime';
import Button from './Button';
import { ArrowIcon } from './Icons';
import '@/styles/footer.css';

export function FooterBottom() {
  const time = useLocalTime(SITE.location.timeZone);
  return (
    <div className="footer-bottom">
      <div className="meta">
        <div>
          <h5>Version</h5>
          <p>{SITE.version}</p>
        </div>
        <div>
          <h5>Local time</h5>
          <p>
            {time} {SITE.location.tzLabel}
          </p>
        </div>
      </div>
      <div className="socials">
        <h5>Socials</h5>
        <ul>
          {SITE.socials.map(s => (
            <li key={s.href}>
              <a className="link-line" href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Dark closing section on every page. `curve` is the colour of the section
 * above it, which bulges into the footer and flattens as you scroll.
 */
export default function Footer({ curve = '#ffffff' }: { curve?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGsap(
    () => {
      gsap.fromTo(
        '.footer-curve',
        { height: '10vh' },
        {
          height: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 25%', scrub: true },
        },
      );
      gsap.fromTo(
        '.footer',
        { yPercent: -25 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
        },
      );
      gsap.fromTo(
        '.footer-title .arrow',
        { rotate: 0 },
        {
          rotate: 90,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
        },
      );
    },
    root,
  );

  return (
    <div className="footer-wrap theme-dark" ref={root} style={{ ['--curve-color' as string]: curve }}>
      <div className="footer-curve">
        <div className="shape" />
      </div>
      <footer className="footer">
        <div className="container medium">
          <div className="footer-title">
            <h2>
              <span className="avatar">
                <img src={SITE.photos.avatar} alt="" loading="lazy" />
              </span>
              Let’s build
              <br />
              together
            </h2>
            <ArrowIcon className="arrow" rotate={90} />
          </div>
          <div className="footer-line">
            <div className="stripe" />
            <Button variant="round" blue to="/contact" strength={80}>
              Get in touch
            </Button>
          </div>
          <div className="footer-contacts">
            <Button href={`mailto:${SITE.email}`}>{SITE.email}</Button>
            <Button href={SITE.phoneHref}>{SITE.phone}</Button>
          </div>
        </div>
        <FooterBottom />
      </footer>
    </div>
  );
}
