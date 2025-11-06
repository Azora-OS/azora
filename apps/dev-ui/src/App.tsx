import { useState, Suspense, lazy } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header, Sidebar } from './components'
import { Button } from './components/ui/button'
import { ComplianceOverview } from './types'

// Lazy load panel components for code splitting
const Dashboard = lazy(() => import('./components/panels/Dashboard').then(module => ({ default: module.Dashboard })))
const AlertsPanel = lazy(() => import('./components/panels/AlertsPanel').then(module => ({ default: module.AlertsPanel })))
const ReportsPanel = lazy(() => import('./components/panels/ReportsPanel').then(module => ({ default: module.ReportsPanel })))
const MetricsPanel = lazy(() => import('./components/panels/MetricsPanel').then(module => ({ default: module.MetricsPanel })))

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'alerts' | 'reports' | 'metrics'>('dashboard');

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

  const renderActiveView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading compliance data...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 m-4">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-destructive mb-1">
                Error Loading Compliance Data
              </h3>
              <p className="text-sm text-muted-foreground">
                Unable to connect to the compliance dashboard service at{' '}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">localhost:4000</code>
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="destructive"
              className="w-fit"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )
    }

    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading panel...</p>
        </div>
      </div>
    )

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
    <div className="min-h-screen bg-background text-foreground">
      <Header onRefresh={() => refetch()} />
      <div className="flex">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          data={complianceData}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  )
}

export default App
