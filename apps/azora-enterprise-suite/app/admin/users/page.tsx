'use client';

import React from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';

export default function AdminUsersPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />

            <main className="ml-64 p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Add User
                    </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-blue-200">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                            <div>
                                                <div className="font-medium">User {i}</div>
                                                <div className="text-xs text-blue-300">user{i}@azora.edu</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">Student</td>
                                    <td className="p-4">
                                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                                            Active
                                        </span>
                                    </td>
                                    <td className="p-4 text-blue-200">2025-11-{10 + i}</td>
                                    <td className="p-4">
                                        <button className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                                        <button className="text-red-400 hover:text-red-300">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
