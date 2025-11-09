'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Video, Users, MessageSquare, Award, Brain } from 'lucide-react';

export default function StudyspacesPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/studyspaces/rooms')
      .then(res => res.json())
      .then(data => setRooms(data.rooms || []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-[#33ff92]" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#33ff92] to-[#00D9FF] bg-clip-text text-transparent">
              Azora Studyspaces
            </h1>
          </div>
          <p className="text-lg text-gray-400">Collaborative learning powered by Ubuntu philosophy</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Video className="w-8 h-8 text-[#33ff92] mb-3" />
            <h3 className="font-semibold mb-2">Live Lecture</h3>
            <p className="text-sm text-gray-400">Join or host live sessions</p>
          </button>
          
          <button className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Users className="w-8 h-8 text-[#00D9FF] mb-3" />
            <h3 className="font-semibold mb-2">Study Group</h3>
            <p className="text-sm text-gray-400">Peer learning rooms</p>
          </button>
          
          <button className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Brain className="w-8 h-8 text-[#FF6B35] mb-3" />
            <h3 className="font-semibold mb-2">AI Tutor</h3>
            <p className="text-sm text-gray-400">Elara assistance</p>
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Active Study Rooms</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No active rooms. Create your first study space!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {rooms.map((room: any) => (
                <div key={room.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#33ff92]/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{room.name}</h3>
                      <p className="text-sm text-gray-400">{room.subject}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      {room.participants}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 px-4 py-2 bg-[#33ff92] text-black rounded-lg font-semibold hover:bg-[#2ee882] transition-all">
                      Join Room
                    </button>
                    {room.hasRewards && (
                      <div className="px-3 py-2 bg-yellow-500/20 rounded-lg">
                        <Award className="w-5 h-5 text-yellow-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-400 text-sm">
            🔧 Backend integration pending - Agents will implement /api/studyspaces endpoints
          </p>
        </div>
      </div>
    </div>
  );
}
