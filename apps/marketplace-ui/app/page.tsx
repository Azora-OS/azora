"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { ServiceLogo } from "@/components/service-logo"
import { Briefcase, Users, TrendingUp, Award } from "lucide-react"

const jobs = [
  { title: 'Senior AI Engineer', company: 'Azora Labs', location: 'Remote', salary: '5000 AZR/mo', type: 'Full-time' },
  { title: 'Blockchain Developer', company: 'Mint Protocol', location: 'Cape Town', salary: '4500 AZR/mo', type: 'Contract' },
  { title: 'UI/UX Designer', company: 'Forge Studios', location: 'Johannesburg', salary: '3500 AZR/mo', type: 'Full-time' },
  { title: 'Data Scientist', company: 'Oracle Analytics', location: 'Remote', salary: '4800 AZR/mo', type: 'Full-time' },
]

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-red-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <ServiceLogo service="forge" size={40} />
              <span className="text-xl font-bold text-white">Azora Forge</span>
            </div>
            <Button variant="forge" size="sm">Post Job</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Skills <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Marketplace</span>
          </h1>
          <p className="text-2xl text-slate-300 mb-8">
            Connect talent with opportunity. Build the future together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Active Jobs', value: '2.5K+', icon: Briefcase },
            { label: 'Professionals', value: '50K+', icon: Users },
            { label: 'Placements', value: '12K+', icon: TrendingUp },
            { label: 'Avg Salary', value: '4.2K AZR', icon: Award },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {jobs.map((job, idx) => (
            <Card key={idx} className="bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{job.title}</CardTitle>
                    <CardDescription>{job.company} • {job.location}</CardDescription>
                  </div>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">{job.type}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange-400">{job.salary}</span>
                  <Button variant="forge">Apply Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
