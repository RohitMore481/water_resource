import React, { useState, useEffect } from 'react';

const INSIGHTS_RULES = [
  (s) => s.pH < 6.5  && { level: 'warning', msg: `pH at ${s.name} is ${s.pH} – possible acidic contamination`, icon: '⚗️' },
  (s) => s.pH > 8.2  && { level: 'info',    msg: `pH at ${s.name} is ${s.pH} – slightly alkaline, monitor`, icon: '🔵' },
  (s) => s.turbidity > 5 && { level: 'warning', msg: `High turbidity (${s.turbidity} NTU) at ${s.name}`, icon: '🌊' },
  (s) => s.pressure  < 2.0 && { level: 'critical', msg: `Low pressure (${s.pressure} bar) at ${s.name} – possible leak`, icon: '🔴' },
  (s) => s.tds > 500 && { level: 'warning', msg: `High TDS (${s.tds} mg/L) at ${s.name} – check source`, icon: '💧' },
  (s) => s.flow < 1.0 && { level: 'info', msg: `Low flow rate at ${s.name} – check valve status`, icon: '⚡' },
];

export default function AIInsightsPanel({ sensors = [] }) {
  const [open, setOpen] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const found = [];
    for (const sensor of sensors) {
      for (const rule of INSIGHTS_RULES) {
        const result = rule(sensor);
        if (result) found.push({ ...result, sensorId: sensor.sensor_id, key: `${sensor.sensor_id}-${result.msg}` });
      }
    }
    setInsights(found.slice(0, 6));
  }, [sensors]);

  const levelColors = {
    critical: '#ef4444',
    warning:  '#f59e0b',
    info:     '#3b82f6',
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, width: '300px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,212,255,0.2))', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', color: '#f1f5f9', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(16px)', fontSize: '13px', fontWeight: '600' }}
        id="ai-insights-toggle"
      >
        <span>🤖 AI Insights {insights.length > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '1px 7px', fontSize: '11px', marginLeft: '6px', fontWeight: '700' }}>{insights.length}</span>}</span>
        <span style={{ fontSize: '10px', color: '#64748b' }}>{open ? '▼' : '▲'}</span>
      </button>

      {open && (
        <div style={{ marginTop: '8px', background: 'rgba(13,21,48,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', backdropFilter: 'blur(20px)', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
          {insights.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
              ✅ All sensors nominal
            </div>
          ) : (
            insights.map((ins) => (
              <div key={ins.key} style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{ins.icon}</span>
                <div>
                  <p style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: '1.4' }}>{ins.msg}</p>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: levelColors[ins.level] || '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ins.level}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
