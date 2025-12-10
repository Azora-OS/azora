import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import Link from "next/link"

export default function AIStudioPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">AI Studio</h1>
          <p className="text-gray-400 mb-6">Toy with models, chain prompts, and design no-code workflows that scale.</p>
          <div className="rounded-xl bg-white/5 p-6 border border-white/10">An interactive playground for agents, chains, and evaluation metrics.</div>
          <div className="mt-4">
            <Link href="/features" className="text-emerald-400">Back to features</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
