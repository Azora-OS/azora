import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span 
      className={`
        bg-gradient-to-r from-purple-600 to-pink-600 
        bg-clip-text text-transparent
        ${className || ''}
      `}
    >
      {children}
    </span>
  );
}
