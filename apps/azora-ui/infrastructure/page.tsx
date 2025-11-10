import { InfrastructureDashboard } from "@/components/infrastructure-dashboard"
import { Navigation } from "@/components/navigation"

export default function InfrastructurePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/infrastructure" />
      <div className="container mx-auto px-6 py-8">
        <InfrastructureDashboard />
      </div>
    </div>
  )
}
