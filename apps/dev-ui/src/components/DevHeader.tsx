import { AzoraLogo, ElaraAvatar, colors } from '@azora/branding'
import { Code, Terminal, GitBranch, Zap } from 'lucide-react'

export function DevHeader() {
  return (
    <header className="border-b bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <AzoraLogo variant="primary-pro" size="sm" animated />
          <div>
            <h1 className="text-lg font-bold">Azora Developer</h1>
            <p className="text-sm text-muted-foreground">Constitutional AI Development</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/api" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Code className="h-4 w-4" />
            API Docs
          </a>
          <a href="/cli" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Terminal className="h-4 w-4" />
            CLI Tools
          </a>
          <a href="/sdk" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <GitBranch className="h-4 w-4" />
            SDKs
          </a>
          <a href="/playground" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Zap className="h-4 w-4" />
            Playground
          </a>
        </nav>
        
        <ElaraAvatar variant="ide" mood="helpful" size={32} />
      </div>
    </header>
  )
}