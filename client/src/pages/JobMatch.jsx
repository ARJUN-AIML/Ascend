import React, { useState, useEffect } from 'react';
import jdMatchEngine from '../services/jdMatchEngine';
import aiService from '../services/aiService';
import './JobMatch.css';

// ── ICONS ────────────────────────────────────────────────
const IconUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="var(--accent-primary)" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="#F87171" strokeWidth="3" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

// ── ANIMATED COUNTER ─────────────────────────────────────
const AnimatedCounter = ({ targetValue }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let id; let start = null; const dur = 1500;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = ts - start;
      const r = p === dur ? 1 : 1 - Math.pow(2, -10 * p / dur);
      if (p < dur) { setVal(r * targetValue); id = requestAnimationFrame(tick); }
      else setVal(targetValue);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [targetValue]);
  return <>{Math.floor(val)}</>;
};

// ── RADIAL GAUGE ─────────────────────────────────────────
const RadialGauge = ({ value, label, color }) => {
  const r = 70, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const [pulse, setPulse] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPulse(true), 1500); return () => clearTimeout(t); }, [value]);
  return (
    <div className={`jd-radial-gauge ${pulse ? 'pulse-glow' : ''}`}>
      <svg width="180" height="180" viewBox="0 0 180 180" className="gauge-svg">
        <circle className="gauge-bg" cx="90" cy="90" r={r} strokeWidth="10" />
        <circle className="gauge-progress" cx="90" cy="90" r={r} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={off} stroke={color} style={{ '--dash-offset': off }} />
      </svg>
      <div className="gauge-content">
        <span className="gauge-value" style={{ color }}><AnimatedCounter targetValue={value} />%</span>
        <span className="gauge-label">{label}</span>
      </div>
    </div>
  );
};

export default function JobMatch() {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsExtracting(true);
    setError('');
    try {
      const data = await aiService.extractResume(file);
      setResumeText(data.text);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to extract resume text.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDesc.trim()) {
      setError('Please provide both Resume and Job Description.');
      return;
    }
    setIsAnalyzing(true);
    setError('');
    setResults(null);
    try {
      const data = await jdMatchEngine.analyzeJobMatch(resumeText, jobDesc);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getProbabilityColor = (prob) => {
    if (prob === 'High') return '#34D399';
    if (prob === 'Moderate') return '#FBBF24';
    return '#F87171';
  };

  return (
    <div className="ascend-container jd-match-page">
      {/* ── HERO ────────────────────────────────────────────── */}
      <div className="jd-hero animate-fade-up">
        <h1 className="text-h1">Job Match Engine</h1>
        <p className="text-large text-secondary">Analyze your compatibility with any job instantly.</p>
      </div>

      {error && <div className="jd-error animate-fade-up">{error}</div>}

      {/* ── INPUT SECTION ───────────────────────────────────── */}
      {!results && (
        <div className="jd-input-grid animate-fade-up" style={{animationDelay: '0.1s'}}>
          <div className="premium-card jd-input-card">
            <h3 className="text-h3" style={{marginBottom: 'var(--sp-16)'}}>Your Resume</h3>
            <textarea 
              className="jd-textarea" 
              placeholder="Paste your resume text here or upload a file..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="jd-upload-bar">
              <label className="btn-secondary jd-upload-btn">
                <input type="file" accept=".pdf,.docx" hidden onChange={handleFileUpload} />
                {isExtracting ? 'Extracting...' : <><IconUpload /> Upload Resume (PDF/DOCX)</>}
              </label>
            </div>
          </div>

          <div className="premium-card jd-input-card">
            <h3 className="text-h3" style={{marginBottom: 'var(--sp-16)'}}>Job Description</h3>
            <textarea 
              className="jd-textarea" 
              placeholder="Paste the target job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>
      )}

      {!results && (
        <div className="jd-action-bar animate-fade-up" style={{animationDelay: '0.2s'}}>
          <button 
            className={`btn-primary jd-analyze-btn ${isAnalyzing ? 'pulsing' : ''}`} 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || isExtracting}
          >
            {isAnalyzing ? 'Analyzing Match...' : 'Analyze Match'}
          </button>
        </div>
      )}

      {/* ── RESULTS DASHBOARD ─────────────────────────────── */}
      {results && (
        <div className="jd-results-dashboard animate-fade-up">
          <div className="jd-results-top">
            <div className="premium-card jd-score-card animate-stagger-1">
              <RadialGauge value={results.matchScore} label="Match Score" color={results.matchScore >= 75 ? 'var(--accent-primary)' : results.matchScore >= 50 ? '#FBBF24' : '#F87171'} />
              <div className="jd-prob-badge" style={{color: getProbabilityColor(results.winProbability), background: `${getProbabilityColor(results.winProbability)}15`}}>
                Win Probability: {results.winProbability}
              </div>
              <button className="btn-ghost" onClick={() => setResults(null)} style={{marginTop: 'var(--sp-24)'}}>Scan Another Job</button>
            </div>
            
            <div className="jd-results-lists">
              <div className="premium-card jd-list-card animate-stagger-2">
                <h3 className="text-h3" style={{marginBottom: 'var(--sp-16)'}}>Strengths</h3>
                <ul className="jd-list">
                  {results.strengths?.map((s, i) => (
                    <li key={i}><IconCheck /> <span>{s}</span></li>
                  ))}
                  {results.strengths?.length === 0 && <li className="text-tertiary">No major strengths identified.</li>}
                </ul>
              </div>

              <div className="premium-card jd-list-card animate-stagger-3">
                <h3 className="text-h3" style={{marginBottom: 'var(--sp-16)'}}>Missing Skills</h3>
                <ul className="jd-list missing">
                  {results.missingSkills?.map((m, i) => (
                    <li key={i}><IconX /> <span>{m}</span></li>
                  ))}
                  {results.missingSkills?.length === 0 && <li className="text-tertiary">No critical skills missing!</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="premium-card jd-action-plan animate-stagger-4">
            <h3 className="text-h3" style={{marginBottom: 'var(--sp-24)'}}>Action Plan</h3>
            <div className="jd-plan-grid">
              {results.recommendations?.map((r, i) => (
                <div key={i} className="jd-plan-step">
                  <div className="jd-step-num">{i + 1}</div>
                  <div className="jd-step-text">{r}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
