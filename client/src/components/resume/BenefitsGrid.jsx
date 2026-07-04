import React from 'react';

export default function BenefitsGrid() {
  const benefits = [
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>, title: "ATS Score", desc: "Get an exact formulaic score for your resume based on strict deterministic rules." },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: "Keyword Match", desc: "Identify exactly which mandatory keywords your resume is missing." },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, title: "Semantic Analysis", desc: "Analyze the context of your bullets, not just exact word matching." },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="20 6 9 17 4 12"/></svg>, title: "Recommendations", desc: "Actionable steps to rewrite bullet points and maximize your offer probability." },
  ];

  return (
    <div className="ai-benefits stagger-4">
      {benefits.map((b, i) => (
        <div key={i} className="ai-benefit-card">
          <div className="ai-benefit-icon">{b.icon}</div>
          <div className="ai-benefit-title">{b.title}</div>
          <div className="ai-benefit-desc">{b.desc}</div>
        </div>
      ))}
    </div>
  );
}
