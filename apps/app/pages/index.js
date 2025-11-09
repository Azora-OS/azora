import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>🌟 Azora OS - Constitutional AI Operating System</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">🌟</div>
                <div>
                  <h1 className="text-2xl font-bold">Azora OS</h1>
                  <p className="text-sm text-blue-300">Constitutional AI Operating System</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-bold mb-6">
              Welcome to the Future
            </h2>
            <p className="text-2xl text-gray-300 mb-8">
              Ubuntu Philosophy • Constitutional AI • Global Prosperity
            </p>
            <p className="text-lg text-gray-400 italic">
              "Ngiyakwazi ngoba sikwazi" - "I can because we can"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Education Platform */}
            <Link href="/education" className="group">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-8 border border-green-500/20 hover:border-green-400/40 transition-all group-hover:scale-105">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-2xl font-bold mb-4">Azora Education</h3>
                <p className="text-gray-300 mb-6">
                  Next-gen learning platform with AI tutoring, gamification, and learn-to-earn rewards
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">🤖 AI Tutor Elara</span>
                  <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">💰 Learn-to-Earn</span>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">🏆 Gamified</span>
                </div>
                <div className="text-green-400 font-semibold group-hover:text-green-300">
                  Start Learning Journey →
                </div>
              </div>
            </Link>

            {/* Codespaces */}
            <Link href="/codespaces" className="group">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20 hover:border-blue-400/40 transition-all group-hover:scale-105">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-2xl font-bold mb-4">Azora Codespaces</h3>
                <p className="text-gray-300 mb-6">
                  Cloud development environments with AI assistance and collaborative coding
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">🐳 Docker</span>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">🤖 AI Assistant</span>
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">🔗 Collaborative</span>
                </div>
                <div className="text-blue-400 font-semibold group-hover:text-blue-300">
                  Launch Workspace →
                </div>
              </div>
            </Link>

            {/* Studyspaces */}
            <Link href="/studyspaces" className="group">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all group-hover:scale-105">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-2xl font-bold mb-4">Azora Studyspaces</h3>
                <p className="text-gray-300 mb-6">
                  Virtual study rooms with live lectures, AI tutoring, and collaborative notes
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">🎥 Live Video</span>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">📝 Notes</span>
                  <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">⛏️ POK Rewards</span>
                </div>
                <div className="text-purple-400 font-semibold group-hover:text-purple-300">
                  Join Study Room →
                </div>
              </div>
            </Link>

            {/* Marketplace */}
            <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-lg rounded-2xl p-8 border border-orange-500/20">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-2xl font-bold mb-4">Azora Forge</h3>
              <p className="text-gray-300 mb-6">
                AI-powered skills marketplace connecting global talent with opportunities
              </p>
              <div className="text-orange-400 font-semibold">
                Coming Soon...
              </div>
            </div>

            {/* Financial Services */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-lg rounded-2xl p-8 border border-yellow-500/20">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-4">Azora Mint</h3>
              <p className="text-gray-300 mb-6">
                Multi-currency wallet with proof-of-knowledge mining and DeFi integration
              </p>
              <div className="text-yellow-400 font-semibold">
                Coming Soon...
              </div>
            </div>

            {/* Security Framework */}
            <div className="bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold mb-4">Azora Aegis</h3>
              <p className="text-gray-300 mb-6">
                Constitutional AI security framework with threat detection and governance
              </p>
              <div className="text-red-400 font-semibold">
                Coming Soon...
              </div>
            </div>
          </div>

          {/* Ubuntu Philosophy Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-12 border border-orange-500/20">
              <h3 className="text-3xl font-bold mb-6">🌍 Ubuntu Philosophy</h3>
              <p className="text-2xl text-gray-300 italic mb-4">
                "Ngiyakwazi ngoba sikwazi"
              </p>
              <p className="text-xl text-gray-300 mb-6">
                "I can because we can"
              </p>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Through Ubuntu, we multiply sovereignty. Through learning, we generate abundance. 
                Through sharing, we amplify freedom. Individual success becomes collective prosperity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}