'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.ok) {
        router.push('/')
      } else {
        alert('Invalid credentials')
      }
    } catch (error) {
      alert('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Azora Mint</h1>
            <p className="text-white/80">Login to claim your minted AZR tokens</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Don't have an account? <button className="text-blue-400 hover:text-blue-300">Sign up</button>
            </p>
          </div>
        </div>

        {/* Pricing & Features */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Azora Mint Pricing</h2>

            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-400 font-bold">Free Trial</span>
                  <span className="text-green-400 font-bold">1 Week</span>
                </div>
                <p className="text-white/80 text-sm">Start mining and explore the platform</p>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-bold">Basic Plan</span>
                  <span className="text-blue-400 font-bold">R50/month</span>
                </div>
                <p className="text-white/80 text-sm">40% mining power - Perfect for getting started</p>
              </div>

              <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-400 font-bold">Premium Plan</span>
                  <span className="text-purple-400 font-bold">R200/month</span>
                </div>
                <p className="text-white/80 text-sm">100% mining power - Maximum profitability</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Why Azora Mint?</h3>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span>Mine before login - Start earning immediately</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span>Real-time mining dashboard</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span>Constitutionally aligned economics</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span>Quantum-optimized algorithms</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}