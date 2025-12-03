import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PremiumCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    delay?: number;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
    children,
    className,
    hoverEffect = true,
    delay = 0,
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : undefined}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all",
                hoverEffect && "hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/30 cursor-pointer",
                className
            )}
            {...props}
        >
            {/* Gradient Overlay on Hover */}
            {hoverEffect && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            )}

            {children}
        </motion.div>
    );
};
