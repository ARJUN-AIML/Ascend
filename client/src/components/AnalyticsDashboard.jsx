import React from 'react';
import './AnalyticsDashboard.css';

function AnalyticsDashboard({ products }) {
  const total = products.length || 1; // avoid division by zero
  const rawTotal = products.length;
  
  const applied = products.filter(p => p.status === 'Applied').length;
  const interview = products.filter(p => p.status === 'Interview').length;
  const selected = products.filter(p => p.status === 'Selected').length;
  const rejected = products.filter(p => p.status === 'Rejected').length;

  const appliedPct = Math.round((applied / total) * 100);
  const interviewPct = Math.round((interview / total) * 100);
  const selectedPct = Math.round((selected / total) * 100);
  const rejectedPct = Math.round((rejected / total) * 100);

  if (rawTotal === 0) return null;

  return (
    <div className="analytics-container">
      <div className="analytics-card">
        <h3 className="analytics-title">Status Distribution</h3>
        <div className="chart-bars">
          <div className="chart-bar-row">
            <span className="chart-label">Applied</span>
            <div className="chart-track">
              <div className="chart-fill bg-purple" style={{ width: `${appliedPct}%` }}></div>
            </div>
            <span className="chart-value">{appliedPct}%</span>
          </div>
          <div className="chart-bar-row">
            <span className="chart-label">Interview</span>
            <div className="chart-track">
              <div className="chart-fill bg-yellow" style={{ width: `${interviewPct}%` }}></div>
            </div>
            <span className="chart-value">{interviewPct}%</span>
          </div>
          <div className="chart-bar-row">
            <span className="chart-label">Selected</span>
            <div className="chart-track">
              <div className="chart-fill bg-green" style={{ width: `${selectedPct}%` }}></div>
            </div>
            <span className="chart-value">{selectedPct}%</span>
          </div>
          <div className="chart-bar-row">
            <span className="chart-label">Rejected</span>
            <div className="chart-track">
              <div className="chart-fill bg-red" style={{ width: `${rejectedPct}%` }}></div>
            </div>
            <span className="chart-value">{rejectedPct}%</span>
          </div>
        </div>
      </div>

      <div className="analytics-card">
        <h3 className="analytics-title">Conversion Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-box">
            <div className="metric-pct txt-green">{selectedPct}%</div>
            <div className="metric-name">Selection Rate</div>
          </div>
          <div className="metric-box">
            <div className="metric-pct txt-yellow">{interviewPct}%</div>
            <div className="metric-name">Interview Rate</div>
          </div>
          <div className="metric-box">
            <div className="metric-pct txt-red">{rejectedPct}%</div>
            <div className="metric-name">Rejection Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
