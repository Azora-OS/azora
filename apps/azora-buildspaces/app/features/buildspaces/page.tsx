'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import Link from 'next/link'

export default function BuildSpacesProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [ownerId, setOwnerId] = useState('local-owner')

  async function load() {
    const res = await fetch('/api/buildspaces/projects')
    const json = await res.json()
    setProjects(json.projects ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/buildspaces/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, slug, ownerId }) })
    if (res.ok) {
      setName('')
      setSlug('')
      load()
    } else {
      const json = await res.json()
      alert(json.error || 'failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">BuildSpaces Projects</h1>
              <p className="text-gray-400">Create and view BuildSpaces projects (local dev store)</p>
            </div>
            <Link href="/features" className="text-emerald-400 hover:text-emerald-300">← Back to features</Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <form onSubmit={create} className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" className="flex-1 px-3 py-2 bg-transparent border rounded" />
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" className="px-3 py-2 bg-transparent border rounded" />
              <button className="px-3 py-2 bg-emerald-600/20 rounded">Create</button>
            </form>
          </div>

          <div className="grid gap-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-400">{p.slug} • {new Date(p.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Link href={`/features/design-studio?project=${p.slug}`} className="px-3 py-2 bg-blue-600/20 rounded">Open</Link>
                </div>
              </div>
            ))}
            {projects.length === 0 && <div className="text-gray-400">No projects yet. Create one above.</div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
