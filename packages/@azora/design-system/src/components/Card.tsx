/**
 * Card Component
 * Enhanced with Ubuntu glassmorphism and Azora styling
 * Based on v0's gift, integrated with Layer 2 tokens
 */
import * as React from 'react';
import { cn } from '../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  "rounded-xl border transition-all duration-300",
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground shadow-sm',
        glass: 'bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl',
        gem: 'bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-gem',
        elevated: 'bg-card shadow-lg hover:shadow-xl hover:-translate-y-1',
        sapphire: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20',
        emerald: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
        ruby: 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
