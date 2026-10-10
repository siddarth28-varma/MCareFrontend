import React, { useState } from 'react';
import { Activity, CalendarDays, Check, Plus, Stethoscope, Trash2, Users } from 'lucide-react';
import { PageHeading, StatCard, StatusBadge, EmptyState } from '../components/UI';
import { AppointmentTable } from './PatientPages';

export function AdminDashboard({ summary, onNavigate }) {
  return <><PageHeading eyebrow="SYSTEM OVERVIEW" title="Administrator dashboard" description="A clear view of the MediCare community."/><section className="stat-grid"><StatCard label="Registered patients" value={summary.patients ?? '—'} detail="Patient profiles in the system" icon={Users}/><StatCard label="Active doctors" value={summary.doctors ?? '—'} detail="Available care providers" icon={Stethoscope} tone="blue"/><StatCard label="Total appointments" value={summary.appointments ?? '—'} detail={`${summary.booked ?? 0} currently booked`} icon={CalendarDays} tone="peach"/></section><section className="admin-shortcuts"><button onClick={()=>onNavigate('manage-doctors')}><span><Stethoscope size={18}/></span><b>Manage doctors</b><small>Add, update, or remove a doctor</small><i>→</i></button><button onClick={()=>onNavigate('manage-patients')}><span><Users size={18}/></span><b>View patients</b><small>Browse registered patient details</small><i>→</i></button><button onClick={()=>onNavigate('manage-appointments')}><span><Activity size={18}/></span><b>Appointments</b><small>Review the complete schedule</small><i>→</i></button></section></>;
}

export function ManageDoctorsPage({ doctors, onSave, onDelete }) {
  const blank = { name: '', email: '', password: '', specialization: '', qualification: '', phone: '', availableDays: 'MON,TUE,WED,THU,FRI', startTime: '09:00', endTime: '17:00' };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  function startEdit(doctor) {
    setEditing(doctor.id); setError(''); setNotice('');
    setForm({ name: doctor.user.name, email: doctor.user.email, password: '', specialization: doctor.specialization, qualification: doctor.qualification || '', phone: doctor.phone || '', availableDays: doctor.availableDays || '', startTime: doctor.startTime?.slice(0,5) || '09:00', endTime: doctor.endTime?.slice(0,5) || '17:00' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function submit(event) {
    event.preventDefault(); setError(''); setNotice('');
    try { await onSave(editing, form); setNotice(editing ? 'Doctor updated.' : 'Doctor added.'); setEditing(null); setForm(blank); }
    catch (reason) { setError(reason.message); }
  }
  return <><PageHeading eyebrow="CARE TEAM" title="Manage doctors" description="Add doctors to the directory or keep their details current."/><form className="admin-form panel" onSubmit={submit}><div className="panel-heading"><div><div className="eyebrow">{editing?'EDIT PROFILE':'NEW PROFILE'}</div><h2>{editing?'Update doctor':'Add a doctor'}</h2></div>{editing&&<button type="button" className="text-button" onClick={()=>{setEditing(null);setForm(blank);}}>Cancel edit</button>}</div><div className="admin-form-grid"><label>Full name<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Dr. First Last"/></label><label>Email<input required type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="doctor@example.com"/></label>{!editing&&<label>Temporary password<input required minLength={12} maxLength={72} value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} placeholder="At least 12 characters"/></label>}<label>Specialization<input required value={form.specialization} onChange={(e)=>setForm({...form,specialization:e.target.value})} placeholder="e.g. Cardiology"/></label><label>Qualification<input value={form.qualification} onChange={(e)=>setForm({...form,qualification:e.target.value})} placeholder="e.g. MBBS, MD"/></label><label>Phone<input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></label><label>Available days<input value={form.availableDays} onChange={(e)=>setForm({...form,availableDays:e.target.value})} placeholder="MON,TUE,WED"/></label><label>Start time<input type="time" value={form.startTime} onChange={(e)=>setForm({...form,startTime:e.target.value})}/></label><label>End time<input type="time" value={form.endTime} onChange={(e)=>setForm({...form,endTime:e.target.value})}/></label></div>{error&&<div className="inline-error">{error}</div>}{notice&&<div className="success-message">{notice}</div>}<button className="button button-dark"><Plus size={16}/>{editing?'Save changes':'Add doctor'}</button></form><section className="content-section"><div className="section-heading"><div><div className="eyebrow">DIRECTORY</div><h2>{doctors.length} doctors</h2></div></div><div className="table-wrap"><table><thead><tr><th>DOCTOR</th><th>SPECIALIZATION</th><th>CLINIC HOURS</th><th>EMAIL</th><th className="align-right">ACTIONS</th></tr></thead><tbody>{doctors.map((doctor)=><tr key={doctor.id}><td><div className="table-person"><span className="table-avatar">{doctor.user?.name?.charAt(0)}</span><span><b>{doctor.user?.name}</b><small>{doctor.qualification}</small></span></div></td><td>{doctor.specialization}</td><td>{doctor.startTime?.slice(0,5)}–{doctor.endTime?.slice(0,5)}</td><td>{doctor.user?.email}</td><td className="align-right"><div className="table-actions"><button className="table-action" onClick={()=>startEdit(doctor)}>Edit</button><button className="table-action danger-text" title={`Delete ${doctor.user?.name}`} onClick={()=>onDelete(doctor.id)}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div></section></>;
}

export function ManagePatientsPage({ patients }) {
  return <><PageHeading eyebrow="PATIENT DIRECTORY" title="Patients" description="Patient accounts registered with MediCare."/><div className="table-wrap"><table><thead><tr><th>PATIENT</th><th>PHONE</th><th>DATE OF BIRTH</th><th>GENDER</th><th>EMAIL</th></tr></thead><tbody>{patients.map((patient)=><tr key={patient.id}><td><div className="table-person"><span className="table-avatar">{patient.user?.name?.charAt(0)}</span><span><b>{patient.user?.name}</b><small>Patient #{patient.id}</small></span></div></td><td>{patient.phone||'—'}</td><td>{patient.dateOfBirth||'—'}</td><td>{patient.gender||'—'}</td><td>{patient.user?.email}</td></tr>)}</tbody></table></div>{patients.length===0&&<EmptyState icon={Users} title="No patients registered" description="New patient accounts will appear here."/>}</>;
}

export function ManageAppointmentsPage({ appointments }) {
  return <><PageHeading eyebrow="SYSTEM SCHEDULE" title="All appointments" description="Review bookings and visit history across the system."/><AppointmentTable appointments={appointments} mode="admin"/></>;
}
