import React, { useState, useRef, useEffect } from 'react';
import './ResumeAnalyzer.css';
import aiService from '../services/aiService';

export default function ResumeAnalyzer() {
  const [appState, setAppState] = useState('empty'); // empty | processing | results
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('Backend Engineer');
  const [jobDesc, setJobDesc] = useState('');
  
  // Processing state simulation
  const [processLogs, setProcessLogs] = useState([]);
  
  const [intelligenceData, setIntelligenceData] = useState(null);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setAppState('processing');
    setProcessLogs(['[SYSTEM] Initializing Ascend Intelligence Engine...']);
    let interval;
    
    try {
      const logSequence = [
        '[UPLOAD] resume_uploaded_v1.pdf secured.',
        '[EXTRACT] Parsing document ontology...',
        '[EXTRACT] 6-Layer entity extraction complete.',
        '[MATCH] Detecting role requirements: ' + jobTitle,
        '[MATCH] Aligning semantic graph against industry baselines...',
        '[SCORE] Computing deterministic ATS viability...',
        '[SIMULATE] Running Recruiter and Hiring Manager lenses...',
        '[SYSTEM] Analysis complete. Rendering payload.'
      ];

      let currentLog = 0;
      interval = setInterval(() => {
        if (currentLog < logSequence.length) {
          setProcessLogs(prev => [...prev, logSequence[currentLog]]);
          currentLog++;
        }
      }, 600);

      const extracted = await aiService.extractResume(uploadedFile);
      const payload = {
        resumeText: extracted.text,
        roleTitle: jobTitle,
        jobDescription: jobDesc || 'Standard requirements'
      };

      const response = await aiService.analyzeResume(payload);
      
      setTimeout(() => {
        clearInterval(interval);
        setIntelligenceData(response.analysis);
        setAppState('results');
      }, 5000); // Minimum time to show terminal

    } catch (err) {
      clearInterval(interval);
      console.error('Resume Analysis Error:', err);
      setAppState('empty');
    }
  };

  const resetFlow = () => {
    setAppState('empty');
    setFile(null);
    setIntelligenceData(null);
    setProcessLogs([]);
  };

  return (
    <div className="ra-root">
      <div className="ra-container ascend-container">
        <div className="ra-split">
          
          {/* ── LEFT PANE: WORKFLOW PERSISTENCE (35%) ── */}
          <div className="ra-sidebar animate-fade-up">
            
            {/* STATE 1: EMPTY */}
            {appState === 'empty' && (
              <>
                <div className="rhythm-header">
                  <h2 className="text-h2">Target Role Setup</h2>
                  <p className="text-small text-secondary">Configure your target trajectory before initiating neural analysis.</p>
                </div>

                <div className="ra-input-group">
                  <label className="text-caption">Target Role</label>
                  <input className="ra-input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Backend Engineer" />
                </div>

                <div className="ra-input-group" style={{marginTop: 'var(--sp-16)'}}>
                  <label className="text-caption">Job Description (Highly Recommended)</label>
                  <textarea className="ra-textarea" rows={6} value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Paste the exact job description here for deterministic semantic matching..." />
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{display: 'none'}} 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange} 
                />
                
                <div className="ra-upload-zone hover-lift" onClick={handleUploadClick} style={{marginTop: 'var(--sp-24)'}}>
                  <div className="ra-upload-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div className="text-body" style={{fontWeight: 600}}>Upload Resume</div>
                    <div className="text-caption text-secondary" style={{marginTop: '4px'}}>PDF, DOC, DOCX up to 5MB</div>
                  </div>
                </div>

                <div className="ra-trust-signals" style={{marginTop: 'var(--sp-32)'}}>
                  <div className="trust-item">
                    <svg width="16" height="16" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-caption">6-Layer Extraction</span>
                  </div>
                  <div className="trust-item">
                    <svg width="16" height="16" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-caption">Deterministic Math</span>
                  </div>
                  <div className="trust-item">
                    <svg width="16" height="16" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-caption">HM Simulation</span>
                  </div>
                </div>
              </>
            )}

            {/* STATE 2: PROCESSING */}
            {appState === 'processing' && (
              <div className="ra-sidebar-active">
                <div className="rhythm-header">
                  <h2 className="text-h2">Analysis Active</h2>
                  <p className="text-small text-secondary">Engine is computing deterministic viability.</p>
                </div>
                
                <div className="premium-card" style={{padding: 'var(--sp-16)'}}>
                  <div className="text-caption text-secondary mb-8">Document</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div className="ra-file-icon">
                      <svg width="20" height="20" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div>
                      <div className="text-body" style={{fontWeight: 600}}>{file?.name || 'resume.pdf'}</div>
                      <div className="text-caption" style={{color: 'var(--accent-primary)'}}>Parsing...</div>
                    </div>
                  </div>
                </div>

                <div className="premium-card" style={{padding: 'var(--sp-16)', marginTop: 'var(--sp-16)'}}>
                  <div className="text-caption text-secondary mb-8">Target Trajectory</div>
                  <div className="text-body" style={{fontWeight: 600}}>{jobTitle}</div>
                  <div className="text-caption text-tertiary" style={{marginTop: '4px'}}>Custom JD Mapped</div>
                </div>
                
                <div className="ra-pulse-indicator" style={{marginTop: 'var(--sp-32)'}}>
                  <div className="pulse-dot"></div>
                  <span className="text-small text-secondary">Engine running at 100% capacity</span>
                </div>
              </div>
            )}

            {/* STATE 3: RESULTS */}
            {appState === 'results' && (
              <div className="ra-sidebar-active animate-fade-up">
                <div className="rhythm-header">
                  <h2 className="text-h2">Analysis Complete</h2>
                  <p className="text-small text-secondary">Your profile has been deterministically mapped.</p>
                </div>

                <div className="premium-card" style={{padding: 'var(--sp-16)', borderColor: 'rgba(16, 185, 129, 0.3)'}}>
                  <div className="text-caption text-secondary mb-8">Document Status</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div className="ra-file-icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10B981'}}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <div>
                      <div className="text-body" style={{fontWeight: 600}}>{file?.name || 'resume.pdf'}</div>
                      <div className="text-caption" style={{color: '#10B981'}}>Successfully Parsed</div>
                    </div>
                  </div>
                </div>

                <div className="premium-card" style={{padding: 'var(--sp-16)', marginTop: 'var(--sp-16)'}}>
                  <div className="text-caption text-secondary mb-8">Target Trajectory</div>
                  <div className="text-body" style={{fontWeight: 600}}>{jobTitle}</div>
                </div>

                <button className="btn-secondary" style={{width: '100%', marginTop: 'var(--sp-32)'}} onClick={resetFlow}>
                  Analyze New Resume
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT PANE: CORE ENGINE OUTPUT (65%) ── */}
          <div className="ra-main">
            
            {/* STATE 1: EMPTY (Premium Showcase) */}
            {appState === 'empty' && (
              <div className="premium-card ra-showcase animate-fade-up stagger-1">
                <div className="ra-showcase-bg"></div>
                <div className="ra-showcase-content">
                  <div className="ra-showcase-icon">
                    <svg width="48" height="48" fill="none" stroke="var(--accent-primary)" strokeWidth="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  </div>
                  <h2 className="text-h2" style={{marginBottom: 'var(--sp-12)'}}>Awaiting Document</h2>
                  <p className="text-large text-secondary" style={{maxWidth: '400px', textAlign: 'center'}}>
                    Ascend Intelligence requires a document to begin. Once uploaded, the engine maps your trajectory against deterministic market realities.
                  </p>
                </div>
              </div>
            )}

            {/* STATE 2: PROCESSING (Terminal Stream) */}
            {appState === 'processing' && (
              <div className="premium-card ra-terminal animate-fade-up">
                <div className="ra-terminal-header">
                  <div className="terminal-dots"><span></span><span></span><span></span></div>
                  <div className="text-caption">ascend_engine_v3.0_active</div>
                </div>
                <div className="ra-terminal-body">
                  {processLogs.map((log, i) => (
                    <div key={i} className="terminal-log animate-stagger-1" style={{animationDelay: '0s'}}>{log}</div>
                  ))}
                  <div className="terminal-cursor">_</div>
                </div>
              </div>
            )}

            {appState === 'results' && intelligenceData && (
              <div className="ra-results-layout">
                
                {intelligenceData.aiFallback && (
                  <div className="premium-card mb-32 animate-stagger-4" style={{display: 'block', border: '1px solid #FBBF24', background: 'rgba(251, 191, 36, 0.05)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: '#FBBF24'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span className="text-body" style={{fontWeight: 600}}>AI enhancement temporarily unavailable. Using deterministic intelligence engine.</span>
                    </div>
                  </div>
                )}

                {/* SECTION 1: DUAL SCORE HERO (Dominant) */}
                <div className="premium-card ra-hero-massive animate-fade-up stagger-1">
                  
                  {/* RESUME SCORE GAUGE */}
                  <div className="ra-hero-massive-radial">
                    <svg width="220" height="220" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-primary)" strokeWidth="4" 
                              strokeDasharray="283" style={{ '--target-offset': 283 - (283 * (intelligenceData.resumeScore / 100)), animation: 'sweepRing 1.5s var(--ease-spring) forwards' }} strokeLinecap="round" />
                    </svg>
                    <div className="radial-content">
                      <div className="text-hero" style={{fontSize: '72px', lineHeight: 1}}>{intelligenceData.resumeScore}</div>
                      <div className="text-caption text-secondary" style={{marginTop: '8px'}}>Resume Score</div>
                    </div>
                  </div>

                  {/* CAREER SCORE GAUGE */}
                  <div className="ra-hero-massive-radial">
                    <svg width="220" height="220" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-secondary)" strokeWidth="4" 
                              strokeDasharray="283" style={{ '--target-offset': 283 - (283 * (intelligenceData.careerScore / 100)), animation: 'sweepRing 1.5s var(--ease-spring) forwards 0.2s' }} strokeLinecap="round" />
                    </svg>
                    <div className="radial-content">
                      <div className="text-hero" style={{fontSize: '72px', lineHeight: 1, color: 'var(--accent-secondary)'}}>{intelligenceData.careerScore}</div>
                      <div className="text-caption text-secondary" style={{marginTop: '8px'}}>Career Score</div>
                    </div>
                  </div>
                  
                  <div className="ra-hero-massive-stats">
                    <div className="stat-row">
                      <span className="text-small text-secondary">ATS Verdict</span>
                      <span className="text-body" style={{color: '#FCD34D', fontWeight: 700}}>{intelligenceData.atsVerdict}</span>
                    </div>
                    <div className="stat-row" style={{borderBottom: 'none'}}>
                      <span className="text-small text-secondary">Recruiter Verdict</span>
                      <span className="text-body" style={{color: '#FCA5A5', fontWeight: 700}}>{intelligenceData.recruiterVerdict}</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: WHY THIS SCORE? (Waterfall + Breakdown) */}
                <div className="rhythm-header" style={{marginTop: 'var(--sp-24)', marginBottom: 'var(--sp-12)'}}>
                  <h3 className="text-h3 animate-fade-up stagger-2">Why this score?</h3>
                </div>
                <div className="ra-why-split animate-fade-up stagger-2">
                  
                  <div className="premium-card">
                    <div className="text-caption text-secondary mb-16">Category Breakdown</div>
                    <div className="ra-breakdown-list">
                      <div className="ra-breakdown-item">
                        <div className="breakdown-header">
                          <span className="text-small font-600">Keyword Match</span>
                          <span className="text-small">{intelligenceData.categories?.keywordMatch || 0}%</span>
                        </div>
                        <div className="progress-track"><div className="progress-fill" style={{'--target-width': `${intelligenceData.categories?.keywordMatch || 0}%`, background: 'var(--accent-primary)', animation: 'fillProgress 1s var(--ease-smooth) forwards'}}></div></div>
                      </div>
                      <div className="ra-breakdown-item">
                        <div className="breakdown-header">
                          <span className="text-small font-600">Experience Match</span>
                          <span className="text-small">{intelligenceData.categories?.experienceMatch || 0}%</span>
                        </div>
                        <div className="progress-track"><div className="progress-fill" style={{'--target-width': `${intelligenceData.categories?.experienceMatch || 0}%`, background: 'var(--accent-secondary)', animation: 'fillProgress 1s var(--ease-smooth) forwards 0.1s'}}></div></div>
                      </div>
                      <div className="ra-breakdown-item">
                        <div className="breakdown-header">
                          <span className="text-small font-600">Semantic Match</span>
                          <span className="text-small">{intelligenceData.categories?.semanticMatch || 0}%</span>
                        </div>
                        <div className="progress-track"><div className="progress-fill" style={{'--target-width': `${intelligenceData.categories?.semanticMatch || 0}%`, background: 'var(--accent-primary)', animation: 'fillProgress 1s var(--ease-smooth) forwards 0.2s'}}></div></div>
                      </div>
                    </div>
                  </div>

                  <div className="premium-card ra-waterfall">
                    <div className="text-caption text-secondary mb-16">Deterministic Logic</div>
                    <div className="ra-waterfall-flow">
                      <div className="waterfall-row base">
                        <span className="text-small text-secondary">Base Score</span>
                        <span className="font-600">100</span>
                      </div>
                      {intelligenceData.scoringBreakdown?.modifiers?.map((item, idx) => (
                        <div key={idx} className={`waterfall-row ${item.positive ? 'positive' : 'negative'}`}>
                          <span className="text-small text-secondary">{item.label}</span>
                          <span className="font-600">{item.impact}</span>
                        </div>
                      ))}
                      <div className="waterfall-row final">
                        <span className="text-small font-600 text-primary">Final Resume Score</span>
                        <span className="font-600 text-primary">{intelligenceData.resumeScore}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* SECTION 3: MISSING SKILLS */}
                <div className="rhythm-header" style={{marginTop: 'var(--sp-24)', marginBottom: 'var(--sp-12)'}}>
                  <h3 className="text-h3 animate-fade-up stagger-3">Missing Skills</h3>
                </div>
                <div className="ra-skills-grid animate-fade-up stagger-3">
                  <div className="premium-card bg-red-tint" style={{borderColor: 'rgba(239, 68, 68, 0.2)'}}>
                    <div className="text-caption mb-12" style={{color: '#FCA5A5'}}>Critical Gaps</div>
                    <div className="skill-chip-wrap">
                      {intelligenceData.missingCriticalSkills?.length > 0 ? intelligenceData.missingCriticalSkills.map(skill => (
                        <span key={skill} className="skill-chip critical">{skill}</span>
                      )) : <span className="text-small text-secondary">None detected.</span>}
                    </div>
                  </div>
                  <div className="premium-card bg-blue-tint" style={{borderColor: 'rgba(59, 130, 246, 0.2)'}}>
                    <div className="text-caption mb-12" style={{color: '#93C5FD'}}>Important Gaps</div>
                    <div className="skill-chip-wrap">
                      {intelligenceData.missingImportantSkills?.length > 0 ? intelligenceData.missingImportantSkills.map(skill => (
                        <span key={skill} className="skill-chip important">{skill}</span>
                      )) : <span className="text-small text-secondary">None detected.</span>}
                    </div>
                  </div>
                </div>

                {/* SECTION 4: STRATEGIC ACTION PLAN */}
                <div className="rhythm-header" style={{marginTop: 'var(--sp-24)', marginBottom: 'var(--sp-12)'}}>
                  <h3 className="text-h3 animate-fade-up stagger-4">AI General Advice</h3>
                </div>
                <div className="ra-action-plan animate-fade-up stagger-4">
                  {intelligenceData.genericAdvice?.length > 0 ? (
                    <div className="premium-card ra-action-card">
                      <div className="action-body">
                        {intelligenceData.genericAdvice.map((adv, idx) => (
                           <div key={idx} style={{marginBottom: 16}}>
                              <div className="text-body" style={{fontWeight: 600}}>{adv.skill || adv.title || 'Advice'}</div>
                              <p className="text-small" style={{marginTop: 4}}>{adv.action || adv.description || adv}</p>
                           </div>
                        ))}
                      </div>
                      <div className="text-caption" style={{marginTop: 16, color: 'var(--accent-primary)'}}>
                         Check your Action Hub Dashboard for personalized tasks generated from this scan!
                      </div>
                    </div>
                  ) : (
                     <div className="premium-card">
                       <div className="text-body text-secondary">No tactical recommendations required. Check your Action Hub for daily tasks!</div>
                     </div>
                  )}
                </div>

                {/* SECTION 5: RECRUITER SIMULATION */}
                <div className="rhythm-header" style={{marginTop: 'var(--sp-24)', marginBottom: 'var(--sp-12)'}}>
                  <h3 className="text-h3 animate-fade-up stagger-5">Human Simulation</h3>
                </div>
                <div className="ra-sim-layout animate-fade-up stagger-5">
                  
                  {intelligenceData.simulation?.recruiterLens && (
                    <div className="premium-card ra-sim-card">
                      <div className="sim-header">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        <span className="text-caption">Recruiter Lens</span>
                      </div>
                      <div className="text-h3" style={{color: '#FCA5A5', margin: 'var(--sp-12) 0'}}>{intelligenceData.simulation.recruiterLens.verdict}</div>
                      <p className="text-small text-secondary flex-grow">{intelligenceData.simulation.recruiterLens.reasons}</p>
                    </div>
                  )}

                  {intelligenceData.simulation?.hiringManagerLens && (
                    <div className="premium-card ra-sim-card">
                      <div className="sim-header">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        <span className="text-caption">Hiring Manager Lens</span>
                      </div>
                      <div className="text-h3" style={{color: '#FCA5A5', margin: 'var(--sp-12) 0'}}>{intelligenceData.simulation.hiringManagerLens.verdict}</div>
                      <p className="text-small text-secondary flex-grow">{intelligenceData.simulation.hiringManagerLens.reasons}</p>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
