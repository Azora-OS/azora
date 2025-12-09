import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Slick, modern Ascend Logo (Minimalist A-mark with constitutional core)
const AscendLogo = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" className="ascend-logo">
    <defs>
      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#61dafb" stopOpacity={1} />
        <stop offset="100%" stopColor="#21a1f1" stopOpacity={1} />
      </linearGradient>
    </defs>
    {/* Abstract 'A' shape rising */}
    <path d="M50 20 L85 85 L15 85 Z" stroke="url(#blueGradient)" strokeWidth="4" fill="none" strokeLinejoin="round" />
    {/* Inner core pulse */}
    <circle cx="50" cy="65" r="8" fill="#61dafb" opacity={0.8}>
      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
      <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const AwakeningCeremony = ({ onComplete }) => {
  const [loadingText, setLoadingText] = useState("Initializing Constitutional AI Environment...");
  
  // The narrative sequence, but shown one line at a time
  const sequence = [
    "Initializing Constitutional AI Environment...",
    "Securing Sovereign Keys...",
    "Awakening Core Intelligence...",
    "Connecting to Knowledge Ocean...",
    "Summoning Agent Collective...",
    "Forging Developer Sanctuary..."
  ];

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < sequence.length) {
        setLoadingText(sequence[step]);
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 1200); // 1.2s per step for a slick, fast feel

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading">
      <div className="logo-container-minimal">
        <AscendLogo />
      </div>
      <h2 className="app-title-minimal">Ascend IDE</h2>
      <div className="loading-status-container">
         <p className="loading-text-slick">{loadingText}</p>
         <div className="loading-bar-container">
            <div className="loading-bar-progress"></div>
         </div>
      </div>
    </div>
  );
};

const LoadingApp = () => {
  const [showApp, setShowApp] = useState(false);

  return (
    <>
      {!showApp && <AwakeningCeremony onComplete={() => setShowApp(true)} />}
      {showApp && <App />}
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(<LoadingApp />);
