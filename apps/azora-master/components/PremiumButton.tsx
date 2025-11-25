import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary:
                    'bg-gradient-to-r from-[hsl(250,75%,55%)] to-[hsl(280,75%,55%)] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
                secondary:
                    'bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30',
                outline:
                    'border-2 border-[hsl(250,75%,55%)] text-[hsl(250,75%,55%)] hover:bg-[hsl(250,75%,55%)] hover:text-white',
                ghost:
                    'text-white hover:bg-white/10',
                gradient:
                    'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg hover:shadow-[0_0_40px_rgba(102,126,234,0.6)] hover:scale-105 active:scale-95',
            },
            size: {
                sm: 'h-9 px-4 text-sm',
                md: 'h-11 px-6 text-base',
                lg: 'h-14 px-8 text-lg',
                xl: 'h-16 px-10 text-xl',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export interface PremiumButtonProps
    extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
    children: React.ReactNode;
    loading?: boolean;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
    ({ className, variant, size, loading, children, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                className={cn(buttonVariants({ variant, size, className }))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...props}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Loading...</span>
                    </div>
                ) : (
                    children
                )}
            </motion.button>
        );
    }
);

PremiumButton.displayName = 'PremiumButton';
