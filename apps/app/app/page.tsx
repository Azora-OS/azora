"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { ServiceLogo } from "@/components/service-logo"
import { ElaraAvatar } from "@/components/elara-avatar"
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react"

const services = [
  { id: 'sapiens', name: 'Azora Sapiens', description: 'AI-Powered Education' },
  { id: 'forge', name: 'Azora Forge', description: 'Skills Marketplace' },
  { id: 'mint', name: 'Azora Mint', description: 'Financial Engine' },
  { id: 'pay', name: 'Azora Pay', description: 'Payment System' },
  { id: 'aegis', name: 'Azora Aegis', description: 'Security Framework' },
  { id: 'oracle', name: 'Azora Oracle', description: 'Analytics Engine' },
]

const stats = [
  { label: 'Active Users', value: '50K+', icon: TrendingUp, color: 'from-teal-500 to-emerald-500' },
  { label: 'AZR Distributed', value: '2.5M', icon: Sparkles, color: 'from-amber-500 to-yellow-500' },
  { label: 'Services', value: '20+', icon: Zap, color: 'from-blue-500 via-purple-500 to-pink-500' },
  { label: 'Uptime', value: '99.9%', icon: Shield, color: 'from-indigo-500 to-purple-500' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <span className="text-xl font-bold text-white">Azora OS</span>
            <Button variant="azora" size="sm">Get Started</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Constitutional <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI</span> OS
          </h1>
          <p className="text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Ubuntu Philosophy Meets Quantum Technology
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="azora" size="lg">Explore Ecosystem</Button>
            <Button variant="ubuntu" size="lg">Learn More</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6 text-center">
                <div className={`h-12 w-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Explore Our <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Services</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <ServiceLogo service={service.id} size={120} />
                  </div>
                  <CardTitle className="text-white text-center">{service.name}</CardTitle>
                  <CardDescription className="text-center">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant={service.id as any} className="w-full">Explore</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardContent className="p-12 text-center">
            <ElaraAvatar variant="core" size={120} showName mood="helpful" className="mb-6 mx-auto" />
            <h3 className="text-3xl font-bold text-white mb-4">Meet Elara AI</h3>
            <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
              Your Constitutional AI companion guiding you through Ubuntu principles
            </p>
            <Button variant="azora" size="lg">Chat with Elara</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
