import React, { useState } from 'react';

export function Dashboard() {
  const [metrics] = useState({
    totalUsers: 15420,
    activeUsers: 8930,
    revenue: 245000,
    coursesCompleted: 3240
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Enterprise Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-blue-600">{metrics.totalUsers.toLocaleString()}</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-green-600">{metrics.activeUsers.toLocaleString()}</div>
          <div className="text-gray-600">Active Users</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-yellow-600">R{metrics.revenue.toLocaleString()}</div>
          <div className="text-gray-600">Revenue</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-purple-600">{metrics.coursesCompleted.toLocaleString()}</div>
          <div className="text-gray-600">Courses Completed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Growth</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart placeholder - User growth over time
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Export User Data
            </button>
            <button className="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50">
              Generate Report
            </button>
            <button className="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50">
              Manage Users
            </button>
            <button className="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50">
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}