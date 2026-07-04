import React from 'react';

function computeHealth(products) {
  const total = products.length;
  if (!total) return { score: 0, momentum: 0, intRate: 0, selRate: 0 };
  
  const selected = products.filter(p => p.status === 'Selected').length;
  const interview = products.filter(p => p.status === 'Interview' || p.status === 'Selected').length;
  
  const volScore = Math.min((total / 30) * 40, 40);
  const intRate = interview / total;
  const intScore = Math.min((intRate / 0.2) * 40, 40);
  const selRate = selected / total;
  const selScore = Math.min((selRate / 0.05) * 20, 20);
  
  return {
    score: Math.round(volScore + intScore + selScore),
    momentum: Math.round((volScore / 40) * 100),
    intRate: Math.round(intRate * 100),
    selRate: Math.round(selRate * 100),
  };
}

export default function CareerHealthScore({ products }) {
  const h = computeHealth(products);
  const circ = 2 * Math.PI * 46; 
  const dash = (h.score / 100) * circ;

  return (
    <div className="bento-card col-span-6 stagger-3">
      <div className="db-health-top">
        <h3 className="section-label" style={{ margin: 0 }}>Career Health</h3>
      </div>
      <div className="db-health-body">
        <div className="db-me-radial-wrap">
          <svg className="db-me-svg" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-secondary)" />
                <stop offset="100%" stopColor="var(--accent-primary)" />
              </linearGradient>
            </defs>
            <circle className="db-me-bg" cx="60" cy="60" r="46" />
            <circle className="db-me-fill" cx="60" cy="60" r="46" style={{ stroke: 'url(#healthGrad)', strokeDasharray: `${dash} ${circ}` }} />
          </svg>
          <div className="db-me-score-text">
            <span className="db-me-val">{h.score}</span>
            <span className="db-me-lbl">Score</span>
          </div>
        </div>
        <div className="db-me-metrics">
          <div className="db-me-metric">
            <div className="db-me-mtop"><span className="db-me-mlbl">Momentum</span><span className="db-me-mval">{h.momentum}%</span></div>
            <div className="db-me-bar"><div style={{ width: `${h.momentum}%`, background: 'var(--text-primary)' }}/></div>
          </div>
          <div className="db-me-metric">
            <div className="db-me-mtop"><span className="db-me-mlbl">Interview Rate</span><span className="db-me-mval">{h.intRate}%</span></div>
            <div className="db-me-bar"><div style={{ width: `${h.intRate}%`, background: 'var(--accent-secondary)' }}/></div>
          </div>
        </div>
      </div>
    </div>
  );
}
