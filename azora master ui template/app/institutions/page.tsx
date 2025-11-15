"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { institutions } from "@/lib/educator-data"
import { Globe, Award, Users, BookOpen } from "lucide-react"

export default function InstitutionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-purple-500/5 to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              Institutional Partners
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover leading educational institutions worldwide sharing their qualifications on Azora Sapiens.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Partner Institutions</p>
              <p className="text-3xl font-bold text-foreground">500+</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Programs Available</p>
              <p className="text-3xl font-bold text-foreground">15,000+</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Countries Covered</p>
              <p className="text-3xl font-bold text-foreground">180+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Institutions */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-foreground mb-12">Featured Institutions</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {institutions.map((institution) => (
              <Link key={institution.id} href={`/institutions/${institution.id}`}>
                <Card className="border-border p-8 hover:shadow-lg hover:border-purple-500 transition-all cursor-pointer h-full flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{institution.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                        <Globe className="h-4 w-4" />
                        {institution.country}
                      </p>
                    </div>
                    {institution.rankingGlobal && <Badge variant="secondary">Rank: #{institution.rankingGlobal}</Badge>}
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{institution.bio}</p>

                  <div className="pt-4 border-t border-border space-y-3 mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {institution.accreditation.map((acc) => (
                        <Badge key={acc} variant="outline" className="text-xs">
                          {acc}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Programs</p>
                        <p className="font-semibold text-foreground">{institution.totalPrograms}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Students</p>
                        <p className="font-semibold text-foreground">
                          {(institution.totalStudents / 1000).toFixed(0)}K+
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Est.</p>
                        <p className="font-semibold text-foreground">{institution.established}</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4">View Programs</Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-foreground mb-12">Partner Benefits</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: Users,
                title: "Global Reach",
                description: "Connect with millions of learners worldwide and expand your student base",
              },
              {
                icon: Award,
                title: "Blockchain Verification",
                description: "Issue credentials that are permanently verified on the blockchain",
              },
              {
                icon: BookOpen,
                title: "Easy Integration",
                description: "Seamlessly list your programs and manage student enrollments",
              },
              {
                icon: Globe,
                title: "Market Visibility",
                description: "Gain exposure in the global education marketplace",
              },
            ].map((benefit, idx) => {
              const Icon = benefit.icon
              return (
                <Card key={idx} className="border-border p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 mb-4">
                    <Icon className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Partner with Azora Sapiens?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            List your qualifications and reach millions of learners globally
          </p>
          <Button size="lg" asChild>
            <Link href="/institutions/partner">Become a Partner</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
