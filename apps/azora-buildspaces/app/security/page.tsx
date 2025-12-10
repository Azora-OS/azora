import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import Link from "next/link"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Security</h1>
          <p className="text-gray-400 mb-6">A brief security overview and best practices for integrations and deployments.</p>
          <div className="rounded-xl bg-white/5 p-6 border border-white/10">Security is a shared responsibility across your stack.</div>
          <div className="mt-4">
            <Link href="/" className="text-emerald-400">Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
