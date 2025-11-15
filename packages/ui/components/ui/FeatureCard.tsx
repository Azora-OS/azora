import type { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../card'
import { GemIcon } from '../azora/GemIcon'

interface FeatureCardProps {
  title: string
  description: string
  icon?: ReactNode
  gem?: 'sapphire' | 'emerald' | 'ruby'
  children?: ReactNode
  className?: string
}

/**
 * FeatureCard - Showcase features with Azora Gem icons
 */
export function FeatureCard({
  title,
  description,
  icon,
  gem,
  children,
  className
}: FeatureCardProps) {
  const effect = gem ? `glass-${gem}` as const : 'glass' as const
  
  return (
    <Card effect={effect} className={className}>
      <CardHeader>
        <div className="flex items-start gap-4">
          {gem ? (
            <GemIcon gem={gem} glow className="w-8 h-8 shrink-0" />
          ) : icon ? (
            <div className="shrink-0">{icon}</div>
          ) : null}
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  )
}