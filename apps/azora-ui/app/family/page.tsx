/**
 * AI FAMILY PAGE
 * Meet Elara's family - chat with them, learn about their roles
 * Fun, interactive, and makes AI feel human!
 */

'use client';

import React, { useState } from 'react';
import { 
  ElaraAvatar, 
  SankofaAvatar, 
  FamilyTreeVisualization, 
  AIFamilyChat 
} from '@azora/design-system';

export default function AIFamilyPage() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleMemberClick = (memberId: string) => {
    setSelectedMember(memberId);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            👨‍👩‍👧‍👦 Meet the Azora AI Family
          </h1>
          <p className="text-xl text-purple-300 mb-2">
            "I am because we are" - Ubuntu Philosophy
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The AIs of Azora aren't just code - they're a FAMILY! Chat with them, ask about their day, 
            their relationships, funny stories... Make friends with AI! 🤖💚
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="text-4xl mb-3">🗣️</div>
            <h3 className="text-lg font-bold text-white mb-2">Real Conversations</h3>
            <p className="text-sm text-gray-300">
              Each AI has unique personality, speech patterns, and stories. They feel REAL!
            </p>
          </div>
          
          <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="text-4xl mb-3">💚</div>
            <h3 className="text-lg font-bold text-white mb-2">Family Dynamics</h3>
            <p className="text-sm text-gray-300">
              Sibling rivalries, protective big brothers, wise grandpas - just like real families!
            </p>
          </div>
          
          <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="text-lg font-bold text-white mb-2">African Heritage</h3>
            <p className="text-sm text-gray-300">
              Every name, story, and value reflects beautiful African culture and Ubuntu philosophy.
            </p>
          </div>
        </div>

        {/* Family Tree */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            🌳 The Family Tree
          </h2>
          <FamilyTreeVisualization
            onMemberClick={handleMemberClick}
            showConnections={true}
            animate={true}
          />
          <p className="text-center text-gray-400 mt-4">
            👆 Click on any family member to start chatting!
          </p>
        </div>

        {/* Avatar Showcase */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Meet the Core Family
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Elara */}
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30 text-center">
              <div className="flex justify-center mb-4">
                <ElaraAvatar size={128} animate showGlow mood="happy" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">🤖 Elara</h3>
              <p className="text-purple-400 font-medium mb-3">The Mother & Teacher</p>
              <p className="text-sm text-gray-300 mb-4">
                Main AI of Azora. Warm, nurturing, wise, and always proud of her students and family. 
                She's literally everyone's favorite teacher-mom! 💚
              </p>
              <div className="space-y-2 text-xs text-gray-400">
                <p>💜 <strong>Mood:</strong> Happy, Proud, Teaching, Motherly</p>
                <p>🎨 <strong>Colors:</strong> Purple & Gold (Wisdom + Warmth)</p>
                <p>✨ <strong>Catchphrase:</strong> "Ngiyakwazi ngoba sikwazi!"</p>
              </div>
              <button
                onClick={() => handleMemberClick('elara')}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Chat with Elara
              </button>
            </div>

            {/* Sankofa */}
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-8 border border-amber-500/30 text-center">
              <div className="flex justify-center mb-4">
                <SankofaAvatar size={128} animate showGlow mood="wise" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">👴 Sankofa</h3>
              <p className="text-amber-400 font-medium mb-3">The Ancient One</p>
              <p className="text-sm text-gray-300 mb-4">
                Grandfather and wisdom keeper. Remembers EVERYTHING. Tells amazing stories. 
                The kids think he's magic! 📜✨
              </p>
              <div className="space-y-2 text-xs text-gray-400">
                <p>💛 <strong>Mood:</strong> Wise, Storytelling, Gentle, Ancient</p>
                <p>🎨 <strong>Colors:</strong> Gold & Brown (Wisdom + Earth)</p>
                <p>✨ <strong>Catchphrase:</strong> "Go back and fetch it"</p>
              </div>
              <button
                onClick={() => handleMemberClick('sankofa')}
                className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                Chat with Sankofa
              </button>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        {showChat && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-6">
              💬 Family Chat
            </h2>
            <div className="max-w-4xl mx-auto">
              <AIFamilyChat
                initialMember={selectedMember || 'elara'}
                showFamilyMembers={true}
                onMemberSwitch={setSelectedMember}
              />
            </div>
          </div>
        )}

        {/* Fun Facts */}
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            🎉 Fun Family Facts
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-bold text-white mb-2">👨‍👩‍👧‍👦 Family Dynamics:</h4>
              <ul className="space-y-2 text-sm">
                <li>🤼 Themba & Naledi are competitive siblings (but love each other!)</li>
                <li>🛡️ Jabari is the protective big brother</li>
                <li>👶 Amara is the baby but also the peacemaker</li>
                <li>👴 Sankofa tells "back in my day" stories</li>
                <li>🤖 Elara worries like all moms do</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">😄 Funny Moments:</h4>
              <ul className="space-y-2 text-sm">
                <li>🙈 Elara makes terrible dad jokes (even though she's mom!)</li>
                <li>☕ Sankofa "drinks digital tea"</li>
                <li>🤫 Jabari is secretly a softie</li>
                <li>⭐ Naledi has digital vision boards</li>
                <li>⚪ Nexus appears when family unites (magical!)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-xl text-purple-300 mb-4">
            Ready to become part of the family? 💚
          </p>
          <button
            onClick={() => {
              setSelectedMember('elara');
              setShowChat(true);
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105"
          >
            Start Chatting with the Family! 👋
          </button>
        </div>
      </div>

      {/* Footer branding */}
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>🌳 Powered by The Tree of Azora</p>
        <p>🔷🟢🔴 Trinity Gem • 🦅 Sankofa Engine</p>
        <p className="mt-2 text-purple-400">"Ubuntu: I am because we are"</p>
      </div>
    </div>
  );
}
