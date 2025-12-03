import React from 'react';
import { Card } from './Card';

interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AccessibleCard({ className, children, ...props }: AccessibleCardProps) {
  return (
    <Card
      className={`
        glass-card bg-card/80 backdrop-blur-sm 
        border border-border/50
        hover:bg-card/90 transition-all duration-200
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </Card>
  );
}
