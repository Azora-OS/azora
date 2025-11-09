import { AzoraLogo, ServiceLogo, colors } from '@azora/branding'
import { Building2, Users, Shield, TrendingUp } from 'lucide-react'

export function EnterpriseHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <AzoraLogo variant="primary-pro" size="sm" animated />
          <div className="flex flex-col">
            <span className="text-lg font-bold">Azora Enterprise</span>
            <span className="text-xs text-muted-foreground">Constitutional AI for Business</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</a>
          <a href="/analytics" className="text-sm font-medium hover:text-primary">Analytics</a>
          <a href="/compliance" className="text-sm font-medium hover:text-primary">Compliance</a>
          <a href="/settings" className="text-sm font-medium hover:text-primary">Settings</a>
        </nav>
        
        <div className="flex items-center gap-2">
          <ServiceLogo service="aegis" size={32} />
          <ServiceLogo service="covenant" size={32} />
        </div>
      </div>
    </header>
  )
}