import { useState, Suspense, lazy } from 'react'
import { Header, Sidebar } from './components'
import { useLmsApi } from '../../../packages/hooks/useApi'

// Lazy load panel components for code splitting
const Dashboard = lazy(() => import('./components/panels/Dashboard').then(module => ({ default: module.Dashboard })))
const CoursesPanel = lazy(() => import('./components/panels/CoursesPanel').then(module => ({ default: module.CoursesPanel })))
const ProgressPanel = lazy(() => import('./components/panels/ProgressPanel').then(module => ({ default: module.ProgressPanel })))
const EarningsPanel = lazy(() => import('./components/panels/EarningsPanel').then(module => ({ default: module.EarningsPanel })))
const LessonPanel = lazy(() => import('./components/panels/LessonPanel').then(module => ({ default: module.LessonPanel })))
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })))

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'courses' | 'progress' | 'earnings' | 'settings'>('dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const userId = 'user1' // Mock user ID

  // Fetch learning data using the new API hook with fallback to mock data
  const { data: learningData, isLoading, error, refetch } = useLmsApi('/courses')

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
                Error Loading Learning Data
              </h3>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Unable to connect to the learning service.</p>
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

    if (!learningData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    switch (activeView) {
      case 'courses':
        return selectedCourseId ?
          <LessonPanel courseId={selectedCourseId} userId={userId} onBack={() => setSelectedCourseId(null)} /> :
          <CoursesPanel courses={learningData.data || []} onCourseSelect={setSelectedCourseId} />
      case 'progress':
        return <ProgressPanel progress={{ overallProgress: 65, weeklyProgress: 15, monthlyProgress: 45, completedCourses: 2, totalCourses: 5 }} courses={learningData.data || []} />
      case 'earnings':
        return <EarningsPanel earnings={{ total: 0, thisWeek: 0, thisMonth: 0, history: [] }} />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard data={{
          totalCourses: learningData.data?.length || 0,
          completedCourses: 0,
          inProgressCourses: 1,
          totalEarnings: 0,
          currentStreak: 0,
          lastUpdated: new Date().toISOString(),
          courses: learningData.data?.slice(0, 2) || [],
          progress: { overallProgress: 25, weeklyProgress: 10, monthlyProgress: 25 },
          earnings: { total: 0, thisWeek: 0, thisMonth: 0, history: [] },
          achievements: []
        }} />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onRefresh={() => refetch()} />
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} data={{
          totalCourses: learningData.data?.length || 0,
          completedCourses: 0,
          inProgressCourses: 1,
          totalEarnings: 0,
          currentStreak: 0,
          lastUpdated: new Date().toISOString(),
          courses: learningData.data?.slice(0, 2) || [],
          progress: { overallProgress: 25, weeklyProgress: 10, monthlyProgress: 25 },
          earnings: { total: 0, thisWeek: 0, thisMonth: 0, history: [] },
          achievements: []
        }} />
        <main className="flex-1 p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            {renderActiveView()}
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default App
