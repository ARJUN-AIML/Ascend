import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthHero from '../components/AuthHero';
import api from '../services/api';
import './Auth.css';

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
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

export default function Signup() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [serverStatus, setServerStatus] = useState('Waking Up'); // Waking Up | Online | Offline

  const { register } = useContext(AuthContext);
  const navigate     = useNavigate();

  useEffect(() => {
    api.get('/api/health', { timeout: 5000 })
      .then(() => setServerStatus('Online'))
      .catch(() => setServerStatus('Offline'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true); setError('');
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      console.error('Signup Error:', err);
      let msg = err.customMessage || err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-server-status">
        <div className="status-pill">
          <div className="status-dot" style={{ 
            background: serverStatus === 'Online' ? '#10B981' : serverStatus === 'Waking Up' ? '#FBBF24' : '#EF4444',
            boxShadow: `0 0 8px ${serverStatus === 'Online' ? '#10B981' : serverStatus === 'Waking Up' ? '#FBBF24' : '#EF4444'}`
          }}></div>
          <span className="status-text">{serverStatus}</span>
        </div>
      </div>
      <div className="auth-ambient-bg">
        <div className="cyber-scanline"></div>
        <div className="ai-node n1"></div>
        <div className="ai-node n2"></div>
        <div className="ai-node n3"></div>
        <div className="ai-node n4"></div>
      </div>
      <AuthHero />

      <div className="auth-right">
        <div className="auth-form-container animate-fade-up">
          <div className="auth-form-card premium-glass">
            <div className="auth-form-header">
              <h2 className="auth-form-title">Create your account</h2>
              <p className="auth-form-sub">Join Ascend and turn your career data into your biggest advantage.</p>
            </div>

            {error && (
              <div className="auth-form-error animate-fade-up">
                <IconAlert />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field group">
                <label className="auth-field-label">Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-field-icon"><IconUser /></span>
                  <input
                    type="text"
                    className="auth-field-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="auth-field group">
                <label className="auth-field-label">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-field-icon"><IconMail /></span>
                  <input
                    type="email"
                    className="auth-field-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field group">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-field-icon"><IconLock /></span>
                  <input
                    type="password"
                    className="auth-field-input"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span className="btn-text">{loading ? 'Creating account...' : 'Start Your Ascent'}</span>
                {!loading && <span className="btn-icon"><IconArrow /></span>}
                {loading && <span className="btn-loader"></span>}
              </button>
            </form>
          </div>
          
          <div className="auth-footer animate-fade-up" style={{animationDelay: '0.2s'}}>
            Already have an account? <Link to="/login" className="auth-link">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
