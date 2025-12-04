"use client"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { AgentsSection } from "@/components/landing/agents-section"
import { DemoSection } from "@/components/landing/demo-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FooterSection } from "@/components/landing/footer-section"
import { NavigationBar } from "@/components/landing/navigation-bar"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <NavigationBar />
            <main>
                <HeroSection />
                <FeaturesSection />
                <AgentsSection />
                <DemoSection />
                <PricingSection />
            </main>
            <FooterSection />
        </div>
    )
}
