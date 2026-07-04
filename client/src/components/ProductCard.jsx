import React from 'react';
import './ProductCard.css';

const STATUS_MAP = {
  Applied: { label: 'Applied', color: '#3B82F6' },
  Interview: { label: 'Interview', color: '#EAB308' },
  Selected: { label: 'Selected', color: '#22C55E' },
  Rejected: { label: 'Rejected', color: '#EF4444' },
};

function formatDeadline(deadline) {
  const d = new Date(deadline);
  if (isNaN(d)) return deadline;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDeadlineStatus(deadline) {
  if (!deadline) return null;
  const dDate = new Date(deadline);
  if (isNaN(dDate)) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  if (diffDays === 0) return { label: 'Due Today', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
  if (diffDays <= 3) return { label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' };
  return { label: 'Safe', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
}

function ProductCard({ id, companyName, role, stipend, status, deadline, onDelete, onEdit }) {
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.Applied;
  const deadlineStatus = getDeadlineStatus(deadline);

  return (
    <div className="pc-card" style={{ '--status-color': statusInfo.color }}>
      <div className="pc-rail" />
      <div className="pc-notch" />

      <div className="pc-header">
        <div className="pc-company">{companyName}</div>
        <div className="pc-header-actions">
          <span className="pc-badge">
            <span className="pc-badge-dot" />
            {statusInfo.label}
          </span>
          <button className="pc-edit-btn" onClick={() => onEdit({_id: id, companyName, role, stipend, status, deadline: deadline ? deadline.split('T')[0] : ''})} title="Edit Internship">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button className="pc-delete-btn" onClick={() => onDelete(id)} title="Delete Internship">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="pc-role">{role}</div>

      <div className="pc-divider" />

      <div className="pc-footer">
        <div className="pc-stat">
          <span className="pc-stat-label">Stipend</span>
          <span className="pc-stat-value">₹{Number(stipend).toLocaleString('en-IN')}</span>
        </div>
        <div className="pc-stat pc-stat-right">
          <span className="pc-stat-label">Deadline</span>
          <div className="pc-deadline-wrapper">
            <span className="pc-stat-value">{formatDeadline(deadline)}</span>
            {deadlineStatus && (
              <span className="pc-deadline-badge" style={{ color: deadlineStatus.color, backgroundColor: deadlineStatus.bg }}>
                {deadlineStatus.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
