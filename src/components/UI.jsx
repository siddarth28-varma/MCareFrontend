import React from 'react';
import { ArrowRight, CalendarDays, Clock3, Stethoscope } from 'lucide-react';

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'green' }) {
  return <article className={`stat-card tone-${tone}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div><strong>{value}</strong><small>{detail}</small></article>;
}

export function DoctorCard({ doctor, onSelect, onBook }) {
  const initials = doctor.user?.name?.replace('Dr. ', '').split(' ').map((part) => part[0]).slice(0, 2).join('') || 'MD';
  return (
    <article className="doctor-card">
      <div className="doctor-card-top"><span className="doctor-avatar">{initials}</span><span className="availability-tag"><i /> Taking appointments</span></div>
      <div className="doctor-info"><h3>{doctor.user?.name}</h3><p>{doctor.specialization}</p><small>{doctor.qualification || 'Medical professional'}</small></div>
      <div className="doctor-card-meta"><span><Clock3 size={14} /> {doctor.startTime?.slice(0, 5)}–{doctor.endTime?.slice(0, 5)}</span><span><CalendarDays size={14} /> {doctor.availableDays || 'Weekdays'}</span></div>
      <div className="doctor-card-actions"><button className="text-button" onClick={() => onSelect(doctor)}>Details <ArrowRight size={15} /></button><button className="button button-dark button-small" onClick={() => onBook(doctor)}><Stethoscope size={14} /> Book visit</button></div>
    </article>
  );
}

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status?.toLowerCase()}`}>{status}</span>;
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={21} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
