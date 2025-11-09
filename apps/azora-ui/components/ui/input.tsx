import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground/60 selection:bg-premium-sapphire-500 selection:text-white',
        'glass-light border-border/50 h-12 w-full min-w-0 rounded-xl px-4 py-3 text-base',
        'shadow-premium-sm transition-all duration-300',
        'outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-premium-sapphire-500 focus-visible:ring-premium-sapphire-500/50 focus-visible:ring-2 focus-visible:glow-premium-sapphire',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'hover:border-premium-sapphire-500/50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
