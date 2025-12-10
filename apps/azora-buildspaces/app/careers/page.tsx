import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import Link from "next/link"

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Careers</h1>
          <p className="text-gray-400 mb-6">Explore open positions at Azora and BuildSpaces.</p>
          <div className="rounded-xl bg-white/5 p-6 border border-white/10">We are hiring for multiple roles. Check back soon or submit a resume to <a href="mailto:jobs@azora.com" className="text-emerald-400">jobs@azora.com</a>.</div>
          <div className="mt-4">
            <Link href="/about" className="text-emerald-400">About Us</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
