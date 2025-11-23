'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'light' | 'medium' | 'dark';
    hover?: boolean;
    children: React.ReactNode;
}

export const GlassCard = ({
    variant = 'light',
    hover = true,
    className,
    children,
    ...props
}: GlassCardProps) => {
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
