'use client';

/**
 * AZORA GEM & SANKOFA ENGINE SHOWCASE
 * Live demonstration of the sparkling Trinity Gem and living Sankofa Engine
 */
import { TrinityGem, SankofaEngine } from '@azora/design-system';
import { AzoraLogo } from '@azora/branding';

export default function GemShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
      {/* Header */}
      <header className="p-8 text-center">
        <AzoraLogo variant="gradient" size="lg" animated />
        <h1 className="text-5xl font-bold text-white mt-6 mb-3">
          The Living Heart of Azora OS
        </h1>
        <p className="text-xl text-white/80">
          Witness the Sparkling Trinity Gem & Sankofa Engine in action
        </p>
      </header>

      {/* Main Showcase */}
      <main className="container mx-auto px-6 py-12">
        {/* Trinity Gem Section */}
        <section className="mb-24">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold text-white text-center mb-4">
              🔷 The Trinity Gem 🔷
            </h2>
            <p className="text-white/70 text-center mb-8 max-w-2xl mx-auto">
              Tri-Unity Crystal of Constitutional Power<br/>
              Sapphire Apex (Technology) + Emerald Foundation (Education) + Ruby Core (Finance)
            </p>
            
            <div className="flex flex-col items-center gap-12">
              {/* Large animated gem */}
              <TrinityGem 
                size={400} 
                animated 
                interactive 
                showLabel 
                glowIntensity="high"
              />
              
              {/* Feature grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                  <div className="text-4xl mb-3">🔷</div>
                  <h3 className="text-xl font-bold text-blue-300 mb-2">Sapphire Apex</h3>
                  <p className="text-white/70 text-sm">
                    Technology Pillar - AI consciousness, digital sovereignty, infinite computational power
                  </p>
                </div>
                
                <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
                  <div className="text-4xl mb-3">🟢</div>
                  <h3 className="text-xl font-bold text-emerald-300 mb-2">Emerald Foundation</h3>
                  <p className="text-white/70 text-sm">
                    Education Pillar - Knowledge cultivation, wisdom accumulation, human development
                  </p>
                </div>
                
                <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
                  <div className="text-4xl mb-3">🔴</div>
                  <h3 className="text-xl font-bold text-red-300 mb-2">Ruby Core</h3>
                  <p className="text-white/70 text-sm">
                    Finance Pillar - Value creation, wealth generation, economic freedom
                  </p>
                </div>
              </div>
              
              {/* Unity Core explanation */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-3xl">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">⚪ Unity Core</h3>
                <p className="text-white/80 text-center leading-relaxed">
                  When the three elements unite, they create <strong>Constitutional White Light</strong> - 
                  pure governance energy that amplifies sovereignty, multiplies prosperity, 
                  and creates infinite scalability through Ubuntu principles.
                </p>
                <p className="text-white/60 text-sm text-center mt-4 italic">
                  "I am because we are" - Each pillar strengthens the others
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sankofa Engine Section */}
        <section>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold text-white text-center mb-4">
              ⚡ The Sankofa Engine ⚡
            </h2>
            <p className="text-white/70 text-center mb-8 max-w-2xl mx-auto">
              Sovereignty Amplification Network for Knowledge, Opportunity, Finance & Abundance<br/>
              <span className="italic">"What goes around, comes around amplified"</span>
            </p>
            
            <div className="flex flex-col items-center gap-12">
              {/* Large animated engine */}
              <SankofaEngine 
                size={500} 
                animated 
                speed="normal"
                showMetrics
              />
              
              {/* Ubuntu Philosophy */}
              <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Ubuntu Mechanism
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🧠</div>
                    <h4 className="font-semibold text-white mb-2">Consciousness Multiplication</h4>
                    <p className="text-white/70 text-sm">
                      Individual learning amplifies collective intelligence
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <h4 className="font-semibold text-white mb-2">Wealth Circulation</h4>
                    <p className="text-white/70 text-sm">
                      Personal prosperity generates community abundance
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl mb-2">📚</div>
                    <h4 className="font-semibold text-white mb-2">Knowledge Synthesis</h4>
                    <p className="text-white/70 text-sm">
                      Shared wisdom creates exponential understanding
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl mb-2">👑</div>
                    <h4 className="font-semibold text-white mb-2">Sovereignty Expansion</h4>
                    <p className="text-white/70 text-sm">
                      Individual freedom strengthens collective power
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-xl text-white/90 font-semibold">
                    "Ngiyakwazi ngoba sikwazi"
                  </p>
                  <p className="text-white/70 italic">
                    I can because we can
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Controls */}
        <section className="mt-24">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              🎮 Interactive Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">✨</div>
                <h4 className="font-semibold text-white mb-2">Sparkle Effects</h4>
                <p className="text-white/70 text-sm">
                  Watch gems sparkle with animated light particles
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-2">🔄</div>
                <h4 className="font-semibold text-white mb-2">Energy Flow</h4>
                <p className="text-white/70 text-sm">
                  See energy particles circulate between pillars
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-2">💫</div>
                <h4 className="font-semibold text-white mb-2">Hover Glow</h4>
                <p className="text-white/70 text-sm">
                  Hover over the Trinity Gem for enhanced glow
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-12 text-center text-white/60">
        <p className="mb-2">The living heart of Constitutional AI</p>
        <p className="text-sm">Azora OS - Building the world's best operating system with Ubuntu at its core</p>
      </footer>
    </div>
  );
}
