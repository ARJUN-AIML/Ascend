import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ProductContext } from '../context/ProductContext';
import {
  ResponsiveContainer, Tooltip,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '../services/api';
import { generateIntelligence, generateTimeline } from '../services/intelligenceEngine';
import './Dashboard.css';

// ── ICONS ────────────────────────────────────────────────
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
);
const IconBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);
const IconLock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

// ── GREETING ─────────────────────────────────────────────
const Greeting = ({ name }) => (
  <h1 className="text-h1">Welcome back, {name || 'Engineer'} 👋</h1>
);

// ── DASHBOARD BANNER ──────────────────────────────────────────
const DashboardBanner = ({ onCompleteSetup, onSkip }) => (
  <div className="db-banner animate-fade-up">
    <div className="db-banner-content">
      <span className="db-banner-icon">⚠️</span>
      <span className="db-banner-text">Complete your career profile to unlock better AI insights.</span>
    </div>
    <div className="db-banner-actions">
      <button className="btn-primary btn-sm" onClick={onCompleteSetup}>Complete Setup</button>
      <button className="btn-ghost btn-sm" onClick={onSkip}>Skip for Now</button>
    </div>
  </div>
);

// ── COMMAND CENTER ──────────────────────────────────────────
const CommandCenter = ({ user, products }) => {
  const intel = React.useMemo(() => generateIntelligence(products, user), [products, user]);
  
  return (
    <div className="bento-hero-section">
      <div className="bento-hero-left premium-bento-card hover-lift animate-stagger-1 style-glass" style={{minHeight: '220px', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 'var(--sp-32)'}}>
          <Greeting name={user?.name?.split(' ')[0]} />
          
          <div className="command-focus-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-24)', alignItems: 'baseline' }}>
            <div>
              <div className="text-caption text-secondary mb-8 text-uppercase">Current Focus</div>
              <div className="text-h3" style={{color: 'var(--text-primary)'}}>{intel.focus}</div>
            </div>
            <div>
              <div className="text-caption text-secondary mb-8 text-uppercase">Biggest Bottleneck</div>
              <div className="text-h3" style={{color: '#F87171'}}>{intel.bottleneck}</div>
            </div>
          </div>
        </div>
        <div className="hero-bg-anim"></div>
      </div>
      
      <div className="bento-hero-right" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-24)', height: '100%' }}>
        <div className="premium-bento-card hover-lift animate-stagger-2 style-solid" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="text-caption text-secondary mb-4 text-uppercase">Weekly Goal</div>
          <div className="text-h4" style={{color: 'var(--accent-primary)'}}>{intel.weeklyGoal}</div>
        </div>
        <div className="premium-bento-card hover-lift animate-stagger-3 style-solid" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="text-caption text-secondary mb-4 text-uppercase">AI Recommendation</div>
          <div className="text-h4" style={{color: 'var(--accent-secondary)'}}>{intel.recommendation}</div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// TASK 1 — QUICK ACTIONS BENTO
// ══════════════════════════════════════════════════════════
const QuickActions = ({ onAddClick }) => (
  <div className="bento-empty-state">
    <a href="/resume-analyzer" className="premium-bento-card hover-lift animate-stagger-2 style-glass bento-qa-card bento-qa-resume">
      <div className="ob-step-icon ob-blue large-icon"><IconUpload /></div>
      <div className="ob-step-text">
        <h3 className="text-h3">Upload Resume</h3>
        <p className="text-secondary">Get your Resume Score & Career Score</p>
      </div>
      <div className="bento-arrow">→</div>
    </a>
    
    <div className="premium-bento-card hover-lift animate-stagger-3 style-solid bento-qa-card bento-qa-add" onClick={onAddClick} style={{cursor: 'pointer'}}>
      <div className="ob-step-icon ob-green large-icon"><IconBriefcase /></div>
      <div className="ob-step-text">
        <h3 className="text-h3">Add Application</h3>
      </div>
      <div className="bento-arrow">→</div>
    </div>

    <a href="/skill-gap" className="premium-bento-card hover-lift animate-stagger-4 style-solid bento-qa-card bento-qa-radar">
      <div className="ob-step-icon ob-purple large-icon"><IconTarget /></div>
      <div className="ob-step-text">
        <h3 className="text-h3">Run Skill Radar</h3>
      </div>
      <div className="bento-arrow">→</div>
    </a>

    <a href="/mock-interview" className="premium-bento-card hover-lift animate-stagger-5 style-solid bento-qa-card bento-qa-mock">
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <div className="ob-step-icon large-icon" style={{background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E'}}><IconPlay /></div>
        <div className="ob-step-text">
          <h3 className="text-h3">Start Mock Interview</h3>
          <p className="text-secondary">Simulate an interview with our AI hiring manager</p>
        </div>
      </div>
      <div className="bento-arrow">→</div>
    </a>
  </div>
);

const PremiumPlaceholder = ({ icon, title, target, current }) => (
  <div className="premium-placeholder">
    <div className="premium-placeholder-icon">{icon || <IconLock />}</div>
    <div className="premium-placeholder-title">{title}</div>
    <div className="premium-placeholder-req">Unlock at {target} applications</div>
    <div className="premium-placeholder-progress">
      <div className="premium-placeholder-bar" style={{ width: `${Math.min(100, (current / target) * 100)}%` }}></div>
    </div>
    <div className="premium-placeholder-count">[{current} / {target}]</div>
  </div>
);

const EmptyChart = ({ icon, title, desc }) => (
  <div className="empty-chart-placeholder">
    <div className="empty-chart-icon">{icon}</div>
    <div className="empty-chart-title">{title}</div>
    <div className="empty-chart-desc">{desc}</div>
  </div>
);

const QuickStartGuide = ({ hasResume, hasApp, hasRadar, hasInterview }) => {
  const steps = [
    { title: 'Upload Resume', desc: 'AI analyzes your CV', completed: hasResume },
    { title: 'Add First Application', desc: 'Track your career pipeline', completed: hasApp },
    { title: 'Run Skill Radar', desc: 'Map your industry gaps', completed: hasRadar },
    { title: 'Start Mock Interview', desc: 'Practice and improve', completed: hasInterview }
  ];

  let firstIncompleteFound = false;

  return (
    <div className="quick-start-container animate-fade-up">
      <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-16)' }}>
        <h3 className="text-h3">Quick Start Guide</h3>
        <p className="text-secondary">Complete these steps to activate your AI co-pilot.</p>
      </div>
      <div className="qs-timeline">
        {steps.map((step, i) => {
          let statusClass = 'locked';
          if (step.completed) {
            statusClass = 'completed';
          } else if (!firstIncompleteFound) {
            statusClass = 'active';
            firstIncompleteFound = true;
          }

          return (
            <div key={i} className={`qs-step ${statusClass}`}>
              <div className="qs-dot"></div>
              <div className="qs-content">
                <div className="qs-title">{step.title}</div>
                <div className="qs-desc">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// TASK 2/3 — LIVE INTELLIGENCE FEED & TIMELINE
// ══════════════════════════════════════════════════════════
const LiveIntelligenceFeed = ({ feed }) => {
  return (
    <div className="premium-bento-card style-solid animate-stagger-2 live-feed-container" style={{height: '100%', maxHeight: '350px', display: 'flex', flexDirection: 'column'}}>
      <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-16)' }}>
        <h3 className="text-h3">Live Intelligence</h3>
      </div>
      <div className="live-feed-scroll" style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', minWidth: 0 }}>
        {feed.length === 0 ? (
          <p className="text-secondary text-small">No recent insights.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {feed.map((item, i) => (
              <div key={i} className={`feed-item feed-${item.type} hover-lift`} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className={`feed-indicator indicator-${item.type}`}></span>
                <span className="feed-text">{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityTimeline = ({ timeline }) => {
  return (
    <div className="premium-bento-card style-glass animate-stagger-3 activity-timeline-container" style={{height: '100%', maxHeight: '350px', display: 'flex', flexDirection: 'column'}}>
      <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-16)' }}>
        <h3 className="text-h3">Activity Timeline</h3>
      </div>
      <div className="timeline-scroll" style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', minWidth: 0 }}>
        {timeline.length === 0 ? (
          <p className="text-secondary text-small">No recent activity.</p>
        ) : (
          <div className="timeline-track">
            {timeline.map((item, i) => (
              <div key={item.id} className="timeline-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-text">{item.text}</div>
                  <div className="timeline-time text-caption text-tertiary">{timeAgo(item.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// TASK P19 — PROGRESS INSIGHTS WIDGET
// ══════════════════════════════════════════════════════════
const ProgressInsightsWidget = ({ strategy }) => {
  if (!strategy || !strategy.memory || !strategy.memory.hasData || strategy.memory.evaluationCount < 3) {
    return (
      <div className="premium-bento-card style-glass animate-stagger-5" style={{ height: '100%', maxHeight: '350px', display: 'flex', flexDirection: 'column' }}>
        <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-16)' }}>
          <h3 className="text-h3">Progress Insights</h3>
          <p className="text-secondary text-caption">AI Growth Velocity</p>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}>🔒</div>
          <div className="text-body text-secondary" style={{ fontWeight: 600 }}>Insufficient Data</div>
          <p className="text-caption text-tertiary" style={{ marginTop: '8px' }}>Complete at least 3 evaluations (mock interviews, resume scans) to unlock AI pattern detection.</p>
        </div>
      </div>
    );
  }

  const { patterns, velocity, memory } = strategy;
  const velocityColor = velocity.velocityLabel === 'High' ? '#10B981' : velocity.velocityLabel === 'Low' ? '#F87171' : '#FBBF24';

  return (
    <div className="premium-bento-card style-glass animate-stagger-5" style={{ height: '100%', maxHeight: '350px', display: 'flex', flexDirection: 'column' }}>
      <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-16)' }}>
        <h3 className="text-h3">Progress Insights</h3>
        <p className="text-secondary text-caption">AI Growth Velocity</p>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
          <span className="text-caption text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Velocity</span>
          <span style={{ color: velocityColor, fontWeight: 700, fontSize: '1.1rem' }}>{velocity.velocityLabel}</span>
        </div>

        {patterns.improving.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div className="text-caption" style={{ color: '#10B981', marginBottom: '4px' }}>Trending Up ↗</div>
            <div className="text-small text-secondary">{patterns.improving.map(p => p.area).join(', ')}</div>
          </div>
        )}
        
        {memory.recurringWeaknesses && memory.recurringWeaknesses.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div className="text-caption" style={{ color: '#F87171', marginBottom: '4px' }}>Chronic Weaknesses ⚠</div>
            <div className="text-small text-secondary">{memory.recurringWeaknesses.map(w => w.weakness).slice(0, 2).join(', ')}</div>
          </div>
        )}

      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// TASK P18 — MARKET PULSE WIDGET
// ══════════════════════════════════════════════════════════
const MarketPulseWidget = () => {
  const highDemand = ['React', 'Node.js', 'Python', 'AWS', 'Docker'];
  const rising = ['Rust', 'Go', 'LLMs', 'RAG'];

  return (
    <div className="premium-bento-card style-glass animate-stagger-4" style={{ height: '100%', maxHeight: '350px', display: 'flex', flexDirection: 'column' }}>
      <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-16)' }}>
        <h3 className="text-h3">Market Pulse</h3>
        <p className="text-secondary text-caption">Current hiring demand</p>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div className="text-caption" style={{ fontWeight: 600, color: '#10B981', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>High Demand</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {highDemand.map(skill => (
              <span key={skill} style={{ padding: '4px 12px', background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(16,185,129,0.2)' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-caption" style={{ fontWeight: 600, color: '#A78BFA', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>Rising Stars</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {rising.map(skill => (
              <span key={skill} style={{ padding: '4px 12px', background: 'rgba(139,92,246,0.1)', color: '#A78BFA', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(139,92,246,0.2)' }}>
                {skill} ↗
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ADD APPLICATION MODAL
// ══════════════════════════════════════════════════════════
const PLATFORMS = ['LinkedIn', 'Naukri', 'Internshala', 'Unstop', 'AngelList', 'Indeed', 'Company Website', 'Referral', 'Direct'];
const STATUSES = ['Applied', 'OA', 'Interview', 'Selected', 'Rejected'];

const AddApplicationModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    companyName: '', role: '', platform: 'LinkedIn', status: 'Applied', deadline: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.role) { setError('Company and Role are required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await api.post('/api/products', form);
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-h3">Add Application</h3>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-field">
            <label>Company Name</label>
            <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Google" required />
          </div>
          <div className="modal-field">
            <label>Role</label>
            <input name="role" value={form.role} onChange={handleChange} placeholder="e.g. SDE Intern" required />
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label>Platform</label>
              <select name="platform" value={form.platform} onChange={handleChange}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-field">
            <label>Applied Date</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary" style={{width:'100%', marginTop:'16px'}} disabled={saving}>
            {saving ? 'Saving...' : 'Save Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// TASK 5 — KANBAN WITH INTELLIGENT CARDS
// ══════════════════════════════════════════════════════════
const timeAgo = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

const statusColor = {
  Applied: 'rgba(255,255,255,0.15)',
  OA: '#FBBF24',
  Interview: '#60A5FA',
  Selected: '#34D399',
  Rejected: '#F87171',
};

const KanbanBoard = ({ products, onStatusChange, onAddClick }) => {
  const columns = ['Applied', 'OA', 'Interview', 'Selected', 'Rejected'];

  const handleStatusUpdate = async (productId, newStatus) => {
    try {
      await api.put(`/api/products/${productId}`, { status: newStatus });
      onStatusChange();
    } catch (err) { console.error('Status update failed', err); }
  };

  return (
    <div className="kanban-board premium-bento-card style-solid animate-stagger-1" style={{height: '100%'}}>
      <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-h3">Application Pipeline</h3>
        <button className="btn-ghost btn-sm" onClick={onAddClick} style={{padding:'6px 12px', gap:'6px'}}>
          <IconPlus /> Add
        </button>
      </div>
      
      {products.length === 0 ? (
        <div className="kanban-empty-state" style={{margin: 'auto 0'}}>
          <IconBriefcase />
          <p>No applications tracked yet.</p>
        </div>
      ) : (
        <div className="kanban-grid">
          {columns.map(col => {
            const items = products.filter(p => p.status === col);
            return (
              <div key={col} className="kanban-col">
                <div className="kanban-col-header">
                  <span style={{display:'flex', alignItems:'center', gap:'6px'}}>
                    <span className="kanban-dot" style={{background: statusColor[col]}}></span>
                    {col}
                  </span>
                  <span className="kanban-count">{items.length}</span>
                </div>
                <div className="kanban-col-body">
                  {items.map(p => (
                    <div key={p._id} className="kanban-item hover-lift">
                      <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px'}}>
                        <div className="kanban-company-logo">
                          {p.companyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="kanban-item-company">{p.companyName}</div>
                          <div className="kanban-item-role">{p.role}</div>
                        </div>
                      </div>
                      <div className="kanban-item-meta">
                        {p.platform && <span className="kanban-item-platform">{p.platform}</span>}
                        <span className="kanban-item-date">{timeAgo(p.appliedDate || p.createdAt)}</span>
                      </div>
                      <div className="kanban-actions">
                        {columns.filter(s => s !== col).map(s => (
                          <button key={s} className="kanban-action-btn" onClick={() => handleStatusUpdate(p._id, s)}>→ {s}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="kanban-empty">No items</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// CHART CONSTANTS
// ══════════════════════════════════════════════════════════
const CM = { top: 20, right: 0, left: -20, bottom: 0 };
const CT = { fill: 'var(--text-secondary)', fontSize: 11 };
const TTS = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px' };
const TTI = { color: 'var(--text-primary)', fontWeight: 600 };
const TTC = { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 };

// ══════════════════════════════════════════════════════════
// TASK 4 — ADVANCED ANALYTICS
// ══════════════════════════════════════════════════════════
const ApplicationHeatmap = ({ products }) => {
  const weeks = 12;
  const days = 7;
  const now = new Date();
  const grid = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekData = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (w * 7 + (6 - d)));
      const dateStr = date.toISOString().split('T')[0];
      const count = products.filter(p => {
        const pd = new Date(p.appliedDate || p.createdAt).toISOString().split('T')[0];
        return pd === dateStr;
      }).length;
      weekData.push({ date: dateStr, count, day: d });
    }
    grid.push(weekData);
  }

  const getColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.03)';
    if (count === 1) return 'rgba(20, 184, 166, 0.25)';
    if (count === 2) return 'rgba(20, 184, 166, 0.45)';
    if (count <= 4) return 'rgba(20, 184, 166, 0.65)';
    return 'rgba(20, 184, 166, 0.9)';
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="premium-card animate-stagger-3 db-heatmap-card">
      <div className="rhythm-header" style={{ padding: 'var(--sp-24)', paddingBottom: 'var(--sp-12)' }}>
        <h3 className="text-h3">Application Activity</h3>
        <div className="heatmap-legend">
          <span className="text-caption text-tertiary">Less</span>
          {[0,1,2,3,5].map(v => <span key={v} className="heatmap-legend-box" style={{background: getColor(v)}}></span>)}
          <span className="text-caption text-tertiary">More</span>
        </div>
      </div>
      <div className="heatmap-grid-wrap">
        <div className="heatmap-day-labels">
          {dayLabels.map((l, i) => <span key={i} className="heatmap-day-label">{i % 2 === 1 ? l : ''}</span>)}
        </div>
        <div className="heatmap-grid">
          {grid.map((week, wi) => (
            <div key={wi} className="heatmap-col">
              {week.map((cell, di) => (
                <div key={di} className="heatmap-cell" style={{background: getColor(cell.count)}} title={`${cell.date}: ${cell.count} app${cell.count !== 1 ? 's' : ''}`}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ConversionFunnel = ({ products }) => {
  const total = products.length;
  const oa = products.filter(p => ['OA','Interview','Selected'].includes(p.status)).length;
  const interview = products.filter(p => ['Interview','Selected'].includes(p.status)).length;
  const offer = products.filter(p => p.status === 'Selected').length;

  const stages = [
    { name: 'Applied', count: total, conversion: 100, color: 'rgba(255,255,255,0.15)' },
    { name: 'OA', count: oa, conversion: total ? Math.round((oa/total)*100) : 0, color: '#FBBF24' },
    { name: 'Interview', count: interview, conversion: oa ? Math.round((interview/oa)*100) : 0, color: '#60A5FA' },
    { name: 'Offer', count: offer, conversion: interview ? Math.round((offer/interview)*100) : 0, color: '#34D399' },
  ];

  return (
    <div className="premium-card animate-stagger-4 db-conversion-card">
      <div className="rhythm-header" style={{ padding: 'var(--sp-24)', paddingBottom: 'var(--sp-12)' }}>
        <h3 className="text-h3">Conversion Funnel</h3>
      </div>
      <div className="conversion-funnel">
        {stages.map((s, i) => {
          const widthPct = total ? Math.max(12, (s.count / total) * 100) : 12;
          const prevCount = i > 0 ? stages[i-1].count : total;
          const dropoff = prevCount > 0 && i > 0 ? Math.round(((prevCount - s.count) / prevCount) * 100) : 0;
          return (
            <div key={s.name} className="conversion-stage" style={{animationDelay: `${i * 0.12}s`}}>
              <div className="conversion-bar-wrap">
                <div className="conversion-bar" style={{width: `${widthPct}%`, background: s.color}}></div>
              </div>
              <div className="conversion-info">
                <span className="conversion-name">{s.name}</span>
                <span className="conversion-count">{s.count}</span>
                {i > 0 && <span className="conversion-rate" style={{color: s.color}}>{s.conversion}% pass</span>}
                {i > 0 && dropoff > 0 && <span className="conversion-dropoff">-{dropoff}% drop</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdvancedAnalytics = ({ history, products }) => {
  const trendData = useMemo(() => {
    if (products.length === 0) return [];
    const sorted = [...products].sort((a, b) => new Date(a.appliedDate || a.createdAt) - new Date(b.appliedDate || b.createdAt));
    const weeks = {};
    sorted.forEach(p => {
      const d = new Date(p.appliedDate || p.createdAt);
      const ws = new Date(d); ws.setDate(d.getDate() - d.getDay());
      const key = ws.toISOString().split('T')[0];
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks).map(([week, count]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), apps: count
    }));
  }, [products]);

  const platformData = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const pl = p.platform || 'Direct';
      if (!map[pl]) map[pl] = { platform: pl, total: 0, responded: 0 };
      map[pl].total++;
      if (p.status !== 'Applied') map[pl].responded++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [products]);

  const appCount = products.length;
  const canShowFunnel = appCount >= 2;
  const canShowTrend = appCount >= 3;
  const canShowPlatform = appCount >= 3;
  const canShowHeatmap = appCount >= 5;

  return (
    <div className="bento-analytics-section" style={{marginTop: 'var(--sp-24)'}}>
      <div className="bento-analytics-left premium-bento-card style-glass animate-stagger-5">
        <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-12)' }}>
          <h3 className="text-h3">Application Trend</h3>
        </div>
        <div className="db-graph-container" style={{height: '320px', width: '100%', overflow: 'hidden'}}>
          {!canShowTrend ? (
            <PremiumPlaceholder icon={<IconChart />} title="Application Trend" target={3} current={appCount} />
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={CM}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--text-tertiary)" tick={CT} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--text-tertiary)" tick={CT} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                <Tooltip contentStyle={TTS} itemStyle={TTI} cursor={TTC} />
                <Line type="monotone" dataKey="apps" stroke="#60A5FA" strokeWidth={2} dot={{ r: 4, fill: '#60A5FA' }} name="Applications" animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart icon={<IconBriefcase />} title="No data" desc="Add applications" />}
        </div>
      </div>

      <div className="bento-analytics-right">
        <div className="premium-bento-card animate-stagger-6 bento-analytics-top style-solid">
          <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-12)' }}>
            <h3 className="text-h3">Funnel</h3>
          </div>
          <div style={{height: '140px', overflowY: 'auto'}}>
            {!canShowFunnel ? (
              <PremiumPlaceholder title="Conversion Funnel" target={2} current={appCount} />
            ) : (
              <ConversionFunnel products={products} />
            )}
          </div>
        </div>

        <div className="premium-bento-card animate-stagger-7 bento-analytics-bottom style-solid">
          <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-12)' }}>
            <h3 className="text-h3">Platform Response</h3>
          </div>
          <div className="db-graph-container" style={{height: '140px', width: '100%', overflow: 'hidden'}}>
            {!canShowPlatform ? (
              <PremiumPlaceholder title="Platform Response" target={3} current={appCount} />
            ) : platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} margin={CM} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-tertiary)" tick={CT} axisLine={false} tickLine={false} hide />
                  <YAxis type="category" dataKey="platform" stroke="var(--text-tertiary)" tick={CT} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={TTS} itemStyle={TTI} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="total" fill="rgba(255,255,255,0.1)" radius={[0,4,4,0]} name="Applied" animationDuration={800} />
                  <Bar dataKey="responded" fill="var(--accent-primary)" radius={[0,4,4,0]} name="Responded" animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart icon={<IconChart />} title="No data" desc="" />}
          </div>
        </div>
      </div>

      {canShowHeatmap && (
        <div className="premium-bento-card animate-stagger-7 style-solid" style={{gridColumn: '1 / -1', minHeight: '200px'}}>
          <div className="rhythm-header" style={{ paddingBottom: 'var(--sp-12)' }}>
            <h3 className="text-h3">Application Heatmap</h3>
          </div>
          <ApplicationHeatmap products={products} />
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { products, addProduct, refreshProducts } = useContext(ProductContext);
  const [history, setHistory] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [strategyData, setStrategyData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [histRes, stratRes] = await Promise.all([
        api.get('/api/users/progress').catch(() => ({ data: [] })),
        api.get('/api/users/strategy').catch(() => ({ data: null }))
      ]);
      setHistory((histRes.data || []).map((h, i) => ({ ...h, dateFormatted: `Scan ${i + 1}` })));
      setStrategyData(stratRes.data || null);
    } catch(err) { console.error('Failed to load dashboard data', err); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddSave = (newProduct) => addProduct(newProduct);

  const intelligence = useMemo(() => generateIntelligence(products, user), [products, user]);
  const timelineData = useMemo(() => generateTimeline(products), [products]);

  const appCount = products.length;
  const hasResume = user?.hasResume || false;
  const hasSkillRadar = user?.hasSkillRadar || false;
  const hasInterview = false; // Add to user schema if needed

  const isNewUser = appCount === 0 && !hasResume && !hasSkillRadar;
  const showBanner = !bannerDismissed && user?.onboardingStatus !== 'COMPLETED';

  // Analytics thresholds
  const canShowPipeline = appCount >= 1;
  const canShowLiveFeed = appCount >= 2;
  const canShowTimeline = appCount >= 1;

  return (
    <div className="ascend-container" style={{ paddingBottom: 'var(--sp-64)', paddingTop: 'var(--sp-32)' }}>
      {showAddModal && <AddApplicationModal onClose={() => setShowAddModal(false)} onSave={handleAddSave} />}

      <div className="rhythm-section">
        {showBanner && (
          <DashboardBanner 
            onCompleteSetup={() => window.location.href = '/onboarding'} 
            onSkip={() => setBannerDismissed(true)} 
          />
        )}

        {/* Row 1: Command Center */}
        <CommandCenter user={user} products={products} />

        {isNewUser ? (
          /* ========================================================
             PREMIUM ONBOARDING DASHBOARD
             ======================================================== */
          <>
            <QuickActions onAddClick={() => setShowAddModal(true)} />
            <QuickStartGuide 
              hasResume={hasResume} 
              hasApp={appCount > 0} 
              hasRadar={hasSkillRadar} 
              hasInterview={hasInterview} 
            />
          </>
        ) : (
          /* ========================================================
             FULL ANALYTICS DASHBOARD
             ======================================================== */
          <>
            <QuickActions onAddClick={() => setShowAddModal(true)} />
            
            {/* Row 3: Application Pipeline & AI Intelligence */}
            {canShowPipeline && (
              <div className="bento-pipeline-section">
                <div className="kanban-board-wrapper" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <KanbanBoard products={products} onStatusChange={() => { fetchData(); refreshProducts(); }} onAddClick={() => setShowAddModal(true)} />
                </div>
                
                <div className="career-intelligence-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-16)', minWidth: 0 }}>
                  {canShowLiveFeed ? (
                    <LiveIntelligenceFeed feed={intelligence.feed} />
                  ) : (
                    <div className="premium-bento-card style-solid" style={{flex: 1, minHeight: '160px'}}>
                      <PremiumPlaceholder title="Live Intelligence" target={2} current={appCount} />
                    </div>
                  )}

                  {canShowTimeline ? (
                    <ActivityTimeline timeline={timelineData} />
                  ) : (
                    <div className="premium-bento-card style-glass" style={{flex: 1, minHeight: '160px'}}>
                      <PremiumPlaceholder title="Activity Timeline" target={1} current={appCount} />
                    </div>
                  )}
                  
                  {/* P18 Market Pulse */}
                  <MarketPulseWidget />

                  {/* P19 Progress Insights */}
                  <ProgressInsightsWidget strategy={strategyData} />
                </div>
              </div>
            )}

            {/* Row 4: Analytics Grid */}
            <AdvancedAnalytics history={history} products={products} />
          </>
        )}
      </div>
    </div>
  );
}
