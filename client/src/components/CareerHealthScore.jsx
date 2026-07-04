import React from 'react';
import './CareerHealthScore.css';

const CareerHealthScore = ({ products }) => {
  // Calculate Score Algorithmically based on frontend data
  const total = products.length;
  let score = 0;
  
  if (total === 0) {
    return null;
  }

  const selected = products.filter(p => p.status === 'Selected').length;
  const interview = products.filter(p => p.status === 'Interview').length;
  const applied = products.filter(p => p.status === 'Applied').length;
  
  const selectionRate = total > 0 ? (selected / total) * 100 : 0;
  const interviewRate = total > 0 ? (interview / total) * 100 : 0;

  // Base score from volume (max 20 points for 20+ apps)
  const volumeScore = Math.min((total / 20) * 20, 20);
  
  // Pipeline health (max 40 points) - rewards having active applications
  const pipelineScore = Math.min(((applied + interview * 2) / total) * 40, 40);
  
  // Success rate (max 40 points)
  const successScore = Math.min(((interviewRate * 0.5) + (selectionRate * 2)) * 40 / 100, 40) || 0;
  
  score = Math.round(volumeScore + pipelineScore + successScore);
  
  // Artificial sub-scores for premium UI
  const applicationPerformance = Math.min(Math.round(volumeScore * 5), 100);
  const interviewReadiness = Math.min(Math.round((interviewRate > 0 ? 70 : 40) + (selected > 0 ? 30 : 0)), 100);
  const pipelineActivity = Math.min(Math.round((applied > 0 ? 60 : 30) + (total > 5 ? 30 : 0)), 100);

  const getScoreColor = (val) => {
    if (val >= 80) return '#10b981';
    if (val >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  const strokeDasharray = `${(score / 100) * 283} 283`;

  return (
    <div className="chs-container">
      <div className="chs-header">
        <h2 className="chs-title">Career Health Score™</h2>
        <span className="chs-badge" style={{ color: getScoreColor(score), borderColor: getScoreColor(score) }}>
          {score >= 80 ? 'Excellent' : score >= 50 ? 'Needs Focus' : 'Critical'}
        </span>
      </div>
      
      <div className="chs-content">
        <div className="chs-visual">
          <svg className="chs-circle-svg" viewBox="0 0 100 100">
            <circle className="chs-circle-bg" cx="50" cy="50" r="45" />
            <circle 
              className="chs-circle-progress" 
              cx="50" cy="50" r="45" 
              style={{ 
                strokeDasharray, 
                stroke: getScoreColor(score) 
              }} 
            />
          </svg>
          <div className="chs-score-text">
            <span className="chs-score-value" style={{ color: getScoreColor(score) }}>{score}</span>
            <span className="chs-score-label">/ 100</span>
          </div>
        </div>

        <div className="chs-breakdown">
          <div className="chs-bar-group">
            <div className="chs-bar-label">
              <span>Application Volume</span>
              <span style={{ color: getScoreColor(applicationPerformance) }}>{applicationPerformance}</span>
            </div>
            <div className="chs-bar-track">
              <div className="chs-bar-fill" style={{ width: `${applicationPerformance}%`, backgroundColor: getScoreColor(applicationPerformance) }}></div>
            </div>
          </div>
          
          <div className="chs-bar-group">
            <div className="chs-bar-label">
              <span>Pipeline Activity</span>
              <span style={{ color: getScoreColor(pipelineActivity) }}>{pipelineActivity}</span>
            </div>
            <div className="chs-bar-track">
              <div className="chs-bar-fill" style={{ width: `${pipelineActivity}%`, backgroundColor: getScoreColor(pipelineActivity) }}></div>
            </div>
          </div>

          <div className="chs-bar-group">
            <div className="chs-bar-label">
              <span>Interview Readiness</span>
              <span style={{ color: getScoreColor(interviewReadiness) }}>{interviewReadiness}</span>
            </div>
            <div className="chs-bar-track">
              <div className="chs-bar-fill" style={{ width: `${interviewReadiness}%`, backgroundColor: getScoreColor(interviewReadiness) }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerHealthScore;
