import React, { useMemo } from 'react';

export default function MarketIntelligenceFeed({ products }) {
  const insights = useMemo(() => {
    const list = [];
    const total = products.length;
    if (total === 0) return [{ type: 'info', text: 'Pipeline empty. Initialize applications to begin tracking.' }];
    
    const stagnant = products.filter(p => p.status === 'Applied' && (new Date() - new Date(p.appliedDate)) > 7 * 86400000).length;
    if (stagnant > 0) list.push({ type: 'warning', text: `${stagnant} applications stuck in 'Applied'. Recommend reaching out to hiring managers.` });
    
    const interview = products.filter(p => p.status === 'Interview').length;
    if (interview > 0) list.push({ type: 'success', text: `${interview} active interviews. Run Skill Intelligence to prepare.` });
    
    if (list.length === 0) list.push({ type: 'info', text: 'Pipeline optimized. No critical actions required.' });
    
    return list;
  }, [products]);

  const upcomingDeadlines = useMemo(() => {
    return products
      .filter(p => p.deadline)
      .map(p => ({ ...p, daysLeft: Math.round((new Date(p.deadline) - new Date()) / 86400000) }))
      .filter(p => p.daysLeft >= 0 && p.daysLeft <= 14)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
  }, [products]);

  return (
    <div className="bento-card col-span-6 stagger-4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      
      <div>
        <h3 className="section-label">AI Recommendations</h3>
        <div className="db-insight-cards">
          {insights.map((ins, i) => (
            <div key={i} className={`db-insight-feed-card ${ins.type}`}>
              <svg className="db-insight-icon" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                {ins.type === 'info' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                {ins.type === 'success' && <polyline points="20 6 9 17 4 12"/>}
                {ins.type === 'warning' && <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
              </svg>
              {ins.text}
            </div>
          ))}
        </div>
      </div>

      {upcomingDeadlines.length > 0 && (
        <div>
          <h3 className="section-label" style={{ color: 'var(--status-yellow)' }}>Upcoming Deadlines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingDeadlines.map(p => (
              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-main)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{p.companyName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.role}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: p.daysLeft <= 3 ? 'var(--status-red)' : 'var(--status-yellow)' }}>
                  {p.daysLeft === 0 ? 'Today' : `In ${p.daysLeft} days`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
