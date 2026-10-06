// Small inline icons, drawn with currentColor so they follow the text colour.
import RotatingGlobe from './RotatingGlobe';

export function SocialIcon({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {label === 'GitHub' ? (
        <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.07c-3.09.67-3.74-1.31-3.74-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.7.08-.68.08-.68 1.12.08 1.71 1.14 1.71 1.14.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.71-1.49-2.47-.28-5.06-1.24-5.06-5.49 0-1.21.43-2.2 1.14-2.98-.11-.28-.49-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.21-5.08 5.48.4.35.75 1.03.75 2.08v3.04c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
      ) : label === 'LinkedIn' ? (
        <>
          <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="6.8" cy="7" r="1.4" />
          <path d="M5.5 10h2.6v8.5H5.5zm5 0H13v1.2c.7-1 1.6-1.5 2.9-1.5 2.3 0 3.1 1.5 3.1 3.8v5h-2.6v-4.6c0-1.2-.3-2-1.5-2-1.3 0-1.8.9-1.8 2.1v4.5h-2.6z" />
        </>
      ) : (
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l4.5 6.7L18.9 2ZM17.9 20h1.8L6.2 4H4.3z" />
      )}
    </svg>
  );
}

export function ArrowIcon({ className = '', rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <path d="M1 13 13 1M13 1H3.5M13 1v9.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M1 5h18M1 10h18M1 15h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="1.75" y="1.75" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.75" y="1.75" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1.75" y="11.75" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.75" y="11.75" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Rotating continental globe, shared by every location badge. */
export function Globe({ className = '', variant }: { className?: string; variant?: 'solid' | 'dark' }) {
  return <RotatingGlobe className={className} variant={variant} />;
}
