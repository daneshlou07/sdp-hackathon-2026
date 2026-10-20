import { useState } from 'react';
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
          <span className="brand-mark">GP</span>
          <span>GreenPulse for Sime Darby Property</span>
        </div>

        <div>
          <h1>Run the site on sun and battery. Keep the genset off.</h1>
          <p style={{ marginTop: 16, lineHeight: 1.6 }}>
            Autonomous power planning for the M&E team, DOE compliance logging for the Environmental Officer, and ESG cost verification for HQ. Works directly alongside existing IESS and Solis hardware.
          </p>
        </div>

        <div className="login-facts">
          <div>
            <b>100%</b>
            <span>Daytime Clean Energy</span>
          </div>
          <div>
            <b>&lt; 60 dBA</b>
            <span>Boundary Noise Compliance</span>
          </div>
          <div>
            <b>RM 18.7k</b>
            <span>Avg Monthly Site Savings</span>
          </div>
        </div>
      </section>

      <main className="login-form">
        <div style={{ marginBottom: 24 }}>
          <h2>Log in to GreenPulse</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            Select a role below or enter your Sime Darby Property credentials.
          </p>
        </div>

        <form onSubmit={submit} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="e.g. me.manager@simedarbyproperty.demo"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
          />

          {error && <div className="err" role="alert">{error}</div>}

          <button id="login-submit" className="btn btn-primary" type="submit">
            Log in to Dashboard
          </button>
        </form>

        <div className="demo-head">Quick Demo Profiles (1-Click Access)</div>
        <div className="demo">
          {ACCOUNTS.map((a) => (
            <button
              key={a.role}
              id={`demo-${a.role}`}
              type="button"
              onClick={() => onLogin(a)}
              className="demo-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: '18px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.05)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {a.icon}
                </span>
                <div>
                  <b style={{ fontSize: '14px', color: 'var(--ink)' }}>{a.title}</b>
                  <small style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>{a.org}</small>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--ink-2)',
                    backgroundColor: '#f1f5f9',
                    padding: '3px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {a.home}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>→</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
