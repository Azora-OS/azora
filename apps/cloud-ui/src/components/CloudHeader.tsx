import { AzoraLogo, ServiceLogo, colors } from '@azora/branding'
import { Cloud, Server, Database, Shield } from 'lucide-react'

export function CloudHeader() {
  return (
    <header className="border-b bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <ServiceLogo service="nexus" size={40} animated />
          <div>
            <h1 className="text-lg font-bold">Azora Cloud</h1>
            <p className="text-sm text-muted-foreground">Infrastructure Management</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/compute" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Server className="h-4 w-4" />
            Compute
          </a>
          <a href="/storage" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Database className="h-4 w-4" />
            Storage
          </a>
          <a href="/network" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Cloud className="h-4 w-4" />
            Network
          </a>
          <a href="/security" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Shield className="h-4 w-4" />
            Security
          </a>
        </nav>
        
        <AzoraLogo variant="primary" size="sm" />
      </div>
    </header>
  )
}