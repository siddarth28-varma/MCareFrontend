import React, { useEffect, useState } from 'react';
import { Activity, CalendarDays, Check, ClipboardList, Clock3, FileText, Stethoscope } from 'lucide-react';
import { AppointmentTable } from './PatientPages';
import { EmptyState, PageHeading, StatCard } from '../components/UI';
import { api } from '../services/api';

export function DoctorDashboard({ user, data, onNavigate, onConsultation, onComplete }) {
  const appointments = data.appointments;
  const today = new Date().toISOString().slice(0, 10);
  const todays = appointments.filter((item) => item.appointmentDate === today && item.status === 'BOOKED');
  const upcoming = appointments.filter((item) => item.appointmentDate >= today && item.status === 'BOOKED').slice(0, 4);
  return <><PageHeading eyebrow="DOCTOR OVERVIEW" title={`Good ${greeting()}, ${user.name?.replace('Dr. ', '').split(' ')[0] || 'Doctor'}.`} description="Your clinic schedule, at a glance." action={<button className="button button-dark" onClick={() => onNavigate('doctor-appointments')}><CalendarDays size={16} /> View schedule</button>} /><section className="stat-grid"><StatCard label="Total appointments" value={appointments.length} detail="Across your schedule" icon={ClipboardList} /><StatCard label="Today" value={todays.length} detail="Visits on today's schedule" icon={CalendarDays} tone="blue" /><StatCard label="Upcoming" value={upcoming.length} detail="Booked visits ahead" icon={Clock3} tone="peach" /></section><section className="content-section"><div className="section-heading"><div><div className="eyebrow">YOUR SCHEDULE</div><h2>Upcoming patients</h2></div><button className="text-button" onClick={() => onNavigate('doctor-appointments')}>Full schedule <span>→</span></button></div>{upcoming.length ? <AppointmentTable appointments={upcoming} mode="doctor" onConsultation={onConsultation} onComplete={onComplete} /> : <EmptyState icon={CalendarDays} title="A clear schedule" description="Booked patient visits will appear here." />}</section><section className="doctor-callout"><span className="callout-icon"><Stethoscope size={19}/></span><div><b>Keep your availability current</b><p>Your listed clinic hours help patients choose a convenient appointment.</p></div><span className="callout-hours">{data.profile?.startTime?.slice(0,5)} – {data.profile?.endTime?.slice(0,5)}</span></section></>;
}

export function DoctorAppointmentsPage({ appointments, onCancel, onComplete, onConsultation }) {
  const [filter, setFilter] = useState('ALL');
  const shown = filter === 'ALL' ? appointments : appointments.filter((item) => item.status === filter);
  return <><PageHeading eyebrow="PATIENT SCHEDULE" title="Appointments" description="Review your schedule and record the outcome of each visit."/><div className="segmented-tabs">{['ALL','BOOKED','COMPLETED','CANCELLED'].map((status)=><button key={status} className={filter===status?'selected':''} onClick={()=>setFilter(status)}>{status==='ALL'?'All visits':status.charAt(0)+status.slice(1).toLowerCase()}</button>)}</div>{shown.length?<AppointmentTable appointments={shown} mode="doctor" onCancel={onCancel} onComplete={onComplete} onConsultation={onConsultation}/>:<EmptyState icon={CalendarDays} title="No appointments here" description="Visits matching this filter will appear here."/>}</>;
}

export function ConsultationDialog({ appointment, onClose, onSave }) {
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.consultation(appointment.id).then((record) => {
      setNotes(record.consultationNotes || '');
      setPrescription(record.prescriptionDetails || '');
    }).catch(() => {});
  }, [appointment.id]);
  async function submit(event) {
    event.preventDefault(); setSaving(true); setMessage('');
    try { await onSave(appointment.id, { consultationNotes: notes, prescriptionDetails: prescription }); setMessage('Consultation saved.'); }
    catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="consult-title"><div className="modal-head"><div><div className="eyebrow">PATIENT CONSULTATION</div><h2 id="consult-title">Visit notes</h2></div><button className="icon-button modal-close" onClick={onClose} aria-label="Close">×</button></div><div className="consult-patient"><span className="table-avatar">{appointment.patient?.user?.name?.charAt(0)}</span><span><b>{appointment.patient?.user?.name}</b><small>{appointment.appointmentDate} · {appointment.appointmentTime?.slice(0,5)}</small></span></div><form className="form-stack" onSubmit={submit}><label>Consultation notes<textarea rows="4" value={notes} onChange={(event)=>setNotes(event.target.value)} placeholder="Symptoms, observations, and care plan" required /></label><label>Prescription details<textarea rows="3" value={prescription} onChange={(event)=>setPrescription(event.target.value)} placeholder="Medicine name, dosage, and duration" /></label>{message && <div className={message.includes('saved')?'success-message':'inline-error'}>{message}</div>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Close</button><button className="button button-dark" disabled={saving}>{saving?'Saving…':'Save notes'} <Check size={15}/></button></div></form></section></div>;
}

function greeting(){const hour=new Date().getHours();return hour<12?'morning':hour<18?'afternoon':'evening';}
