import React from 'react';

export default function ATSDashboard({ analysis }) {
  if (!analysis) return null;

  const s = analysis.scores || { keywordMatch: {score: 0}, semanticMatch: {score: 0}, experienceMatch: {score: 0}, projectRelevance: {score: 0} };

  return (
    <div className="ats-dashboard-card stagger-3">
      
      {/* Hero Score */}
      <div className="ats-score-hero">
        <div className="ats-dial">
          <span className="ats-dial-score">{analysis.matchScore}</span>
          <span className="ats-dial-label">Match</span>
        </div>
        <div className="ats-score-text">
          <h2>{analysis.matchScore >= 80 ? 'Strong Match' : analysis.matchScore >= 60 ? 'Moderate Match' : 'Weak Match'}</h2>
          <p>{analysis.summary || 'Based on deterministic keyword and semantic matching against the provided job description.'}</p>
        </div>
      </div>

      {/* Formula Breakdown */}
      <h3 className="section-label" style={{ marginTop: 'var(--sp-6)' }}>Formula Breakdown</h3>
      <div className="ats-formula">
        <FormulaRow label="Keyword Match (35)" score={s.keywordMatch.score} max={35} color="var(--accent-primary)" />
        <FormulaRow label="Semantic Match (30)" score={s.semanticMatch.score} max={30} color="var(--accent-secondary)" />
        <FormulaRow label="Experience Match (20)" score={s.experienceMatch.score} max={20} color="var(--status-green)" />
        <FormulaRow label="Project Relevance (15)" score={s.projectRelevance.score} max={15} color="var(--status-yellow)" />
      </div>

      {/* Actionable Insights */}
      <div className="ats-insights">
        {analysis.missingSkills && analysis.missingSkills.length > 0 && (
          <div className="ats-insight-box">
            <div className="ats-insight-title" style={{ color: 'var(--status-red)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Critical Missing Skills
            </div>
            <ul className="ats-insight-list">
              {analysis.missingSkills.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}
        
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="ats-insight-box">
            <div className="ats-insight-title" style={{ color: 'var(--status-green)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              AI Recommendations
            </div>
            <ul className="ats-insight-list">
              {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}

function FormulaRow({ label, score, max, color }) {
  const pct = (score / max) * 100;
  return (
    <div className="ats-formula-row">
      <div className="ats-formula-label">{label}</div>
      <div className="ats-formula-bar-wrap">
        <div className="ats-formula-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="ats-formula-val">{score}/{max}</div>
    </div>
  );
}
