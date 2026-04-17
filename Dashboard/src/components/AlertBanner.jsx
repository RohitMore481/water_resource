import React, { useEffect, useRef, useState } from 'react';

/**
 * Floating alert banner — top-right stacked alerts
 * Props: alerts = [{ id, type, message, timestamp }]
 *        onDismiss(id)
 */
export default function AlertBanner({ alerts = [], onDismiss }) {
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px', width: '100%' }}>
      {alerts.slice(0, 5).map((alert) => (
        <AlertItem key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function AlertItem({ alert, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => onDismiss(alert.id), 350);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const isLeak          = alert.type === 'leak';
  const isContamination = alert.type === 'contamination';

  const colors = isLeak
    ? { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)', icon: '🔴', accent: '#ef4444', label: 'LEAK DETECTED' }
    : isContamination
    ? { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', icon: '🟡', accent: '#f59e0b', label: 'CONTAMINATION' }
    : { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', icon: 'ℹ️', accent: '#3b82f6', label: 'ALERT' };

  return (
    <div
      className={visible ? 'alert-enter' : 'alert-exit'}
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '14px 16px', backdropFilter: 'blur(16px)', boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 12px ${colors.border}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: colors.accent, letterSpacing: '0.08em' }}>{colors.label}</span>
            <span style={{ fontSize: '10px', color: '#475569' }}>{new Date(alert.timestamp).toLocaleTimeString()}</span>
          </div>
          <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.4' }}>{alert.message}</p>
          {alert.sensorName && (
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>📍 {alert.location}</p>
          )}
        </div>
        <button
          onClick={() => setVisible(false)}
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0', flexShrink: 0 }}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      </div>
      {/* Progress bar */}
      <div style={{ marginTop: '10px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: colors.accent, borderRadius: '999px', animation: 'shrink-bar 8s linear forwards' }} />
      </div>
      <style>{`@keyframes shrink-bar { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
}
