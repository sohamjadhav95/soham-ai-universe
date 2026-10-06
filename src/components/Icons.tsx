// Small inline icons, drawn with currentColor so they follow the text colour.

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

/** Wireframe globe; the meridians sweep to suggest rotation (see globe.css). */
export function Globe({ className = '' }: { className?: string }) {
  return (
    <span className={`globe ${className}`} aria-hidden="true">
      <span className="globe-ring" />
      <span className="globe-meridian m1" />
      <span className="globe-meridian m2" />
      <span className="globe-meridian m3" />
      <span className="globe-lat l1" />
      <span className="globe-lat l2" />
      <span className="globe-lat l3" />
    </span>
  );
}
