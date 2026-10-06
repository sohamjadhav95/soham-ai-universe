import { useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import SplitWords from '@/components/SplitWords';
import HoverPreview from '@/components/HoverPreview';
import ProjectVisual from '@/components/ProjectVisual';
import ProjectCard from '@/components/ProjectCard';
import { GridIcon, ListIcon } from '@/components/Icons';
import { PROJECTS, type Category } from '@/data/projects';
import { SITE } from '@/data/site';
import { TLink } from '@/lib/transition';
import { ScrollTrigger } from '@/lib/motion';
import { useEntrance, useTitle } from '@/lib/useEntrance';
import { useIsMobile } from '@/lib/useIsMobile';
import '@/styles/work-list.css';
import '@/styles/work.css';

const FILTERS: { key: 'all' | Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'research', label: 'Research' },
  { key: 'engineering', label: 'Engineering' },
];

export default function Work() {
  const root = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [switching, setSwitching] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const mobile = useIsMobile();
  useTitle(`Work • ${SITE.name}`);
  useEntrance(root);

  const shown = PROJECTS.filter(p => filter === 'all' || p.categories.includes(filter));
  const showGrid = view === 'grid' || mobile;

  // Fade out, swap content, fade back in.
  const change = (fn: () => void) => {
    setSwitching(true);
    setActive(null);
    window.setTimeout(() => {
      fn();
      setSwitching(false);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, 300);
  };

  return (
    <div className="page" ref={root}>
      <Header />
      <section className="page-header container medium">
        <SplitWords as="h1" trigger="reveal" text="Research turned into real products" />
      </section>

      <div className="work-filters once-in">
        <div className="group" role="group" aria-label="Filter projects">
          {FILTERS.map(f => (
            <Button
              key={f.key}
              active={filter === f.key}
              onClick={() => filter !== f.key && change(() => setFilter(f.key))}
              count={f.key === 'all' ? undefined : PROJECTS.filter(p => p.categories.includes(f.key as Category)).length}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="group toggles" role="group" aria-label="Layout">
          <Button variant="icon" label="List view" active={view === 'list'} onClick={() => view !== 'list' && change(() => setView('list'))}>
            <ListIcon />
          </Button>
          <Button variant="icon" label="Grid view" active={view === 'grid'} onClick={() => view !== 'grid' && change(() => setView('grid'))}>
            <GridIcon />
          </Button>
        </div>
      </div>

      <section className={`work-list once-in${switching ? ' is-switching' : ''}`}>
        {showGrid ? (
          <div className="project-grid">
            {shown.map(p => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        ) : (
          <>
            <div className="table-head">
              <h5>Project</h5>
              <h5>Context</h5>
              <h5>Field</h5>
              <h5>Year</h5>
            </div>
            <ul className="table-list" onPointerLeave={() => setActive(null)}>
              {shown.map((p, i) => (
                <li key={p.slug} onPointerEnter={() => setActive(i)}>
                  <TLink to={`/work/${p.slug}`} className="table-row">
                    <h4>{p.title}</h4>
                    <p>{p.org}</p>
                    <p>{p.services}</p>
                    <p>{p.year}</p>
                  </TLink>
                </li>
              ))}
            </ul>
            <HoverPreview
              square
              active={active}
              slides={shown.map(p => ({ key: p.slug, bg: p.tone.bg, content: <ProjectVisual project={p} /> }))}
            />
          </>
        )}
      </section>

      <div className="work-archive">
        <Button href={SITE.socials[0].href} dark>
          All code on GitHub
        </Button>
      </div>
      <Footer />
    </div>
  );
}
