import { useRef, useState, type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Button from '@/components/Button';
import SplitWords from '@/components/SplitWords';
import ProjectVisual from '@/components/ProjectVisual';
import FollowBall from '@/components/FollowBall';
import VideoPlayer from '@/components/VideoPlayer';
import DeviceIframe from '@/components/DeviceIframe';
import { FooterBottom } from '@/components/Footer';
import { getProject, nextProject, PROJECTS, type Project } from '@/data/projects';
import { SITE } from '@/data/site';
import { TLink } from '@/lib/transition';
import { gsap, useGsap } from '@/lib/motion';
import { useEntrance, useTitle } from '@/lib/useEntrance';
import NotFound from './NotFound';
import '@/styles/footer.css';
import '@/styles/project.css';

export default function ProjectPage() {
  const { slug = '' } = useParams();
  const project = getProject(slug);
  if (!project) return <NotFound />;
  return <Case key={slug} p={project} />;
}

function Case({ p }: { p: Project }) {
  const next = nextProject(p.slug);
  const root = useRef<HTMLDivElement>(null);
  const [overNext, setOverNext] = useState(false);
  useTitle(`${p.title} • ${SITE.name}`);
  useEntrance(root);

  useGsap(
    () => {
      gsap.fromTo(
        '.case-hero .project-visual',
        { yPercent: -6 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.case-hero', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
      gsap.fromTo(
        '.case-hero .btn-wrapper',
        { yPercent: -50, y: 120 },
        {
          yPercent: -50,
          y: -120,
          ease: 'none',
          scrollTrigger: { trigger: '.case-hero', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
      gsap.fromTo(
        '.next-case-curve',
        { height: '10vh' },
        {
          height: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.next-case', start: 'top bottom', end: 'top 25%', scrub: true },
        },
      );
      gsap.fromTo(
        '.next-case-inner',
        { yPercent: -25 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.next-case', start: 'top bottom', end: 'bottom bottom', scrub: true },
        },
      );
    },
    root,
  );

  const primary = p.links[0];

  return (
    <div className="page" ref={root}>
      <Header />
      <section className="page-header container medium">
        <SplitWords as="h1" className="big" trigger="reveal" text={p.title} />
        <p className="case-summary once-in">{p.summary}</p>
      </section>

      <section className="case-intro container medium once-in">
        <div className="cols">
          <div>
            <h5>Role</h5>
            <div className="stripe" />
            <p>{p.intro.role}</p>
          </div>
          <div>
            <h5>Stack</h5>
            <div className="stripe" />
            <p>{p.intro.stack}</p>
          </div>
          <div>
            <h5>Context & year</h5>
            <div className="stripe" />
            <p>
              {p.intro.context}
              <br />
              {p.year}
            </p>
          </div>
        </div>
      </section>

      <section className="case-hero container">
        <div className="frame once-in" style={{ background: p.tone.bg }}>
          <ProjectVisual project={p} />
        </div>
        {primary && (
          <div className="btn-wrapper once-in">
            <Button variant="round" blue href={primary.href} strength={90}>
              {primary.label} ↗
            </Button>
          </div>
        )}
      </section>

      {(p.videos || (p.video ? [p.video] : [])).map((v, i) => {
        const isFirst = i === 0;
        return (
          <section key={i} className={`case-device${!isFirst ? ' container medium' : ''}`}>
            {v.title && <h5 style={{ marginBottom: '1.5em' }}>{v.title}</h5>}
            <div className="video-block" style={{
              background: v.bg || 'transparent',
              borderRadius: !isFirst ? 'clamp(12px, 2vw, 24px)' : undefined,
              overflow: !isFirst ? 'hidden' : undefined
            }}>
              <VideoPlayer
                src={v.src}
                webm={v.webm}
                poster={v.poster}
                title={`${p.title} demo ${i + 1}`}
                sound={v.sound}
                speedup={v.speedup}
                crop={v.crop}
              />
            </div>
          </section>
        );
      })}

      {p.iframe && (
        <section className="case-device">
          <DeviceIframe src={p.iframe.src} title={`${p.title} demo`} bg={p.iframe.bg} />
        </section>
      )}

      {p.highlights && (
        <section
          className="case-highlights container medium"
          style={{ '--n': p.highlights.length } as CSSProperties}
        >
          {p.highlights.map(h => (
            <div key={h.label}>
              <p className="value">{h.value}</p>
              <div className="stripe" />
              <p>{h.label}</p>
            </div>
          ))}
        </section>
      )}

      <section className="container medium">
        {p.sections.map(s => (
          <div className="case-section" key={s.heading}>
            <h4>{s.heading}</h4>
            <div className="body">
              {s.body.map((b, i) => (
                <p key={i}>{b}</p>
              ))}
            </div>
          </div>
        ))}
      </section>

      {p.flow && (
        <section className="case-flow container medium">
          <h5>{p.flow.title}</h5>
          <ol
            className={`flow-steps${p.flow.steps.length > 5 ? ' is-long' : ''}`}
            style={{ '--n': p.flow.steps.length } as CSSProperties}
          >
            {p.flow.steps.map((s, i) => (
              <li className={`flow-step${i === (p.flow?.steps.length ?? 0) - 1 ? ' is-accent' : ''}`} key={s.label}>
                <span className="nr">{String(i + 1).padStart(2, '0')}</span>
                <h4>{s.label}</h4>
                <p>{s.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {p.sample && (
        <section className="case-sample container medium">
          <h5>{p.sample.title}</h5>
          <pre>
            <code>{p.sample.code}</code>
          </pre>
        </section>
      )}

      {p.gallery && (
        <section className="case-gallery container">
          {p.gallery.map(g => (
            <figure key={g.src} style={{ background: p.tone.bg, color: p.tone.ink }}>
              <img src={g.src} alt={g.alt} loading="lazy" />
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </section>
      )}

      {(p.links.length > 0 || p.note) && (
        <section className="case-links container medium">
          {p.links.map(l => (
            <Button key={l.href} href={l.href}>
              {l.label} ↗
            </Button>
          ))}
          {p.note && <p className="note">{p.note}</p>}
        </section>
      )}

      <section className="next-case theme-dark footer-wrap" style={{ ['--curve-color' as string]: '#ffffff' }}>
        <div className="footer-curve next-case-curve">
          <div className="shape" />
        </div>
        <div className="next-case-inner">
          <TLink
            to={`/work/${next.slug}`}
            className="link"
            onPointerEnter={() => setOverNext(true)}
            onPointerLeave={() => setOverNext(false)}
            onClick={() => setOverNext(false)}
          >
            <p>Next case</p>
            <h2 className="next-case-title">{next.title}</h2>
            <div className="next-case-preview">
              <div className="thumb">
                <ProjectVisual project={next} />
              </div>
            </div>
          </TLink>
          <FollowBall active={overNext} label="Next case" />
          <div className="container medium">
            <div className="stripe" />
          </div>
          <div className="all">
            <Button to="/work" count={PROJECTS.length}>
              All work
            </Button>
          </div>
          <FooterBottom />
        </div>
      </section>
    </div>
  );
}
