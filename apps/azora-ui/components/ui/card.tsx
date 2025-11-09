import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Ubuntu Card Component
 * 
 * @description A card that embodies Ubuntu philosophy - individual content
 *              that contributes to collective knowledge. Supports Azora Gem
 *              color variants for different system pillars.
 * 
 * @ubuntu Individual content → Collective knowledge
 * 
 * @example
 * // Sapphire card (Technology)
 * <Card className="border-sapphire-500">Technology Content</Card>
 * 
 * // Emerald card (Education)
 * <Card className="border-emerald-500 glow-emerald">Learning Content</Card>
 * 
 * // Ruby card (Finance)
 * <Card className="border-ruby-500">Financial Content</Card>
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        // Ubuntu spacing (golden ratio)
        'space-ubuntu-md',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn('heading-3 leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
