import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function RadarVisualizer({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="ats-dashboard-card stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-8)' }}>
      <div style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysis.radarData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}
            />
            <Radar name="Your Skills" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.5} />
            <Radar name="Target Role" dataKey="B" stroke="var(--accent-secondary)" fill="var(--accent-secondary)" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
        <div className="ats-insight-box">
          <div className="ats-insight-title" style={{ color: 'var(--status-green)' }}>Verified Strengths</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(analysis.strengths || analysis.verifiedStrengths || []).map((s, i) => (
              <span key={i} className="db-app-tag" style={{ color: 'var(--status-green)', borderColor: 'var(--status-green)', background: 'rgba(16, 185, 129, 0.1)' }}>{s}</span>
            ))}
          </div>
        </div>

        <div className="ats-insight-box">
          <div className="ats-insight-title" style={{ color: 'var(--status-red)' }}>Critical Gaps</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(analysis.missingSkills || analysis.criticalGaps || []).map((g, i) => (
              <span key={i} className="db-app-tag" style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)', background: 'rgba(239, 68, 68, 0.1)' }}>{g}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
