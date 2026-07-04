import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

// ── ICONS ────────────────────────────────────────────────
const IconTarget = () => <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconActivity = () => <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconLock = () => <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconBriefcase = () => <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;

export default function Profile() {
  const { user, updateProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    targetRole: '',
    currentStatus: '',
    weeklyCommitmentHours: 5,
    mainGoal: '',
    location: ''
  });

  const [prefs, setPrefs] = useState({
    theme: true,
    notifications: true,
    emailReminders: false
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        targetRole: user.careerProfile?.targetRole || '',
        currentStatus: user.careerProfile?.currentStatus || '',
        weeklyCommitmentHours: user.careerProfile?.weeklyCommitmentHours || 5,
        mainGoal: user.careerProfile?.mainGoal || '',
        location: user.careerProfile?.locationPreference || ''
      });
    }
  }, [user]);

  const [strategy, setStrategy] = useState(null);
  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const res = await api.get('/api/users/strategy');
        setStrategy(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStrategy();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfile({
        careerProfile: {
          targetRole: formData.targetRole,
          currentStatus: formData.currentStatus,
          weeklyCommitmentHours: formData.weeklyCommitmentHours,
          mainGoal: formData.mainGoal,
          locationPreference: formData.location
        }
      });
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  const avatarLetter = user.name?.[0]?.toUpperCase() || 'A';

  const targetRoles = ['Frontend', 'Backend', 'Fullstack', 'AIML', 'Data Engineering'];
  const statuses = ['Student', 'Intern', 'Fresher', 'Working Professional'];
  const careerGoals = ['Internship Hunt', 'First Job', 'Career Switch', 'Promotion'];

  const usageData = [
    { label: 'Resume Scans', used: 2, total: 3, reset: '4 days' },
    { label: 'Skill Radar', used: 1, total: 2, reset: '12 days' },
    { label: 'Mock Interviews', used: 9, total: 10, reset: '2 days' }
  ];

  return (
    <div className="ascend-container prof-page">
      <div className="prof-header animate-fade-up">
        <h1 className="text-hero">Settings Hub</h1>
        <p className="text-secondary text-large mt-8">Manage your Ascend career preferences and AI quota.</p>
        
        {error && <div className="prof-error mt-24">{error}</div>}
        {success && <div className="prof-success mt-24">{success}</div>}
      </div>

      <div className="prof-bento animate-fade-up stagger-1">
        
        {/* 1. ACCOUNT OVERVIEW (Span 12) */}
        <div className="prof-card hero">
          <div className="prof-hero-left">
            <div className="prof-avatar">{avatarLetter}</div>
            <div className="prof-user-info">
              <div className="text-h2" style={{color: 'var(--text-primary)'}}>
                {user.name} <span className="prof-tier-badge">Pro Tier</span>
              </div>
              <div className="text-secondary">{user.email}</div>
              <div className="text-small text-tertiary mt-8">Member since Oct 2023</div>
            </div>
          </div>
          <div className="prof-hero-right">
            <div className="text-small text-uppercase text-secondary">Profile Completion</div>
            <div className="text-h3" style={{color: '#34D399'}}>85%</div>
            <div className="prof-completion-track">
              <div className="prof-completion-fill"></div>
            </div>
          </div>
        </div>

        {/* 2. CAREER PREFERENCES (Span 8) */}
        <div className="prof-card career">
          <div className="prof-card-title"><IconTarget /> Career Preferences</div>
          
          <div className="prof-field">
            <label className="prof-field-label">Target Role</label>
            <div className="prof-chips">
              {targetRoles.map(r => (
                <button key={r} type="button" className={`prof-chip ${formData.targetRole === r ? 'active' : ''}`} onClick={() => setFormData({...formData, targetRole: r})}>{r}</button>
              ))}
            </div>
          </div>

          <div className="prof-field">
            <label className="prof-field-label">Current Status</label>
            <div className="prof-chips">
              {statuses.map(s => (
                <button key={s} type="button" className={`prof-chip ${formData.currentStatus === s ? 'active' : ''}`} onClick={() => setFormData({...formData, currentStatus: s})}>{s}</button>
              ))}
            </div>
          </div>

          <div className="prof-field">
            <label className="prof-field-label">Career Goal</label>
            <div className="prof-goal-cards">
              {careerGoals.map(g => (
                <div key={g} className={`prof-goal-card ${formData.mainGoal === g ? 'active' : ''}`} onClick={() => setFormData({...formData, mainGoal: g})}>
                  <div className="prof-goal-icon"><IconBriefcase /></div>
                  <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{g}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display: 'flex', gap: '32px', flexWrap: 'wrap'}}>
            <div className="prof-field" style={{flex: 1, minWidth: '200px'}}>
              <label className="prof-field-label">Preferred Location</label>
              <input type="text" className="prof-text-input" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Remote, NYC" />
            </div>

            <div className="prof-field" style={{flex: 2, minWidth: '300px'}}>
              <label className="prof-field-label">Weekly Commitment: <span style={{color: 'var(--accent-primary)'}}>{formData.weeklyCommitmentHours} hrs</span></label>
              <div className="prof-slider-container">
                <input type="range" className="prof-slider" min="1" max="40" value={formData.weeklyCommitmentHours} onChange={(e) => setFormData({...formData, weeklyCommitmentHours: e.target.value})} />
              </div>
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
          </div>
        </div>

        {/* 3. AI USAGE (Span 4) */}
        <div className="prof-card usage">
          <div className="prof-card-title"><IconActivity /> AI Usage Quota</div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center'}}>
            {usageData.map((u, i) => {
              const pct = (u.used / u.total) * 100;
              const isWarning = pct >= 80;
              return (
                <div key={i} className="prof-usage-item">
                  <div className="prof-usage-header">
                    <span className="text-secondary" style={{fontWeight: 600}}>{u.label}</span>
                    <span style={{color: isWarning ? '#F59E0B' : 'var(--text-primary)', fontWeight: 700}}>{u.used} / {u.total}</span>
                  </div>
                  <div className="prof-usage-track mt-8">
                    <div className={`prof-usage-fill ${isWarning ? 'warning' : ''}`} style={{width: `${pct}%`}}></div>
                  </div>
                  <div className="text-small text-tertiary mt-4">Resets in {u.reset}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. APP PREFERENCES (Span 6) */}
        <div className="prof-card prefs">
          <div className="prof-card-title"><IconSettings /> App Preferences</div>
          <div style={{marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div className="prof-toggle-row">
              <span className="text-secondary" style={{fontWeight: 600}}>Dark Theme</span>
              <div className={`prof-toggle ${prefs.theme ? 'active' : ''}`} onClick={() => setPrefs({...prefs, theme: !prefs.theme})}>
                <div className="prof-toggle-knob"></div>
              </div>
            </div>
            <div className="prof-toggle-row">
              <span className="text-secondary" style={{fontWeight: 600}}>In-App Notifications</span>
              <div className={`prof-toggle ${prefs.notifications ? 'active' : ''}`} onClick={() => setPrefs({...prefs, notifications: !prefs.notifications})}>
                <div className="prof-toggle-knob"></div>
              </div>
            </div>
            <div className="prof-toggle-row">
              <span className="text-secondary" style={{fontWeight: 600}}>Email Reminders</span>
              <div className={`prof-toggle ${prefs.emailReminders ? 'active' : ''}`} onClick={() => setPrefs({...prefs, emailReminders: !prefs.emailReminders})}>
                <div className="prof-toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SECURITY & ACTIONS (Span 6) */}
        <div className="prof-card security">
          <div className="prof-card-title"><IconLock /> Security & Account</div>
          
          <div className="prof-safe-actions mt-16">
            <button className="btn-outline" style={{justifyContent: 'center', width: '100%'}}>Change Password</button>
            <button className="btn-outline" style={{justifyContent: 'center', width: '100%'}}>Logout All Devices</button>
          </div>

          <div className="prof-danger-zone mt-24">
            <div>
              <div style={{color: '#F87171', fontWeight: 600}}>Danger Zone</div>
              <div className="text-small text-tertiary mt-4">Irreversibly delete your account and all data.</div>
            </div>
            <button className="btn-danger">Delete Account</button>
          </div>
        </div>

        {/* P19: Growth Summary (Span 4) */}
        <div className="prof-card growth-summary" style={{ gridColumn: 'span 4' }}>
          <div className="prof-card-title">Growth Summary</div>
          {(!strategy || !strategy.memory || !strategy.memory.hasData || strategy.memory.evaluationCount < 3) ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '16px', marginTop: '32px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}>🔒</div>
              <div className="text-body text-secondary" style={{ fontWeight: 600 }}>Insufficient Data</div>
              <p className="text-caption text-tertiary" style={{ marginTop: '8px' }}>Unlock detailed pattern intelligence after 3 evaluations.</p>
            </div>
          ) : (
            <div style={{ marginTop: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div className="text-caption text-secondary" style={{ textTransform: 'uppercase', marginBottom: '4px' }}>Velocity</div>
                <div className="text-h3" style={{ color: strategy.velocity?.velocityLabel === 'High' ? '#10B981' : strategy.velocity?.velocityLabel === 'Low' ? '#F87171' : '#FBBF24' }}>
                  {strategy.velocity?.velocityLabel}
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div className="text-caption text-secondary" style={{ textTransform: 'uppercase', marginBottom: '4px' }}>Improving Areas</div>
                <div className="text-small" style={{ color: '#10B981', fontWeight: 600 }}>
                  {strategy.patterns?.improving?.map(p => p.area).join(', ') || 'None yet'}
                </div>
              </div>
              <div>
                <div className="text-caption text-secondary" style={{ textTransform: 'uppercase', marginBottom: '4px' }}>Recurring Weaknesses</div>
                <div className="text-small" style={{ color: '#F87171', fontWeight: 600 }}>
                  {strategy.memory?.recurringWeaknesses?.map(w => w.weakness).slice(0, 3).join(', ') || 'None'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
