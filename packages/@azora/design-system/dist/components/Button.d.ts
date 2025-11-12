/**
 * Button Component
 * Enhanced with Azora Gem gradients and Ubuntu philosophy
 * Based on v0's gift, integrated with Layer 2 tokens
 */
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const buttonVariants: (props?: ({
    variant?: "default" | "sapphire" | "emerald" | "ruby" | "ubuntu" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass" | null | undefined;
    size?: "default" | "sm" | "lg" | "xl" | "icon" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export { Button, buttonVariants };
//# sourceMappingURL=Button.d.ts.map