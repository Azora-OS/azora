import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import Link from "next/link"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold mb-6">Features</h1>
          <p className="text-gray-400 mb-8">Overview of BuildSpaces capabilities. Browse individual rooms and tooling.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/features/code-chamber" className="block rounded-xl p-6 bg-white/5 border border-white/10 hover:border-emerald-500/40">
              <h3 className="font-semibold text-lg">Code Chamber</h3>
              <p className="text-sm text-gray-400 mt-1">Full-stack cloud IDE with AI-assisted development.</p>
            </Link>
            <Link href="/features/design-studio" className="block rounded-xl p-6 bg-white/5 border border-white/10 hover:border-purple-500/40">
              <h3 className="font-semibold text-lg">Design Studio</h3>
              <p className="text-sm text-gray-400 mt-1">Figma to React workflows and creative tooling.</p>
            </Link>
            <Link href="/features/ai-studio" className="block rounded-xl p-6 bg-white/5 border border-white/10 hover:border-pink-500/40">
              <h3 className="font-semibold text-lg">AI Studio</h3>
              <p className="text-sm text-gray-400 mt-1">Agent orchestration and workflows.</p>
            </Link>
            <Link href="/features/agents" className="block rounded-xl p-6 bg-white/5 border border-white/10 hover:border-emerald-400/40">
              <h3 className="font-semibold text-lg">AI Agents</h3>
              <p className="text-sm text-gray-400 mt-1">Meet the team of specialized assistants (Elara, Imani, Sankofa...)</p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
