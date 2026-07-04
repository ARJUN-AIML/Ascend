import React from 'react';

export default function ExecutionTimeline({ roadmap }) {
  if (!roadmap || roadmap.length === 0) return null;

  return (
    <div className="ats-dashboard-card stagger-3" style={{ marginTop: 'var(--sp-6)' }}>
      <h3 className="section-label">Execution Roadmap</h3>
      <div style={{ marginTop: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
        {roadmap.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--sp-4)', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-panel)', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px', zIndex: 2 }}>
                {i + 1}
              </div>
              {i !== roadmap.length - 1 && (
                <div style={{ width: '2px', height: '100%', background: 'var(--border)', position: 'absolute', top: '32px', left: '15px' }} />
              )}
            </div>
            <div style={{ paddingBottom: 'var(--sp-4)' }}>
              <h4 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', marginBottom: '4px' }}>{step.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
