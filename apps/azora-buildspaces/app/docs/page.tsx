import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-gray-400 mb-6">Developer documentation, API references, and tutorials for BuildSpaces.</p>
          <div className="rounded-xl bg-white/5 p-6 border border-white/10">Explore code examples, API reference, and tutorials.</div>
          <div className="mt-4">
            <Link href="/docs/api" className="text-emerald-400">API Reference</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
