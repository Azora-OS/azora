import { AzoraLogo, ElaraAvatar, colors } from '@azora/branding'
import { Menu, Bell, Search } from 'lucide-react'

export function MobileHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-muted rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <AzoraLogo variant="primary" size={32} />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          </button>
          <ElaraAvatar variant="core" mood="helpful" size={32} />
        </div>
      </div>
    </header>
  )
}