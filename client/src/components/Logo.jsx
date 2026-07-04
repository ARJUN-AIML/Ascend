import React from 'react';

export default function Logo({ size = 28, className = '' }) {
  return (
    <svg 
      className={`ascend-logo ${className}`} 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ascend-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-primary)" />
          <stop offset="100%" stopColor="var(--accent-secondary)" />
        </linearGradient>
      </defs>
      
      {/* Upward momentum wave */}
      <path 
        d="M 15 80 L 35 50 L 50 65 L 85 20 L 95 30 L 50 85 L 35 70 L 15 100 Z" 
        fill="url(#ascend-grad)" 
      />
      {/* Signal / Data bar */}
      <rect x="75" y="55" width="10" height="25" rx="3" fill="var(--accent-primary)" opacity="0.8" />
      <rect x="90" y="45" width="10" height="35" rx="3" fill="var(--accent-secondary)" opacity="0.9" />
    </svg>
  );
}
