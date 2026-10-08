import type { ReactNode } from 'react';
import '@/styles/device.css';

/**
 * A desktop monitor drawn in CSS: a thin black frame around a 16:10 screen,
 * a neck and a base. Every size is a share of the monitor's own width (cqw),
 * so it keeps its shape at any size. Total height is 85.5% of the width.
 */
export default function Monitor({ children, screenBg, className = '' }: { children: ReactNode; screenBg?: string; className?: string }) {
  return (
    <div className={`monitor ${className}`.trim()}>
      <div className="monitor-frame">
        <div className="monitor-screen" style={screenBg ? { background: screenBg } : undefined}>
          {children}
        </div>
      </div>
      <div className="monitor-stand" aria-hidden="true">
        <div className="monitor-neck" />
        <div className="monitor-seam" />
        <div className="monitor-base" />
        <div className="monitor-shadow" />
      </div>
    </div>
  );
}
