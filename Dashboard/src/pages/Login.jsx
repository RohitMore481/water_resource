import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login, error } = useAuth();
  const [email, setEmail]       = useState('admin@jeevan.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading]   = useState(false);
  const [localError, setLocalError] = useState('');
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random bubble particles for background
    const p = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size:  Math.random() * 8 + 3,
      left:  Math.random() * 100,
      delay: Math.random() * 8,
      dur:   Math.random() * 6 + 8,
    }));
    setParticles(p);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) { setLocalError('Please fill in all fields.'); return; }
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setLocalError(result.error);
    setLoading(false);
  };

  return (
    <div className="login-page" style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: `${p.left}%`,
              width:  `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: 'rgba(0,212,255,0.15)',
              border: '1px solid rgba(0,212,255,0.3)',
              animation: `bubble-rise ${p.dur}s ${p.delay}s ease-in infinite`,
            }}
          />
        ))}
      </div>

      {/* Radial glow orbs */}
      <div style={{ position: 'absolute', top: '-10%',  left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%',right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '380px', padding: '20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(0,212,255,0.3)', marginBottom: '12px', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>
            <span style={{ fontSize: '24px' }}>💧</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Jeevan<span style={{ color: '#00d4ff' }}>Rakshak</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Smart Water Monitoring System</p>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: '24px 28px', background: 'rgba(13,21,48,0.85)', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.05)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>Welcome Back</h2>
            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} id="login-form">
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="login-email" style={{ marginBottom: '4px', display: 'block' }}>Email Address</label>
              <input
                id="login-email"
                type="email"
                style={{ padding: '10px 14px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jeevan.com"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="login-password" style={{ marginBottom: '4px', display: 'block' }}>Password</label>
              <input
                id="login-password"
                type="password"
                style={{ padding: '10px 14px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {(localError || error) && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {localError || error}
              </div>
            )}

            <button id="login-submit" type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0a0f1e', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Signing in…
                </>
              ) : '🔐 Sign In'}
            </button>
          </form>

          {/* Quick fill buttons */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-ghost" style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
              onClick={() => { setEmail('admin@jeevan.com'); setPassword('admin123'); }}>
              🔑 Admin Demo
            </button>
            <button type="button" className="btn-ghost" style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
              onClick={() => { setEmail('user@jeevan.com'); setPassword('user123'); }}>
              👤 User Demo
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#475569', fontSize: '12px' }}>
          JeevanRakshak © 2024 · Hackathon Project
        </p>
      </div>

      <style>{`
        @keyframes bubble-rise {
          0%  { transform: translateY(0) scale(1);    opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100%{ transform: translateY(-110vh) scale(0.5); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
