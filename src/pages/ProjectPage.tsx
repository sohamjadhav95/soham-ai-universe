import { useRef, type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Button from '@/components/Button';
import SplitWords from '@/components/SplitWords';
import ProjectVisual from '@/components/ProjectVisual';
import { FooterBottom } from '@/components/Footer';
import { getProject, nextProject } from '@/data/projects';
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
  return <Case key={slug} slug={slug} />;
}

function Case({ slug }: { slug: string }) {
  const p = getProject(slug)!;
  const next = nextProject(slug);
  const root = useRef<HTMLDivElement>(null);
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

      <section className="case-hero container once-in">
        <div className="frame" style={{ background: p.tone.bg }}>
          <ProjectVisual project={p} />
        </div>
        {primary && (
          <Button variant="round" blue href={primary.href} strength={90}>
            {primary.label} ↗
          </Button>
        )}
      </section>

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
              <li className={`flow-step${i === p.flow!.steps.length - 1 ? ' is-accent' : ''}`} key={s.label}>
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

      <section className="next-case">
        <TLink to={`/work/${next.slug}`} className="link">
          <p>Next project</p>
          <h1 className="big">{next.title}</h1>
          <div className="thumb">
            <ProjectVisual project={next} />
          </div>
        </TLink>
        <div className="container medium">
          <div className="stripe" />
        </div>
        <div className="all">
          <Button to="/work">
            All work
          </Button>
        </div>
        <FooterBottom />
      </section>
    </div>
  );
}
