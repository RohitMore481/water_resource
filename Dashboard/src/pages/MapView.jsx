import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import { useStateContext } from '../contexts/ContextProvider';
import LiveIndicator from '../components/LiveIndicator';
import 'leaflet/dist/leaflet.css';

const PIPELINE_EDGES = [
  [['S001', 'S002'], ['S001', 'S003']],
  [['S002', 'S004'], ['S002', 'S005']],
  [['S003', 'S006']],
  [['S004', 'S007']],
  [['S005', 'S008']],
].flat();

const statusColor = { normal: '#10b981', leak: '#ef4444', contamination: '#f59e0b' };

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center]);
  return null;
}

export default function MapView() {
  const { sensors } = useStateContext();
  const [selectedSensor, setSelectedSensor] = useState(null);
  const mapRef = useRef(null);

  const sensorMap = Object.fromEntries(sensors.map((s) => [s.sensor_id, s]));

  const getCoords = (id) => {
    const s = sensorMap[id];
    return s ? [s.lat, s.lng] : null;
  };

  const statusLabel = { normal: 'Normal', leak: '🔴 Leak Detected', contamination: '🟡 Contamination' };

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', padding: '20px', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9' }}>🗺️ GIS Pipeline Map</h1>
            <LiveIndicator live={sensors.length > 0} />
          </div>
          <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>Tap a sensor node for details · Color: 🟢 Normal 🔴 Leak 🟡 Contamination</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['normal', 'leak', 'contamination'].map((s) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor[s], display: 'inline-block' }} />
              {statusLabel[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Map + Sidebar */}
      <div style={{ flex: 1, display: 'flex', gap: '16px', minHeight: 0 }}>
        <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <MapContainer
            center={[28.614, 77.209]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* Pipeline edges */}
            {PIPELINE_EDGES.map(([from, to], i) => {
              const a = getCoords(from);
              const b = getCoords(to);
              if (!a || !b) return null;
              const fromSensor = sensorMap[from];
              const isAlert = fromSensor && fromSensor.status !== 'normal';
              return (
                <Polyline
                  key={i}
                  positions={[a, b]}
                  pathOptions={{
                    color: isAlert ? statusColor[fromSensor.status] : 'rgba(59,130,246,0.5)',
                    weight: isAlert ? 3 : 2,
                    dashArray: isAlert ? '6 4' : null,
                  }}
                />
              );
            })}

            {/* Sensor markers */}
            {sensors.map((sensor) => {
              const color = statusColor[sensor.status] || '#94a3b8';
              const isAlert = sensor.status !== 'normal';
              return (
                <CircleMarker
                  key={sensor.sensor_id}
                  center={[sensor.lat, sensor.lng]}
                  radius={isAlert ? 14 : 10}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.85,
                    weight: isAlert ? 3 : 2,
                  }}
                  eventHandlers={{ click: () => setSelectedSensor(sensor) }}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <strong>{sensor.name}</strong>
                      <p style={{ fontSize: '12px', margin: '4px 0', color: '#64748b' }}>📍 {sensor.location}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px', fontSize: '12px' }}>
                        <span>💧 Pressure: <strong>{sensor.pressure} bar</strong></span>
                        <span>🌊 Flow: <strong>{sensor.flow} L/s</strong></span>
                        <span>⚗️ pH: <strong>{sensor.pH}</strong></span>
                        <span>🌫️ Turbidity: <strong>{sensor.turbidity}</strong></span>
                        <span>🧪 TDS: <strong>{sensor.tds} mg/L</strong></span>
                        <span>📊 Leak Score: <strong>{sensor.leakageProbability}%</strong></span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {/* Alert sensors first */}
          {sensors.sort((a, b) => (a.status === 'normal' ? 1 : -1)).map((sensor) => {
            const c = statusColor[sensor.status] || '#94a3b8';
            const isSelected = selectedSensor?.sensor_id === sensor.sensor_id;
            return (
              <div
                key={sensor.sensor_id}
                onClick={() => setSelectedSensor(sensor)}
                className="glass-card"
                style={{ padding: '14px', cursor: 'pointer', border: `1px solid ${isSelected ? c : 'rgba(255,255,255,0.06)'}`, boxShadow: isSelected ? `0 0 16px ${c}30` : undefined, transition: 'all 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="pulse-dot" style={{ color: c, width: '8px', height: '8px', borderRadius: '50%', background: c, display: 'inline-block' }} />
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#f1f5f9' }}>{sensor.name}</span>
                  </div>
                  <span className={`badge badge-${sensor.status}`}>{sensor.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {[['P', `${sensor.pressure}bar`, sensor.pressure < 2], ['pH', sensor.pH, sensor.pH < 6.5 || sensor.pH > 8.5], ['Q', `${sensor.flow}L/s`, false], ['TDS', `${sensor.tds}`, sensor.tds > 500]].map(([k, v, warn]) => (
                    <div key={k} style={{ fontSize: '11px', color: warn ? '#f59e0b' : '#64748b' }}>
                      <span style={{ fontWeight: '600' }}>{k}:</span> {v}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
