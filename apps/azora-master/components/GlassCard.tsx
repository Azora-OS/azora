import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils/cn';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    blur?: 'sm' | 'md' | 'lg';
    gradient?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, children, blur = 'md', gradient = false, ...props }, ref) => {
        const blurClasses = {
            sm: 'backdrop-blur-sm',
            md: 'backdrop-blur-md',
            lg: 'backdrop-blur-lg',
        };

        return (
            <motion.div
                ref={ref}
                className={cn(
                    'rounded-2xl border border-white/20 bg-white/10',
                    blurClasses[blur],
                    gradient && 'bg-gradient-to-br from-white/15 to-white/5',
                    'shadow-xl shadow-black/10',
                    'transition-all duration-300',
                    'hover:border-white/30 hover:bg-white/15',
                    className
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = 'GlassCard';
