import { useState } from 'react';
import logoImg from '../assets/BUILDWITHGEEKS LOGO.png';
import { ACCOUNTS } from '../data/accounts';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const acc = ACCOUNTS.find(
      (a) => a.email === email.trim().toLowerCase() && a.password === password
    );
    if (!acc) return setError('Email or password is wrong.');
    onLogin(acc);
  };

  return (
    <div className="login">
      {/* Left Panel (Dark Blue Background - patterns removed) */}
      <section className="login-brand">
        <div>
          <h1>Run the site on sun and battery. Keep the genset off.</h1>
          <p>
            Daily power plan for the M&E team, DOE noise logs for the Environmental Officer,
            and diesel savings for HQ. Works on top of the IESS and Solis systems already on site.
          </p>
        </div>

        {/* Center Wave Separator (inspired by bwell) */}
        <div className="login-wave-divider" aria-hidden="true">
          <svg viewBox="0 0 120 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,0 C45,160 65,300 28,500 C-5,660 60,820 20,1000 L120,1000 L120,0 Z"
              fill="rgba(255, 255, 255, 0.04)"
            />
            <path
              d="M18,0 C72,180 92,340 48,500 C12,680 80,830 36,1000 L120,1000 L120,0 Z"
              fill="#f8fafc"
            />
          </svg>
        </div>

        <div className="login-wave-mobile" aria-hidden="true">
          <svg viewBox="0 0 1000 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,0 C220,50 420,15 620,55 C820,75 920,25 1000,45 L1000,70 L0,70 Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* Right Panel with prominent Logo & Login Card */}
      <main className="login-form login-form-panel">
        <div className="login-card">
          {/* Prominent Large Logo at Top-Center */}
          <div className="login-logo-container">
            <img
              src={logoImg}
              alt="GreenPulse"
              className="login-large-logo"
            />
            <div className="login-logo-sub">
              for Sime Darby Property
            </div>
          </div>

          <div className="login-card-header">
            <h2>Log in</h2>
          </div>

          <form onSubmit={submit} noValidate>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />
            {error && (
              <div className="err" role="alert">
                {error}
              </div>
            )}
            {/* Original Button */}
            <button id="login-submit" className="btn btn-primary" type="submit">
              Log in
            </button>
          </form>

          {/* Old Demo Accounts Design */}
          <div className="demo-head">Demo accounts</div>
          <div className="demo">
            {ACCOUNTS.map((a) => (
              <button
                key={a.role}
                id={`demo-${a.role}`}
                type="button"
                onClick={() => onLogin(a)}
              >
                <span>
                  <b>{a.title}</b>
                  <small>{a.org}</small>
                </span>
                <small>{a.home} →</small>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

