import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import Link from "next/link"

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Tutorials</h1>
          <p className="text-gray-400 mb-6">Hands-on tutorials to build with BuildSpaces.</p>
          <div className="rounded-xl bg-white/5 p-6 border border-white/10">Starter guides and walkthroughs are coming soon.</div>
          <div className="mt-4">
            <Link href="/docs" className="text-emerald-400">Back to docs</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
