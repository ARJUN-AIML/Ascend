import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Onboarding.css';

const STEPS = [
  { id: 0, label: 'Career Profile' },
  { id: 1, label: 'AI Skill Discovery' },
  { id: 2, label: 'Launch Copilot' }
];

export default function Onboarding() {
  const { user, completeOnboarding } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    targetRole: '',
    currentStatus: '', // Student, Fresher, Working Professional
    locationPreference: '',
    weeklyCommitmentHours: 10,
    mainGoal: ''
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  // AI Parsing State
  const [uploadStatus, setUploadStatus] = useState('IDLE'); // IDLE, PARSING, EXTRACTING, BUILDING, DONE
  const [uploadError, setUploadError] = useState(null);

  // If already onboarded, redirect out
  useEffect(() => {
    if (user?.onboardingStatus === 'COMPLETED') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setStatus = (val) => setFormData({ ...formData, currentStatus: val });

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (s) => setSkills(skills.filter(x => x !== s));

  // Simulated animated logs for UX
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setUploadError(null);
    setUploadStatus('PARSING');

    try {
      // 1. Extract Text
      const form = new FormData();
      form.append('file', file);
      
      await sleep(800); // Simulate network latency for UX animation
      const textRes = await api.post('/api/ai/extract-resume', form);
      
      setUploadStatus('EXTRACTING');
      await sleep(1000);
      
      // 2. Extract Skills
      const skillsRes = await api.post('/api/ai/extract-skills', { resumeText: textRes.data.text });
      
      setUploadStatus('BUILDING');
      await sleep(800);
      
      if (skillsRes.data.skills && Array.isArray(skillsRes.data.skills)) {
        // Merge without duplicates
        const newSkills = [...new Set([...skills, ...skillsRes.data.skills])];
        setSkills(newSkills);
      }
      setUploadStatus('DONE');
    } catch (err) {
      setUploadError('AI failed to parse resume. Please enter skills manually.');
      setUploadStatus('IDLE');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 0) {
      if (!formData.targetRole || !formData.currentStatus) {
        setError('Please enter your target role and select your current status.');
        return;
      }
      setError(null);
      setStep(1);
    } else if (step === 1) {
      setStep(2); // Move to Finalize
    } else if (step === 2) {
      // Finalize
      setLoading(true);
      setError(null);
      try {
        await completeOnboarding({
          targetRole: formData.targetRole,
          currentStatus: formData.currentStatus,
          weeklyCommitmentHours: formData.weeklyCommitmentHours,
          locationPreference: formData.locationPreference,
          mainGoal: formData.mainGoal,
          confirmedSkills: skills
        });
        navigate('/');
      } catch (err) {
        setError('Failed to finalize profile. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="ob-layout">
      
      {/* LEFT PANEL */}
      <div className="ob-left">
        <div className="ob-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.14 5.14"/></svg>
          Ascend
        </div>
        
        <div className="ob-welcome">
          <h1>Welcome to<br/>Ascend Copilot.</h1>
          <p>Let's configure your AI-powered career growth engine. This setup personalizes your action plan.</p>
        </div>

        <div className="ob-stepper">
          {STEPS.map((s) => {
            const isActive = s.id === step;
            const isCompleted = s.id < step;
            return (
              <div key={s.id} className={`ob-stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="ob-stepper-circle">
                  {isCompleted ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    s.id + 1
                  )}
                </div>
                <div className="ob-stepper-label">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="ob-benefits">
          <div className="ob-benefits-title">INCLUDED IN COPILOT</div>
          <div className="ob-benefit-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Deep AI Career Analysis
          </div>
          <div className="ob-benefit-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Automated Resume Optimization
          </div>
          <div className="ob-benefit-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Neural Job Match Engine
          </div>
          <div className="ob-benefit-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Dynamic Mock Interviews
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="ob-right">
        <div className="ob-content-card">
          
          {error && <div className="ob-error">{error}</div>}

          {step === 0 && (
            <div className="ob-step-content">
              <div className="ob-step-header">
                <h2 className="ob-step-title">Career Profile</h2>
                <p className="ob-step-subtitle">Define your trajectory. We'll optimize your path.</p>
              </div>

              <div className="ob-field">
                <label className="ob-label">Target Role *</label>
                <input className="ob-input" type="text" name="targetRole" placeholder="e.g. Frontend Engineer" value={formData.targetRole} onChange={handleChange} required />
              </div>

              <div className="ob-field">
                <label className="ob-label">Current Status *</label>
                <div className="ob-chips">
                  {['Student', 'Fresher', 'Working Professional'].map(status => (
                    <button 
                      key={status}
                      type="button" 
                      className={`ob-chip ${formData.currentStatus === status ? 'active' : ''}`}
                      onClick={() => setStatus(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ob-field">
                <label className="ob-label">Location Preference</label>
                <input className="ob-input" type="text" name="locationPreference" placeholder="e.g. Remote, San Francisco" value={formData.locationPreference} onChange={handleChange} />
              </div>

              <div className="ob-field">
                <label className="ob-label">Weekly Time Commitment</label>
                <div className="ob-slider-wrap">
                  <input className="ob-slider" type="range" name="weeklyCommitmentHours" min="1" max="40" value={formData.weeklyCommitmentHours} onChange={handleChange} />
                  <div className="ob-slider-val">{formData.weeklyCommitmentHours} hrs</div>
                </div>
              </div>

              <div className="ob-field">
                <label className="ob-label">Main Goal</label>
                <textarea className="ob-textarea" name="mainGoal" placeholder="What are you trying to achieve? (e.g. Break into FAANG, Switch to AI)" value={formData.mainGoal} onChange={handleChange} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="ob-step-content">
              <div className="ob-step-header">
                <h2 className="ob-step-title">AI Skill Discovery</h2>
                <p className="ob-step-subtitle">Upload your resume to automatically extract your technical stack.</p>
              </div>

              <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              
              {uploadStatus === 'IDLE' && (
                <div className="ob-dropzone" onClick={() => fileInputRef.current.click()}>
                  <div className="ob-dropzone-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div className="ob-dropzone-title">Upload Resume</div>
                  <div className="ob-dropzone-sub">Supports PDF, DOC, DOCX up to 5MB</div>
                </div>
              )}

              {uploadStatus !== 'IDLE' && uploadStatus !== 'DONE' && (
                <div className="ob-logs">
                  <div className="ob-log-line">Initializing AI Parser...</div>
                  {uploadStatus === 'PARSING' || uploadStatus === 'EXTRACTING' || uploadStatus === 'BUILDING' ? (
                    <div className="ob-log-line">Parsing resume document...</div>
                  ) : null}
                  {uploadStatus === 'EXTRACTING' || uploadStatus === 'BUILDING' ? (
                    <div className="ob-log-line">Extracting technical entities...</div>
                  ) : null}
                  {uploadStatus === 'BUILDING' ? (
                    <div className="ob-log-line">Building semantic skill graph...</div>
                  ) : null}
                </div>
              )}

              {uploadError && <div className="ob-error" style={{marginTop: 16}}>{uploadError}</div>}

              {(uploadStatus === 'DONE' || skills.length > 0) && (
                <div style={{ marginTop: 32 }}>
                  <label className="ob-label">Confirmed Skill Stack</label>
                  <div className="ob-skills-list" style={{ marginBottom: 16 }}>
                    {skills.map(s => (
                      <div key={s} className="ob-skill-tag">
                        {s}
                        <button type="button" className="ob-skill-remove" onClick={() => removeSkill(s)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="ob-skills-input-wrap">
                    <input 
                      className="ob-input" 
                      type="text" 
                      placeholder="Add missing skill & press Enter" 
                      value={skillInput} 
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      style={{ flex: 1 }}
                    />
                    <button type="button" className="ob-btn ob-btn-secondary" onClick={addSkill}>Add</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="ob-step-content ob-success">
              <div className="ob-success-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2>Copilot Initialized</h2>
              <p>Your AI Career Copilot is ready. Your baseline metrics are set.</p>
              
              <div className="ob-scores">
                <div className="ob-score-card">
                  <div className="ob-score-label">Starting Resume Score</div>
                  <div className="ob-score-val">-- / 100</div>
                </div>
                <div className="ob-score-card">
                  <div className="ob-score-label">Extracted Skills</div>
                  <div className="ob-score-val">{skills.length}</div>
                </div>
              </div>
            </div>
          )}

          <div className="ob-actions">
            {step === 0 && (
              <button type="button" className="ob-btn ob-btn-secondary" onClick={() => navigate('/')} disabled={loading} style={{marginRight: 'auto', background: 'transparent', border: '1px solid var(--border-light)'}}>
                Skip for now
              </button>
            )}
            {step > 0 && step < 2 && (
              <button type="button" className="ob-btn ob-btn-secondary" onClick={() => setStep(step - 1)} disabled={loading}>
                Back
              </button>
            )}
            
            {step < 2 ? (
              <button type="button" className="ob-btn ob-btn-primary" onClick={handleNext} disabled={loading || uploadStatus === 'PARSING' || uploadStatus === 'EXTRACTING' || uploadStatus === 'BUILDING'}>
                {loading ? 'Processing...' : 'Continue'}
              </button>
            ) : (
              <button type="button" className="ob-btn ob-btn-primary" onClick={handleNext} disabled={loading}>
                {loading ? 'Finalizing...' : 'Enter Dashboard'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
