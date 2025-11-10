import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Button Component
 * Enhanced with Azora Gem gradients and Ubuntu philosophy
 * Based on v0's gift, integrated with Layer 2 tokens
 */
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2", {
    variants: {
        variant: {
            default: 'bg-primary text-white hover:opacity-90',
            // Azora Gem variants
            sapphire: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:scale-105',
            emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:scale-105',
            ruby: 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-lg hover:scale-105',
            ubuntu: 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white hover:shadow-xl hover:scale-105',
            // Standard variants
            destructive: 'bg-red-600 text-white hover:bg-red-700',
            outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline',
            // Glass morphism (Ubuntu style)
            glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
        },
        size: {
            default: 'h-10 px-4 py-2',
            sm: 'h-8 rounded-md px-3 text-xs',
            lg: 'h-12 rounded-md px-8 text-base',
            xl: 'h-14 rounded-lg px-10 text-lg',
            icon: 'h-10 w-10',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    return (_jsx("button", { className: cn(buttonVariants({ variant, size, className })), ref: ref, ...props }));
});
Button.displayName = "Button";
export { Button, buttonVariants };
