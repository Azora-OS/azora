import type React from "react"
// Accessible card component with proper semantic HTML and ARIA
interface AccessibleCardProps {
  title: string
  description?: string
  children: React.ReactNode
  role?: string
  ariaLabel?: string
}

export function AccessibleCard({ title, description, children, role = "article", ariaLabel }: AccessibleCardProps) {
  return (
    <article role={role} aria-label={ariaLabel || title} className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {children}
    </article>
  )
}
