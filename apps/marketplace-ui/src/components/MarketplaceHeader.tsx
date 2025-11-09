import { AzoraLogo, ServiceLogo, ElaraAvatar, colors } from '@azora/branding'
import { Search, Briefcase, Users, Star } from 'lucide-react'

export function MarketplaceHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <ServiceLogo service="forge" size={40} animated />
          <div className="flex flex-col">
            <span className="text-lg font-bold">Azora Forge</span>
            <span className="text-xs text-muted-foreground">Skills & Opportunities Marketplace</span>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
              placeholder="Search jobs, skills, or freelancers..."
            />
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/jobs" className="text-sm font-medium hover:text-primary flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Jobs
          </a>
          <a href="/freelancers" className="text-sm font-medium hover:text-primary flex items-center gap-2">
            <Users className="h-4 w-4" />
            Talent
          </a>
          <a href="/projects" className="text-sm font-medium hover:text-primary flex items-center gap-2">
            <Star className="h-4 w-4" />
            Projects
          </a>
        </nav>
        
        <ElaraAvatar variant="core" mood="helpful" size={32} />
      </div>
    </header>
  )
}