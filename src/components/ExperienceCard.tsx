import React from 'react';
import type { ExperienceEntry } from '@/data/experience';
import gsocLogo from '@/assets/logos/gsoc.png';
import ml4sciLogo from '@/assets/logos/ml4sci.png';
import gdgLogo from '@/assets/logos/gdg.png';

const LOGO_MAP: Record<string, string> = {
  'gsoc-2026': gsocLogo,
  'ml4sci': ml4sciLogo,
  'gdg': gdgLogo,
};

type Props = ExperienceEntry & { revealDelay?: number };

const ExperienceCard: React.FC<Props> = ({
  role, org, duration, location, type, status,
  description, tags, metrics, accentColor, initials, logoBg, revealDelay = 0,
}) => {
  return (
    <div
      className="exp-card reveal"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        transitionDelay: `${revealDelay}ms`,
      }}
    >
      <div className="exp-card__head">
        <div
          className="exp-card__logo"
          style={{ background: logoBg }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="exp-card__head-text">
          <div className="exp-card__role">{role}</div>
          <div className="exp-card__org" style={{ color: accentColor }}>{org}</div>
          <div className="exp-card__meta">
            <span>{duration}</span>
            <span aria-hidden="true">·</span>
            <span>{location}</span>
            <span aria-hidden="true">·</span>
            <span>{type}</span>
          </div>
        </div>
        <span className={`exp-card__badge ${status === 'active' ? 'is-active' : 'is-done'}`}>
          {status === 'active' ? 'Active' : 'Completed'}
        </span>
      </div>

      <p className="exp-card__desc">{description}</p>

      {metrics && metrics.length > 0 && (
        <div className="exp-card__metrics">
          {metrics.map(m => (
            <span key={m.label} className="exp-metric">
              <strong>{m.label}</strong> {m.value}
            </span>
          ))}
        </div>
      )}

      <div className="exp-card__tags">
        {tags.map(t => (
          <span key={t} className="exp-tag">{t}</span>
        ))}
      </div>
    </div>
  );
};

export default ExperienceCard;
