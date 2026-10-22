import { useState } from 'react';
import logoImg from '../assets/BUILDWITHGEEKS LOGO.png';
import { ACCOUNTS } from '../data/accounts';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const acc = ACCOUNTS.find((a) => a.email === email.trim().toLowerCase() && a.password === password);
    if (!acc) return setError('Email or password is wrong.');
    onLogin(acc);
  };

  return (
    <div className="login">
      <section className="login-brand">
        <div className="brand-row">
          <img src={logoImg} alt="GreenPulse" style={{ height: '34px', width: 'auto', display: 'block' }} />
          <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500 }}>for Sime Darby Property</span>
        </div>
        <div>
          <h1>Run the site on sun and battery. Keep the genset off.</h1>
          <p>Daily power plan for the M&E team, DOE noise logs for the Environmental Officer, and diesel savings for HQ. Works on top of the IESS and Solis systems already on site.</p>
        </div>
      </section>
      <main className="login-form">
        <h2>Log in</h2>
        <form onSubmit={submit} noValidate>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
          {error && <div className="err" role="alert">{error}</div>}
          <button id="login-submit" className="btn btn-primary" type="submit">Log in</button>
        </form>
        <div className="demo-head">Demo accounts</div>
        <div className="demo">
          {ACCOUNTS.map((a) => (
            <button key={a.role} id={`demo-${a.role}`} type="button" onClick={() => onLogin(a)}>
              <span><b>{a.title}</b><small>{a.org}</small></span>
              <small>{a.home} →</small>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
