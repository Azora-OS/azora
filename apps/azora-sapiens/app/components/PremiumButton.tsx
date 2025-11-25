'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    gradient?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

export const PremiumButton = ({
    variant = 'primary',
    size = 'md',
    gradient = true,
    className,
    children,
    loading = false,
    disabled,
    ...props
}: PremiumButtonProps) => {
    const baseStyles = 'font-bold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group';

    const variants = {
        primary: gradient
            ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] border border-white/10'
            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/50',
        secondary: 'bg-white/5 hover:bg-white/10 text-white backdrop-blur-md border border-white/10 hover:border-white/30 shadow-lg',
        outline: 'bg-transparent hover:bg-white/5 text-white border-2 border-white/20 hover:border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.1)]',
        ghost: 'bg-transparent hover:bg-white/10 text-white hover:text-purple-200',
    };

    const sizes = {
        sm: 'px-5 py-2 text-sm',
        md: 'px-8 py-3.5 text-base',
        lg: 'px-10 py-5 text-lg',
    };

    return (
        <motion.button
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
            disabled={disabled || loading}
            {...props}
        >
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />

            <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </>
                ) : (
                    children
                )}
            </span>
        </motion.button>
    );
};
