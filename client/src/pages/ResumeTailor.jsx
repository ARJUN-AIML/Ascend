import React, { useState, useEffect } from 'react';
import resumeTailorEngine from '../services/resumeTailorEngine';
import aiService from '../services/aiService';
import './ResumeTailor.css';

// ── ICONS ────────────────────────────────────────────────
const IconUpload = () => <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" stroke="#10B981" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX = () => <svg width="18" height="18" viewBox="0 0 24 24" stroke="#F87171" strokeWidth="3" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCopy = () => <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;

// ── ANIMATED COUNTER & GAUGE ─────────────────────────────
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

const RadialGauge = ({ value, label, color }) => {
  const r = 50, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="rt-radial-gauge">
      <svg width="120" height="120" viewBox="0 0 120 120" className="rt-gauge-svg">
        <circle className="rt-gauge-bg" cx="60" cy="60" r={r} strokeWidth="8" />
        <circle className="rt-gauge-progress" cx="60" cy="60" r={r} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={off} stroke={color} />
      </svg>
      <div className="rt-gauge-content">
        <span className="rt-gauge-value" style={{ color }}><AnimatedCounter targetValue={value} />%</span>
        <span className="rt-gauge-label">{label}</span>
      </div>
    </div>
  );
};

export default function ResumeTailor() {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

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

  const handleTailor = async () => {
    if (!resumeText.trim() || !jobDesc.trim()) {
      setError('Please provide both Resume and Job Description.');
      return;
    }
    setIsTailoring(true);
    setError('');
    setResults(null);
    try {
      const data = await resumeTailorEngine.tailorResume(resumeText, jobDesc);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Tailoring failed. Please try again.');
    } finally {
      setIsTailoring(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="ascend-container rt-page">
      <div className="rt-hero animate-fade-up">
        <h1 className="text-h1">Resume Tailoring Engine</h1>
        <p className="text-large text-secondary">Optimize your resume for any role to beat the ATS.</p>
      </div>

      {error && <div className="rt-error animate-fade-up">{error}</div>}

      {!results && (
        <div className="rt-input-grid animate-fade-up" style={{animationDelay: '0.1s'}}>
          <div className="premium-card rt-input-card">
            <div className="rt-card-header">
              <h3 className="text-h3">Current Resume</h3>
              <label className="btn-secondary btn-sm rt-upload-btn">
                <input type="file" accept=".pdf,.docx" hidden onChange={handleFileUpload} />
                {isExtracting ? 'Extracting...' : <><IconUpload /> Upload</>}
              </label>
            </div>
            <textarea 
              className="rt-textarea" 
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <div className="premium-card rt-input-card">
            <div className="rt-card-header">
              <h3 className="text-h3">Job Description</h3>
            </div>
            <textarea 
              className="rt-textarea" 
              placeholder="Paste the target job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>
      )}

      {!results && (
        <div className="rt-action-bar animate-fade-up" style={{animationDelay: '0.2s'}}>
          <button 
            className={`btn-primary rt-tailor-btn ${isTailoring ? 'pulsing' : ''}`} 
            onClick={handleTailor} 
            disabled={isTailoring || isExtracting}
          >
            {isTailoring ? 'Tailoring Resume...' : 'Tailor My Resume'}
          </button>
        </div>
      )}

      {results && (
        <div className="rt-results-dashboard animate-fade-up">
          <div className="rt-results-top">
            <div className="premium-card rt-score-card animate-stagger-1">
              <RadialGauge 
                value={results.keywordScore} 
                label="ATS Keyword Score" 
                color={results.keywordScore >= 80 ? '#10B981' : results.keywordScore >= 50 ? '#FBBF24' : '#F87171'} 
              />
              <button className="btn-ghost" onClick={() => setResults(null)} style={{marginTop: 'var(--sp-24)'}}>Tailor Another Resume</button>
            </div>

            <div className="rt-keyword-lists">
              <div className="premium-card rt-list-card animate-stagger-2">
                <h4 className="text-h4" style={{marginBottom: 'var(--sp-12)'}}>Found Keywords</h4>
                <div className="rt-badges">
                  {results.foundKeywords?.map((kw, i) => (
                    <span key={i} className="rt-badge success"><IconCheck /> {kw}</span>
                  ))}
                </div>
              </div>
              <div className="premium-card rt-list-card animate-stagger-3">
                <h4 className="text-h4" style={{marginBottom: 'var(--sp-12)'}}>Missing Keywords</h4>
                <div className="rt-badges">
                  {results.missingKeywords?.map((kw, i) => (
                    <span key={i} className="rt-badge danger"><IconX /> {kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="premium-card rt-bullets-card animate-stagger-4">
            <h3 className="text-h3" style={{marginBottom: 'var(--sp-24)'}}>AI Bullet Point Rewrites</h3>
            <div className="rt-bullets-list">
              {results.bulletImprovements?.map((b, i) => (
                <div key={i} className="rt-bullet-row">
                  <div className="rt-bullet-col original">
                    <div className="rt-bullet-label">Original</div>
                    <p className="rt-bullet-text">{b.original}</p>
                  </div>
                  <div className="rt-bullet-col improved">
                    <div className="rt-bullet-label highlight">Tailored & Optimized</div>
                    <p className="rt-bullet-text">{b.improved}</p>
                    <button 
                      className="rt-copy-btn" 
                      onClick={() => handleCopy(b.improved, i)}
                      title="Copy to clipboard"
                    >
                      {copiedIndex === i ? 'Copied!' : <IconCopy />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card rt-recommendations animate-stagger-5">
            <h3 className="text-h3" style={{marginBottom: 'var(--sp-16)'}}>Strategic Recommendations</h3>
            <ul className="rt-rec-list">
              {results.recommendations?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
