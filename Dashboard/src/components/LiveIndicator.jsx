import React from 'react';

export default function LiveIndicator({ live = true, label = 'LIVE' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        className="live-dot"
        style={{
          display: 'inline-block',
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: live ? '#10b981' : '#475569',
          boxShadow: live ? '0 0 6px #10b981' : 'none',
        }}
      />
      <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: live ? '#10b981' : '#475569' }}>
        {label}
      </span>
    </span>
  );
}
