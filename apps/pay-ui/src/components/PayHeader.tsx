import { ServiceLogo, MiningIcon, colors } from '@azora/branding'
import { Wallet, CreditCard, TrendingUp, Shield } from 'lucide-react'

export function PayHeader() {
  return (
    <header className="border-b border-border bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <ServiceLogo service="pay" size={40} animated />
          <div className="flex flex-col">
            <span className="text-lg font-bold">Azora Pay</span>
            <span className="text-xs text-muted-foreground">Sovereign Financial System</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20">
            <MiningIcon type="status" name="active" size={16} />
            <span className="text-sm font-medium text-emerald-600">Mining Active</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20">
            <MiningIcon type="algorithm" name="azr" size={16} />
            <span className="text-sm font-medium">1,247.89 AZR</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/wallet" className="text-sm font-medium hover:text-primary flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet
          </a>
          <a href="/cards" className="text-sm font-medium hover:text-primary flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cards
          </a>
          <a href="/mining" className="text-sm font-medium hover:text-primary flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Mining
          </a>
          <a href="/security" className="text-sm font-medium hover:text-primary flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </a>
        </nav>
      </div>
    </header>
  )
}