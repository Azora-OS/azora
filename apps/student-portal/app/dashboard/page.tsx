'use client';
import { useEffect, useState } from 'react';
import { lmsApi, mintApi } from '../../../packages/lib/api-client';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    // Fetch wallet
    mintApi.getWallet(userData.id).then(res => setWallet(res.data));

    // Fetch courses
    lmsApi.getCourses(userData.id).then(res => setCourses(res.data || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <div className="flex gap-4">
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded">
              💰 {wallet?.balance || 0} AZR
            </span>
            <a href="/profile" className="text-blue-600 hover:underline">Profile</a>
            <button onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }} className="text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Total Earned</div>
            <div className="text-3xl font-bold">{wallet?.balance || 0} AZR</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Courses</div>
            <div className="text-3xl font-bold">{courses.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Completed</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Certificates</div>
            <div className="text-3xl font-bold">0</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <a href="/courses" className="bg-blue-600 text-white p-8 rounded-lg text-center hover:bg-blue-700">
            <div className="text-4xl mb-4">📚</div>
            <div className="text-xl font-bold">Browse Courses</div>
          </a>
          <a href="/wallet" className="bg-green-600 text-white p-8 rounded-lg text-center hover:bg-green-700">
            <div className="text-4xl mb-4">💰</div>
            <div className="text-xl font-bold">My Wallet</div>
          </a>
          <a href="/jobs" className="bg-purple-600 text-white p-8 rounded-lg text-center hover:bg-purple-700">
            <div className="text-4xl mb-4">💼</div>
            <div className="text-xl font-bold">Find Jobs</div>
          </a>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="text-gray-600">No activity yet. Start your first course!</div>
        </div>
      </main>
    </div>
  );
}