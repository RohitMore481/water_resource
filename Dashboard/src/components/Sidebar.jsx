import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdOutlineCancel } from 'react-icons/md';
import { useStateContext } from '../contexts/ContextProvider';
import { useAuth } from '../auth/AuthContext';
import logo from '../data/jeevanrakshak-logo.png';

const NAV_ITEMS = [
  {
    title: 'OVERVIEW',
    links: [
      { name: 'dashboard',  label: 'Dashboard', icon: '📊' },
      { name: 'map-view',   label: 'GIS Map',   icon: '🗺️' },
    ],
  },
  {
    title: 'MONITORING',
    links: [
      { name: 'iot-simulator', label: 'IoT Sensors',  icon: '📡', adminOnly: false },
      { name: 'analytics',     label: 'Analytics',    icon: '📈', adminOnly: false },
      { name: 'Water-Quality', label: 'Water Quality', icon: '💧' },
      { name: 'water-sensors', label: 'Sensor Nodes', icon: '🔬' },
    ],
  },
  {
    title: 'DETECTION',
    links: [
      { name: 'leakage-detection', label: 'Leak Detection', icon: '🔴' },
      { name: 'outbreak-risk',     label: 'Outbreak Risk',  icon: '⚠️' },
      { name: 'health-data',       label: 'Health Data',    icon: '🏥' },
    ],
  },
  {
    title: 'COMMUNITY',
    links: [
      { name: 'complaints-awareness', label: 'Complaints',       icon: '📢' },
      { name: 'complains-data',       label: 'Complaint Data',   icon: '📋' },
    ],
  },
  {
    title: 'OPERATIONS',
    links: [
      { name: 'operations',       label: 'Task Management', icon: '🔧', adminOnly: false },
      { name: 'sensor-allocation', label: 'Sensor Allocation', icon: '📍', adminOnly: true },
    ],
  },
];

const Sidebar = () => {
  const { activeMenu, setActiveMenu, screenSize, alerts } = useStateContext();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) setActiveMenu(false);
  };

  const activeLink = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-sm m-1.5 font-semibold transition-all shadow-sm';
  const normalLink = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm m-1.5 transition-all';

  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <div style={{ background: 'rgba(13,21,48,0.95)', backdropFilter: 'blur(20px)', height: '100%', borderRight: '1px solid rgba(255,255,255,0.06)' }} className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10">
      {activeMenu && (
        <>
          {/* Logo */}
          <div className="flex justify-between items-center pt-4 px-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/dashboard'); handleCloseSideBar(); }}>
              <img src={logo} alt="JeevanRakshak" style={{ height: '36px', width: 'auto', display: 'block' }} />
            </div>
            <TooltipComponent content="Menu" position="BottomCenter">
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setActiveMenu(!activeMenu)}
                className="text-xl rounded-full p-2 md:hidden"
                style={{ color: '#64748b' }}
              >
                <MdOutlineCancel />
              </button>
            </TooltipComponent>
          </div>

          {/* User info */}
          {user && (
            <div style={{ margin: '12px 12px 16px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: '#0a0f1e', flexShrink: 0 }}>
                  {user.avatar || user.name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '700', color: user.role === 'admin' ? '#00d4ff' : '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user.role}</span>
                  </div>
                </div>
                <button onClick={logout} title="Sign out" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>⎋</button>
              </div>
            </div>
          )}

          {/* Alert badge */}
          {unresolvedAlerts > 0 && (
            <div style={{ margin: '0 12px 12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>🚨</span>
              <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>{unresolvedAlerts} active alert{unresolvedAlerts > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Nav sections */}
          <div className="mt-2">
            {NAV_ITEMS.map((section) => (
              <div key={section.title}>
                <p style={{ fontSize: '10px', color: '#334155', fontWeight: '700', letterSpacing: '0.08em', padding: '8px 16px 4px', textTransform: 'uppercase' }}>
                  {section.title}
                </p>
                {section.links.map((link) => {
                  if (link.adminOnly && !isAdmin()) return null;
                  return (
                    <NavLink
                      to={`/${link.name}`}
                      key={link.name}
                      onClick={handleCloseSideBar}
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 14px', borderRadius: '10px', margin: '1px 8px',
                        fontSize: '13px', fontWeight: isActive ? '700' : '500',
                        color: isActive ? '#f1f5f9' : '#64748b',
                        background: isActive ? 'rgba(0,212,255,0.12)' : 'transparent',
                        borderLeft: isActive ? '2px solid #00d4ff' : '2px solid transparent',
                        transition: 'all 0.15s',
                        textDecoration: 'none',
                      })}
                    >
                      <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{link.icon}</span>
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
