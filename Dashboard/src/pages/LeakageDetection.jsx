import React from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import LiveIndicator from '../components/LiveIndicator';

export default function LeakageDetection() {
  const { sensors, sensorHistory } = useStateContext();

  const leakSensors      = sensors.filter((s) => s.status === 'leak');
  const suspectedSensors = sensors.filter((s) => s.leakageProbability > 30 && s.status === 'normal');

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9' }}>🔴 Leak Detection</h1>
            <LiveIndicator live={sensors.length > 0} />
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
            Pressure anomaly analysis · Leakage probability scoring
          </p>
        </div>
      </div>

      {/* Alert if leak */}
      {leakSensors.length > 0 && (
        <div style={{ marginBottom: '24px', padding: '18px', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.4)', boxShadow: '0 0 24px rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '22px' }}>🚨</span>
            <strong style={{ color: '#ef4444', fontSize: '16px' }}>ACTIVE LEAK DETECTED</strong>
          </div>
          {leakSensors.map((s) => (
            <p key={s.sensor_id} style={{ color: '#94a3b8', fontSize: '13px', marginLeft: '32px' }}>
              ▸ <strong style={{ color: '#f1f5f9' }}>{s.name}</strong> ({s.location}) — Pressure: {s.pressure} bar · Leak Score: {s.leakageProbability}%
            </p>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Sensors Monitored', value: sensors.length, color: '#3b82f6', icon: '📡' },
          { label: 'Active Leaks',       value: leakSensors.length, color: '#ef4444', icon: '💥' },
          { label: 'Suspected Issues',   value: suspectedSensors.length, color: '#f59e0b', icon: '⚠️' },
          { label: 'Avg Leak Score',     value: sensors.length ? (sensors.reduce((a, s) => a + s.leakageProbability, 0) / sensors.length).toFixed(1) + '%' : '--', color: '#8b5cf6', icon: '📊' },
        ].map((c) => (
          <div key={c.label} className="glass-card" style={{ padding: '18px' }}>
            <div style={{ fontSize: '18px', marginBottom: '6px' }}>{c.icon}</div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', marginBottom: '4px' }}>{c.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Sensors with leak probability */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontWeight: '700', fontSize: '16px', color: '#f1f5f9', marginBottom: '16px' }}>Leakage Probability by Sensor</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...sensors].sort((a, b) => b.leakageProbability - a.leakageProbability).map((s) => {
            const pct = s.leakageProbability;
            const barColor = pct > 70 ? '#ef4444' : pct > 30 ? '#f59e0b' : '#10b981';
            return (
              <div key={s.sensor_id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '600' }}>
                    {s.name}
                    <span style={{ color: '#64748b', fontWeight: '400', fontSize: '11px', marginLeft: '8px' }}>P: {s.pressure} bar</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: barColor }}>{pct}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '999px', transition: 'width 0.5s', boxShadow: pct > 50 ? `0 0 8px ${barColor}` : 'none' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pressure trend charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {sensors.slice(0, 4).map((sensor) => {
          const hist = sensorHistory[sensor.sensor_id] || [];
          const isAlert = sensor.status === 'leak';
          return (
            <div key={sensor.sensor_id} className="glass-card" style={{ padding: '18px', border: `1px solid ${isAlert ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#f1f5f9' }}>{sensor.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{sensor.location}</div>
                </div>
                <span className={`badge badge-${sensor.status}`}>{sensor.status}</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={hist}>
                  <defs>
                    <linearGradient id={`g-${sensor.sensor_id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={isAlert ? '#ef4444' : '#3b82f6'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isAlert ? '#ef4444' : '#3b82f6'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip contentStyle={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: '8px', fontSize: '11px' }} formatter={(v) => [`${v} bar`, 'Pressure']} labelFormatter={() => ''} />
                  <Area type="monotone" dataKey="pressure" stroke={isAlert ? '#ef4444' : '#3b82f6'} strokeWidth={2} fill={`url(#g-${sensor.sensor_id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
