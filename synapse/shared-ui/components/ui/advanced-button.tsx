/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion"
import { useHapticFeedback } from "react-haptic-feedback"
import { cn } from "@/lib/utils"

const advancedButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group",
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
        destructive: 'bg-gradient-to-r from-destructive to-destructive/80 text-white hover:from-destructive/90 hover:to-destructive/70 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
        outline: 'border-2 border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
        secondary: 'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
        ghost: 'hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-lg hover:shadow-xl',
        neon: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]',
        gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
        cyber: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm: 'h-9 rounded-lg gap-1.5 px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'size-11',
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
        'icon-xl': 'size-14',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        spin: 'animate-spin',
        ping: 'animate-ping',
        wiggle: 'animate-wiggle',
        float: 'animate-float',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  },
)

export interface AdvancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof advancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  haptic?: boolean
  ripple?: boolean
  glow?: boolean
  particles?: boolean
  sound?: boolean
  children?: React.ReactNode
}

const AdvancedButton = React.forwardRef<HTMLButtonElement, AdvancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    haptic = true,
    ripple = true,
    glow = false,
    particles = false,
    sound = false,
    children,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const { triggerHaptic } = useHapticFeedback()
    const [isPressed, setIsPressed] = React.useState(false)
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic) {
        triggerHaptic('impact', 'medium')
      }
      
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const newRipple = {
          id: Date.now(),
          x,
          y,
        }
        setRipples(prev => [...prev, newRipple])
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
      }

      onClick?.(e)
    }

    const handleMouseDown = () => setIsPressed(true)
    const handleMouseUp = () => setIsPressed(false)
    const handleMouseLeave = () => setIsPressed(false)

    return (
      <Comp
        ref={ref}
        data-slot="advanced-button"
        className={cn(advancedButtonVariants({ variant, size, animation, className }))}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        disabled={loading || props.disabled}
        {...props}
      >
        {/* Ripple Effect */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute inset-0 rounded-full bg-white/30 pointer-events-none"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* Glow Effect */}
        {glow && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 blur-sm -z-10"
            animate={{ opacity: isPressed ? 0.8 : 0.4 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            className="size-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Particles Effect */}
        {particles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                initial={{ 
                  x: '50%', 
                  y: '50%', 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100,
                  scale: [0, 1, 0],
                  opacity: [1, 0.5, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
            ))}
          </div>
        )}

        {/* Button Content */}
        <motion.span
          className="relative z-10 flex items-center gap-2"
          animate={{ scale: isPressed ? 0.95 : 1 }}
          transition={{ duration: 0.1 }}
        >
          {children}
        </motion.span>

        {/* Hover Shine Effect */}
        <motion.div
          className="absolute inset-0 -top-1 -left-1 w-0 h-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </Comp>
    )
  }
)

AdvancedButton.displayName = "AdvancedButton"

export { AdvancedButton, advancedButtonVariants }
