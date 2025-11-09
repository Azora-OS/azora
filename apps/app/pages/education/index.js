import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AzoraEducation() {
  const [learner, setLearner] = useState(null);
  const [courses, setCourses] = useState([]);
  const [elaraChat, setElaraChat] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchLeaderboard();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:4500/api/courses');
      const data = await response.json();
      setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:4500/api/leaderboards');
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const createLearner = async () => {
    try {
      const response = await fetch('http://localhost:4500/api/learners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Demo Learner',
          email: 'demo@azora.education',
          learningGoals: ['AI', 'Quantum Computing', 'Entrepreneurship'],
          preferredStyle: 'visual'
        })
      });
      const data = await response.json();
      setLearner(data.learner);
      setElaraChat([{ role: 'elara', content: data.welcomeMessage }]);
    } catch (error) {
      console.error('Error creating learner:', error);
    }
  };

  const enrollInCourse = async (courseId) => {
    if (!learner) return;
    
    try {
      const response = await fetch(`http://localhost:4500/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learnerId: learner.id })
      });
      const data = await response.json();
      
      if (data.success) {
        setLearner(prev => ({
          ...prev,
          enrolledCourses: [...prev.enrolledCourses, courseId],
          azrBalance: prev.azrBalance - (courses.find(c => c.id === courseId)?.price || 0)
        }));
        setElaraChat(prev => [...prev, { role: 'elara', content: data.elaraMessage }]);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const chatWithElara = async () => {
    if (!learner || !chatMessage.trim()) return;
    
    const userMessage = chatMessage;
    setChatMessage('');
    setElaraChat(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch('http://localhost:4500/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId: learner.id,
          message: userMessage,
          context: 'curious'
        })
      });
      const data = await response.json();
      setElaraChat(prev => [...prev, { role: 'elara', content: data.response }]);
    } catch (error) {
      console.error('Error chatting with Elara:', error);
    }
  };

  const simulateProgress = async (courseId) => {
    if (!learner) return;
    
    try {
      const response = await fetch('http://localhost:4500/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId: learner.id,
          courseId,
          moduleId: 'demo_module',
          score: 0.85,
          timeSpent: 30
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setLearner(prev => ({
          ...prev,
          xp: data.progress.totalXP,
          azrBalance: data.progress.totalAZR,
          level: data.progress.level
        }));
        setElaraChat(prev => [...prev, { role: 'elara', content: data.elaraMessage }]);
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <>
      <Head>
        <title>🌟 Azora Education - Next-Gen Learning Platform</title>
      </Head>
      
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <header className="relative z-10 bg-black/40 backdrop-blur-xl border-b border-white/5">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Azora Education</h1>
                  <p className="text-sm text-purple-300 font-medium">Next-Gen Learning Platform</p>
                </div>
              </div>
              
              {learner ? (
                <div className="flex items-center space-x-8">
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/10">
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Level</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{learner.level}</div>
                    <div className="text-xs text-gray-400">{learner.xp} XP</div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-yellow-500/20">
                    <div className="text-xs text-yellow-300 uppercase tracking-wider">AZR Balance</div>
                    <div className="text-2xl font-bold text-yellow-400">{learner.azrBalance}</div>
                    <div className="text-xs text-yellow-300">Cryptocurrency</div>
                  </div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={createLearner}
                  className="relative group bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/25"
                >
                  <span className="relative z-10">Start Learning Journey 🚀</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              <div className="relative bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-2xl rounded-3xl p-12 border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-3xl"></div>
                <div className="relative z-10">
                  <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    🎓 Welcome to the Future of Learning
                  </h2>
                  <p className="text-2xl text-gray-300 mb-8 leading-relaxed">
                    Where curiosity meets mastery, and knowledge becomes prosperity
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg px-6 py-4 rounded-2xl border border-green-500/20 hover:border-green-400/40 transition-all hover:scale-105">
                      <span className="text-green-400 font-semibold">🤖 AI Tutor Elara</span>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg px-6 py-4 rounded-2xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all hover:scale-105">
                      <span className="text-yellow-400 font-semibold">💰 Learn-to-Earn AZR</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg px-6 py-4 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all hover:scale-105">
                      <span className="text-purple-400 font-semibold">🏆 Gamified Learning</span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-lg px-6 py-4 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all hover:scale-105">
                      <span className="text-blue-400 font-semibold">🌍 Ubuntu Community</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">📚 Premium Course Library</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map(course => (
                    <div key={course.id} className="group bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-blue-200 transition-all">{course.title}</h4>
                        {course.premium && (
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-pulse">
                            ✨ PREMIUM
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-300 mb-4 font-medium">{course.instructor}</p>
                      
                      <div className="flex items-center space-x-6 mb-6">
                        <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full">
                          <span className="text-yellow-400">⭐</span>
                          <span className="ml-2 text-sm font-semibold">{course.rating}</span>
                        </div>
                        <div className="text-sm text-gray-300 bg-white/5 px-3 py-1 rounded-full">{course.students} students</div>
                        <div className="text-sm text-gray-300 bg-white/5 px-3 py-1 rounded-full">{course.duration}</div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        {course.skills.map(skill => (
                          <span key={skill} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/20 hover:border-blue-400/40 transition-all">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">
                          {course.price === 0 ? (
                            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">FREE</span>
                          ) : (
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{course.price} AZR</span>
                          )}
                        </div>
                        
                        {learner && (
                          <div className="space-x-2">
                            {learner.enrolledCourses.includes(course.id) ? (
                              <button
                                onClick={() => simulateProgress(course.id)}
                                className="relative group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
                              >
                                <span className="relative z-10">Continue Learning 📖</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                              </button>
                            ) : (
                              <button
                                onClick={() => enrollInCourse(course.id)}
                                className="relative group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25"
                              >
                                <span className="relative z-10">Enroll Now 🚀</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-black/30 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  🤖 Chat with Elara AI
                </h3>
                
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {elaraChat.map((msg, index) => (
                    <div key={index} className={`p-4 rounded-2xl backdrop-blur-lg border transition-all hover:scale-102 ${
                      msg.role === 'elara' 
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30' 
                        : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30'
                    }`}>
                      <div className="text-sm font-bold mb-2 text-white">
                        {msg.role === 'elara' ? '🤖 Elara AI' : '👤 You'}
                      </div>
                      <div className="text-gray-200">{msg.content}</div>
                    </div>
                  ))}
                </div>
                
                {learner && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && chatWithElara()}
                      placeholder="Ask Elara anything..."
                      className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                    <button
                      onClick={chatWithElara}
                      className="relative group bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25"
                    >
                      <span className="relative z-10">Send</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-black/30 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">🏆 Global Leaderboard</h3>
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/2 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-yellow-500/25' : 
                          index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 shadow-gray-500/25' : 
                          index === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/25' : 'bg-gradient-to-r from-gray-600 to-gray-800'
                        }`}>
                          {user.rank}
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm text-purple-300">Level {user.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user.xp} XP</div>
                        <div className="text-sm text-yellow-400 font-semibold">{user.azrBalance} AZR</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-2xl rounded-3xl p-8 border border-orange-500/20 shadow-2xl shadow-orange-500/10">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-3xl"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">🌍 Ubuntu Philosophy</h3>
                  <p className="text-lg text-gray-200 italic mb-3">
                    "Ngiyakwazi ngoba sikwazi"
                  </p>
                  <p className="text-lg text-gray-200 mb-4">
                    "I can because we can"
                  </p>
                  <p className="text-gray-300">
                    Individual learning multiplied into collective wisdom
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}