'use client';

import { useState, useEffect } from 'react';
import { Code, Play, Terminal, GitBranch, Users, Zap } from 'lucide-react';

export default function CodespacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/codespaces/workspaces')
      .then(res => res.json())
      .then(data => setWorkspaces(data.workspaces || []))
      .catch(() => setWorkspaces([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-10 h-10 text-[#33ff92]" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#33ff92] to-[#00D9FF] bg-clip-text text-transparent">
              Azora Codespaces
            </h1>
          </div>
          <p className="text-lg text-gray-400">Cloud development environments powered by Constitutional AI</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Zap className="w-8 h-8 text-[#33ff92] mb-3" />
            <h3 className="font-semibold mb-2">New Workspace</h3>
            <p className="text-sm text-gray-400">Create cloud dev environment</p>
          </button>
          
          <button className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <GitBranch className="w-8 h-8 text-[#00D9FF] mb-3" />
            <h3 className="font-semibold mb-2">From Repository</h3>
            <p className="text-sm text-gray-400">Clone and launch</p>
          </button>
          
          <button className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Users className="w-8 h-8 text-[#FF6B35] mb-3" />
            <h3 className="font-semibold mb-2">Team Workspace</h3>
            <p className="text-sm text-gray-400">Collaborative coding</p>
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Your Workspaces</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading workspaces...</div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-12">
              <Terminal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No workspaces yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workspaces.map((ws: any) => (
                <div key={ws.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#33ff92]/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{ws.name}</h3>
                      <p className="text-sm text-gray-400">{ws.repository || 'Local workspace'}</p>
                    </div>
                    <button className="px-4 py-2 bg-[#33ff92] text-black rounded-lg font-semibold hover:bg-[#2ee882] transition-all flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-400 text-sm">
            🔧 Backend integration pending - Agents will implement /api/codespaces endpoints
          </p>
        </div>
      </div>
    </div>
  );
}
