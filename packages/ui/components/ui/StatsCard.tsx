import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '../../card'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  gem?: 'sapphire' | 'emerald' | 'ruby'
  className?: string
}

/**
 * StatsCard - Display statistics with Azora Gem theming
 */
export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  gem,
  className
}: StatsCardProps) {
  const trendColor = {
    up: 'text-emerald',
    down: 'text-ruby',
    neutral: 'text-muted-foreground'
  }[trend || 'neutral']
  
  const effect = gem ? `glass-${gem}` as const : 'flat' as const
  
  return (
    <Card effect={effect} className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className={cn('p-2 rounded-lg', gem && `bg-gradient-${gem}`)}>
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          {(description || trendValue) && (
            <div className="flex items-center gap-2 text-xs">
              {trendValue && (
                <span className={cn('font-medium', trendColor)}>
                  {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
                </span>
              )}
              {description && (
                <span className="text-muted-foreground">{description}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}