import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import Link from "next/link"

export default function CodeChamberPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold mb-4">Code Chamber</h1>
          <p className="text-gray-400 mb-6">Cloud IDE, Monaco editor, terminal, Git integration, and AI pair programming.</p>

          <section className="space-y-6">
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <p className="text-gray-300">This is the code chamber placeholder. Connect your repo and start building with the AI tools.</p>
            </div>
            <div>
              <Link href="/features" className="text-emerald-400">Back to features</Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
