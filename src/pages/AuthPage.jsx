import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Btn, Inp } from '../components/ui';
import './AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setUser, showToast } = useApp();
  const [mode, setMode] = useState(params.get('mode') === 'login' ? 'login' : 'signup');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', age:'' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Enter your name';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    // Signup: use the name they typed (required field, always present).
    // Login: there's no name field, so derive a display name from their
    // email instead of ever hardcoding a placeholder name.
    const displayName = mode === 'signup'
      ? form.name.trim()
      : form.email.split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

    setUser({ name: displayName, email: form.email });
    showToast(mode === 'signup' ? '🎉 Account created!' : '👋 Welcome back!');
    navigate('/q1');
  };

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  return (
    <div className="screen">
      <div className="screen__scroll">
      <div className="auth__hero">
        <div className="auth__hero-top">
          <div className="auth__logo">🧠 FocusFlow</div>
          <span className="auth__demo-badge">Demo</span>
        </div>
        <h1 className="auth__hero-title">
          {mode === 'signup' ? 'Start your\nADHD journey' : 'Welcome\nback!'}
        </h1>
      </div>

      <div className="auth__form-area">
        {/* Tab toggle */}
        <div className="auth__tabs">
          <button className={`auth__tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Sign Up</button>
          <button className={`auth__tab ${mode === 'login'  ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
        </div>

        <div className="gap-md" style={{ marginBottom: 28 }}>
          {mode === 'signup' && (
            <Inp label="Full name" placeholder="Alex Johnson"
              value={form.name} onChange={e => update('name', e.target.value)}
              error={errors.name} />
          )}
          <Inp label="Email" type="email" placeholder="alex@email.com"
            value={form.email} onChange={e => update('email', e.target.value)}
            error={errors.email} />
          {mode === 'signup' && (
            <div className="ui-field">
              <label className="ui-field__label">Age range</label>
              <select className="ui-field__input" value={form.age}
                onChange={e => update('age', e.target.value)}>
                <option value="">Select age range</option>
                <option value="Child">6–11 (Child)</option>
                <option value="Teen">12–17 (Teen)</option>
                <option value="Undergrad">18–24 (Young Adult)</option>
                <option value="Adult">25+ (Adult)</option>
              </select>
            </div>
          )}
          <Inp label="Password" type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={e => update('password', e.target.value)}
            error={errors.password} />
        </div>

        <Btn onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="animate-spin" style={{display:'inline-block'}}>⏳</span>
            : mode === 'signup' ? 'Create Account & Take Assessment →'
            : 'Sign In →'}
        </Btn>

        {mode === 'login' && (
          <button className="auth__forgot" onClick={() => showToast('📧 Reset link sent!')}>
            Forgot password?
          </button>
        )}

        <p className="auth__demo">
          Demo: <strong>any email</strong> + <strong>123456</strong>
        </p>
      </div>
      </div>
    </div>
  );
}
