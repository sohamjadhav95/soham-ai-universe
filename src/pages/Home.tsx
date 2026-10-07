import { useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import SplitWords from '@/components/SplitWords';
import HoverPreview from '@/components/HoverPreview';
import ProjectVisual from '@/components/ProjectVisual';
import ProjectCard from '@/components/ProjectCard';
import { ArrowIcon, Globe } from '@/components/Icons';
import { SITE } from '@/data/site';
import { PROJECTS } from '@/data/projects';
import { TLink } from '@/lib/transition';
import { gsap, ScrollTrigger, useGsap, prefersReducedMotion } from '@/lib/motion';
import { useEntrance, useTitle } from '@/lib/useEntrance';
import { useIsMobile } from '@/lib/useIsMobile';
import '@/styles/home.css';
import '@/styles/work-list.css';
import '@/styles/globe.css';

const FEATURED = PROJECTS.filter(p => p.featured);

function Hero() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGsap(
    () => {
      // Endless name slider; scrolling down pushes it left, scrolling up pulls it right.
      let x = 0;
      let dir = -1;
      const tick = () => {
        x += 0.035 * dir;
        if (x <= -50) x = 0;
        if (x > 0) x = -50;
        gsap.set(track.current, { xPercent: x });
      };
      if (!prefersReducedMotion()) gsap.ticker.add(tick);

      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: 'max',
        onUpdate: self => {
          dir = self.direction === 1 ? -1 : 1;
        },
      });

      const scrub = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-name', { x: '-10vw', ease: 'none', scrollTrigger: scrub });
      gsap.to('.hero-photo', { yPercent: 12, ease: 'none', scrollTrigger: scrub });
      gsap.to('.hero-role .arrow', { rotate: 90, ease: 'none', scrollTrigger: scrub });

      return () => gsap.ticker.remove(tick);
    },
    root,
  );

  const name = (
    <h1>
      {SITE.name}
      <span className="spacer">—</span>
    </h1>
  );

  return (
    <header className="home-hero" ref={root}>
      <div className="hero-photo once-in">
        <img src={SITE.photos.hero} alt={`Portrait of ${SITE.name}`} fetchpriority="high" />
      </div>
      <Header light />
      <div className="hero-hanger once-in">
        <p>
          {SITE.location.badge.map(w => (
            <span key={w}>{w}</span>
          ))}
        </p>
        <span className="ball">
          <Globe />
        </span>
      </div>
      <div className="hero-role once-in">
        <ArrowIcon className="arrow" rotate={0} />
        <h4>
          <span>{SITE.roleTop}</span>
          <span>{SITE.roleMain}</span>
        </h4>
      </div>
      <div className="hero-name once-in" aria-hidden="true">
        <div className="name-track" ref={track}>
          {name}
          {name}
        </div>
      </div>
    </header>
  );
}

function RecentWork() {
  const [active, setActive] = useState<number | null>(null);
  const mobile = useIsMobile();

  return (
    <section className="home-work">
      <h5>Recent work</h5>
      {mobile ? (
        <div className="project-grid">
          {FEATURED.map(p => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      ) : (
        <>
          <ul className="work-rows" onPointerLeave={() => setActive(null)}>
            {FEATURED.map((p, i) => (
              <li key={p.slug} onPointerEnter={() => setActive(i)}>
                <TLink to={`/work/${p.slug}`} className="row-link">
                  <h3>{p.title}</h3>
                  <p>{p.services}</p>
                </TLink>
              </li>
            ))}
          </ul>
          <HoverPreview
            active={active}
            slides={FEATURED.map(p => ({ key: p.slug, bg: p.tone.bg, content: <ProjectVisual project={p} /> }))}
          />
        </>
      )}
    </section>
  );
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  useTitle(`${SITE.name} • ${SITE.roleTop} ${SITE.roleMain}`);
  useEntrance(root);

  return (
    <div className="page" ref={root}>
      <Hero />
      <section className="home-intro">
        <div className="container medium">
          <div className="row">
            <div className="statement">
              <SplitWords text="Turning research into AI that works in the real world. From sub-pixel medical imaging to multimodal moderation, I build models that get the details right." />
            </div>
            <div className="aside">
              <p>
                I find the quiet error hiding in a pipeline, prove it, and ship the fix, from the first experiment to the
                published paper.
              </p>
              <Button variant="round" to="/about" strength={70}>
                About me
              </Button>
            </div>
          </div>
        </div>
      </section>
      <RecentWork />
      <div className="home-more">
        <Button to="/work" count={PROJECTS.length}>
          More work
        </Button>
      </div>
      <Footer />
    </div>
  );
}
