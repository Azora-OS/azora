import { ServiceLogo, colors } from '@azora/branding'
import { Scale, FileCheck, AlertTriangle, CheckCircle } from 'lucide-react'

export function ComplianceHeader() {
  return (
    <header className="border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <ServiceLogo service="covenant" size={40} animated />
          <div>
            <h1 className="text-lg font-bold">Azora Compliance</h1>
            <p className="text-sm text-muted-foreground">Legal & Regulatory Framework</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Compliant</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/regulations" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Scale className="h-4 w-4" />
            Regulations
          </a>
          <a href="/audits" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <FileCheck className="h-4 w-4" />
            Audits
          </a>
          <a href="/risks" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <AlertTriangle className="h-4 w-4" />
            Risk Assessment
          </a>
        </nav>
      </div>
    </header>
  )
}