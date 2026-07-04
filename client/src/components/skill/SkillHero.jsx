import React from 'react';

export default function SkillHero({ targetRole, setTargetRole, currentSkills, setCurrentSkills, isAnalyzing, handleAnalyze }) {
  const exampleRoles = ['Frontend Engineer', 'ML Engineer', 'Data Scientist', 'Product Manager'];

  return (
    <div className="ai-hero stagger-1" style={{ maxWidth: '700px' }}>
      <h1 className="ai-hero-title">
        Skill <span className="highlight">Intelligence</span>
      </h1>
      <p className="ai-hero-sub">
        Map your exact skill vectors against industry requirements. Discover your verified strengths and generate an AI-powered execution roadmap to close your critical gaps.
      </p>

      <div style={{ background: 'var(--bg-card)', padding: 'var(--sp-8)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', textAlign: 'left' }}>
        <h3 className="section-label">Target Role</h3>
        <div className="ai-form-group">
          <input 
            className="ai-input" 
            placeholder="e.g. Machine Learning Engineer" 
            value={targetRole} 
            onChange={e => setTargetRole(e.target.value)} 
            style={{ fontSize: '16px', padding: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Example Queries: </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {exampleRoles.map(r => (
              <button 
                key={r} 
                className="db-app-tag" 
                style={{ cursor: 'pointer', padding: '4px 10px' }}
                onClick={() => setTargetRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <h3 className="section-label" style={{ marginTop: 'var(--sp-6)' }}>Current Skills</h3>
        <div className="ai-form-group">
          <textarea 
            className="ai-textarea" 
            placeholder="List your current skills, tools, and expertise here (e.g., Python, React, basic SQL...)" 
            value={currentSkills} 
            onChange={e => setCurrentSkills(e.target.value)} 
            style={{ fontSize: '14px', padding: '16px', minHeight: '100px' }}
          />
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: 'var(--sp-4)' }} 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !targetRole || !currentSkills}
        >
          {isAnalyzing ? 'Mapping Skill Vectors...' : 'Generate Intelligence'}
        </button>
      </div>

      <div className="ai-benefits" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 'var(--sp-8)' }}>
        <div className="ai-benefit-card">
          <div className="ai-benefit-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div className="ai-benefit-title">Vector Analysis</div>
          <div className="ai-benefit-desc">Visualize exact overlaps between your current skills and the target role.</div>
        </div>
        <div className="ai-benefit-card">
          <div className="ai-benefit-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="ai-benefit-title">Execution Roadmap</div>
          <div className="ai-benefit-desc">Step-by-step actionable timeline to acquire missing critical skills.</div>
        </div>
      </div>
    </div>
  );
}
