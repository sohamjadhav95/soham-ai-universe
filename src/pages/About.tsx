import { useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import SplitWords from '@/components/SplitWords';
import HoverPreview from '@/components/HoverPreview';
import VideoPlayer from '@/components/VideoPlayer';
import { ArrowIcon, Globe } from '@/components/Icons';
import { SITE } from '@/data/site';
import { CERTIFICATES, EXPERIENCE, PAPERS, SERVICES } from '@/data/about';
import { gsap, useGsap } from '@/lib/motion';
import { useEntrance, useTitle } from '@/lib/useEntrance';
import { useIsMobile } from '@/lib/useIsMobile';
import '@/styles/about.css';
import '@/styles/work-list.css';
import '@/styles/globe.css';

function Certificates() {
  const [active, setActive] = useState<number | null>(null);
  const mobile = useIsMobile();
  return (
    <section className="about-block">
      <div className="head">
        <h2>Certificates</h2>
        <p>{CERTIFICATES.length} certificates, from Google Summer of Code to IBM’s professional programmes.</p>
      </div>
      <div className="list">
        <ul className="table-list" onPointerLeave={() => setActive(null)}>
          {CERTIFICATES.map((c, i) => (
            <li key={c.title} onPointerEnter={() => setActive(i)}>
              <a className="table-row" href={c.href} target="_blank" rel="noopener noreferrer">
                <h4>{c.title}</h4>
                <p>{c.issuer}</p>
                <p />
                <p>{c.date}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
      {!mobile && (
        <HoverPreview
          active={active}
          label="Open"
          slides={CERTIFICATES.map(c => ({
            key: c.title,
            bg: '#e9eaeb',
            content: <img className="contain" src={c.image} alt="" loading="lazy" />,
          }))}
        />
      )}
    </section>
  );
}

export default function About() {
  const root = useRef<HTMLDivElement>(null);
  useTitle(`About • ${SITE.name}`);
  useEntrance(root);

  useGsap(
    () => {
      gsap.fromTo(
        '.about-intro .image img',
        { yPercent: -10 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.about-intro .image', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
      gsap.fromTo(
        '.about-intro .text',
        { y: 0 },
        {
          y: -60,
          ease: 'none',
          scrollTrigger: { trigger: '.about-intro', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    root,
  );

  return (
    <div className="page" ref={root}>
      <Header />
      <section className="page-header container medium">
        <SplitWords as="h1" trigger="reveal" text="Building AI for good faith of humanity" />
      </section>

      <div className="about-globe container medium once-in">
        <div className="stripe" />
        <div className="ball-wrap">
          <div className="ball" aria-hidden="true">
            <Globe variant="dark" />
          </div>
        </div>
      </div>

      <section className="about-intro container medium">
        <div className="row">
          <div className="text">
            <ArrowIcon className="arrow" rotate={90} />
            <p>
              I’m Soham, an AI / ML engineer and researcher based in {SITE.location.city}. I work where research meets
              real use: medical imaging, multimodal AI, and the engineering that makes a model worth trusting.
            </p>
            <p>
              In 2026 I completed Google Summer of Code with ML4Sci. There I created a sub-pixel labelling method for
              coronary calcium segmentation and built PrediCT Studio, a research workstation for calcium scoring. I’m
              still building with the team.
            </p>
            <p className="small">Two published papers, a year as GDG AI / ML co-lead, and one belief: build AI in good faith, for people.</p>
          </div>
          <div className="image">
            <img src={SITE.photos.about} alt={`${SITE.name} smiling`} loading="lazy" />
          </div>
        </div>
      </section>

      <section className="about-film">
        <div className="head container medium">
          <h2>The short version</h2>
          <p>A 50-second film about what I build and why. Turn the sound on.</p>
        </div>
        <div className="container">
          <div className="video-block">
            <VideoPlayer
              src="/videos/soham-story.mp4"
              stream="/videos/soham-story/index.m3u8"
              poster="/videos/soham-story-poster.webp"
              title="Soham Jadhav, a 50-second story film"
              sound
            />
          </div>
        </div>
      </section>

      <section className="about-services">
        <div className="container medium">
          <h2>What I can do for you</h2>
          <div className="services-grid">
            {SERVICES.map(s => (
              <div key={s.nr}>
                <h5>{s.nr}</h5>
                <div className="stripe" />
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-block">
        <div className="head">
          <h2>Published research</h2>
          <p>Peer-reviewed work on multimodal content moderation.</p>
        </div>
        <div className="list">
          <ul className="paper-list">
            {PAPERS.map(p => (
              <li key={p.doi}>
                <a className="paper-row" href={p.href} target="_blank" rel="noopener noreferrer">
                  <div>
                    <h4>{p.title}</h4>
                    <p className="authors">{p.authors}</p>
                  </div>
                  <div className="meta">
                    <p>{p.venue}</p>
                    <p className="small">
                      {p.type} · {p.date}
                    </p>
                    <p className="doi">DOI {p.doi}</p>
                  </div>
                  <ArrowIcon className="arrow" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-block">
        <div className="head">
          <h2>Experience</h2>
        </div>
        <div className="list">
          <ul className="exp-list">
            {EXPERIENCE.map(e => (
              <li key={e.role}>
                <div className="exp-row">
                  <h4>{e.role}</h4>
                  <p>{e.org}</p>
                  <p className="period">{e.period}</p>
                  <p className="text">{e.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-block">
        <div className="head">
          <h2>Writings</h2>
          <p>Blogs and technical writing.</p>
        </div>
        <div className="list">
          <ul className="paper-list writing-list">
            <li>
              <a className="paper-row" href="https://sohamjadhav95.github.io/gsoc-2026-predict-blog/" target="_blank" rel="noopener noreferrer">
                <div>
                  <h4>GSoC 2026: Sub-pixel CAC Segmentation</h4>
                  <p className="authors">PrediCT Blog</p>
                </div>
                <div className="meta">
                  <p>Read post</p>
                  <p className="small">Technical · 2026</p>
                </div>
                <ArrowIcon className="arrow" />
              </a>
            </li>
          </ul>
        </div>
      </section>

      <Certificates />

      <div className="about-resume">
        <Button href={SITE.resume} dark>
          Résumé
        </Button>
        <Button to="/work">See my work</Button>
      </div>
      <Footer />
    </div>
  );
}
