import React from 'react';

const StatusBadge: React.FC = () => (
  <div
    className="reveal"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.85rem',
      borderRadius: '999px',
      background: 'rgba(0,87,255,0.08)',
      border: '1px solid rgba(0,87,255,0.18)',
      color: 'var(--accent, #0057ff)',
      fontSize: '0.78rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#22c55e',
        boxShadow: '0 0 0 0 rgba(34,197,94,0.7)',
        animation: 'pulse-dot 2s infinite',
      }}
    />
    Available for opportunities
  </div>
);

export default StatusBadge;
