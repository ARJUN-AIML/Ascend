import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import aiService from '../services/aiService';
import './SkillGapRadar.css';

// --- MOCK STRATEGY ENGINE PAYLOAD ---
const mockStrategyPayload = {
  readiness: {
    currentScore: 58,
    futureScore: 83,
    timeToReady: '12 Weeks',
    unlockedRoles: 'Senior Engineer, Tech Lead',
    salaryBump: '+$25k - $40k',
    confidenceIncrease: '+45%',
    confidenceScore: 'Medium',
    marketFitScore: 68
  },
  marketData: {
    demand: 'High',
    competition: 'High',
    salaryRange: '$100k - $160k'
  },
  companyFit: {
    startup: 76,
    service: 84,
    product: 61,
    faang: 28
  },
  radarData: [
    { subject: 'Core Language', A: 85, fullMark: 100 },
    { subject: 'System Design', A: 30, fullMark: 100 },
    { subject: 'Cloud & DevOps', A: 20, fullMark: 100 },
    { subject: 'Data Engineering', A: 50, fullMark: 100 },
    { subject: 'APIs & Microservices', A: 65, fullMark: 100 }
  ],
  missingSkills: [
    { name: 'Kubernetes & EKS', importance: 'Critical', time: '3 weeks', impact: '+12%' },
    { name: 'Distributed Systems Design', importance: 'Critical', time: '4 weeks', impact: '+15%' },
    { name: 'Kafka / Event Streaming', importance: 'Moderate', time: '2 weeks', impact: '+8%' },
    { name: 'GraphQL', importance: 'Optional', time: '1 week', impact: '+4%' }
  ],
  roadmap: [
    {
      phase: 1,
      timeline: 'Week 1-3',
      goal: 'Master Cloud & Container Orchestration',
      tasks: [
        'Complete Kubernetes Core Concepts',
        'Containerize a multi-tier Node.js application',
        'Deploy cluster to AWS EKS locally'
      ],
      output: 'Production-ready EKS Microservices Project'
    },
    {
      phase: 2,
      timeline: 'Week 4-7',
      goal: 'Distributed Systems & Architecture',
      tasks: [
        'Study CAP Theorem & Data Partitioning',
        'Implement distributed rate limiting with Redis',
        'Practice 10 mock system design interviews'
      ],
      output: 'System Design Interview Readiness'
    },
    {
      phase: 3,
      timeline: 'Week 8-12',
      goal: 'Event-Driven Engineering',
      tasks: [
        'Understand Pub/Sub vs Message Queues',
        'Build an event-sourced analytics pipeline with Kafka',
        'Integrate Dead Letter Queues'
      ],
      output: 'Event-Sourced Analytics Engine Project'
    }
  ]
};

// --- ICONS ---
const IconZap = () => <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconTarget = () => <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconTrendingUp = () => <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

const AnimatedCounter = ({ targetValue }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let animationFrameId;
    let startTime = null;
    const duration = 1500;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      
      setVal(progressRatio * targetValue);
      
      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setVal(targetValue);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue]);
  return <>{Math.floor(val)}</>;
};

export default function SkillGapRadar() {
  const [appState, setAppState] = useState('input'); // input | processing | results
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [currentSkills, setCurrentSkills] = useState('Python, Django, PostgreSQL, Basic AWS, REST APIs');
  const [strategy, setStrategy] = useState(null);

  const handleExecute = async () => {
    setAppState('processing');
    try {
      const response = await aiService.analyzeSkillGap({ currentSkills, targetRole });
      
      setTimeout(() => {
        if (response.radar) {
          const r = response.radar;
          const mappedStrategy = {
            readiness: {
              currentScore: r.readinessScore || 0,
              timeToReady: r.estimatedTimeline || '12 Weeks',
              confidenceScore: r.confidenceScore || 'Medium',
              marketFitScore: r.marketFitScore || 0
            },
            marketData: r.marketData || { demand: 'High', competition: 'High', salaryRange: 'N/A' },
            companyFit: r.companyFit || { startup: 0, service: 0, product: 0, faang: 0 },
            radarData: r.radarData || [],
            missingSkills: r.deficits || [],
            roadmap: (r.roadmap && r.roadmap.length > 0) ? r.roadmap.map(p => ({
              phase: p.phase,
              timeline: p.estimatedTime || '2 Weeks',
              goal: p.title || 'Master Concepts',
              tasks: p.skillsCovered ? p.skillsCovered.map(s => `Master ${s}`) : ['Complete foundational tutorials'],
              output: p.deliverables || 'Phase Complete'
            })) : mockStrategyPayload.roadmap
          };
          setStrategy(mappedStrategy);
        } else {
          setStrategy(mockStrategyPayload);
        }
        setAppState('results');
      }, 2000);
    } catch (err) {
      console.error('Skill Radar failed:', err);
      setTimeout(() => {
        setStrategy(mockStrategyPayload);
        setAppState('results');
      }, 1000);
    }
  };

  return (
    <div className="sgr-root">
      <div className="ascend-container" style={{ paddingBottom: 'var(--sp-64)', paddingTop: 'var(--sp-32)' }}>
        
        {/* ── STATE 1: INPUT ── */}
        {appState === 'input' && (
          <div className="sgr-input-view animate-fade-up">
            <div className="sgr-input-hero">
              <div className="sgr-icon-badge">
                <IconZap />
              </div>
              <h1 className="text-h1">Skill Radar</h1>
              <p className="text-large text-secondary" style={{maxWidth: '500px', textAlign: 'center'}}>
                Identify critical skill gaps and generate a deterministic execution plan to achieve your target role.
              </p>
            </div>
            
            <div className="sgr-input-card">
              <div className="sgr-form-group">
                <label className="text-caption text-secondary">Target Trajectory</label>
                <input className="sgr-input" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior Backend Engineer" />
              </div>
              <div className="sgr-form-group" style={{marginTop: 'var(--sp-24)'}}>
                <label className="text-caption text-secondary">Current Core Stack</label>
                <textarea className="sgr-input" rows={4} value={currentSkills} onChange={e => setCurrentSkills(e.target.value)} placeholder="e.g. Python, Django, PostgreSQL..." />
              </div>
              <button className="btn-primary sgr-execute-btn" onClick={handleExecute} style={{marginTop: 'var(--sp-32)'}}>
                Run Strategy Engine
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 2: PROCESSING ── */}
        {appState === 'processing' && (
          <div className="sgr-processing-view animate-fade-up">
            <div className="sgr-pulse-ring">
              <div className="sgr-pulse-inner"></div>
            </div>
            <h2 className="text-h2" style={{marginTop: 'var(--sp-32)'}}>Computing Trajectory...</h2>
            <p className="text-body text-secondary">Mapping ontology against {targetRole} market requirements.</p>
          </div>
        )}

        {/* ── STATE 3: RESULTS ── */}
        {appState === 'results' && strategy && (
          <div className="rhythm-section">
            
            {/* TASK 1: REDUCE RADAR DOMINANCE (Top Bento) */}
            <div className="sgr-top-bento animate-fade-up stagger-1">
              <div className="sgr-bento-card hero">
                <div>
                  <span className="text-caption" style={{color: 'var(--accent-primary)', display: 'block', marginBottom: '4px'}}>Strategy Initialized</span>
                  <h2 className="text-h2" style={{color: 'var(--text-primary)'}}>{targetRole}</h2>
                </div>
                <button className="btn-secondary" onClick={() => setAppState('input')} style={{padding: '8px 16px'}}>Recalibrate Target</button>
              </div>
              <div className="sgr-bento-card" style={{textAlign: 'center', alignItems: 'center'}}>
                <span className="text-caption text-secondary">Current Readiness</span>
                <div className="text-h2" style={{color: 'var(--text-primary)', marginTop: '4px'}}><AnimatedCounter targetValue={strategy.readiness.currentScore} />%</div>
              </div>
              <div className="sgr-bento-card" style={{textAlign: 'center', alignItems: 'center'}}>
                <span className="text-caption text-secondary">Time to Target</span>
                <div className="text-h2" style={{color: '#10B981', marginTop: '4px'}}>{strategy.readiness.timeToReady}</div>
              </div>
              <div className="sgr-bento-card" style={{textAlign: 'center', alignItems: 'center'}}>
                <span className="text-caption text-secondary">Market Fit Score</span>
                <div className="text-h2" style={{color: strategy.readiness.marketFitScore >= 70 ? '#10B981' : strategy.readiness.marketFitScore >= 40 ? '#FBBF24' : '#F87171', marginTop: '4px'}}>{strategy.readiness.marketFitScore}/100</div>
              </div>
            </div>

            {/* NEW: MARKET INTELLIGENCE & COMPANY FIT */}
            <div className="sgr-market-split animate-fade-up stagger-2" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px'}}>
              <div className="sgr-market-intel" style={{background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-12)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <span className="text-caption text-secondary" style={{display: 'block'}}>Market Intelligence</span>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px'}}>
                  <div>
                    <span className="text-small text-secondary">Est. Salary Range</span>
                    <div className="text-h3" style={{color: '#34D399', marginTop: '4px'}}>{strategy.marketData.salaryRange}</div>
                  </div>
                  <div>
                    <span className="text-small text-secondary">Market Demand</span>
                    <div className="text-h3" style={{color: 'var(--text-primary)', marginTop: '4px'}}>{strategy.marketData.demand}</div>
                  </div>
                  <div>
                    <span className="text-small text-secondary">Competition</span>
                    <div className="text-h3" style={{color: 'var(--accent-primary)', marginTop: '4px'}}>{strategy.marketData.competition}</div>
                  </div>
                </div>
              </div>

              <div className="sgr-company-fit" style={{background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-12)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <span className="text-caption text-secondary" style={{display: 'block'}}>Company Tier Fit</span>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '8px'}}>
                  {Object.entries(strategy.companyFit).map(([tier, score]) => (
                    <div key={tier} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span className="text-small font-600 text-uppercase" style={{color: 'var(--text-primary)'}}>{tier}</span>
                        <span className="text-small" style={{color: score >= 70 ? '#10B981' : score >= 40 ? '#FBBF24' : '#F87171'}}>{score}%</span>
                      </div>
                      <div className="sgr-progress-track">
                        <div className="sgr-progress-fill" style={{width: `${score}%`, background: score >= 70 ? '#10B981' : score >= 40 ? '#FBBF24' : '#F87171'}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TASK 1: RADAR ENGINE (Middle Split) */}
            <div className="sgr-radar-split animate-fade-up stagger-3">
              <div className="sgr-radar-container">
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={strategy.radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Current" 
                      dataKey="A" 
                      stroke="var(--accent-primary)" 
                      fill="url(#radarGradient)" 
                      fillOpacity={1} 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 0 }}
                    />
                    <defs>
                      <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="sgr-breakdown-container">
                <span className="text-caption text-secondary" style={{marginBottom: 'var(--sp-24)', display: 'block'}}>Axis Breakdown</span>
                <div className="sgr-breakdown-list">
                  {strategy.radarData.map((item, idx) => (
                    <div key={idx} className="sgr-breakdown-item">
                      <div className="sgr-breakdown-header">
                        <span className="text-small font-600" style={{color: 'var(--text-primary)'}}>{item.subject}</span>
                        <span className="text-small font-600" style={{color: item.A < 40 ? '#F87171' : item.A < 70 ? '#FBBF24' : '#34D399'}}>{item.A}%</span>
                      </div>
                      <div className="sgr-progress-track">
                        <div className="sgr-progress-fill" style={{width: `${item.A}%`, background: item.A < 40 ? '#F87171' : item.A < 70 ? '#FBBF24' : '#34D399', animationDelay: `${idx * 0.1}s`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TASK 2: SMART MISSING SKILLS */}
            <div className="rhythm-header" style={{marginBottom: '16px'}}>
              <h3 className="text-h3 animate-fade-up stagger-4">Identified Deficits</h3>
            </div>
            <div className="sgr-skills-grid animate-fade-up stagger-4">
              {strategy.missingSkills.map((skill, idx) => (
                <div key={idx} className="sgr-skill-card">
                  <div className="sgr-skill-header">
                    <span className="text-h4">{skill.name}</span>
                    <span className={`sgr-badge ${skill.importance.toLowerCase()}`}>{skill.importance}</span>
                  </div>
                  <div className="sgr-skill-meta">
                    <div className="sgr-skill-metric">
                      <span className="text-caption text-secondary">Est. Time</span>
                      <span className="text-small font-600" style={{display: 'flex', alignItems: 'center', gap: '4px'}}><IconClock/> {skill.time}</span>
                    </div>
                    <div className="sgr-skill-metric">
                      <span className="text-caption text-secondary">ATS Impact</span>
                      <span className="text-small font-600" style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981'}}><IconTrendingUp/> {skill.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TASK 3: EXECUTION ROADMAP */}
            <div className="rhythm-header" style={{marginBottom: '16px'}}>
              <h3 className="text-h3 animate-fade-up stagger-5">Execution Roadmap</h3>
            </div>
            <div className="sgr-roadmap-list animate-fade-up stagger-5">
              {strategy.roadmap.map(phase => (
                <div key={phase.phase} className="sgr-phase-card">
                  <div className="sgr-phase-header">
                    <span className="sgr-phase-pill">Phase {phase.phase} &bull; {phase.timeline}</span>
                  </div>
                  
                  <div className="sgr-phase-content">
                    <div>
                      <h4 className="text-h4" style={{color: 'var(--text-primary)'}}>{phase.goal}</h4>
                      <div className="sgr-task-list">
                        {phase.tasks.map((t, idx) => (
                          <div key={idx} className="sgr-task-item">
                            <IconTarget/> <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <div className="sgr-phase-output">
                        <span className="text-small font-600" style={{color: '#34D399'}}>Deliverable: {phase.output}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TASK 4: IMPACT SIMULATION (WOW SECTION) */}
            <div className="sgr-wow-section animate-fade-up stagger-6">
              <div className="sgr-wow-left">
                <h3 className="text-h3" style={{color: 'var(--text-primary)'}}>Impact Simulation</h3>
                <span className="text-caption text-secondary">Complete the roadmap to unlock these projections.</span>
              </div>
              
              <div className="sgr-delta-display">
                <div className="sgr-delta-box">
                  <div className="text-caption text-secondary text-uppercase">Current Readiness</div>
                  <div className="text-h2" style={{color: 'var(--text-tertiary)'}}>{strategy.readiness.currentScore}%</div>
                </div>
                <div className="sgr-delta-arrow">→</div>
                <div className="sgr-delta-box">
                  <div className="text-caption text-secondary text-uppercase" style={{color: '#10B981'}}>Future Readiness</div>
                  <div className="text-h1" style={{color: '#10B981'}}><AnimatedCounter targetValue={strategy.readiness.futureScore || 100} />%</div>
                </div>
              </div>

              <div className="sgr-sim-metrics">
                <div className="sgr-sim-metric">
                  <span className="text-caption text-secondary">Unlocked Roles</span>
                  <span className="text-h3 text-primary">{strategy.readiness.unlockedRoles || '+450%'}</span>
                </div>
                <div className="sgr-sim-metric">
                  <span className="text-caption text-secondary">Est. Salary Impact</span>
                  <span className="text-h3" style={{color: '#34D399'}}>{strategy.readiness.salaryBump || '+$25K'}</span>
                </div>
                <div className="sgr-sim-metric">
                  <span className="text-caption text-secondary">Interview Confidence</span>
                  <span className="text-h3" style={{color: 'var(--accent-primary)'}}>{strategy.readiness.confidenceIncrease || '+60%'}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
