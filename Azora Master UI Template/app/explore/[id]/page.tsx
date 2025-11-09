"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { qualificationsData } from "@/lib/qualifications-data"
import { ArrowLeft, Award, Globe, Zap, CheckCircle, Clock, Building2, BookOpen } from "lucide-react"

export default function QualificationDetailPage() {
  const params = useParams()
  const id = params.id as string
  const qualification = qualificationsData.find((q) => q.id === id)

  if (!qualification) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Qualification not found</h1>
            <Button asChild>
              <Link href="/explore">Back to Explore</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b border-border bg-gradient-to-b from-blue-500/5 to-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/explore" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Link>
          </Button>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <Award className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-2">{qualification.name}</h1>
                <p className="text-lg text-muted-foreground">{qualification.issuingBody}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>{qualification.category}</Badge>
              <Badge variant="outline">{qualification.level}</Badge>
              <Badge variant="outline">{qualification.type}</Badge>
              {qualification.country && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {qualification.country}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">About This Qualification</h2>
                <p className="text-muted-foreground leading-relaxed">{qualification.description}</p>
              </Card>

              {/* Key Details */}
              <Card className="border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Key Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {qualification.duration && (
                    <div className="flex gap-3">
                      <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium text-foreground">{qualification.duration}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Building2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Issuing Body</p>
                      <p className="font-medium text-foreground">{qualification.issuingBody}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Prerequisites */}
              {qualification.prerequisites && qualification.prerequisites.length > 0 && (
                <Card className="border-border p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Prerequisites</h2>
                  <ul className="space-y-2">
                    {qualification.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Recognition */}
              {qualification.recognizedIn && qualification.recognizedIn.length > 0 && (
                <Card className="border-border p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Recognized In</h2>
                  <div className="flex flex-wrap gap-2">
                    {qualification.recognizedIn.map((region) => (
                      <Badge key={region} variant="secondary" className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {region}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* CTA Card */}
              <Card className="border-border p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <div className="space-y-4">
                  {qualification.azrReward && (
                    <div className="rounded-lg bg-blue-500/10 p-4">
                      <p className="text-sm text-muted-foreground mb-2">Earn Upon Verification</p>
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <span className="text-2xl font-bold text-foreground">{qualification.azrReward} AZR</span>
                      </div>
                    </div>
                  )}

                  {qualification.verifiable && (
                    <div className="rounded-lg bg-green-500/10 p-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Blockchain Verifiable</span>
                    </div>
                  )}

                  <Button size="lg" className="w-full">
                    <Award className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>

                  <Button variant="outline" size="lg" className="w-full bg-transparent">
                    Save for Later
                  </Button>
                </div>
              </Card>

              {/* Info Card */}
              <Card className="border-border p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm">About Azora Sapiens</h3>
                <p className="text-xs text-muted-foreground">
                  All qualifications are verified on blockchain and integrated with the global education ecosystem.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
