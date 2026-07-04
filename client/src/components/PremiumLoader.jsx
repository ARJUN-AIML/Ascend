import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import './PremiumLoader.css';

const TEXTS = [
  "Loading Career Intelligence...",
  "Analyzing Momentum...",
  "Preparing Dashboard..."
];

export default function PremiumLoader() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex(prev => (prev + 1) % TEXTS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="premium-loader-overlay fade-up">
      <div className="pl-content">
        <div className="pl-logo-wrap">
          <div className="pl-pulse" />
          <div className="pl-logo-inner">
            <Logo size={48} />
          </div>
        </div>
        <div className="pl-text-wrap">
          <span className="pl-text" key={textIndex}>
            {TEXTS[textIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}
