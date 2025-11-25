'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
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
        light: 'bg-white/5 border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
        medium: 'bg-white/10 border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
        dark: 'bg-black/40 border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]',
    };

    return (
        <motion.div
            className={clsx(
                'backdrop-blur-xl border rounded-2xl relative overflow-hidden',
                variants[variant],
                hover && 'hover:bg-white/10 hover:border-white/30 transition-all duration-500 group',
                className
            )}
            whileHover={hover ? { y: -5, scale: 1.01 } : undefined}
            {...props}
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
