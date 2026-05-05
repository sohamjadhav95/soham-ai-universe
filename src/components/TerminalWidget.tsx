import React, { useEffect, useState } from 'react';

const LINES = [
  { p: '$', t: 'whoami', c: '#0057ff' },
  { p: '>', t: 'soham_jadhav · ai/ml engineer', c: '#0d0d0b' },
  { p: '$', t: 'cat focus.txt', c: '#0057ff' },
  { p: '>', t: 'medical imaging · deep learning · open source', c: '#0d0d0b' },
  { p: '$', t: 'status --now', c: '#0057ff' },
  { p: '>', t: 'building @ GSoC 2026 · ML4Sci', c: '#22c55e' },
];

const TerminalWidget: React.FC = () => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= LINES.length) return;
    const t = setTimeout(() => setShown(s => s + 1), 600);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div
      style={{
        background: '#0d0d0b',
        borderRadius: '12px',
        padding: '1.1rem 1.2rem',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: '0.82rem',
        color: '#e6e6e6',
        boxShadow: '0 20px 60px -20px rgba(0,0,0,0.35)',
        minHeight: '220px',
      }}
    >
      <div style={{ display: 'flex', gap: 6, marginBottom: '0.9rem' }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
      </div>
      {LINES.slice(0, shown).map((l, i) => (
        <div key={i} style={{ marginBottom: 4 }}>
          <span style={{ color: l.c, marginRight: 8 }}>{l.p}</span>
          <span style={{ color: l.p === '$' ? '#fff' : l.c === '#22c55e' ? '#22c55e' : '#cbd5e1' }}>
            {l.t}
          </span>
        </div>
      ))}
      {shown < LINES.length && <span style={{ color: '#0057ff' }}>▍</span>}
    </div>
  );
};

export default TerminalWidget;
