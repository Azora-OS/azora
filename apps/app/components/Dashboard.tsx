'use client';
import { useEffect, useState } from 'react';

export function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-gray-800">Azora OS</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.name || user.email}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome to your Azora OS workspace</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-lg">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Education</h3>
            </div>
            <p className="text-gray-600 mb-4">Access courses and learning materials</p>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
              View Courses
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold text-lg">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Mint</h3>
            </div>
            <p className="text-gray-600 mb-4">Financial services and payments</p>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors">
              Open Wallet
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold text-lg">🛒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Forge</h3>
            </div>
            <p className="text-gray-600 mb-4">Marketplace and services</p>
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition-colors">
              Browse Market
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">📚</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Started new course</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm">💰</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Wallet transaction completed</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}