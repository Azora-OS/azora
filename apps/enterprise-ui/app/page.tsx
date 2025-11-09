"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { ServiceLogo } from "@/components/service-logo"
import { ElaraAvatar } from "@/components/elara-avatar"
import { Building2, Users, TrendingUp, Shield, Zap, Award } from "lucide-react"

const metrics = [
  { label: 'Employees', value: '2,500', change: '+12%', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { label: 'Revenue', value: '125K AZR', change: '+28%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  { label: 'Compliance', value: '100%', change: '0%', icon: Shield, color: 'from-purple-500 to-indigo-500' },
  { label: 'Efficiency', value: '94%', change: '+8%', icon: Zap, color: 'from-amber-500 to-orange-500' },
]

const departments = [
  { name: 'Engineering', employees: 850, budget: '45K AZR', performance: 96 },
  { name: 'Sales', employees: 420, budget: '28K AZR', performance: 92 },
  { name: 'Operations', employees: 380, budget: '22K AZR', performance: 94 },
  { name: 'HR', employees: 180, budget: '12K AZR', performance: 98 },
]

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">Azora Enterprise</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm">Reports</Button>
              <Button variant="azora" size="sm">Admin Panel</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Enterprise <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-xl text-slate-300">Constitutional AI for Business Excellence</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric) => (
            <Card key={metric.label} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className={`h-12 w-12 mb-3 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{metric.label}</span>
                  <span className="text-sm text-emerald-400">{metric.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Departments */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Department Overview</CardTitle>
                <CardDescription>Performance and resource allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => (
                    <div key={dept.name} className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{dept.name}</h3>
                          <p className="text-sm text-slate-400">{dept.employees} employees</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{dept.budget}</div>
                          <div className="text-sm text-slate-400">Budget</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Performance</span>
                          <span className="text-emerald-400 font-semibold">{dept.performance}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${dept.performance}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
              <CardContent className="p-6 text-center">
                <ElaraAvatar variant="core" size={80} showName mood="helpful" className="mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">AI Assistant</h3>
                <p className="text-sm text-slate-300 mb-4">Get insights and recommendations</p>
                <Button variant="azora" size="sm" className="w-full">Ask Elara</Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Teams
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Compliance Check
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Services Grid */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Enterprise Services</CardTitle>
            <CardDescription>Integrated Azora ecosystem for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              {['sapiens', 'forge', 'mint', 'aegis', 'oracle', 'covenant'].map((service) => (
                <div key={service} className="text-center">
                  <ServiceLogo service={service} size={80} className="mx-auto mb-2" />
                  <Button variant={service as any} size="sm" className="w-full mt-2">Open</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
