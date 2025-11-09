import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Ubuntu Button Component
 * 
 * @description A button that embodies Ubuntu philosophy - individual action
 *              that contributes to collective benefit. Uses Azora Gem colors
 *              to represent different pillars of the system.
 * 
 * @ubuntu Individual action → Collective benefit
 * 
 * @accessibility
 * - Minimum 44x44px touch target
 * - Keyboard accessible (Enter/Space)
 * - Focus visible indicator
 * - ARIA labels for screen readers
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-[44px] min-w-[44px] px-6 py-3 relative overflow-hidden group shadow-premium-sm hover:shadow-premium-md hover:scale-105",
  {
    variants: {
      variant: {
        // Premium Default uses Sapphire (Technology)
        default: 'gradient-premium-sapphire text-white hover:shadow-premium-lg glow-premium-sapphire',
        
        // Premium Azora Gem Variants
        sapphire: 'gradient-premium-sapphire text-white hover:shadow-premium-lg glow-premium-sapphire',
        emerald: 'gradient-premium-emerald text-white hover:shadow-premium-lg glow-premium-emerald',
        ruby: 'gradient-premium-ruby text-white hover:shadow-premium-lg glow-premium-ruby',
        
        // Premium Glassmorphic variants
        glass: 'glass-medium text-foreground hover:glass-strong border-premium-sapphire',
        glassSapphire: 'glass-sapphire text-white hover:shadow-premium-lg',
        glassEmerald: 'glass-emerald text-white hover:shadow-premium-lg',
        glassRuby: 'glass-ruby text-white hover:shadow-premium-lg',
        
        // Standard variants (premium enhanced)
        destructive:
          'gradient-premium-ruby text-white hover:shadow-premium-lg glow-premium-ruby focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border-2 border-premium-sapphire bg-transparent text-premium-sapphire-500 hover:bg-premium-sapphire-500 hover:text-white shadow-premium-sm hover:shadow-premium-md',
        secondary:
          'gradient-premium-emerald text-white hover:shadow-premium-lg glow-premium-emerald',
        ghost:
          'hover:glass-light hover:shadow-premium-sm text-foreground',
        link: 'text-premium-sapphire-500 underline-offset-4 hover:underline hover:text-premium-sapphire-600',
        
        // Premium Ubuntu-specific variant
        ubuntu: 'bg-gradient-to-r from-[var(--premium-sapphire-500)] via-[var(--premium-emerald-500)] to-[var(--premium-ruby-500)] text-white hover:opacity-90 focus-visible:ring-[var(--premium-sapphire-500)]/20 glow-premium-sapphire shadow-premium-lg',
      },
      size: {
        default: 'h-12 px-6 py-3 text-base has-[>svg]:px-4',
        sm: 'h-10 rounded-lg gap-1.5 px-4 py-2 text-sm has-[>svg]:px-3',
        lg: 'h-14 rounded-xl px-8 py-4 text-lg has-[>svg]:px-6',
        icon: 'size-12',
        'icon-sm': 'size-10',
        'icon-lg': 'size-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Premium shine effect */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
