import React, { useState } from 'react';

const COLUMNS = [
  { key: 'Applied',   label: 'Applied',   color: 'var(--text-primary)' },
  { key: 'Interview', label: 'Interview', color: 'var(--status-yellow)' },
  { key: 'Selected',  label: 'Selected',  color: 'var(--status-green)' },
  { key: 'Rejected',  label: 'Rejected',  color: 'var(--status-red)' },
];

function getAvatarColor(name) {
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E', '#3B82F6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function KanbanCard({ product, onEdit, onDelete }) {
  const col = COLUMNS.find(c => c.key === product.status) || COLUMNS[0];
  const avatarName = product.companyName ? product.companyName.substring(0, 2).toUpperCase() : 'CO';
  const avatarColor = getAvatarColor(product.companyName || '');
  
  let progress = 0;
  let progColor = 'var(--bg-panel)';
  if (product.deadline) {
    const totalDays = 30; 
    const daysLeft = Math.round((new Date(product.deadline) - new Date()) / 86400000);
    if (daysLeft <= 0) { progress = 100; progColor = 'var(--status-red)'; }
    else if (daysLeft <= 3) { progress = 80; progColor = 'var(--status-yellow)'; }
    else { progress = Math.max(10, 100 - (daysLeft / totalDays) * 100); progColor = 'var(--status-cyan)'; }
  }

  return (
    <div className="db-app-card">
      <div className="db-app-top">
        <div className="db-app-avatar" style={{ color: avatarColor, background: `${avatarColor}15`, borderColor: `${avatarColor}40` }}>
          {avatarName}
        </div>
        <div className="db-app-info">
          <div className="db-app-company">{product.companyName}</div>
          <div className="db-app-role">{product.role}</div>
          <div className="db-app-tags" style={{ marginTop: '8px' }}>
            {product.stipend && <span className="db-app-tag">₹{Number(product.stipend).toLocaleString('en-IN')}</span>}
            <span className="db-app-tag" style={{ color: col.color, borderColor: col.color }}>{col.key}</span>
          </div>
        </div>
      </div>
      
      {product.deadline && (
        <div className="db-app-progress">
          <div className="db-app-progress-fill" style={{ width: `${progress}%`, background: progColor }} />
        </div>
      )}

      <div className="db-app-actions">
        <button className="db-app-btn-mini" onClick={() => onEdit(product)}>
          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button className="db-app-btn-mini danger" onClick={() => onDelete(product._id)} style={{ color: 'var(--status-red)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function KanbanBoard({ products, loading, onEdit, onDelete, onShowForm }) {
  const [mobileTab, setMobileTab] = useState('Applied');

  return (
    <div className="col-span-12 stagger-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
        <h2 className="section-label" style={{ margin: 0 }}>Application Pipeline</h2>
        <button className="btn-primary" onClick={onShowForm}>+ Track App</button>
      </div>

      <div className="db-mobile-tabs hide-desktop">
        {COLUMNS.map(col => (
          <button key={col.key} className={`db-mobile-tab-btn ${mobileTab === col.key ? 'active' : ''}`} onClick={() => setMobileTab(col.key)}>
            {col.label}
          </button>
        ))}
      </div>

      <div className="db-kanban-wrap bento-card">
        {loading ? (
          <div className="db-kanban">
            {COLUMNS.map(col => <div key={col.key} className={`db-kanban-col ${mobileTab === col.key ? 'mobile-active' : 'mobile-hidden'}`}><div className="skeleton" style={{ height: '100px' }}/></div>)}
          </div>
        ) : products.length === 0 ? (
          <div className="bento-card" style={{ textAlign: 'center', padding: 'var(--sp-12) var(--sp-6)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No applications tracked.</p>
            <button className="btn-secondary" onClick={onShowForm} style={{ marginTop: 'var(--sp-4)' }}>Initialize Pipeline</button>
          </div>
        ) : (
          <div className="db-kanban">
            {COLUMNS.map(col => {
              const cards = products.filter(p => p.status === col.key);
              return (
                <div className={`db-kanban-col ${mobileTab === col.key ? 'mobile-active' : 'mobile-hidden'}`} key={col.key}>
                  <div className="db-kanban-col-header">
                    <div className="db-kanban-col-title">{col.label}</div>
                    <span className="db-kanban-count">{cards.length}</span>
                  </div>
                  <div className="db-kanban-cards">
                    {cards.map(p => (
                      <KanbanCard key={p._id} product={p} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
