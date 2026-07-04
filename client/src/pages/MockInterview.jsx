import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewEngine from '../services/interviewEngine';
import FeedbackWidget from '../components/FeedbackWidget';
import './MockInterview.css';

// ── ICONS ────────────────────────────────────────────────
const IconChevron = () => <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6"/></svg>;
const IconCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" stroke="#10B981" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"/></svg>;
const IconMic = () => <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;

// ── ANIMATED GAUGE / COUNTER ─────────────────────────────
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


export default function MockInterview() {
  const navigate = useNavigate();
  const [view, setView] = useState('setup'); // setup | session | evaluating | results
  const [error, setError] = useState('');
  
  // Setup State
  const [role, setRole] = useState('Frontend');
  const [difficulty, setDifficulty] = useState('Medium');
  const [experience, setExperience] = useState('Fresher');
  const [isStarting, setIsStarting] = useState(false);

  // Session State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionData, setSessionData] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timer, setTimer] = useState(0);

  // Evaluation State
  const [evaluation, setEvaluation] = useState(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [expandedExplain, setExpandedExplain] = useState({});

  useEffect(() => {
    let interval = null;
    if (view === 'session') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  const handleStart = async () => {
    setIsStarting(true);
    setError('');
    try {
      const data = await interviewEngine.generateSession(role, difficulty, experience);
      setQuestions(data.questions);
      setSessionData([]);
      setCurrentIndex(0);
      setTimer(0);
      setCurrentAnswer('');
      setView('session');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate interview.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) return;

    const newSessionData = [
      ...sessionData,
      { question: questions[currentIndex], answer: currentAnswer }
    ];
    setSessionData(newSessionData);
    
    if (currentIndex < questions.length - 1) {
      setCurrentAnswer('');
      setCurrentIndex(currentIndex + 1);
    } else {
      setView('evaluating');
      try {
        const result = await interviewEngine.evaluateSession(role, difficulty, experience, newSessionData);
        setEvaluation(result);
        setView('results');
      } catch (err) {
        setError(err.response?.data?.error || 'Evaluation failed. Please try again.');
        setView('setup');
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderSetup = () => (
    <div className="mi-setup animate-fade-up">
      <div className="mi-split-layout">
        <div className="mi-split-left">
          <h1 className="text-hero mb-16">AI Interview Coach</h1>
          <p className="text-large text-secondary mb-32">
            Simulate real-world technical interviews with deterministic AI and receive a line-by-line strategic code review of your answers.
          </p>
          <div className="mi-feature-list">
            <div className="mi-feature-item">
              <div className="mi-feature-icon"><IconCheck /></div>
              <div className="mi-feature-text">
                <h4>Mistake Replay Engine</h4>
                <p>Pinpoint exact weaknesses and see the golden optimal answers.</p>
              </div>
            </div>
            <div className="mi-feature-item">
              <div className="mi-feature-icon"><IconCheck /></div>
              <div className="mi-feature-text">
                <h4>Actionable Coaching</h4>
                <p>Get a high-ROI study plan based on your exact fail points.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mi-split-right">
          <div className="premium-card p-32 mi-setup-card">
            {error && <div className="mi-error">{error}</div>}
            <h3 className="text-h3 mb-24">Configure Session</h3>

            <div className="mi-field">
              <label>Target Role</label>
              <div className="mi-chip-group">
                {['Frontend', 'Backend', 'Fullstack', 'AIML', 'Data Engineering'].map(r => (
                  <button key={r} className={`mi-chip ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>{r}</button>
                ))}
              </div>
            </div>

            <div className="mi-field">
              <label>Difficulty</label>
              <div className="mi-chip-group">
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} className={`mi-chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>
                ))}
              </div>
            </div>

            <div className="mi-field" style={{marginBottom: 'var(--sp-48)'}}>
              <label>Experience Level</label>
              <div className="mi-chip-group">
                {['Fresher', 'Junior', 'Senior'].map(e => (
                  <button key={e} className={`mi-chip ${experience === e ? 'active' : ''}`} onClick={() => setExperience(e)}>{e}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn-primary" style={{width: '100%', maxWidth: '400px', padding: '16px', fontSize: '1.1rem', borderRadius: '30px'}} onClick={handleStart} disabled={isStarting}>
                {isStarting ? 'Generating Session...' : 'Start Interview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSession = () => {
    const q = questions[currentIndex];
    return (
      <div className="mi-session animate-fade-up">
        <div className="mi-session-header">
          <div className="text-secondary">Question {currentIndex + 1} of {questions.length}</div>
          <div className="mi-timer">{formatTime(timer)}</div>
        </div>
        
        <div className="premium-card p-32 mi-question-card">
          <div className="mi-q-type mb-12">{q.type} Question</div>
          <h2 className="text-h2 mb-24">{q.question}</h2>
          
          <div className="mi-answer-zone">
            <textarea 
              className="mi-textarea" 
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              autoFocus
            />
          </div>

          <div className="mi-session-footer mt-24">
            <div className="text-small text-tertiary" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
              <IconMic /> Voice input coming soon
            </div>
            <button className="btn-primary" onClick={handleNextQuestion} disabled={!currentAnswer.trim()}>
              {currentIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'} <IconChevron />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEvaluating = () => (
    <div className="mi-evaluating animate-fade-up">
      <div className="mi-spinner"></div>
      <h2 className="text-h2 mt-24">Evaluating Performance...</h2>
      <p className="text-secondary mt-12">The AI Hiring Manager is running a line-by-line review of your answers.</p>
    </div>
  );

  const renderResults = () => {
    if (!evaluation) return null;
    
    const displayReplays = showAllQuestions 
      ? evaluation.replays 
      : evaluation.replays.filter(r => r.score < 75);

    return (
      <div className="mi-results animate-fade-up">
        
        {/* 1. VERDICT BANNER */}
        <div className={`mi-verdict-banner ${evaluation.verdictClass} animate-fade-up stagger-1`}>
          <div className="text-caption text-uppercase" style={{letterSpacing: '2px', fontWeight: 700}}>Final Verdict</div>
          <h1 className="text-hero">{evaluation.verdict}</h1>
          <p className="mi-verdict-summary">{evaluation.verdictSummary}</p>
          {/* P17.1: Evaluation confidence + reasoning label */}
          <div style={{display:'flex', gap:'12px', justifyContent:'center', marginTop:'16px', flexWrap:'wrap'}}>
            {evaluation.evaluationConfidence && (
              <div style={{
                padding:'6px 16px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:600,
                background: evaluation.evaluationConfidence.label === 'High' ? 'rgba(16,185,129,0.15)' : evaluation.evaluationConfidence.label === 'Medium' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
                color: evaluation.evaluationConfidence.label === 'High' ? '#10B981' : evaluation.evaluationConfidence.label === 'Medium' ? '#FBBF24' : '#F87171',
                border: '1px solid currentColor',
              }}>
                Evaluation Confidence: {evaluation.evaluationConfidence.score}% ({evaluation.evaluationConfidence.label})
              </div>
            )}
            {evaluation.reasoningLabel && (
              <div style={{
                padding:'6px 16px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:600,
                background:'rgba(139,92,246,0.15)', color:'#A78BFA', border:'1px solid #A78BFA',
              }}>
                Reasoning: {evaluation.reasoningLabel}
              </div>
            )}
          </div>
          {evaluation.evaluationConfidence?.label === 'Low' && (
            <p style={{fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginTop:'8px', maxWidth:'500px', margin:'8px auto 0'}}>
              ⚠️ {evaluation.evaluationConfidence.explanation}
            </p>
          )}
        </div>

        {/* 2. SCORE BREAKDOWN */}
        <div className="mi-score-bento animate-fade-up stagger-2">
          {evaluation.scores.map((s, i) => (
            <div key={i} className="mi-score-card">
              <div className="mi-score-header">
                <span className="mi-score-title">{s.label}</span>
                <span className={`mi-score-status mi-status-${s.statusClass}`}>{s.status}</span>
              </div>
              <div className="mi-score-value mt-16" style={{color: 'var(--text-primary)'}}>
                <AnimatedCounter targetValue={s.score} /><span style={{fontSize: '1.2rem', color: 'var(--text-tertiary)'}}>/{s.maxRaw || 100}</span>
              </div>
              <p className="mi-score-insight">{s.insight}</p>
              {s.severity && (
                <div style={{marginTop:'12px', fontSize:'0.75rem', fontWeight:700, color: s.severity === 'Critical' ? '#F87171' : '#FBBF24'}}>
                   Severity: {s.severity}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 3. MISTAKE REPLAY ENGINE */}
        <div className="mi-replay-section animate-fade-up stagger-3">
          <div className="mi-replay-header">
            <h2 className="text-h2">Mistake Replay Engine</h2>
            <button className="mi-replay-toggle" onClick={() => setShowAllQuestions(!showAllQuestions)}>
              {showAllQuestions ? 'Show Only Mistakes' : 'View All Questions'}
            </button>
          </div>

          {displayReplays.length === 0 ? (
            <div className="premium-card p-32" style={{textAlign: 'center', color: 'var(--text-secondary)'}}>
              No critical mistakes detected! Toggle "View All" to see your answers.
            </div>
          ) : (
            displayReplays.map((r, i) => (
              <div key={i} className="mi-replay-card">
                {/* Question header */}
                <div className="mi-replay-q">
                  <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px'}}>
                    <div className="mi-replay-label neutral">Question {i+1}</div>
                    <div style={{marginLeft:'auto', fontSize:'0.8rem', fontWeight:700,
                      padding:'2px 10px', borderRadius:'8px',
                      background: r.score < 50 ? 'rgba(248,113,113,0.1)' : r.score < 75 ? 'rgba(251,191,36,0.1)' : 'rgba(16,185,129,0.1)',
                      color: r.score < 50 ? '#F87171' : r.score < 75 ? '#FBBF24' : '#10B981'
                    }}>{r.score}/100</div>
                  </div>
                  <div className="text-large" style={{color: 'var(--text-primary)', fontWeight: 600}}>{r.question}</div>
                </div>

                {/* Answer + Problem */}
                <div className="mi-replay-blocks">
                  <div className="mi-replay-block user-ans">
                    <div className="mi-replay-label red">Your Answer</div>
                    <div className="mi-replay-text">{r.userAnswer}</div>
                  </div>
                  <div className="mi-replay-block problem">
                    <div className="mi-replay-label yellow">The Problem</div>
                    <div className="mi-replay-text secondary">{r.problem}</div>
                  </div>
                </div>

                {/* 4 NEW BRUTAL FIELDS */}
                <div style={{padding:'var(--sp-24)', display:'flex', flexDirection:'column', gap:'var(--sp-16)',
                  borderTop:'1px solid var(--border-light)', background:'rgba(0,0,0,0.15)'}}>
                  {r.criticalIssue && (
                    <div>
                      <div className="mi-replay-label red" style={{marginBottom:'6px'}}>⚡ Critical Issue</div>
                      <div className="mi-replay-text secondary" style={{fontSize:'0.9rem'}}>{r.criticalIssue}</div>
                    </div>
                  )}
                  {r.interviewerImpression && (
                    <div>
                      <div className="mi-replay-label yellow" style={{marginBottom:'6px'}}>👔 Interviewer Impression</div>
                      <div className="mi-replay-text secondary" style={{fontSize:'0.9rem'}}>{r.interviewerImpression}</div>
                    </div>
                  )}
                  {r.hiringRisk && (
                    <div>
                      <div className="mi-replay-label red" style={{marginBottom:'6px'}}>🚨 Hiring Risk</div>
                      <div className="mi-replay-text secondary" style={{fontSize:'0.9rem'}}>{r.hiringRisk}</div>
                    </div>
                  )}
                </div>

                {/* Ideal Answer */}
                {r.optimalAnswer && (
                  <div className="mi-replay-block optimal">
                    <div className="mi-replay-label green">✓ Ideal Answer</div>
                    <div className="mi-replay-text">{r.optimalAnswer}</div>
                  </div>
                )}

                {/* P18 Explainability Toggle */}
                {r.explainability && (
                  <div style={{borderTop: '1px solid var(--border-light)'}}>
                    <button 
                      onClick={() => setExpandedExplain(prev => ({...prev, [i]: !prev[i]}))}
                      style={{
                        width: '100%', padding: '12px 24px', background: 'transparent', border: 'none',
                        color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                        textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                      className="hover-lift"
                    >
                      <span>{expandedExplain[i] ? 'Hide Scoring Details' : 'View Scoring Details'}</span>
                      <span style={{transform: expandedExplain[i] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}>▼</span>
                    </button>
                    
                    {expandedExplain[i] && (
                      <div style={{padding: '0 24px 24px 24px', background: 'rgba(0,0,0,0.2)', fontSize: '0.85rem'}}>
                        {r.explainability.dimensions.map((dim, dIdx) => (
                          <div key={dIdx} style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '6px'}}>
                              <span style={{fontWeight: 700, color: 'var(--text-primary)'}}>{dim.name}</span>
                              <span style={{color: 'var(--text-secondary)'}}>{dim.score} / {dim.maxScore}</span>
                            </div>
                            
                            {dim.matchedSignals.length > 0 && (
                              <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px'}}>
                                <span style={{color: '#10B981', marginRight: '4px'}}>Matched:</span>
                                {dim.matchedSignals.map(sig => <span key={sig} style={{padding: '2px 6px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', color: '#10B981'}}>{sig}</span>)}
                              </div>
                            )}
                            
                            {dim.missingSignals.length > 0 && (
                              <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px'}}>
                                <span style={{color: '#F87171', marginRight: '4px'}}>Missing:</span>
                                {dim.missingSignals.map(sig => <span key={sig} style={{padding: '2px 6px', background: 'rgba(248,113,113,0.1)', borderRadius: '4px', color: '#F87171'}}>{sig}</span>)}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {r.explainability.appliedPenalties?.length > 0 && (
                          <div style={{marginTop: '12px'}}>
                            <div style={{color: '#FBBF24', fontWeight: 700, marginBottom: '6px'}}>Applied Penalties</div>
                            {r.explainability.appliedPenalties.map((pen, pIdx) => (
                              <div key={pIdx} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                                <span style={{color: 'var(--text-secondary)'}}>{pen.message}</span>
                                <span style={{color: '#F87171'}}>{pen.deduction > 0 ? `-${pen.deduction}` : ''}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 4. COACHING PLAN */}
        <div className="animate-fade-up stagger-4" style={{width: '100%'}}>
          <h2 className="text-h2 mb-24">Actionable Coaching Plan</h2>
          <div className="mi-coach-grid">
            {(evaluation.coachingPlan || []).map((c, i) => (
              <div key={i} className="mi-coach-task">
                <div className="mi-coach-action">{c.action}</div>
                <div className="mi-coach-meta">
                  <div className="mi-coach-metric">
                    <span className="mi-coach-metric-val impact">{c.priority || c.impact || 'HIGH'}</span>
                    <span className="mi-coach-metric-lbl">Priority</span>
                  </div>
                  <div className="mi-coach-metric">
                    <span className="mi-coach-metric-val effort">{c.effort}</span>
                    <span className="mi-coach-metric-lbl">Effort</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. SUCCESS SIMULATION (WOW SECTION) */}
        <div className="mi-wow-section animate-fade-up stagger-5">
          <h3 className="text-h3" style={{color: 'var(--text-secondary)'}}>Success Simulation</h3>
          <p className="text-secondary" style={{maxWidth: '500px'}}>If you complete the coaching plan above, your probability of passing this interview loop increases dramatically.</p>
          
          <div className="mi-delta-display">
            <div className="mi-delta-box">
              <div className="text-caption text-secondary text-uppercase">Current Probability</div>
              <div className="text-h1" style={{color: 'var(--text-tertiary)'}}>{evaluation.simulation.currentProb}%</div>
            </div>
            <div className="mi-delta-arrow">→</div>
            <div className="mi-delta-box">
              <div className="text-caption text-secondary text-uppercase" style={{color: '#10B981'}}>Future Probability</div>
              <div className="text-h1" style={{color: '#10B981', fontSize: '4.5rem'}}><AnimatedCounter targetValue={evaluation.simulation.futureProb} />%</div>
            </div>
          </div>

          <div className="mi-sim-metrics">
            <div className="mi-sim-metric">
              <span className="text-caption text-secondary text-uppercase">Confidence Gain</span>
              <span className="text-h3 text-primary">{evaluation.simulation.confidenceGain}</span>
            </div>
            <div className="mi-sim-metric">
              <span className="text-caption text-secondary text-uppercase">Expected Window</span>
              <span className="text-h3 text-primary">{evaluation.simulation.timeframe}</span>
            </div>
          </div>
        </div>

        <div style={{width: '100%', marginTop: '32px'}}>
          <FeedbackWidget context="MockInterview_Results" />
        </div>

        <div style={{display: 'flex', justifyContent: 'center', gap: '16px', width: '100%', marginTop: '32px'}}>
          <button className="btn-secondary" onClick={() => setView('setup')}>Run Another Simulation</button>
          <button className="btn-primary" onClick={() => navigate('/copilot')}>Go to Action Hub</button>
        </div>
      </div>
    );
  };

  return (
    <div className="ascend-container mi-page">
      {view === 'setup' && renderSetup()}
      {view === 'session' && renderSession()}
      {view === 'evaluating' && renderEvaluating()}
      {view === 'results' && renderResults()}
    </div>
  );
}
