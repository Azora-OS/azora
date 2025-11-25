import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export interface AnimatedBackgroundProps {
    variant?: 'gradient' | 'particles' | 'waves';
    className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    variant = 'gradient',
    className,
}) => {
    if (variant === 'gradient') {
        return (
            <div className={cn('fixed inset-0 -z-10 overflow-hidden', className)}>
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[hsl(250,75%,15%)] via-[hsl(280,75%,20%)] to-[hsl(250,75%,15%)]"
                    animate={{
                        background: [
                            'linear-gradient(135deg, hsl(250,75%,15%) 0%, hsl(280,75%,20%) 50%, hsl(250,75%,15%) 100%)',
                            'linear-gradient(135deg, hsl(280,75%,15%) 0%, hsl(250,75%,20%) 50%, hsl(280,75%,15%) 100%)',
                            'linear-gradient(135deg, hsl(250,75%,15%) 0%, hsl(280,75%,20%) 50%, hsl(250,75%,15%) 100%)',
                        ],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(102,126,234,0.1),transparent_50%)]" />
            </div>
        );
    }

    return null;
};

AnimatedBackground.displayName = 'AnimatedBackground';
