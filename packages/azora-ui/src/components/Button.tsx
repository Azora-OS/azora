import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-ubuntu-sapphire text-white hover:bg-ubuntu-sapphire/90',
        destructive: 'bg-ubuntu-ruby text-white hover:bg-ubuntu-ruby/90',
        outline: 'border border-ubuntu-sapphire text-ubuntu-sapphire hover:bg-ubuntu-sapphire hover:text-white',
        secondary: 'bg-ubuntu-emerald text-white hover:bg-ubuntu-emerald/90',
        ghost: 'hover:bg-ubuntu-sapphire/10 hover:text-ubuntu-sapphire',
        link: 'underline-offset-4 hover:underline text-ubuntu-sapphire'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ubuntu?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ubuntu, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        title={ubuntu || 'Ubuntu action'}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };