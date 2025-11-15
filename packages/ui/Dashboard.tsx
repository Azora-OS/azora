import { StatsCard, GradientText } from './components/ui'
import { Card } from './card'
import { CheckCircle2, AlertTriangle, AlertCircle, Shield } from 'lucide-react'

// Type definitions
interface ComplianceMetrics {
  overallComplianceScore?: number
  regionalCompliance?: any
}

interface ComplianceFramework {
  id: string
  name: string
  status: string
}

interface ComplianceActivity {
  id: string
  type: string
  message: string
  timestamp: string
}

interface ComplianceAlert {
  id: string
  severity: string
  message: string
}

interface ComplianceOverview {
  compliantFrameworks: number
  totalFrameworks: number
  needsAttentionFrameworks: number
  activeAlerts?: ComplianceAlert[]
  metrics?: ComplianceMetrics
  frameworks?: ComplianceFramework[]
  recentActivity?: ComplianceActivity[]
}

interface DashboardProps {
  data: ComplianceOverview
}

// Placeholder components - these should be replaced with actual implementations
const ComplianceScoreChart = ({ metrics }: { metrics?: ComplianceMetrics }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">Compliance Score</h3>
    <div className="text-4xl font-bold text-sapphire">
      {metrics?.overallComplianceScore || 0}%
    </div>
    <p className="text-sm text-muted-foreground mt-2">Overall compliance rating</p>
  </div>
)

const RegionalComplianceChart = ({ regional }: { regional?: any }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">Regional Compliance</h3>
    <p className="text-sm text-muted-foreground">Regional compliance data visualization</p>
  </div>
)

const FrameworkStatusGrid = ({ frameworks }: { frameworks?: ComplianceFramework[] }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">Framework Status</h3>
    <div className="space-y-2">
      {frameworks?.slice(0, 5).map((framework) => (
        <div key={framework.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <span className="text-sm">{framework.name}</span>
          <span className="text-xs text-muted-foreground">{framework.status}</span>
        </div>
      )) || <p className="text-sm text-muted-foreground">No frameworks to display</p>}
    </div>
  </div>
)

const RecentActivity = ({ activities }: { activities?: ComplianceActivity[] }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
    <div className="space-y-2">
      {activities?.slice(0, 5).map((activity) => (
        <div key={activity.id} className="text-sm">
          <p className="font-medium">{activity.type}</p>
          <p className="text-muted-foreground text-xs">{activity.message}</p>
        </div>
      )) || <p className="text-sm text-muted-foreground">No recent activity</p>}
    </div>
  </div>
)

export function Dashboard({ data }: DashboardProps) {
  const compliancePercentage = Math.round((data.compliantFrameworks / data.totalFrameworks) * 100)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <GradientText variant="ubuntu" as="h1" className="text-3xl font-bold">
          Compliance Dashboard
        </GradientText>
        <p className="text-muted-foreground">
          Constitutional AI compliance monitoring and reporting
        </p>
      </div>

      {/* Overview Cards - Updated with Azora Gem Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Compliance Score"
          value={`${data.metrics?.overallComplianceScore || 0}/100`}
          description={`${compliancePercentage}% compliant`}
          icon={<Shield className="w-5 h-5" />}
          gem="sapphire"
        />

        <StatsCard
          title="Compliant Frameworks"
          value={data.compliantFrameworks}
          description={`of ${data.totalFrameworks} frameworks`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          gem="emerald"
          trend="up"
          trendValue={`${compliancePercentage}%`}
        />

        <StatsCard
          title="Needs Attention"
          value={data.needsAttentionFrameworks}
          description="frameworks require review"
          icon={<AlertTriangle className="w-5 h-5" />}
          trend="neutral"
        />

        <StatsCard
          title="Active Alerts"
          value={data.activeAlerts?.length || 0}
          description="require immediate action"
          icon={<AlertCircle className="w-5 h-5" />}
          gem="ruby"
        />
      </div>

      {/* Charts Row - Wrapped in Glass Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card effect="glass">
          <ComplianceScoreChart metrics={data.metrics} />
        </Card>
        <Card effect="glass">
          <RegionalComplianceChart regional={data.metrics?.regionalCompliance} />
        </Card>
      </div>

      {/* Framework Status and Recent Activity - Enhanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card effect="glass-sapphire">
            <FrameworkStatusGrid frameworks={data.frameworks} />
          </Card>
        </div>
        <div>
          <Card effect="glass">
            <RecentActivity activities={data.recentActivity} />
          </Card>
        </div>
      </div>
    </div>
  )
}
