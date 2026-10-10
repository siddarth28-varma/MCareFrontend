import React from 'react';
import { ArrowRight, CalendarCheck, ShieldCheck, Stethoscope } from 'lucide-react';
import { PublicHeader } from '../components/AppShell';

export function HomePage({ onLogin, onRegister }) {
  return <div className="public-page">
    <PublicHeader onLogin={onLogin} onRegister={onRegister} />
    <main className="home-hero">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> HEALTHCARE, THOUGHTFULLY CONNECTED</div>
        <h1>Good care starts<br />with <em>being heard.</em></h1>
        <p className="hero-description">A calmer way to manage appointments, meet your doctor, and keep your care in one place.</p>
        <div className="hero-actions"><button className="button button-dark" onClick={onRegister}>Get started <ArrowRight size={17} /></button><button className="text-button" onClick={onLogin}>I already have an account</button></div>
        <div className="hero-proof"><span><ShieldCheck size={17} /> Private by design</span><span><CalendarCheck size={17} /> Simple scheduling</span></div>
      </div>
      <div className="hero-visual"><div className="visual-backdrop" />
        <div className="visual-label"><span className="visual-cross"><Stethoscope size={18} /></span><span><b>Care, connected.</b><small>Everything in its right place.</small></span></div>
        <div className="visual-note"><div className="note-head"><span className="note-icon"><CalendarCheck size={17} /></span><span className="note-overline">YOUR NEXT STEP</span><span className="note-dot" /></div><strong>Appointments,<br />made simple.</strong><p>Find a specialist and choose a time that works for you.</p><button className="note-link" onClick={onRegister}>Explore MediCare <ArrowRight size={15} /></button></div>
        <div className="hero-ring ring-one" /><div className="hero-ring ring-two" /><span className="hero-spark spark-a">+</span><span className="hero-spark spark-b">+</span>
      </div>
      <div className="hero-footer"><span>CARE THAT FITS REAL LIFE</span><span>01 — 03</span></div>
    </main>
  </div>;
}

export function LoginPage({ onSubmit, onBack, error, loading }) {
  return <AuthLayout title="Welcome back" intro="Sign in to continue to your care workspace." onBack={onBack}>
    <form className="form-stack" onSubmit={onSubmit}>
      <label>Email address<input name="email" type="email" placeholder="you@example.com" required autoComplete="email" /></label>
      <label>Password<input name="password" type="password" placeholder="Enter your password" required autoComplete="current-password" /></label>
      <p className="form-hint">Sign in with the credentials provided for your account.</p>
      {error && <div className="inline-error">{error}</div>}
      <button className="button button-dark button-wide" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} /></button>
    </form>
    <p className="auth-switch">New to MediCare? <button onClick={() => onBack('register')}>Create an account</button></p>
  </AuthLayout>;
}

export function RegisterPage({ onSubmit, onBack, error, loading }) {
  return <AuthLayout title="Your care, in one place" intro="Create a patient account to find a doctor and book your first visit." onBack={onBack}>
    <form className="form-stack" onSubmit={onSubmit}>
      <label>Full name<input name="name" placeholder="e.g. Asha Kumar" required autoComplete="name" /></label>
      <label>Email address<input name="email" type="email" placeholder="you@example.com" required autoComplete="email" /></label>
      <div className="form-row"><label>Phone<input name="phone" type="tel" placeholder="Phone number" /></label><label>Date of birth<input name="dateOfBirth" type="date" /></label></div>
      <label>Password<input name="password" type="password" minLength="12" maxLength="72" placeholder="At least 12 characters" required autoComplete="new-password" /></label>
      <label>Gender<select name="gender" defaultValue=""><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></label>
      {error && <div className="inline-error">{error}</div>}
      <button className="button button-dark button-wide" disabled={loading}>{loading ? 'Creating account…' : 'Create patient account'} <ArrowRight size={16} /></button>
    </form>
    <p className="auth-switch">Already registered? <button onClick={() => onBack('login')}>Sign in</button></p>
  </AuthLayout>;
}

function AuthLayout({ title, intro, children, onBack }) {
  return <div className="auth-page"><div className="auth-left"><PublicHeader onLogin={() => onBack('login')} onRegister={() => onBack('register')} /><div className="auth-aside"><div className="auth-aside-mark"><Stethoscope size={22} /></div><div className="eyebrow">A LITTLE MORE HUMAN</div><h2>Care is a<br /><em>conversation.</em></h2><p>MediCare brings patients and doctors together with a little more clarity, and a lot less hassle.</p><span className="auth-aside-rule" /></div><div className="auth-legal">MediCare <span>·</span> Student healthcare management project</div></div>
    <main className="auth-main"><div className="auth-card"><button className="back-link" onClick={() => onBack('home')}>← Back to home</button><div className="eyebrow">PATIENT & STAFF PORTAL</div><h1>{title}</h1><p className="auth-intro">{intro}</p>{children}</div></main></div>;
}
