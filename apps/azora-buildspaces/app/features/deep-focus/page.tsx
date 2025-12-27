"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function DeepFocusPage() {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(25 * 60)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [running])

  function startTimer() {
    setSeconds(25 * 60)
    setRunning(true)
  }

  function format(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Deep Focus</h1>
              <p className="text-gray-400">Pomodoro-style focus sessions with minimal UI to help you get work done.</p>
            </div>
            <Link href="/features" className="text-emerald-400 hover:text-emerald-300">← Back to features</Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
            <Clock className="mx-auto mb-4 w-12 h-12 text-yellow-400" />
            <div className="text-6xl font-mono font-semibold mb-4">{format(seconds)}</div>
            <div className="space-x-3">
              <button onClick={startTimer} className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded">Start 25m</button>
              <button onClick={() => setRunning((r) => !r)} className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded">{running ? 'Pause' : 'Resume'}</button>
              <button onClick={() => { setRunning(false); setSeconds(25 * 60); }} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded">Reset</button>
            </div>
            <p className="text-sm text-gray-400 mt-4">Use this simple timer for focused coding sprints.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
