import React, { useRef, useState } from 'react';

export default function ResumeUploader({ onFileSelect, jobTitle, setJobTitle, jobDesc, setJobDesc, handleAnalyze, isUploading, hasFile, fileName }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const onDragLeave = () => setIsDragActive(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="ai-hero stagger-1" style={{ maxWidth: '800px' }}>
      <h1 className="ai-hero-title">
        Resume Match <span className="highlight">Engine</span>
      </h1>
      <p className="ai-hero-sub">
        Deterministic ATS scoring verified by real mathematical constraints. Upload your resume to map it precisely against your target job description.
      </p>

      {!hasFile ? (
        <div 
          className={`ai-upload-zone stagger-2 ${isDragActive ? 'active' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="ai-upload-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h2 className="ai-upload-title">Drop your resume here</h2>
          <p className="ai-upload-sub">Strict extraction over backend server (PDF, DOCX max 5MB)</p>
          <input 
            type="file" 
            accept=".pdf,.docx" 
            ref={fileInputRef}
            onChange={(e) => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); }}
            style={{ display: 'none' }}
          />
          <button className="btn-primary" style={{ position: 'relative', zIndex: 2 }}>
            Browse Files
          </button>
        </div>
      ) : (
        <div className="stagger-3" style={{ textAlign: 'left', background: 'var(--bg-card)', padding: 'var(--sp-6)', borderRadius: 'var(--r-xl)', border: '1px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)', marginBottom: 'var(--sp-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
            <h3 className="section-label" style={{ color: 'var(--accent-primary)', margin: 0 }}>Document Extracted</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{fileName}</span>
          </div>
          <div className="ai-form-group">
            <label className="ai-label">Target Role</label>
            <input 
              className="ai-input" 
              placeholder="e.g. Frontend Engineer" 
              value={jobTitle} 
              onChange={e => setJobTitle(e.target.value)} 
            />
          </div>
          <div className="ai-form-group">
            <label className="ai-label">Target Job Description</label>
            <textarea 
              className="ai-textarea" 
              placeholder="Paste the strict requirements here..." 
              value={jobDesc} 
              onChange={e => setJobDesc(e.target.value)} 
            />
          </div>
          <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: 'var(--sp-2)' }} onClick={handleAnalyze} disabled={isUploading || !jobTitle || !jobDesc}>
            {isUploading ? 'Executing Analysis...' : 'Run Hybrid ATS Analysis'}
          </button>
        </div>
      )}
    </div>
  );
}
