import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ComplianceOverview } from '../../types'

interface SidebarProps {
  activeView: 'dashboard' | 'alerts' | 'reports' | 'metrics'
  onViewChange: (view: 'dashboard' | 'alerts' | 'reports' | 'metrics') => void
  data?: ComplianceOverview
}

export function Sidebar({ activeView, onViewChange, data }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: null
    },
    {
      id: 'alerts' as const,
      label: 'Alerts',
      icon: AlertTriangle,
      count: Array.isArray(data?.activeAlerts) ? data.activeAlerts.length : data?.activeAlerts || 0
    },
    {
      id: 'reports' as const,
      label: 'Reports',
      icon: FileText,
      count: null
    },
    {
      id: 'metrics' as const,
      label: 'Metrics',
      icon: BarChart3,
      count: null
    }
  ]

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-primary/10 text-primary font-medium'
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {item.count}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Compliance Status Summary */}
      {data && (
        <div className="p-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Compliance Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Compliant</span>
              </div>
              <span className="font-semibold text-green-600 dark:text-green-400">{data.compliantFrameworks}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">Needs Attention</span>
              </div>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">{data.needsAttentionFrameworks}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-muted-foreground">Non-Compliant</span>
              </div>
              <span className="font-semibold text-destructive">{data.nonCompliantFrameworks}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Unreachable</span>
              </div>
              <span className="font-semibold text-muted-foreground">{data.unreachableFrameworks}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
