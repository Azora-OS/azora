import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import Link from "next/link"

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Compliance</h1>
          <p className="text-gray-400 mb-6">Compliance and regulatory policies for enterprises and government customers.</p>
          <div className="rounded-xl bg-white/5 p-6 border border-white/10">Compliance matrix and certifications will be published here.</div>
          <div className="mt-4">
            <Link href="/security" className="text-emerald-400">Security &amp; Privacy</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
