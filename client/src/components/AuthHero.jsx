import React from 'react';

const LogoMark = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 22h20L12 2z" fill="url(#gradHero)" />
    <path d="M12 10l-5 10h10l-5-10z" fill="#020617" />
    <defs>
      <linearGradient id="gradHero" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2DD4BF" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function AuthHero() {
  return (
    <div className="auth-left">
      <div className="auth-brand animate-stagger-1">
        <LogoMark />
        <span className="brand-text">Ascend</span>
      </div>

      <div className="auth-hero-content">
        <div className="auth-badge animate-stagger-1">
          <span className="pulse-dot"></span> Ascend Intelligence 2.0
        </div>
        <h1 className="auth-hero-title animate-stagger-2">
          Brutal intelligence,<br />
          <span className="text-gradient">for your tech career.</span>
        </h1>
        <p className="auth-hero-sub animate-stagger-3">
          Ascend delivers deterministic resume parsing, real-time market fit analysis, and unvarnished interview simulation. Data-driven career acceleration without the fluff.
        </p>

        <div className="auth-live-preview animate-stagger-4">
          <div className="auth-preview-card">
            <div className="card-scanner scanner-teal">
              <div className="scanner-fade"></div>
              <div className="scanner-line"></div>
            </div>
            <div className="preview-header">
              <div className="preview-icon icon-teal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <span className="preview-label">Resume Score</span>
            </div>
            <div className="preview-value-group">
              <span className="preview-value-old">48</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              <span className="preview-value-new text-teal">92</span>
            </div>
            <div className="preview-bar"><div className="preview-progress prog-teal" style={{'--target-width': '92%'}}></div></div>
          </div>
          
          <div className="auth-preview-card">
            <div className="card-scanner scanner-blue" style={{ animationDelay: '0.5s' }}>
              <div className="scanner-fade"></div>
              <div className="scanner-line"></div>
            </div>
            <div className="preview-header">
              <div className="preview-icon icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <span className="preview-label">Market Fit</span>
            </div>
            <div className="preview-value-group">
              <span className="preview-value-old">Top 40%</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              <span className="preview-value-new text-blue">Top 5%</span>
            </div>
            <div className="preview-bar"><div className="preview-progress prog-blue" style={{'--target-width': '95%'}}></div></div>
          </div>
          
          <div className="auth-preview-card" style={{ animationDelay: '1s' }}>
            <div className="card-scanner scanner-purple" style={{ animationDelay: '1s' }}>
              <div className="scanner-fade"></div>
              <div className="scanner-line"></div>
            </div>
            <div className="preview-header">
              <div className="preview-icon icon-purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </div>
              <span className="preview-label">Interview Score</span>
            </div>
            <div className="preview-value-group">
              <span className="preview-value-old">65</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              <span className="preview-value-new text-purple">88</span>
            </div>
            <div className="preview-bar"><div className="preview-progress prog-purple" style={{'--target-width': '88%'}}></div></div>
          </div>
        </div>
      </div>

      <div className="auth-trust animate-stagger-5">
        <div className="trust-item">
          <CheckIcon />
          <span>Deterministic scoring</span>
        </div>
        <div className="trust-item">
          <CheckIcon />
          <span>Real-time intelligence</span>
        </div>
        <div className="trust-item">
          <CheckIcon />
          <span>Multi-engine analysis</span>
        </div>
      </div>
    </div>
  );
}
