import React, { useEffect, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, HeartPulse, Search, Stethoscope, UserRound } from 'lucide-react';
import { api } from '../services/api';
import { DoctorCard, EmptyState, PageHeading, StatCard, StatusBadge } from '../components/UI';

export function PatientDashboard({ user, data, onNavigate, onDoctor, onBook }) {
  const upcoming = data.appointments.filter((item) => item.status === 'BOOKED' && item.appointmentDate >= new Date().toISOString().slice(0, 10)).slice(0, 3);
  return <>
    <PageHeading eyebrow="PATIENT OVERVIEW" title={`Good ${greeting()}, ${user.name?.split(' ')[0] || 'there'}.`} description="Your care plan, at a glance." action={<button className="button button-dark" onClick={() => onNavigate('doctors')}><Stethoscope size={16} /> Find a doctor</button>} />
    <section className="stat-grid"><StatCard label="Upcoming visits" value={upcoming.length} detail="Your next steps in care" icon={CalendarDays} /><StatCard label="Care history" value={data.appointments.length} detail="Appointments on your record" icon={Activity} tone="blue" /><StatCard label="Available doctors" value={data.doctors.length} detail="Specialists ready to help" icon={Stethoscope} tone="peach" /></section>
    <section className="content-section"><div className="section-heading"><div><div className="eyebrow">COMING UP</div><h2>Your next appointments</h2></div><button className="text-button" onClick={() => onNavigate('appointments')}>View all <ArrowRight size={15} /></button></div>
      {upcoming.length ? <AppointmentTable appointments={upcoming} mode="patient" onCancel={data.onCancel} /> : <EmptyState icon={CalendarDays} title="Nothing on the calendar" description="When you book a visit, the details will show up here." action={<button className="text-button" onClick={() => onNavigate('doctors')}>Meet our doctors <ArrowRight size={15} /></button>} />}
    </section>
    <section className="content-section doctor-feature"><div className="section-heading"><div><div className="eyebrow">HERE WHEN YOU NEED US</div><h2>Meet your care team</h2></div><button className="text-button" onClick={() => onNavigate('doctors')}>Browse all doctors <ArrowRight size={15} /></button></div><div className="doctor-grid compact-grid">{data.doctors.slice(0, 3).map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} onSelect={onDoctor} onBook={onBook} />)}</div></section>
  </>;
}

export function DoctorsPage({ doctors, onDoctor, onBook }) {
  const [query, setQuery] = useState('');
  const shown = doctors.filter((doctor) => `${doctor.specialization} ${doctor.user?.name}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading eyebrow="YOUR CARE TEAM" title="Find your doctor" description="Browse experienced specialists and choose the right care for you." />
    <div className="search-toolbar"><label className="search-input"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by doctor or specialization" /><kbd>⌕</kbd></label><span>{shown.length} {shown.length === 1 ? 'doctor' : 'doctors'}</span></div>
    {shown.length ? <div className="doctor-grid">{shown.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} onSelect={onDoctor} onBook={onBook} />)}</div> : <EmptyState icon={Search} title="No matching doctors" description="Try another name or specialization." />}
  </>;
}

export function DoctorDetailsPage({ doctor, onBack, onBook }) {
  if (!doctor) return <EmptyState icon={Stethoscope} title="Doctor not found" description="Choose someone from the doctor directory." action={<button className="text-button" onClick={onBack}><ArrowLeft size={15} /> Back to doctors</button>} />;
  return <><button className="back-link page-back" onClick={onBack}><ArrowLeft size={15} /> All doctors</button><div className="doctor-detail-hero"><div className="doctor-avatar doctor-avatar-large">{doctor.user?.name?.replace('Dr. ', '').split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="doctor-detail-copy"><div className="eyebrow">SPECIALIST PROFILE</div><h1>{doctor.user?.name}</h1><p>{doctor.specialization} <span>·</span> {doctor.qualification}</p><div className="availability-tag"><i /> Accepting appointments</div></div><button className="button button-dark" onClick={() => onBook(doctor)}><CalendarDays size={16} /> Book an appointment</button></div>
    <div className="detail-columns"><section className="detail-panel"><div className="eyebrow">AVAILABILITY</div><h2>Plan a visit</h2><div className="detail-line"><span><Clock3 size={17} /> Consultation hours</span><b>{doctor.startTime?.slice(0, 5)} – {doctor.endTime?.slice(0, 5)}</b></div><div className="detail-line"><span><CalendarDays size={17} /> Clinic days</span><b>{doctor.availableDays || 'Weekdays'}</b></div><div className="detail-line"><span><UserRound size={17} /> Specialty</span><b>{doctor.specialization}</b></div></section><section className="detail-panel detail-note"><span className="detail-note-icon"><HeartPulse size={20} /></span><h2>Care that starts with listening.</h2><p>Choose a time that works for you. Your appointment details will be available in your patient dashboard.</p></section></div>
  </>;
}

export function BookAppointmentPage({ user, doctor, doctors, onBack, onBooked }) {
  const [doctorId, setDoctorId] = useState(doctor?.id || '');
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setTime('');
    if (!doctorId || !date) { setSlots([]); return; }
    api.slots(doctorId, date).then(setSlots).catch((reason) => setError(reason.message));
  }, [doctorId, date]);
  const selectedDoctor = doctors.find((item) => String(item.id) === String(doctorId));
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await api.book({ patientId: user.profileId, doctorId: Number(doctorId), appointmentDate: date, appointmentTime: time });
      await onBooked();
    } catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  return <><button className="back-link page-back" onClick={onBack}><ArrowLeft size={15} /> Back</button><PageHeading eyebrow="NEW APPOINTMENT" title="Book a visit" description="Choose a specialist, date, and available time." />
    <form className="booking-layout" onSubmit={submit}><section className="booking-form panel"><label>Choose a doctor<select value={doctorId} onChange={(event) => setDoctorId(event.target.value)} required><option value="">Select a specialist</option>{doctors.map((item) => <option value={item.id} key={item.id}>{item.user?.name} · {item.specialization}</option>)}</select></label>
      {selectedDoctor && <div className="booking-doctor"><span className="doctor-avatar">{selectedDoctor.user?.name?.replace('Dr. ', '').split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span><b>{selectedDoctor.user?.name}</b><small>{selectedDoctor.specialization}</small></span><Check size={17} /></div>}
      <label>Choose a date<input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
      <div className="slot-label"><span>Available times</span><small>1 hour appointment</small></div>
      {slots.length ? <div className="slot-grid">{slots.map((slot) => <button type="button" className={`slot-button ${time === slot ? 'selected' : ''}`} key={slot} onClick={() => setTime(slot)}>{slot.slice(0, 5)}</button>)}</div> : <p className="no-slots">{doctorId ? 'No available times for this date. Please choose another day.' : 'Choose a doctor to see available times.'}</p>}
      {error && <div className="inline-error">{error}</div>}<button className="button button-dark button-wide" disabled={!time || busy}>{busy ? 'Confirming…' : 'Confirm appointment'} <ArrowRight size={16} /></button>
    </section><aside className="booking-aside"><div className="eyebrow">YOUR VISIT</div><h2>A little preparation goes a long way.</h2><p>Your appointment will appear in My appointments once confirmed. You can cancel it there if plans change.</p><div className="aside-rule" /><div className="aside-detail"><CalendarDays size={16} /><span><b>Appointment date</b><small>{date ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}</small></span></div><div className="aside-detail"><Clock3 size={16} /><span><b>Selected time</b><small>{time ? time.slice(0, 5) : 'Choose a slot'}</small></span></div></aside></form>
  </>;
}

export function MyAppointmentsPage({ appointments, onCancel }) {
  const [filter, setFilter] = useState('ALL');
  const shown = filter === 'ALL' ? appointments : appointments.filter((item) => item.status === filter);
  return <><PageHeading eyebrow="YOUR CARE HISTORY" title="My appointments" description="Keep track of upcoming visits and past care." /><div className="segmented-tabs">{['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'].map((status) => <button key={status} className={filter === status ? 'selected' : ''} onClick={() => setFilter(status)}>{status === 'ALL' ? 'All visits' : status.charAt(0) + status.slice(1).toLowerCase()}</button>)}</div>{shown.length ? <AppointmentTable appointments={shown} mode="patient" onCancel={onCancel} /> : <EmptyState icon={CalendarDays} title="No appointments here" description="Appointments matching this filter will appear here." />}</>;
}

export function ProfilePage({ patient, onSave }) {
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try { await onSave({ ...patient, user: { ...patient.user, name: form.get('name') }, phone: form.get('phone'), dateOfBirth: form.get('dateOfBirth'), gender: form.get('gender') }); setMessage('Profile saved.'); }
    catch (error) { setMessage(error.message); }
  }
  return <><PageHeading eyebrow="PERSONAL DETAILS" title="My profile" description="Keep your contact and patient details up to date."/><form className="profile-form panel" onSubmit={submit}><div className="profile-heading"><span className="avatar avatar-large">{patient.user?.name?.charAt(0)}</span><span><b>{patient.user?.name}</b><small>Patient account · {patient.user?.email}</small></span></div><div className="form-row"><label>Full name<input name="name" defaultValue={patient.user?.name} required /></label><label>Email<input value={patient.user?.email || ''} disabled /></label></div><div className="form-row"><label>Phone<input name="phone" defaultValue={patient.phone || ''} /></label><label>Date of birth<input type="date" name="dateOfBirth" defaultValue={patient.dateOfBirth || ''} /></label></div><label>Gender<select name="gender" defaultValue={patient.gender || ''}><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></label>{message && <p className={message.includes('saved') ? 'success-message' : 'inline-error'}>{message}</p>}<button className="button button-dark">Save profile <Check size={16}/></button></form></>;
}

function AppointmentTable({ appointments, mode, onCancel, onComplete, onConsultation }) {
  const isDoctor = mode === 'doctor';
  return <div className="table-wrap"><table><thead><tr><th>{isDoctor ? 'PATIENT' : 'DOCTOR'}</th><th>SPECIALIZATION</th><th>DATE & TIME</th><th>STATUS</th>{mode !== 'admin' && <th className="align-right">ACTION</th>}</tr></thead><tbody>{appointments.map((item) => <tr key={item.id}><td><div className="table-person"><span className="table-avatar">{(isDoctor ? item.patient?.user?.name : item.doctor?.user?.name)?.charAt(0)}</span><span><b>{isDoctor ? item.patient?.user?.name : item.doctor?.user?.name}</b><small>{mode === 'admin' ? `Patient: ${item.patient?.user?.name}` : isDoctor ? item.patient?.user?.email : item.doctor?.qualification}</small></span></div></td><td>{item.doctor?.specialization}</td><td><b>{new Date(`${item.appointmentDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</b><small className="table-subline">{item.appointmentTime?.slice(0, 5)}</small></td><td><StatusBadge status={item.status} /></td>{mode !== 'admin' && <td className="align-right">{mode === 'patient' && item.status === 'BOOKED' ? <button className="table-action danger-text" onClick={() => onCancel(item.id)}>Cancel</button> : isDoctor && item.status === 'BOOKED' ? <div className="table-actions"><button className="table-action" onClick={() => onConsultation(item)}>Notes</button><button className="table-action" onClick={() => onComplete(item.id)}>Complete</button></div> : <span className="muted">—</span>}</td>}</tr>)}</tbody></table></div>;
}

export { AppointmentTable };
function greeting() { const hour = new Date().getHours(); return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'; }
