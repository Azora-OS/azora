import { useState, Suspense, lazy } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppShell, Header, Sidebar, SidebarSection, SidebarItem } from './components/layout'
import { Button, ThemeToggle, UbuntuBadge } from './index'
import { Card, CardHeader, CardTitle, CardContent } from './card'
import { 
  LayoutDashboard, 
  Bell, 
  FileText, 
  BarChart3,
  RefreshCw,
  User
} from 'lucide-react'

// Type definition
interface ComplianceOverview {
  compliantFrameworks: number
  totalFrameworks: number
  needsAttentionFrameworks: number
  activeAlerts?: any[]
  metrics?: any
  frameworks?: any[]
  recentActivity?: any[]
}

// Lazy load panel components for code splitting
const Dashboard = lazy(() => import('./Dashboard').then(module => ({ default: module.Dashboard })))

// Placeholder panels - replace with actual implementations
const AlertsPanel = () => (
  <Card>
    <CardHeader>
      <CardTitle>Alerts Panel</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Active alerts and notifications will appear here.</p>
    </CardContent>
  </Card>
)

const ReportsPanel = () => (
  <Card>
    <CardHeader>
      <CardTitle>Reports Panel</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Compliance reports and documentation will appear here.</p>
    </CardContent>
  </Card>
)

const MetricsPanel = () => (
  <Card>
    <CardHeader>
      <CardTitle>Metrics Panel</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Detailed metrics and analytics will appear here.</p>
    </CardContent>
  </Card>
)

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'alerts' | 'reports' | 'metrics'>('dashboard')

  // Fetch compliance data from the backend API
  const { data: complianceData, isLoading, error, refetch } = useQuery({
    queryKey: ['compliance-overview'],
    queryFn: async (): Promise<ComplianceOverview> => {
      const response = await fetch('http://localhost:4000/api/compliance/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch compliance data')
      }
      return response.json().then(data => data.data)
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapphire mx-auto"></div>
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="glass-ruby rounded-lg p-6 max-w-md w-full space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-ruby" />
            <h3 className="text-lg font-semibold">Error Loading Data</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Unable to connect to the compliance dashboard service.
          </p>
          <Button variant="ruby" onClick={() => refetch()} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  // Loading fallback for lazy components
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapphire"></div>
    </div>
  )

  // Render active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard data={complianceData!} />
          </Suspense>
        )
      case 'alerts':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AlertsPanel />
          </Suspense>
        )
      case 'reports':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ReportsPanel />
          </Suspense>
        )
      case 'metrics':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MetricsPanel />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard data={complianceData!} />
          </Suspense>
        )
    }
  }

  return (
    <div className="theme-compliance">
      <div className="app-themed">
        <AppShell
          gemTheme="ruby"
          header={
            <Header
              title="Compliance Dashboard"
              actions={
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => refetch()}
                    aria-label="Refresh data"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                  <ThemeToggle />
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </>
              }
            />
          }
          sidebar={
            <Sidebar variant="glass">
              <div className="mb-4">
                <UbuntuBadge>Constitutional AI</UbuntuBadge>
              </div>
              
              <SidebarSection title="Navigation">
                <SidebarItem
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  label="Dashboard"
                  active={activeView === 'dashboard'}
                  onClick={() => setActiveView('dashboard')}
                />
                <SidebarItem
                  icon={<Bell className="w-4 h-4" />}
                  label="Alerts"
                  active={activeView === 'alerts'}
                  onClick={() => setActiveView('alerts')}
                />
                <SidebarItem
                  icon={<FileText className="w-4 h-4" />}
                  label="Reports"
                  active={activeView === 'reports'}
                  onClick={() => setActiveView('reports')}
                />
                <SidebarItem
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Metrics"
                  active={activeView === 'metrics'}
                  onClick={() => setActiveView('metrics')}
                />
              </SidebarSection>
            </Sidebar>
          }
        >
          {renderActiveView()}
        </AppShell>
      </div>
    </div>
  )
}

export default App
