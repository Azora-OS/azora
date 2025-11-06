import { useState, Suspense, lazy } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header, Sidebar } from './components'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">
                Error Loading Compliance Data
              </h3>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Unable to connect to the compliance dashboard service.</p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  )
}

export default App
