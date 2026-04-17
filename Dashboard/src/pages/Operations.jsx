import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const PRIORITY_COLORS = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981' };
const STATUS_COLORS   = { open: '#ef4444', 'in-progress': '#3b82f6', resolved: '#10b981' };
const TYPE_ICONS      = { inspection: '🔍', repair: '🔧', maintenance: '⚙️' };

export default function Operations() {
  const { authFetch, isAdmin } = useAuth();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ title: '', description: '', type: 'inspection', priority: 'medium', assignedTo: '', sensorId: '', location: '', dueDate: '' });

  const fetchOps = async () => {
    try {
      const res = await authFetch('/operations');
      const data = await res.json();
      setOperations(data.operations || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOps(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await authFetch(`/operations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setOperations((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    } catch (e) { console.error(e); }
  };

  const createOp = async (e) => {
    e.preventDefault();
    try {
      const res  = await authFetch('/operations', { method: 'POST', body: JSON.stringify(form) });
      const data = await res.json();
      setOperations((prev) => [data.operation, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', type: 'inspection', priority: 'medium', assignedTo: '', sensorId: '', location: '', dueDate: '' });
    } catch (e) { console.error(e); }
  };

  const statusCounts = operations.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {});

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9' }}>🔧 Operations</h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>Inspection workflows · Repair tasks · Maintenance schedules</p>
        </div>
        {isAdmin() && (
          <button id="btn-new-operation" className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ fontSize: '13px' }}>
            + New Task
          </button>
        )}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[{ label: 'Total Tasks', value: operations.length, color: '#3b82f6' }, { label: 'Open', value: statusCounts.open || 0, color: '#ef4444' }, { label: 'In Progress', value: statusCounts['in-progress'] || 0, color: '#f59e0b' }, { label: 'Resolved', value: statusCounts.resolved || 0, color: '#10b981' }].map((c) => (
          <div key={c.label} className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', marginBottom: '6px' }}>{c.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && isAdmin() && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(0,212,255,0.2)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', marginBottom: '18px' }}>Create New Task</h2>
          <form onSubmit={createOp} id="operation-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {[
                { label: 'Title', key: 'title', type: 'text', required: true },
                { label: 'Assigned To', key: 'assignedTo', type: 'text' },
                { label: 'Location', key: 'location', type: 'text' },
                { label: 'Due Date', key: 'dueDate', type: 'date' },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label>{label}</label>
                  <input type={type} required={required} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <option value="inspection">Inspection</option>
                  <option value="repair">Repair</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label>Priority</label>
                <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <label>Description</label>
              <textarea rows={3} required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary" style={{ fontSize: '13px' }}>Create Task</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)} style={{ fontSize: '13px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Operations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#475569' }}>Loading operations…</div>
        ) : operations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#475569' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📋</div>
            No operations yet
          </div>
        ) : (
          operations.map((op) => (
            <div key={op.id} className="glass-card" style={{ padding: '18px', border: `1px solid ${op.priority === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '16px' }}>{TYPE_ICONS[op.type] || '📋'}</span>
                    <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#f1f5f9' }}>{op.title}</h3>
                    <span className={`badge badge-${op.priority}`}>{op.priority}</span>
                    <span className={`badge badge-${op.status}`}>{op.status}</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>{op.description}</p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#64748b' }}>
                    <span>👤 {op.assignedTo}</span>
                    <span>📍 {op.location}</span>
                    <span>📅 Due: {new Date(op.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {isAdmin() && (
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {op.status !== 'in-progress' && op.status !== 'resolved' && (
                      <button className="btn-ghost" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => updateStatus(op.id, 'in-progress')}>Start</button>
                    )}
                    {op.status !== 'resolved' && (
                      <button className="btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => updateStatus(op.id, 'resolved')}>Resolve</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
