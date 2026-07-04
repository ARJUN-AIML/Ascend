import React, { useState } from 'react';
import './InternshipForm.css';

const STATUSES = ['Applied', 'Interview', 'Selected', 'Rejected'];

export default function CreateInternshipForm({ onSubmit, initialData, onCancel }) {
  const [form, setForm] = useState(initialData || {
    companyName: '', role: '', stipend: '', status: 'Applied',
    deadline: '', notes: '', applicationLink: '', source: '', location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await onSubmit(form);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(initialData);

  return (
    <div className="if-card">
      {/* Header */}
      <div className="if-header">
        <div className="if-header-left">
          <div className="if-header-icon">
            {isEdit
              ? <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          </div>
          <div>
            <h2 className="if-title">{isEdit ? 'Edit Application' : 'Track Application'}</h2>
            <p className="if-subtitle">{isEdit ? 'Update pipeline metadata.' : 'Inject a new application into your pipeline.'}</p>
          </div>
        </div>
        {onCancel && (
          <button className="if-close" onClick={onCancel} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="if-body">
          {error && <div className="if-error">{error}</div>}

          {/* Section 1 — Job Information */}
          <div className="if-section">
            <div className="if-section-title">Job Information</div>
            <div className="if-row">
              <div className="field-group">
                <label className="field-label">Company Name</label>
                <input className="field-input" type="text" placeholder="e.g. Stripe, Linear"
                  value={form.companyName} onChange={e => set('companyName', e.target.value)} required />
              </div>
              <div className="field-group">
                <label className="field-label">Role Title</label>
                <input className="field-input" type="text" placeholder="e.g. Frontend Engineer"
                  value={form.role} onChange={e => set('role', e.target.value)} required />
              </div>
            </div>
            <div className="field-group" style={{ width: 'calc(50% - 12px)' }}>
              <label className="field-label">Stipend / Salary <span className="if-optional">(optional)</span></label>
              <input className="field-input" type="number" placeholder="e.g. 150000"
                value={form.stipend} onChange={e => set('stipend', e.target.value)} min="0" />
            </div>
          </div>

          {/* Section 2 — Application Details */}
          <div className="if-section">
            <div className="if-section-title">Application Details</div>
            
            <div className="field-group">
              <label className="field-label">Pipeline Status</label>
              <div className="if-segmented-control">
                {STATUSES.map(s => (
                  <button key={s} type="button"
                    className={`if-segment-btn ${form.status === s ? 'active' : ''}`}
                    data-status={s}
                    onClick={() => set('status', s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="if-row" style={{ marginTop: 'var(--sp-2)' }}>
              <div className="field-group">
                <label className="field-label">Target Deadline</label>
                <input className="field-input" type="date"
                  value={form.deadline} onChange={e => set('deadline', e.target.value)} required />
              </div>
              <div className="field-group">
                <label className="field-label">Application Link <span className="if-optional">(optional)</span></label>
                <input className="field-input" type="url" placeholder="https://careers..."
                  value={form.applicationLink} onChange={e => set('applicationLink', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3 — Additional Metadata */}
          <div className="if-section">
            <div className="if-section-title">Additional Metadata</div>
            <div className="if-row">
              <div className="field-group">
                <label className="field-label">Source <span className="if-optional">(optional)</span></label>
                <input className="field-input" type="text" placeholder="e.g. Referral, LinkedIn"
                  value={form.source} onChange={e => set('source', e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">Location <span className="if-optional">(optional)</span></label>
                <input className="field-input" type="text" placeholder="e.g. Remote, San Francisco"
                  value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
            </div>
            
            <div className="field-group" style={{ marginTop: 'var(--sp-2)' }}>
              <label className="field-label">Intelligence Notes <span className="if-optional">(optional)</span></label>
              <textarea className="field-textarea"
                placeholder="Log interview loops, key recruiter contacts, and strategic notes here..."
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="if-actions">
          {onCancel && (
            <button type="button" className="if-cancel" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
          )}
          <button type="submit" className="if-submit" disabled={submitting}>
            {submitting ? (
              <><div className="spinner-sm" />{isEdit ? 'Syncing...' : 'Injecting...'}</>
            ) : (
              isEdit ? 'Sync Changes' : 'Inject to Pipeline'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
