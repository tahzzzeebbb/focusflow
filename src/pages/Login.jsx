import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = isLogin
      ? await login(email, password)
      : await signup(email, password, name);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-panel__brand">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="10" cy="11" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="23" cy="9" r="2.5" fill="var(--signal-500)" />
            <circle cx="22" cy="22" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="9" cy="23" r="2" fill="var(--positive-500)" />
            <path d="M10 11 L23 9 M10 11 L22 22 M22 22 L9 23 M23 9 L22 22" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>
          Cognith
        </div>
        <blockquote className="auth-panel__quote">
          "The graph doesn't just store what we know about ADHD treatment —
          it shows how each piece connects to the next."
        </blockquote>
        <p className="auth-panel__caption">Built on Neo4j · treatment, symptom, and outcome relationships</p>
      </div>

      <div className="auth-form-side">
        <form onSubmit={handleSubmit} className="auth-card" noValidate>
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth-card__subtitle">
            {isLogin ? 'Sign in to continue exploring the graph.' : 'Start tracing treatment-outcome relationships.'}
          </p>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Aisha Khan"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>

          <p className="auth-card__switch">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" className="auth-card__switch-btn" onClick={switchMode}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="auth-card__demo">
            Demo access — <span>admin@adhd.com</span> / <span>admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
