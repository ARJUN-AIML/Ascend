import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

export default function HeroMetrics({ products, user, loading }) {
  const data = useMemo(() => {
    if (products.length === 0) return []; // STRICT RULE: NO FAKE DATA

    const map = {};
    const sorted = [...products].sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
    sorted.forEach(p => {
      const d = p.appliedDate ? new Date(p.appliedDate) : new Date();
      const key = `${d.getMonth()+1}/${d.getDate()}`;
      if (!map[key]) map[key] = { name: key, apps: 0 };
      map[key].apps += 1;
    });
    
    const vals = Object.values(map);
    return vals.length > 1 ? [{ name: 'Start', apps: 0 }, ...vals] : vals;
  }, [products]);

  const conversionRate = products.length ? Math.round((products.filter(p => p.status === 'Interview' || p.status === 'Selected').length / products.length) * 100) : 0;

  return (
    <section className="db-hero">
      <div className="db-hero-left stagger-1">
        <div>
          <h1 className="db-hero-title">Decode Rejections.<br/>Accelerate Offers.</h1>
          <p className="db-hero-sub" style={{ marginTop: 'var(--sp-4)' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Agent'}. Track patterns, identify weaknesses, and improve career momentum using AI.
          </p>
        </div>
        <div className="db-hero-metrics">
          <div className="db-hero-metric">
            <span className="db-hm-val">{products.length}</span>
            <span className="db-hm-lbl">Tracked</span>
          </div>
          <div className="db-hero-metric">
            <span className="db-hm-val" style={{ color: 'var(--accent-secondary)' }}>
              {conversionRate}%
            </span>
            <span className="db-hm-lbl">Conversion</span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="db-hero-right bento-card skeleton" />
      ) : products.length === 0 ? (
        <div className="db-hero-right bento-card stagger-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-6)', textAlign: 'center', border: '1px dashed var(--border)' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 className="card-heading">No Pipeline Data</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: '8px', maxWidth: '300px' }}>Your momentum chart will appear here once you begin tracking applications.</p>
        </div>
      ) : (
        <div className="db-hero-right bento-card stagger-2">
          <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
            <div className="section-label" style={{ color: 'var(--text-secondary)' }}>Momentum Signal</div>
            <div className="db-hm-val">{products.length} Applications</div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 80, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}
                labelStyle={{ display: 'none' }}
              />
              <Area type="monotone" dataKey="apps" stroke="var(--accent-secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
