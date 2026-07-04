import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import aiService from '../services/aiService';
import api from '../services/api';
import jdMatchEngine from '../services/jdMatchEngine';
import resumeTailorEngine from '../services/resumeTailorEngine';
import FeedbackWidget from '../components/FeedbackWidget';
import './Copilot.css';

const STEPS = [
  { id: 1, title: 'Analyze' },
  { id: 2, title: 'Diagnose' },
  { id: 3, title: 'Optimize' },
  { id: 4, title: 'Execute' }
];

// ── ICONS ────────────────────────────────────────────────
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"/></svg>;
const IconUpload = () => <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconChevron = () => <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6"/></svg>;
const IconCopy = () => <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconTarget = () => <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconShield = () => <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconAlert = () => <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconTrendingUp = () => <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconZap = () => <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

// ── ANIMATED RADIAL GAUGE ────────────────────────────────
const AnimatedCounter = ({ targetValue }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let id; let start = null; const dur = 1500;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = ts - start;
      const r = p >= dur ? 1 : 1 - Math.pow(2, -10 * p / dur);
      setVal(r * targetValue);
      if (p < dur) { id = requestAnimationFrame(tick); }
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [targetValue]);
  return <>{Math.floor(val)}</>;
};

const LinearMetric = ({ value, label, color }) => (
  <div className="cp-linear-metric" style={{ gap: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}><AnimatedCounter targetValue={value} /><span style={{fontSize:'1.2rem', color: 'var(--text-tertiary)'}}>/100</span></span>
    </div>
    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '3px', transition: 'width 1.5s cubic-bezier(0.25, 1, 0.5, 1)' }} />
    </div>
  </div>
);

// ── AI LOADING COMPONENT ────────────────────────────────
const AILoader = ({ stages, currentStageIndex }) => (
  <div className="ai-loader-container animate-fade-up">
    <div className="ai-loader-spinner"></div>
    <div className="text-h3 mt-16 mb-24">Career Copilot AI Engine</div>
    <div className="ai-loader-stages">
      {stages.map((stage, idx) => {
        let status = '';
        if (idx < currentStageIndex) status = 'completed';
        else if (idx === currentStageIndex) status = 'active';
        return (
          <div key={idx} className={`ai-loader-stage ${status}`}>
            {status === 'completed' ? <IconCheck /> : <IconZap />}
            <span>{stage}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export default function Copilot() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Step 1 Inputs
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Loaders
  const [loadingStages, setLoadingStages] = useState([]);
  const [activeStage, setActiveStage] = useState(0);
  
  // Analyses
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [tailorAnalysis, setTailorAnalysis] = useState(null);
  const [strategyPlan, setStrategyPlan] = useState(null);
  
  // UI State
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const advanceStep = () => setCurrentStep(s => Math.min(4, s + 1));
  const goBackStep = () => setCurrentStep(s => Math.max(1, s - 1));

  // --- ACTIONS ---
  
  const runInitialAnalysis = async () => {
    if (!resumeFile) { setError('Please upload a resume first.'); return; }
    if (!jobDesc.trim()) { setError('Please paste a job description.'); return; }

    setIsProcessing(true);
    setError('');
    setLoadingStages(['Analyzing Resume Structure', 'Matching Job Description', 'Detecting Skill Gaps']);
    setActiveStage(0);

    try {
      // Stage 0: Extract
      const data = await aiService.extractResume(resumeFile);
      setResumeText(data.text);
      setActiveStage(1);
      
      // Stage 1: Analyze Profile
      const rPayload = { resumeText: data.text, roleTitle: 'Target Role', jobDescription: jobDesc };
      const rRes = await aiService.analyzeResume(rPayload);
      setResumeAnalysis(rRes.analysis);
      setActiveStage(2);

      // Stage 2: Match JD
      const mRes = await jdMatchEngine.analyzeJobMatch(data.text, jobDesc);
      setMatchAnalysis(mRes);
      
      // Complete
      setIsAnalyzed(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const runOptimization = async () => {
    setIsProcessing(true);
    setError('');
    setLoadingStages(['Optimizing Resume Content', 'Injecting ATS Keywords']);
    setActiveStage(0);
    try {
      const data = await resumeTailorEngine.tailorResume(resumeText, jobDesc);
      setActiveStage(1);
      // simulate artificial delay for stage 2
      await new Promise(resolve => setTimeout(resolve, 800));
      setTailorAnalysis(data);
      advanceStep(); // Go to Step 3 (Optimize)
    } catch (err) {
      setError('Optimization failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const runExecutionPlan = async () => {
    setIsProcessing(true);
    setLoadingStages(['Building Action Plan', 'Simulating Impact ROI', 'Generating Strategic Roadmap']);
    setActiveStage(0);
    // Simulate API delay for polish
    await new Promise(resolve => setTimeout(resolve, 800));
    setActiveStage(1);
    await new Promise(resolve => setTimeout(resolve, 800));
    setActiveStage(2);
    try {
      const res = await api.get('/api/users/strategy');
      setStrategyPlan(res.data?.strategy || null);
    } catch (err) {
      console.error(err);
    }
    setIsProcessing(false);
    advanceStep(); // Go to Step 4 (Execute)
  };

  // --- RENDERERS ---
  const renderStepContent = () => {
    if (isProcessing) {
      return <AILoader stages={loadingStages} currentStageIndex={activeStage} />;
    }

    switch(currentStep) {
      case 1:
        if (!isAnalyzed) {
          return (
            <div className="cp-step-content animate-fade-up">
              <div className="cp-split-analyze">
                <div className="cp-analyze-left">
                  <h1 className="text-h1 mb-16">Career Copilot</h1>
                  <p className="text-secondary" style={{fontSize: '1.1rem'}}>Upload your resume and the exact job description to align your profile and secure the interview.</p>
                  
                  <div className="cp-feature-list">
                    <div className="cp-feature-item">
                      <div className="cp-feature-icon"><IconTarget /></div>
                      <div>
                        <div className="text-h4">Precision Matching</div>
                        <div className="text-secondary text-small">AI detects exactly what recruiters want.</div>
                      </div>
                    </div>
                    <div className="cp-feature-item">
                      <div className="cp-feature-icon"><IconTrendingUp /></div>
                      <div>
                        <div className="text-h4">Impact Optimization</div>
                        <div className="text-secondary text-small">Rewrite bullets for maximum ROI.</div>
                      </div>
                    </div>
                    <div className="cp-feature-item">
                      <div className="cp-feature-icon"><IconShield /></div>
                      <div>
                        <div className="text-h4">ATS Safe</div>
                        <div className="text-secondary text-small">Guaranteed readable by all major systems.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cp-analyze-right">
                  <div>
                    <div className="text-h4 mb-16">1. Upload Resume</div>
                    <div className={`cp-upload-zone ${resumeFile ? 'has-file' : ''}`}>
                      <input type="file" accept=".pdf,.doc,.docx" id="cp-resume" hidden onChange={(e) => setResumeFile(e.target.files[0])} />
                      <label htmlFor="cp-resume" style={{cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <div className="cp-feature-icon" style={{color: resumeFile ? '#34D399' : 'var(--accent-primary)'}}>
                          {resumeFile ? <IconCheck /> : <IconUpload />}
                        </div>
                        <div className="text-h4 mt-8">{resumeFile ? resumeFile.name : 'Click to Upload Document'}</div>
                        <div className="text-small text-tertiary mt-4">PDF, DOC, DOCX up to 5MB</div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="text-h4 mb-16">2. Target Job Description</div>
                    <textarea 
                      className="cp-textarea" 
                      placeholder="Paste the full job description here..."
                      value={jobDesc}
                      onChange={e => setJobDesc(e.target.value)}
                    />
                  </div>

                  <button className="btn-primary mt-16" onClick={runInitialAnalysis} disabled={!jobDesc.trim()} style={{width: '100%', padding: '16px', fontSize: '1.1rem', opacity: !jobDesc.trim() ? 0.5 : 1, cursor: !jobDesc.trim() ? 'not-allowed' : 'pointer'}}>
                    Run Baseline Analysis
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Post-Analysis Step 1 View
        const riskScore = matchAnalysis ? Math.max(0, 100 - matchAnalysis.matchScore) : 0;
        return (
          <div className="cp-step-content animate-fade-up">
            <h2 className="text-h2 mb-16">Analysis Complete</h2>
            <p className="text-secondary mb-32">Your baseline profile metrics have been calculated.</p>
            
            <div className="cp-bento-results mb-32">
              <div className="cp-bento-card animate-stagger-1">
                <LinearMetric value={resumeAnalysis.resumeScore} label="Resume Strength" color="#60A5FA" />
              </div>
              <div className="cp-bento-card animate-stagger-2">
                <LinearMetric value={matchAnalysis.matchScore} label="Job Match Score" color={matchAnalysis.matchScore >= 75 ? '#10B981' : '#FBBF24'} />
              </div>
              <div className="cp-bento-card animate-stagger-3">
                <LinearMetric value={riskScore} label="Risk Score" color={riskScore > 30 ? '#F87171' : '#10B981'} />
              </div>
            </div>

            {(resumeAnalysis.aiFallback || matchAnalysis.aiFallback) && (
              <div className="cp-bento-card mb-32 animate-stagger-4" style={{display: 'block', border: '1px solid #FBBF24', background: 'rgba(251, 191, 36, 0.05)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: '#FBBF24'}}>
                  <IconAlert />
                  <span className="text-body" style={{fontWeight: 600}}>AI enhancement temporarily unavailable. Using deterministic intelligence engine.</span>
                </div>
              </div>
            )}

            {/* P18: Company Benchmarks & Career Gap */}
            {matchAnalysis.companyBenchmarks && (
              <div className="cp-bento-card mb-32 animate-stagger-4" style={{display: 'block'}}>
                <div className="text-caption text-secondary text-uppercase mb-16">Company Tier Benchmarks</div>
                <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
                  {matchAnalysis.companyBenchmarks.map(cb => (
                    <div key={cb.tier} style={{flex: 1, minWidth: '150px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                      <div className="text-small text-secondary">{cb.tier}</div>
                      <div className={`text-body mi-status-${cb.verdictClass}`} style={{fontWeight: 700, marginTop: '4px'}}>{cb.verdict}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchAnalysis.careerGap && (
              <div className="cp-bento-card mb-32 animate-stagger-4" style={{display: 'block'}}>
                <div className="text-caption text-secondary text-uppercase mb-16">Career Gap Analysis</div>
                <div style={{display: 'flex', gap: '32px', flexWrap: 'wrap'}}>
                  <div>
                    <div className="text-small text-secondary mb-4">Target Role</div>
                    <div className="text-body font-bold">{matchAnalysis.careerGap.targetRole}</div>
                  </div>
                  <div>
                    <div className="text-small text-secondary mb-4">Gap Score</div>
                    <div className="text-body font-bold" style={{color: matchAnalysis.careerGap.isReady ? '#10B981' : '#FBBF24'}}>{matchAnalysis.careerGap.gapScore}/100</div>
                  </div>
                  <div>
                    <div className="text-small text-secondary mb-4">Time to Close Gap</div>
                    <div className="text-body font-bold">{matchAnalysis.careerGap.timeToClose}</div>
                  </div>
                </div>
                {matchAnalysis.careerGap.criticalMissingSkills?.length > 0 && (
                  <div style={{marginTop: '16px'}}>
                    <div className="text-small text-secondary mb-8">Critical Missing Skills for {matchAnalysis.careerGap.targetRole}</div>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                      {matchAnalysis.careerGap.criticalMissingSkills.map(skill => (
                        <span key={skill} style={{padding: '4px 12px', background: 'rgba(248,113,113,0.1)', color: '#F87171', borderRadius: '16px', fontSize: '0.8rem'}}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="cp-action-bar" style={{display: 'flex', gap: '16px'}}>
              <button className="btn-secondary" onClick={() => setIsAnalyzed(false)}>Back to Input</button>
              <button className="btn-primary" onClick={advanceStep}>Proceed to Diagnosis <IconChevron/></button>
            </div>
          </div>
        );


      case 2:
        return (
          <div className="cp-step-content animate-fade-up">
            <h2 className="text-h2 mb-16">Diagnosis</h2>
            <p className="text-secondary mb-32">Here is a deep dive into the gaps and strengths of your profile against the JD.</p>
            
            <div className="cp-split-diagnose mb-32">
              <div className="cp-diag-col">
                <div className="cp-diag-section animate-stagger-1">
                  <div className="cp-diag-header" style={{color: '#34D399'}}>Strengths Found</div>
                  {matchAnalysis.strengths?.map((s, i) => (
                    <div key={i} className="cp-issue-item cp-issue-strength">
                      <div className="cp-issue-icon"><IconCheck/></div>
                      <div className="text-secondary">{s}</div>
                    </div>
                  ))}
                </div>
                <div className="cp-diag-section animate-stagger-2 mt-16">
                  <div className="cp-diag-header" style={{color: '#F87171'}}>Critical Weaknesses</div>
                  {resumeAnalysis.missingCriticalSkills?.map((s, i) => (
                    <div key={i} className="cp-issue-item cp-issue-critical">
                      <div className="cp-issue-icon"><IconAlert/></div>
                      <div className="text-secondary">Missing critical skill: {s}</div>
                    </div>
                  ))}
                  {(!resumeAnalysis.missingCriticalSkills || resumeAnalysis.missingCriticalSkills.length === 0) && (
                    <div className="text-tertiary text-small">No critical weaknesses detected.</div>
                  )}
                </div>
              </div>

              <div className="cp-diag-col">
                <div className="cp-diag-section animate-stagger-3">
                  <div className="cp-diag-header" style={{color: '#FBBF24'}}>Moderate Issues</div>
                  {resumeAnalysis.missingImportantSkills?.map((s, i) => (
                    <div key={i} className="cp-issue-item cp-issue-moderate">
                      <div className="cp-issue-icon"><IconAlert/></div>
                      <div className="text-secondary">Missing important skill: {s}</div>
                    </div>
                  ))}
                  {matchAnalysis.missingSkills?.map((s, i) => (
                    <div key={`ms-${i}`} className="cp-issue-item cp-issue-moderate">
                      <div className="cp-issue-icon"><IconAlert/></div>
                      <div className="text-secondary">JD requirement missing: {s}</div>
                    </div>
                  ))}
                </div>
                
                <div className="cp-diag-section animate-stagger-4 mt-16">
                  <div className="cp-diag-header" style={{color: '#60A5FA'}}>Minor Issues</div>
                  <div className="cp-issue-item cp-issue-minor">
                    <div className="cp-issue-icon"><IconAlert/></div>
                    <div className="text-secondary">Action verbs could be stronger in experience section.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cp-action-bar" style={{display: 'flex', gap: '16px'}}>
              <button className="btn-secondary" onClick={goBackStep}>Back</button>
              <button className="btn-primary" onClick={runOptimization}>Optimize Strategy <IconChevron/></button>
            </div>
          </div>
        );

      case 3:
        if (!tailorAnalysis) return null;
        return (
          <div className="cp-step-content animate-fade-up">
            <h2 className="text-h2 mb-16">Optimization</h2>
            <p className="text-secondary mb-32">We rewrote your weakest bullet points and injected the missing keywords.</p>

            <div className="cp-opt-list mb-32">
              {tailorAnalysis.bulletImprovements?.map((b, i) => (
                <div key={i} className={`cp-opt-row animate-stagger-${i+1}`}>
                  <div className="cp-opt-col original">
                    <div className="cp-opt-label">Original Bullet</div>
                    <p className="text-secondary text-small">{b.original}</p>
                  </div>
                  <div className="cp-opt-col improved">
                    <div className="cp-opt-label highlight">Optimized Result</div>
                    <p className="text-primary">{b.improved}</p>
                    <div className="cp-opt-meta">
                      <div className="cp-opt-tag high">Impact: High</div>
                      <div className="cp-opt-tag high">ATS Gain: +{Math.floor(Math.random() * 8 + 4)}%</div>
                    </div>
                    <button className="cp-copy-btn" onClick={() => handleCopy(b.improved, i)}>
                      {copiedIndex === i ? 'Copied!' : <IconCopy />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cp-action-bar" style={{display: 'flex', gap: '16px'}}>
              <button className="btn-secondary" onClick={goBackStep}>Back</button>
              <button className="btn-primary" onClick={runExecutionPlan}>Generate Execution Plan <IconChevron/></button>
            </div>
          </div>
        );

      case 4:
        if (!matchAnalysis || !tailorAnalysis) return null;
        const baseProb = Math.max(10, Math.floor(matchAnalysis.matchScore / 3)); // Dummy calc
        const optProb = Math.min(99, baseProb + 14 + Math.floor(tailorAnalysis.keywordScore / 5));
        
        return (
          <div className="cp-step-content animate-fade-up">
            
            {/* WOW SECTION: IMPACT SIMULATION */}
            <div className="cp-wow-section animate-stagger-1 mb-32">
              <h3 className="text-h3" style={{color: 'var(--text-secondary)'}}>Impact Simulation</h3>
              <div className="cp-delta-display">
                <div className="cp-delta-box">
                  <div className="text-caption text-secondary text-uppercase">Current Interview Probability</div>
                  <div className="text-h1" style={{color: 'var(--text-tertiary)'}}>{baseProb}%</div>
                </div>
                <div className="cp-delta-arrow">→</div>
                <div className="cp-delta-box">
                  <div className="text-caption text-secondary text-uppercase" style={{color: '#10B981'}}>Optimized Probability</div>
                  <div className="text-h1" style={{color: '#10B981', fontSize: '4rem'}}><AnimatedCounter targetValue={optProb} />%</div>
                </div>
              </div>
            </div>

            <h2 className="text-h2 mb-16">Execution Plan</h2>
            <p className="text-secondary mb-32">Follow these precise steps to finalize your application.</p>
            
            <div className="cp-tasks-grid mb-32">
              {tailorAnalysis.recommendations?.map((r, i) => (
                <div key={i} className={`cp-task-card animate-stagger-${i+2}`}>
                  <div className="cp-task-info">
                    <div className="text-primary font-bold">Action {i+1}</div>
                    <div className="text-secondary text-small">{r}</div>
                  </div>
                  <div className="cp-task-metrics">
                    <div className="cp-task-metric">
                      <span className="cp-metric-val impact">High</span>
                      <span className="cp-metric-label">Impact</span>
                    </div>
                    <div className="cp-task-metric">
                      <span className="cp-metric-val effort">{i % 2 === 0 ? '10 mins' : '15 mins'}</span>
                      <span className="cp-metric-label">Effort</span>
                    </div>
                    <div className="cp-task-metric">
                      <span className="cp-metric-val" style={{color: 'var(--accent-primary)'}}>+{(3 + i)}%</span>
                      <span className="cp-metric-label">ROI</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* P19 Strategic Roadmap */}
            {strategyPlan && (
              <div className="animate-stagger-4 mb-32">
                <h2 className="text-h2 mb-16">Long-Term Strategy Roadmap</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  
                  <div className="premium-bento-card style-glass">
                    <div className="text-h3" style={{ color: '#10B981', marginBottom: '12px' }}>30-Day Plan</div>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {strategyPlan.roadmap30.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
                    </ul>
                  </div>

                  <div className="premium-bento-card style-glass">
                    <div className="text-h3" style={{ color: '#3B82F6', marginBottom: '12px' }}>60-Day Plan</div>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {strategyPlan.roadmap60.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
                    </ul>
                  </div>

                  <div className="premium-bento-card style-glass">
                    <div className="text-h3" style={{ color: '#A78BFA', marginBottom: '12px' }}>90-Day Plan</div>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {strategyPlan.roadmap90.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
                    </ul>
                  </div>

                </div>
              </div>
            )}

            <div className="cp-action-bar" style={{justifyContent: 'center', marginTop: '24px'}}>
              <FeedbackWidget context="Copilot_Resume_Scan" />
            </div>

            <div className="cp-action-bar" style={{justifyContent: 'center', marginTop: '32px', display: 'flex', gap: '16px'}}>
              <button className="btn-secondary" style={{padding: '16px 48px', fontSize: '1.2rem'}} onClick={goBackStep}>Back</button>
              <button className="btn-primary" style={{padding: '16px 48px', fontSize: '1.2rem'}} onClick={() => navigate('/')}>Return to Dashboard</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ascend-container cp-page">
      {error && <div className="cp-error animate-fade-up">{error}</div>}
      
      <div className="cp-layout">
        {/* ── LEFT SIDEBAR (STEPPER) ── */}
        <div className="cp-sidebar animate-fade-up">
          <div className="cp-stepper">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className={`cp-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className="cp-step-indicator">
                    {isCompleted && <IconCheck />}
                  </div>
                  <div className="cp-step-title">{step.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT MAIN WORKSPACE ── */}
        <div className="cp-main">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
