import type React from "react"
// Responsive grid component for flexible layouts
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 6,
}: ResponsiveGridProps) {
  const gridClasses = `
    grid gap-${gap}
    grid-cols-${cols.mobile || 1}
    md:grid-cols-${cols.tablet || 2}
    lg:grid-cols-${cols.desktop || 3}
  `
    .trim()
    .replace(/\n/g, " ")

  return <div className={gridClasses}>{children}</div>
}
