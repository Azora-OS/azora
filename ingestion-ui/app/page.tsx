import { Hero } from "@/components/hero"
import { DivineDNA } from "@/components/divine-dna"
import { LivingEcosystem } from "@/components/living-ecosystem"
import { ConstitutionalAI } from "@/components/constitutional-ai"
import { Ubuntu } from "@/components/ubuntu"
import { SacredMission } from "@/components/sacred-mission"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <div className="organism-bg fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-10">
        <Navigation />
        <Hero />
        <DivineDNA />
        <ConstitutionalAI />
        <LivingEcosystem />
        <Ubuntu />
        <SacredMission />
        <Footer />
      </div>
    </main>
  )
}
