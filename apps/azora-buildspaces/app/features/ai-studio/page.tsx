import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { AIStudio } from '@/components/features/ai-studio/ai-studio'
import { Brain, MessageSquare, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function AIStudioPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">AI Studio</h1>
                <p className="text-gray-400">
                  Interact with your team of AI agents: Code review, testing, security, performance, and documentation
                </p>
              </div>
              <Link href="/features" className="text-emerald-400 hover:text-emerald-300">
                ← Back to features
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-400">AI Agents</p>
                    <p className="text-xl font-bold text-white">5</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Conversations</p>
                    <p className="text-xl font-bold text-white">143</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-gray-400">Issues Fixed</p>
                    <p className="text-xl font-bold text-white">87</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Time Saved</p>
                    <p className="text-xl font-bold text-white">127h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 h-[600px]">
            <div className="col-span-3">
              <AIStudio />
            </div>
            <div className="space-y-4 overflow-y-auto">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Agents</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm font-medium text-blue-300">👨‍💻 Sankofa</p>
                    <p className="text-xs text-blue-200">Code Architect</p>
                  </div>
                  <div className="p-3 rounded bg-purple-500/10 border border-purple-500/30">
                    <p className="text-sm font-medium text-purple-300">🧪 Themba</p>
                    <p className="text-xs text-purple-200">Testing Specialist</p>
                  </div>
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/30">
                    <p className="text-sm font-medium text-red-300">🔒 Jabari</p>
                    <p className="text-xs text-red-200">Security Expert</p>
                  </div>
                  <div className="p-3 rounded bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-sm font-medium text-yellow-300">⚡ Nia</p>
                    <p className="text-xs text-yellow-200">Performance</p>
                  </div>
                  <div className="p-3 rounded bg-cyan-500/10 border border-cyan-500/30">
                    <p className="text-sm font-medium text-cyan-300">📚 Imani</p>
                    <p className="text-xs text-cyan-200">Knowledge Manager</p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-emerald-300 mb-2">💡 Pro Tip</h3>
                <p className="text-xs text-emerald-200">
                  You can mention agents by name or use auto-routing to find the best agent for your request.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">🚀 Code Review</h3>
              <p className="text-sm text-gray-400">
                Get instant feedback on code quality, architecture, and best practices from Sankofa.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">🔐 Security Audit</h3>
              <p className="text-sm text-gray-400">
                Have Jabari analyze your code for security vulnerabilities and compliance issues.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">📊 Performance Analysis</h3>
              <p className="text-sm text-gray-400">
                Let Nia identify bottlenecks and optimize your code for maximum performance.
              </p>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
