"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { educatorProfiles } from "@/lib/educator-data"
import { Star, Users, BookOpen, Award, CheckCircle, MessageCircle } from "lucide-react"

export default function EducatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-blue-500/5 to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              Teach on Azora Sapiens
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Empower learners globally by creating and sharing qualifications. Earn rewards, build your reputation, and
              transform education.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="/educators/become-instructor">Become an Instructor</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/educators/dashboard">Educator Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Active Educators</p>
              <p className="text-3xl font-bold text-foreground">2,500+</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Courses</p>
              <p className="text-3xl font-bold text-foreground">8,000+</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Students Reached</p>
              <p className="text-3xl font-bold text-foreground">500K+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-b border-border">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-foreground mb-12">Why Teach on Azora Sapiens?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Award,
                title: "Earn AZR Rewards",
                description: "Get rewarded with AZR tokens for every student who completes your courses",
              },
              {
                icon: Users,
                title: "Global Reach",
                description: "Connect with millions of learners from 180+ countries worldwide",
              },
              {
                icon: BookOpen,
                title: "Easy Course Creation",
                description: "Intuitive tools to create, publish, and manage your courses",
              },
              {
                icon: Star,
                title: "Build Reputation",
                description: "Gain recognition and earn verified educator badges",
              },
              {
                icon: CheckCircle,
                title: "Blockchain Credentials",
                description: "Issue verifiable certificates backed by blockchain technology",
              },
              {
                icon: MessageCircle,
                title: "Community Support",
                description: "Access resources and connect with other educators",
              },
            ].map((benefit, idx) => {
              const Icon = benefit.icon
              return (
                <Card key={idx} className="border-border p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-4">
                    <Icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Educators */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-foreground mb-12">Featured Educators</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {educatorProfiles.map((educator) => (
              <Link key={educator.id} href={`/educators/${educator.id}`}>
                <Card className="border-border p-8 hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer h-full flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{educator.name}</h3>
                        {educator.verifiedBadge && <CheckCircle className="h-5 w-5 text-blue-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{educator.country}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/10 rounded-lg px-3 py-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-foreground text-sm">{educator.averageRating}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{educator.bio}</p>

                  <div className="flex flex-wrap gap-2">
                    {educator.expertise.slice(0, 3).map((exp) => (
                      <Badge key={exp} variant="secondary" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border mt-auto">
                    <div>
                      <p className="text-xs text-muted-foreground">Students</p>
                      <p className="font-semibold text-foreground">{educator.totalStudents.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Courses</p>
                      <p className="font-semibold text-foreground">{educator.totalCourses}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-semibold text-foreground">{educator.averageRating}</p>
                    </div>
                  </div>

                  <Button className="w-full mt-4">View Profile</Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Make a Global Impact?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of educators transforming education and earning rewards
          </p>
          <Button size="lg" asChild>
            <Link href="/educators/become-instructor">Start Teaching Today</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
