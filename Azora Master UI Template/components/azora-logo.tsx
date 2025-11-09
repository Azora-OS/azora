import React from 'react';

export function AzoraLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azoraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#azoraGradient)" opacity="0.1" />
      <path d="M30 70 L50 30 L70 70 M35 60 L65 60" stroke="url(#azoraGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="50" cy="30" r="3" fill="url(#azoraGradient)" />
      <circle cx="30" cy="70" r="3" fill="url(#azoraGradient)" />
      <circle cx="70" cy="70" r="3" fill="url(#azoraGradient)" />
    </svg>
  );
}
