import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useStateContext } from '../contexts/ContextProvider';
import LiveIndicator from '../components/LiveIndicator';

const METRICS = [
  { key: 'pressure', label: 'Pressure (bar)',     color: '#3b82f6', danger: { max: 6.5, min: 2.0 } },
  { key: 'pH',       label: 'pH Level',            color: '#10b981', danger: { max: 8.5, min: 6.5 } },
  { key: 'turbidity',label: 'Turbidity (NTU)',     color: '#f59e0b', danger: { max: 5.0, min: 0   } },
  { key: 'tds',      label: 'TDS (mg/L)',           color: '#8b5cf6', danger: { max: 500, min: 0   } },
  { key: 'flow',     label: 'Flow Rate (L/s)',      color: '#00d4ff', danger: { max: 6.0, min: 1.0 } },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(13,21,48,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', fontSize: '12px' }}>
      <p style={{ color: '#94a3b8', marginBottom: '6px' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: '600' }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { sensors, sensorHistory } = useStateContext();
  const [selectedMetric, setSelectedMetric] = useState('pressure');
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [aggregateData, setAggregateData] = useState([]);

  const metric = METRICS.find((m) => m.key === selectedMetric);

  // Build aggregate time-series
  useEffect(() => {
    if (!sensors.length) return;
    const refSensorId = selectedSensor === 'all' ? sensors[0]?.sensor_id : selectedSensor;
    const history = sensorHistory[refSensorId] || [];
    setAggregateData(
      history.map((h, i) => ({
        time: new Date(h.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        value: h[selectedMetric],
        anomaly: selectedMetric === 'pressure' && h.pressure < 2,
      }))
    );
  }, [sensors, sensorHistory, selectedMetric, selectedSensor]);

  // Current average metrics across all sensors
  const avgMetrics = METRICS.map((m) => {
    const vals = sensors.map((s) => s[m.key]).filter((v) => v != null);
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '--';
    const isAnomaly = vals.some((v) => v < m.danger.min || v > m.danger.max);
    return { ...m, avg, isAnomaly };
  });

  // Sensor comparison for selected metric
  const sensorComparison = sensors.map((s) => ({ name: s.name.replace('Village ', 'V.'), value: s[selectedMetric], status: s.status }));

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9' }}>📈 Analytics</h1>
            <LiveIndicator live={sensors.length > 0} />
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>Real-time sensor trends and anomaly detection</p>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {avgMetrics.map((m) => (
          <div
            key={m.key}
            onClick={() => setSelectedMetric(m.key)}
            className="glass-card"
            style={{ padding: '16px', cursor: 'pointer', border: `1px solid ${selectedMetric === m.key ? m.color : m.isAnomaly ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`, boxShadow: selectedMetric === m.key ? `0 0 20px ${m.color}30` : undefined, transition: 'all 0.2s' }}
          >
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{m.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: m.isAnomaly ? '#ef4444' : m.color }}>
              {m.avg}
            </div>
            {m.isAnomaly && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px' }}>⚠ Anomaly detected</div>}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Metric:</div>
        {METRICS.map((m) => (
          <button key={m.key} onClick={() => setSelectedMetric(m.key)} style={{ padding: '6px 14px', borderRadius: '999px', border: `1px solid ${selectedMetric === m.key ? m.color : 'rgba(255,255,255,0.1)'}`, background: selectedMetric === m.key ? `${m.color}20` : 'transparent', color: selectedMetric === m.key ? m.color : '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
            {m.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Sensor:</span>
          <select value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', width: 'auto' }}>
            <option value="all">All (avg)</option>
            {sensors.map((s) => <option key={s.sensor_id} value={s.sensor_id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>{metric?.label} — Time Series</h2>
          <LiveIndicator live label="AUTO-REFRESH" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={aggregateData}>
            <defs>
              <linearGradient id={`grad-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={metric?.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={metric?.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            {metric?.danger?.max && <ReferenceLine y={metric.danger.max} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" label={{ value: 'Max safe', fill: '#ef4444', fontSize: 10 }} />}
            {metric?.danger?.min > 0 && <ReferenceLine y={metric.danger.min} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" label={{ value: 'Min safe', fill: '#ef4444', fontSize: 10 }} />}
            <Area type="monotone" dataKey="value" name={metric?.label} stroke={metric?.color} strokeWidth={2} fill={`url(#grad-${selectedMetric})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sensor Comparison */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' }}>Sensor Comparison — {metric?.label}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sensorComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name={metric?.label} radius={[4, 4, 0, 0]}
              fill={metric?.color}
              label={false}
            />
            {metric?.danger?.max && <ReferenceLine y={metric.danger.max} stroke="rgba(239,68,68,0.5)" strokeDasharray="4 4" />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
