"use client"

import { useState } from 'react'
import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import Link from 'next/link'
import { Monitor, Play } from 'lucide-react'

export default function InnovationTheaterPage() {
  const [slide, setSlide] = useState(1)

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Innovation Theater</h1>
              <p className="text-gray-400">Create slides, run demos, and share product walkthroughs.</p>
            </div>
            <Link href="/features" className="text-emerald-400 hover:text-emerald-300">← Back to features</Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Slide Preview</h3>
                <div className="space-x-2">
                  <button onClick={() => setSlide((s) => Math.max(1, s - 1))} className="px-3 py-1 bg-white/5 rounded">Prev</button>
                  <button onClick={() => setSlide((s) => s + 1)} className="px-3 py-1 bg-white/5 rounded">Next</button>
                </div>
              </div>
              <div className="h-96 bg-black/20 rounded flex items-center justify-center text-gray-300">
                <div>
                  <p className="text-sm text-gray-400">Slide {slide}</p>
                  <h2 className="text-2xl font-bold mt-2">Title for slide {slide}</h2>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Controls</h3>
              <div className="space-y-3">
                <button className="w-full px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded flex items-center justify-center gap-2"><Play /> Present</button>
                <button className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded flex items-center justify-center gap-2"><Monitor /> Open Speaker View</button>
                <button onClick={() => setSlide(1)} className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded">Reset Slides</button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
