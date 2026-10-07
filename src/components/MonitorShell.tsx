import { ReactNode } from 'react';
import { useSite } from '@/lib/transition';
import '@/styles/monitor-shell.css';

export default function MonitorShell({ children }: { children: ReactNode }) {
  const { setMenuOpen } = useSite();
  return (
    <section className="fabric-monitor-stage">
      <div className="fabric-monitor-device">
        <div className="fabric-monitor-screen">
          {children}
        </div>
        <div className="fabric-monitor-neck" aria-hidden="true"></div>
        <div className="fabric-monitor-base" aria-hidden="true"></div>
      </div>
      <button className="fabric-monitor-menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
        <span></span><span></span>
      </button>
    </section>
  );
}
