import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from './Logo';
import './Navbar.css';

export default function Navbar() {
  const { user, logout }       = useContext(AuthContext);
  const location               = useLocation();
  const navigate               = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const avatarLetter = user.name?.[0]?.toUpperCase() || 'A';
  const path         = location.pathname;

  return (
    <nav className="navbar">
      <div className="nav-container">
        
        {/* Brand */}
        <Link to="/" className="nav-logo">
          <Logo size={24} />
          <span className="nav-logo-text">Ascend</span>
        </Link>

        {/* Desktop Links */}
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
          <Link to="/copilot" className={`nav-link ${path === '/copilot' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Career Copilot</Link>
          <Link to="/mock-interview" className={`nav-link ${path === '/mock-interview' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Mock Interview</Link>
          <Link to="/skill-gap" className={`nav-link ${path === '/skill-gap' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Skill Radar</Link>
          
          {/* Mobile Logout inside menu */}
          <button 
            className="nav-logout hide-desktop" 
            style={{ textAlign: 'left', padding: '8px 0', marginTop: '16px', borderTop: '1px solid var(--border)' }}
            onClick={() => { logout(); navigate('/login'); }}
          >
            Logout
          </button>
        </div>

        {/* User Controls */}
        <div className="nav-user" ref={dropdownRef}>
          <button className="nav-bell hover-lift" aria-label="Notifications" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </button>
          <div className="nav-avatar" style={{ cursor: 'pointer', transition: 'transform 0.2s', transform: dropdownOpen ? 'scale(0.95)' : 'scale(1)' }} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {avatarLetter}
          </div>
          {dropdownOpen && (
            <div className="bento-card" style={{ position: 'absolute', top: '56px', right: '0', padding: 'var(--sp-2)', minWidth: '220px', zIndex: 100, animation: 'fadeUp 0.2s ease forwards' }}>
              <div style={{ padding: 'var(--sp-2)', marginBottom: 'var(--sp-2)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{user.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{user.email}</div>
              </div>
              
              <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Settings
              </Link>
              
              <button 
                className="nav-dropdown-item danger" 
                onClick={() => { logout(); navigate('/login'); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="nav-mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
            {mobileMenuOpen 
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>

      </div>
    </nav>
  );
}
