import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default function AuthForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err);
      // Determine real error message
      let msg = err.customMessage || err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-right">
      <div className="auth-form-container animate-fade-up">
        <div className="auth-form-card premium-glass">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-sub">Sign in to your Ascend account to continue.</p>
          </div>

          {error && (
            <div className="auth-form-error animate-fade-up">
              <IconAlert />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field group">
              <label className="auth-field-label">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-field-icon"><IconMail /></span>
                <input
                  type="email"
                  className="auth-field-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field group">
              <div className="auth-label-row">
                <label className="auth-field-label">Password</label>
                <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-field-icon"><IconLock /></span>
                <input
                  type="password"
                  className="auth-field-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span className="btn-text">{loading ? 'Authenticating...' : 'Sign in to Ascend'}</span>
              {!loading && <span className="btn-icon"><IconArrow /></span>}
              {loading && <span className="btn-loader"></span>}
            </button>
          </form>

        </div>
        
        <div className="auth-footer animate-fade-up" style={{animationDelay: '0.2s'}}>
          Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  );
}
