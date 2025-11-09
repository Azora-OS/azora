import { ServiceLogo, colors } from '@azora/branding'
import { Database, Upload, Filter, BarChart3 } from 'lucide-react'

export function IngestionHeader() {
  return (
    <header className="border-b bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <ServiceLogo service="synapse" size={40} animated />
          <div>
            <h1 className="text-lg font-bold">Azora Ingestion</h1>
            <p className="text-sm text-muted-foreground">Data Processing Pipeline</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">1.2M records/hr</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/sources" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Database className="h-4 w-4" />
            Sources
          </a>
          <a href="/upload" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Upload className="h-4 w-4" />
            Upload
          </a>
          <a href="/transform" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Filter className="h-4 w-4" />
            Transform
          </a>
        </nav>
      </div>
    </header>
  )
}