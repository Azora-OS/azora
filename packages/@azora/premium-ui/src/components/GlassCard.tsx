import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
    variant?: 'light' | 'medium' | 'dark';
    hover?: boolean;
    children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    variant = 'light',
    hover = true,
    className,
    children,
    ...props
}) => {
    const variants = {
        light: 'bg-white/10 border-white/20',
        medium: 'bg-white/20 border-white/30',
        dark: 'bg-black/30 border-white/10',
    };

    return (
        <motion.div
            className={clsx(
                'backdrop-blur-lg border rounded-xl',
                variants[variant],
                hover && 'hover:bg-white/20 transition-all duration-300',
                className
            )}
            whileHover={hover ? { scale: 1.02 } : undefined}
            {...props}
        >
            {children}
        </motion.div>
    );
};
