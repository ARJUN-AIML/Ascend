import React, { useEffect, useState } from 'react';
import AuthForm from '../components/AuthForm';
import AuthHero from '../components/AuthHero';
import api from '../services/api';
import './Auth.css';

export default function Login() {
  const [serverStatus, setServerStatus] = useState('Waking Up'); // Waking Up | Online | Offline

  useEffect(() => {
    api.get('/api/health', { timeout: 5000 })
      .then(() => setServerStatus('Online'))
      .catch(() => setServerStatus('Offline'));
  }, []);


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
      <AuthForm />
    </div>
  );
}
