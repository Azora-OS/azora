'use client'

import { useState, useEffect } from 'react'

export default function AzoraHomePage() {
  const [stats, setStats] = useState({
    totalUsers: 125000,
    monthlyRevenue: 54150000,
    studentCEOs: 2500,
    projectsLaunched: 8500
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white">AZORA</h1>
              <span className="ml-2 text-sm text-blue-300">World's Best Education Platform</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-white hover:text-blue-300">Features</a>
              <a href="#pricing" className="text-white hover:text-blue-300">Pricing</a>
              <a href="#forge" className="text-white hover:text-blue-300">AZORA Forge</a>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                Start Learning
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-6xl font-bold text-white mb-6">
            Learn. Code. <span className="text-blue-400">Earn.</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The world's first education platform where students become millionaire CEOs 
            while learning. Revolutionary AI tutoring, real revenue projects, and crypto rewards.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold">
              Start 90-Day FREE Trial
            </button>
            <button className="border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-semibold">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-gray-300">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400">R{(stats.monthlyRevenue/1000000).toFixed(1)}M</div>
              <div className="text-gray-300">Monthly Revenue</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">{stats.studentCEOs.toLocaleString()}</div>
              <div className="text-gray-300">Student CEOs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400">{stats.projectsLaunched.toLocaleString()}</div>
              <div className="text-gray-300">Projects Launched</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-white text-center mb-16">Revolutionary Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="text-4xl mb-4">🧠</div>
              <h4 className="text-xl font-bold text-white mb-4">Quantum AI Tutoring</h4>
              <p className="text-gray-300">AI that reads your learning patterns and adapts in real-time for 99% success rate.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-xl font-bold text-white mb-4">Revenue Projects</h4>
              <p className="text-gray-300">Build real projects that generate $10K-$100K monthly. Keep 90% of profits.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="text-4xl mb-4">⛏️</div>
              <h4 className="text-xl font-bold text-white mb-4">Crypto Mining</h4>
              <p className="text-gray-300">Mine crypto while learning. Your device earns money in the background.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AZORA Forge Section */}
      <section id="forge" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-8">AZORA Forge: GitHub Killer</h3>
          <p className="text-xl text-gray-300 mb-8">
            Where students become CEOs of revenue-generating projects. 
            Not just code repositories - wealth creation platforms.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold">
            Become a Student CEO
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 AZORA. The World's Best Education Platform.</p>
          <p className="text-sm text-gray-500 mt-2">Making millionaires through education.</p>
        </div>
      </footer>
    </div>
  )
}
