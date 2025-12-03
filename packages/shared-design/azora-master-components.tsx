/**
 * AZORA PROPRIETARY LICENSE
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * 
 * Azora Master UI Components
 * World-class design system components from v0 Master Template
 * Apply across all Azora apps for consistent, premium experience
 */

import type React from 'react'
import { cn } from './utils'

// ============================================================================
// AZORA LOGO COMPONENT
// ============================================================================

interface AzoraLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export const AzoraLogo: React.FC<AzoraLogoProps> = ({ className, ...props }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-10 transition-transform duration-300 hover:scale-110", className)}
      {...props}
      aria-label="Azora Constitutional AI Logo"
      role="img"
    >
      {/* Azora Gem - Tri-Unity Crystal */}
      <defs>
        <linearGradient id="sapphire" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="ruby" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      
      {/* Sapphire Apex - Technology */}
      <path
        d="M50 10 L70 35 L50 40 L30 35 Z"
        fill="url(#sapphire)"
        opacity="0.9"
      />
      
      {/* Emerald Foundation - Education */}
      <path
        d="M30 35 L50 40 L50 70 L20 60 Z"
        fill="url(#emerald)"
        opacity="0.9"
      />
      
      {/* Ruby Core - Finance */}
      <path
        d="M50 40 L70 35 L80 60 L50 70 Z"
        fill="url(#ruby)"
        opacity="0.9"
      />
      
      {/* Ubuntu Core - Unity */}
      <circle cx="50" cy="50" r="8" fill="white" opacity="0.95" />
      
      {/* Sankofa Engine Lines */}
      <path
        d="M50 50 L50 10 M50 50 L20 60 M50 50 L80 60"
        stroke="white"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  )
}

// ============================================================================
// MOBILE NAVIGATION
// ============================================================================

interface MobileNavProps {
  children?: React.ReactNode
}

export const MobileNav: React.FC<MobileNavProps> = ({ children }) => {
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm shadow-lg"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around p-4 safe-area-inset-bottom">
        {children}
      </div>
    </nav>
  )
}

// ============================================================================
// RESPONSIVE GRID
// ============================================================================

interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className
}) => {
  // Use Tailwind classes directly instead of template literals for better tree-shaking
  const gapClass = `gap-${gap}`
  const gridClasses = cn(
    'grid',
    gapClass,
    cols.default === 1 && 'grid-cols-1',
    cols.default === 2 && 'grid-cols-2',
    cols.default === 3 && 'grid-cols-3',
    cols.default === 4 && 'grid-cols-4',
    cols.sm === 2 && 'sm:grid-cols-2',
    cols.sm === 3 && 'sm:grid-cols-3',
    cols.sm === 4 && 'sm:grid-cols-4',
    cols.md === 2 && 'md:grid-cols-2',
    cols.md === 3 && 'md:grid-cols-3',
    cols.md === 4 && 'md:grid-cols-4',
    cols.lg === 3 && 'lg:grid-cols-3',
    cols.lg === 4 && 'lg:grid-cols-4',
    cols.lg === 5 && 'lg:grid-cols-5',
    cols.xl === 4 && 'xl:grid-cols-4',
    cols.xl === 5 && 'xl:grid-cols-5',
    cols.xl === 6 && 'xl:grid-cols-6',
    className
  )

  return <div className={gridClasses}>{children}</div>
}

// ============================================================================
// ACCESSIBLE CARD
// ============================================================================

interface AccessibleCardProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  onClick?: () => void
  href?: string
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  children,
  title,
  description,
  className,
  onClick,
  href
}) => {
  const cardClasses = cn(
    'rounded-lg border border-border bg-card p-6',
    'transition-all duration-200',
    'hover:shadow-lg hover:border-primary/50',
    'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
    onClick || href ? 'cursor-pointer' : '',
    className
  )

  const content = (
    <>
      {title && (
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}
      {children}
    </>
  )

  if (href) {
    return (
      <a href={href} className={cardClasses} aria-label={title}>
        {content}
      </a>
    )
  }

  return (
    <div className={cardClasses} onClick={onClick} role={onClick ? 'button' : undefined}>
      {content}
    </div>
  )
}

// ============================================================================
// LANGUAGE SWITCHER
// ============================================================================

interface LanguageSwitcherProps {
  currentLanguage: string
  onLanguageChange: (lang: string) => void
  languages?: Array<{ code: string; name: string; flag: string }>
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
    { code: 'xh', name: 'isiXhosa', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ]
}) => {
  return (
    <div className="relative inline-block">
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}

// ============================================================================
// ACCESSIBILITY TOOLBAR
// ============================================================================

interface AccessibilityToolbarProps {
  onFontSizeChange?: (size: 'small' | 'medium' | 'large') => void
  onContrastChange?: (highContrast: boolean) => void
  onReduceMotion?: (reduce: boolean) => void
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  onFontSizeChange,
  onContrastChange,
  onReduceMotion
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-4 space-y-2">
      <h3 className="text-sm font-semibold mb-2">Accessibility</h3>
      
      {onFontSizeChange && (
        <div className="flex gap-2">
          <button
            onClick={() => onFontSizeChange('small')}
            className="px-3 py-1 text-xs border rounded hover:bg-accent"
            aria-label="Small font size"
          >
            A
          </button>
          <button
            onClick={() => onFontSizeChange('medium')}
            className="px-3 py-1 text-sm border rounded hover:bg-accent"
            aria-label="Medium font size"
          >
            A
          </button>
          <button
            onClick={() => onFontSizeChange('large')}
            className="px-3 py-1 text-base border rounded hover:bg-accent"
            aria-label="Large font size"
          >
            A
          </button>
        </div>
      )}
      
      {onContrastChange && (
        <button
          onClick={() => onContrastChange(true)}
          className="w-full px-3 py-2 text-sm border rounded hover:bg-accent text-left"
        >
          High Contrast
        </button>
      )}
      
      {onReduceMotion && (
        <button
          onClick={() => onReduceMotion(true)}
          className="w-full px-3 py-2 text-sm border rounded hover:bg-accent text-left"
        >
          Reduce Motion
        </button>
      )}
    </div>
  )
}

// ============================================================================
// STATS CARD
// ============================================================================

interface StatsCardProps {
  label: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  description,
  icon,
  trend,
  trendValue,
  className
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-muted-foreground'
  }

  return (
    <div className={cn('rounded-lg border border-border bg-card p-6', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {trend && trendValue && (
          <span className={cn('text-sm font-medium', trendColors[trend])}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue}
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  )
}

// ============================================================================
// FEATURE CARD
// ============================================================================

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href?: string
  className?: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  href,
  className
}) => {
  const content = (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 mb-4">
        <div className="text-[#667eea]">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm flex-1">{description}</p>
      {href && (
        <span className="text-sm font-medium text-[#667eea] hover:text-[#764ba2] mt-4 inline-block">
          Learn more →
        </span>
      )}
    </>
  )

  const cardClasses = cn(
    'flex flex-col gap-4 rounded-lg border border-border bg-card p-6',
    'transition-all duration-200 hover:shadow-lg hover:border-primary/50',
    className
  )

  if (href) {
    return (
      <a href={href} className={cardClasses}>
        {content}
      </a>
    )
  }

  return <div className={cardClasses}>{content}</div>
}

// ============================================================================
// GRADIENT TEXT
// ============================================================================

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  gradient?: 'primary' | 'success' | 'warning' | 'danger'
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  gradient = 'primary'
}) => {
  const gradients = {
    primary: 'from-[#667eea] to-[#764ba2]',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-orange-600',
    danger: 'from-red-500 to-rose-600'
  }

  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        gradients[gradient],
        className
      )}
    >
      {children}
    </span>
  )
}

// ============================================================================
// HERO SECTION
// ============================================================================

interface HeroSectionProps {
  title: string
  subtitle?: string
  description: string
  primaryAction?: {
    label: string
    href: string
  }
  secondaryAction?: {
    label: string
    href: string
  }
  stats?: Array<{
    label: string
    value: string
    icon?: React.ReactNode
  }>
  className?: string
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  stats,
  className
}) => {
  return (
    <section className={cn('relative overflow-hidden bg-gradient-to-b from-background via-background to-background px-4 py-20 sm:px-6 lg:px-8', className)}>
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 max-w-3xl">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              {title}
              {subtitle && (
                <>
                  {' '}
                  <GradientText>{subtitle}</GradientText>
                </>
              )}
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl text-pretty">
              {description}
            </p>
          </div>

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col gap-3 sm:flex-row">
              {primaryAction && (
                <a
                  href={primaryAction.href}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {primaryAction.label}
                </a>
              )}
              {secondaryAction && (
                <a
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
                >
                  {secondaryAction.label}
                </a>
              )}
            </div>
          )}

          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    {stat.icon && <div className="text-[#667eea]">{stat.icon}</div>}
                    <span className="font-bold text-lg text-foreground">{stat.value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AzoraMasterComponents = {
  AzoraLogo,
  MobileNav,
  ResponsiveGrid,
  AccessibleCard,
  LanguageSwitcher,
  AccessibilityToolbar,
  StatsCard,
  FeatureCard,
  GradientText,
  HeroSection
}

export default AzoraMasterComponents
