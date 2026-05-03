import React from 'react';
import { EXPERIENCE } from '@/data/experience';
import ExperienceCard from './ExperienceCard';

const ExperienceSection: React.FC = () => {
  return (
    <section id="experience" style={{ padding: '7rem 2rem', background: 'rgba(255,255,255,0.82)', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-label reveal" style={{ marginBottom: '1.5rem' }}>03 / Experience</div>
        <h2 className="reveal" style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', marginBottom: '3.5rem', transitionDelay: '0.08s' }}>
          Experience
        </h2>

        <div className="exp-timeline">
          <div className="exp-timeline__line" aria-hidden="true" />
          {EXPERIENCE.map((entry, i) => (
            <div key={entry.id} className="exp-timeline__row">
              <span
                className={`exp-dot ${entry.status === 'active' ? 'is-active' : 'is-done'}`}
                aria-hidden="true"
              />
              <ExperienceCard {...entry} revealDelay={i * 120} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
