import React, { useState, useEffect, useRef } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import LiveIndicator from '../components/LiveIndicator';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

const statusColor = { normal: '#10b981', leak: '#ef4444', contamination: '#f59e0b' };
const statusLabel = { normal: 'Normal', leak: 'Leak', contamination: 'Contaminated' };

function Sparkline({ data = [], dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height={46}>
      <LineChart data={data.slice(-15)}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip contentStyle={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: '8px', fontSize: '11px', color: '#e2e8f0' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SensorRow({ sensor, history }) {
  const c = statusColor[sensor.status] || '#94a3b8';
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
      <td style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pulse-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, display: 'block', color: c, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{sensor.name}</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>📍 {sensor.location}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
        <span className={`badge badge-${sensor.status}`}>{statusLabel[sensor.status] || sensor.status}</span>
      </td>
      <td style={{ padding: '12px 8px', color: sensor.pressure < 2 ? '#ef4444' : '#e2e8f0', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>{sensor.pressure}</td>
      <td style={{ padding: '12px 8px', color: '#e2e8f0', fontSize: '13px', textAlign: 'center' }}>{sensor.flow}</td>
      <td style={{ padding: '12px 8px', color: sensor.pH < 6.5 || sensor.pH > 8.5 ? '#f59e0b' : '#e2e8f0', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>{sensor.pH}</td>
      <td style={{ padding: '12px 8px', color: sensor.turbidity > 5 ? '#f59e0b' : '#e2e8f0', fontSize: '13px', textAlign: 'center' }}>{sensor.turbidity}</td>
      <td style={{ padding: '12px 8px', color: sensor.tds > 500 ? '#ef4444' : '#e2e8f0', fontSize: '13px', textAlign: 'center' }}>{sensor.tds}</td>
      <td style={{ padding: '12px 8px', width: '120px' }}>
        <Sparkline data={history} dataKey="pressure" color={c} />
      </td>
      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: sensor.leakageProbability > 50 ? '#ef4444' : sensor.leakageProbability > 20 ? '#f59e0b' : '#10b981' }}>
          {sensor.leakageProbability}%
        </span>
      </td>
      <td style={{ padding: '12px 8px', color: '#475569', fontSize: '11px', textAlign: 'center' }}>
        {new Date(sensor.timestamp).toLocaleTimeString()}
      </td>
    </tr>
  );
}

export default function IoTSimulator() {
  const { sensors, sensorHistory, simulationMode, triggerLeak, triggerContamination, resetSimulation } = useStateContext();
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (sensors.length > 0) setLastUpdate(new Date());
  }, [sensors]);

  const statusCounts = sensors.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.02em' }}>📡 IoT Sensor Simulator</h1>
            <LiveIndicator live={sensors.length > 0} />
          </div>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            {sensors.length} sensors · Real-time telemetry every 3s
            {lastUpdate && ` · Updated ${lastUpdate.toLocaleTimeString()}`}
          </p>
        </div>

        {/* Simulation Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button id="btn-simulate-leak" className="btn-danger" onClick={triggerLeak} style={{ fontSize: '13px', padding: '10px 18px' }}>
            🔴 Simulate Leak
          </button>
          <button id="btn-simulate-contamination" className="btn-warning" onClick={triggerContamination} style={{ fontSize: '13px', padding: '10px 18px' }}>
            🟡 Simulate Contamination
          </button>
          <button id="btn-reset-simulation" className="btn-ghost" onClick={resetSimulation} style={{ fontSize: '13px', padding: '10px 18px' }}>
            ↺ Reset Normal
          </button>
        </div>
      </div>

      {/* Mode Banner */}
      {simulationMode !== 'normal' && (
        <div style={{ marginBottom: '20px', padding: '14px 18px', borderRadius: '12px', background: simulationMode === 'leak' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${simulationMode === 'leak' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{simulationMode === 'leak' ? '🚨' : '⚠️'}</span>
          <div>
            <strong style={{ color: simulationMode === 'leak' ? '#ef4444' : '#f59e0b', fontSize: '14px' }}>
              {simulationMode === 'leak' ? 'LEAK SIMULATION ACTIVE' : 'CONTAMINATION SIMULATION ACTIVE'}
            </strong>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
              Sensor readings are now in emergency mode. Click Reset to return to normal.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Sensors', value: sensors.length, icon: '📡', color: '#3b82f6' },
          { label: 'Normal', value: statusCounts.normal || 0, icon: '✅', color: '#10b981' },
          { label: 'Leak Detected', value: statusCounts.leak || 0, icon: '🔴', color: '#ef4444' },
          { label: 'Contaminated', value: statusCounts.contamination || 0, icon: '🟡', color: '#f59e0b' },
        ].map((card) => (
          <div key={card.label} className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>{card.icon}</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Sensor Table */}
      <div className="glass-card" style={{ overflow: 'auto' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9' }}>Live Sensor Readings</span>
          <LiveIndicator live />
        </div>
        <table className="data-table" style={{ minWidth: '900px' }}>
          <thead>
            <tr>
              {['Sensor', 'Status', 'Pressure (bar)', 'Flow (L/s)', 'pH', 'Turbidity (NTU)', 'TDS (mg/L)', 'Pressure Trend', 'Leak Score', 'Last Update'].map((h) => (
                <th key={h} style={{ whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensors.length === 0
              ? <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📡</div>
                  Connecting to sensors…
                </td></tr>
              : sensors.map((s) => (
                  <SensorRow key={s.sensor_id} sensor={s} history={sensorHistory[s.sensor_id] || []} />
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
