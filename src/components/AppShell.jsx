import React from 'react';
import { Activity, CalendarDays, ClipboardList, HeartPulse, LogOut, Stethoscope, Users, UserRound, UserPlus } from 'lucide-react';

const patientLinks = [
  { id: 'dashboard', label: 'Overview', icon: Activity },
  { id: 'doctors', label: 'Find a doctor', icon: Stethoscope },
  { id: 'appointments', label: 'My appointments', icon: CalendarDays },
  { id: 'profile', label: 'My profile', icon: UserRound },
];
const doctorLinks = [
  { id: 'dashboard', label: 'Overview', icon: Activity },
  { id: 'doctor-appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'profile', label: 'My profile', icon: UserRound },
];
const adminLinks = [
  { id: 'dashboard', label: 'Overview', icon: Activity },
  { id: 'manage-doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'manage-patients', label: 'Patients', icon: Users },
  { id: 'manage-appointments', label: 'Appointments', icon: ClipboardList },
];

export default function AppShell({ user, view, onNavigate, onLogout, children }) {
  const links = user.role === 'PATIENT' ? patientLinks : user.role === 'DOCTOR' ? doctorLinks : adminLinks;
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <button className="brand" onClick={() => onNavigate('dashboard')} aria-label="MediCare home">
          <span className="brand-mark"><HeartPulse size={21} strokeWidth={2.2} /></span>
          <span>MediCare<small>CARE MANAGEMENT</small></span>
        </button>
        <div className="side-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${view === id ? 'active' : ''}`} onClick={() => onNavigate(id)}>
              <Icon size={18} strokeWidth={1.8} /> <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="support-note"><span className="support-pulse" /><span><b>Care at a glance</b><small>Your health, one step at a time.</small></span></div>
          <div className="side-account">
            <span className="avatar avatar-small">{user.name?.charAt(0) || 'M'}</span>
            <span className="account-copy"><b>{user.name}</b><small>{user.role.toLowerCase()}</small></span>
            <button className="icon-button logout-button" title="Sign out" onClick={onLogout}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><HeartPulse size={19} /></span><b>MediCare</b></div>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><b>{links.find((link) => link.id === view)?.label || 'Overview'}</b></div>
          <div className="topbar-user"><span className="status-dot" />Secure care workspace <span className="avatar avatar-small">{user.name?.charAt(0) || 'M'}</span></div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export function PublicHeader({ onLogin, onRegister }) {
  return (
    <header className="public-header">
      <button className="brand" onClick={onLogin}>
        <span className="brand-mark"><HeartPulse size={21} strokeWidth={2.2} /></span>
        <span>MediCare<small>CARE MANAGEMENT</small></span>
      </button>
      <div className="public-actions"><button className="text-button" onClick={onLogin}>Sign in</button><button className="button button-dark button-small" onClick={onRegister}><UserPlus size={15} /> Create account</button></div>
    </header>
  );
}
