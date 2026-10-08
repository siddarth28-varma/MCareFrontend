import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, HeartPulse, LoaderCircle } from 'lucide-react';
import AppShell from './components/AppShell';
import { api } from './services/api';
import { HomePage, LoginPage, RegisterPage } from './pages/AuthPages';
import { BookAppointmentPage, DoctorsPage, DoctorDetailsPage, MyAppointmentsPage, PatientDashboard, ProfilePage } from './pages/PatientPages';
import { ConsultationDialog, DoctorAppointmentsPage, DoctorDashboard } from './pages/DoctorPages';
import { AdminDashboard, ManageAppointmentsPage, ManageDoctorsPage, ManagePatientsPage } from './pages/AdminPages';

const emptyData = { doctors: [], appointments: [], patients: [], summary: {}, profile: null };

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medicare-user')) || null; }
    catch { return null; }
  });
  const [view, setView] = useState(() => localStorage.getItem('medicare-user') ? 'dashboard' : 'home');
  const [data, setData] = useState(emptyData);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [authError, setAuthError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const refresh = useCallback(async (activeUser = user) => {
    if (!activeUser) return;
    setPageLoading(true);
    setGlobalError('');
    try {
      const doctors = await api.doctors();
      let profile = null;
      let appointments = [];
      let patients = [];
      let summary = {};
      if (activeUser.role === 'PATIENT') {
        profile = await api.patientForUser(activeUser.id);
        appointments = await api.patientAppointments(profile.id);
        activeUser.profileId = profile.id;
        localStorage.setItem('medicare-user', JSON.stringify(activeUser));
      } else if (activeUser.role === 'DOCTOR') {
        profile = await api.doctorForUser(activeUser.id);
        appointments = await api.doctorAppointments(profile.id);
        activeUser.profileId = profile.id;
        localStorage.setItem('medicare-user', JSON.stringify(activeUser));
      } else {
        [appointments, patients, summary] = await Promise.all([api.appointments(), api.patients(), api.summary()]);
      }
      setData({ doctors, appointments, patients, summary, profile });
    } catch (error) {
      setGlobalError(error.message || 'Could not connect to the MediCare API.');
    } finally { setPageLoading(false); }
  }, [user]);

  useEffect(() => { if (user) refresh(user); }, [user, refresh]);

  async function login(event) {
    event.preventDefault(); setLoading(true); setAuthError('');
    const form = new FormData(event.currentTarget);
    try {
      const loggedIn = await api.login({ email: form.get('email'), password: form.get('password') });
      localStorage.setItem('medicare-user', JSON.stringify(loggedIn));
      setUser(loggedIn); setView('dashboard');
    } catch (error) { setAuthError(error.message); }
    finally { setLoading(false); }
  }

  async function register(event) {
    event.preventDefault(); setLoading(true); setAuthError('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const created = await api.register(payload);
      const loggedIn = await api.login({ email: created.email, password: payload.password });
      localStorage.setItem('medicare-user', JSON.stringify(loggedIn));
      setUser(loggedIn); setView('dashboard');
    } catch (error) { setAuthError(error.message); }
    finally { setLoading(false); }
  }

  function logout() {
    localStorage.removeItem('medicare-user'); setUser(null); setData(emptyData); setView('home'); setGlobalError('');
  }

  function bookDoctor(doctor) { setSelectedDoctor(doctor); setView('book'); }

  async function cancelAppointment(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await api.cancel(id); await refresh(); }
    catch (error) { setGlobalError(error.message); }
  }

  async function completeAppointment(id) {
    try { await api.complete(id); await refresh(); }
    catch (error) { setGlobalError(error.message); }
  }

  async function saveConsultation(id, details) {
    await api.saveConsultation(id, details);
    await api.complete(id);
    setConsultation(null);
    await refresh();
  }

  async function saveDoctor(id, details) {
    if (id) await api.updateDoctor(id, details);
    else await api.addDoctor(details);
    await refresh();
  }

  async function deleteDoctor(id) {
    if (!window.confirm('Delete this doctor profile?')) return;
    try { await api.deleteDoctor(id); await refresh(); }
    catch (error) { setGlobalError(error.message); }
  }

  async function savePatient(details) {
    const updated = await api.updatePatient(data.profile.id, details);
    setData((current) => ({ ...current, profile: updated }));
  }

  if (!user) {
    if (view === 'login') return <LoginPage onSubmit={login} onBack={setView} error={authError} loading={loading} />;
    if (view === 'register') return <RegisterPage onSubmit={register} onBack={setView} error={authError} loading={loading} />;
    return <HomePage onLogin={() => { setAuthError(''); setView('login'); }} onRegister={() => { setAuthError(''); setView('register'); }} />;
  }

  const navigate = (next) => { setView(next); setGlobalError(''); };
  let content;
  if (pageLoading && !data.profile && user.role !== 'ADMIN') {
    content = <div className="loading-state"><LoaderCircle className="spin" size={24}/><span>Preparing your workspace…</span></div>;
  } else if (user.role === 'PATIENT') {
    if (view === 'doctors') content = <DoctorsPage doctors={data.doctors} onDoctor={(doctor) => { setSelectedDoctor(doctor); navigate('doctor-details'); }} onBook={bookDoctor} />;
    else if (view === 'doctor-details') content = <DoctorDetailsPage doctor={selectedDoctor} onBack={() => navigate('doctors')} onBook={bookDoctor} />;
    else if (view === 'book') content = <BookAppointmentPage user={user} doctor={selectedDoctor} doctors={data.doctors} onBack={() => navigate(selectedDoctor ? 'doctor-details' : 'doctors')} onBooked={async () => { await refresh(); navigate('appointments'); }} />;
    else if (view === 'appointments') content = <MyAppointmentsPage appointments={data.appointments} onCancel={cancelAppointment} />;
    else if (view === 'profile') content = data.profile ? <ProfilePage patient={data.profile} onSave={savePatient} /> : <Loading />;
    else content = <PatientDashboard user={user} data={{ ...data, onCancel: cancelAppointment }} onNavigate={navigate} onDoctor={(doctor) => { setSelectedDoctor(doctor); navigate('doctor-details'); }} onBook={bookDoctor} />;
  } else if (user.role === 'DOCTOR') {
    if (view === 'doctor-appointments') content = <DoctorAppointmentsPage appointments={data.appointments} onCancel={cancelAppointment} onComplete={completeAppointment} onConsultation={setConsultation} />;
    else if (view === 'profile') content = <DoctorProfile profile={data.profile} onSave={async (updated) => { await api.updateDoctor(data.profile.id, updated); await refresh(); }} />;
    else content = <DoctorDashboard user={user} data={data} onNavigate={navigate} onConsultation={setConsultation} onComplete={completeAppointment} />;
  } else {
    if (view === 'manage-doctors') content = <ManageDoctorsPage doctors={data.doctors} onSave={saveDoctor} onDelete={deleteDoctor} />;
    else if (view === 'manage-patients') content = <ManagePatientsPage patients={data.patients} />;
    else if (view === 'manage-appointments') content = <ManageAppointmentsPage appointments={data.appointments} />;
    else content = <AdminDashboard summary={data.summary} onNavigate={navigate} />;
  }

  return <AppShell user={user} view={view} onNavigate={navigate} onLogout={logout}>
    {globalError && <div className="connection-banner"><AlertCircle size={17}/><span>{globalError}</span><button onClick={() => refresh()}>Retry</button></div>}
    {content}
    {consultation && <ConsultationDialog key={consultation.id} appointment={consultation} onClose={() => setConsultation(null)} onSave={saveConsultation} />}
  </AppShell>;
}

function Loading() { return <div className="loading-state"><LoaderCircle className="spin" size={24}/><span>Loading profile…</span></div>; }

function DoctorProfile({ profile, onSave }) {
  const [message, setMessage] = useState('');
  if (!profile) return <Loading />;
  async function submit(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try {
      await onSave({ name: profile.user.name, email: profile.user.email, specialization: form.get('specialization'), qualification: form.get('qualification'), phone: form.get('phone'), availableDays: form.get('availableDays'), startTime: form.get('startTime'), endTime: form.get('endTime') });
      setMessage('Profile saved.');
    } catch (error) { setMessage(error.message); }
  }
  return <><div className="page-heading"><div><div className="eyebrow">PROFESSIONAL DETAILS</div><h1>Doctor profile</h1><p>Update your specialty and the hours patients can book.</p></div></div><form className="profile-form panel" onSubmit={submit}><div className="profile-heading"><span className="avatar avatar-large">{profile.user.name.charAt(0)}</span><span><b>{profile.user.name}</b><small>{profile.user.email}</small></span></div><div className="form-row"><label>Specialization<input name="specialization" defaultValue={profile.specialization} required/></label><label>Qualification<input name="qualification" defaultValue={profile.qualification}/></label></div><div className="form-row"><label>Phone<input name="phone" defaultValue={profile.phone}/></label><label>Available days<input name="availableDays" defaultValue={profile.availableDays}/></label></div><div className="form-row"><label>Start time<input type="time" name="startTime" defaultValue={profile.startTime?.slice(0,5)}/></label><label>End time<input type="time" name="endTime" defaultValue={profile.endTime?.slice(0,5)}/></label></div>{message&&<p className={message.includes('saved')?'success-message':'inline-error'}>{message}</p>}<button className="button button-dark">Save profile</button></form></>;
}
