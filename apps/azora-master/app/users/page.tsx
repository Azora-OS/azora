'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Shield, Mail } from 'lucide-react';

export default function UsersPage() {
    const router = useRouter();

    const users = [
        { id: 1, name: 'John Smith', email: 'john@azora.com', role: 'Admin', status: 'active', lastLogin: '2 hours ago' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@azora.com', role: 'Educator', status: 'active', lastLogin: '5 min ago' },
        { id: 3, name: 'Mike Davis', email: 'mike@azora.com', role: 'Student', status: 'inactive', lastLogin: '2 days ago' },
        { id: 4, name: 'Emily Lee', email: 'emily@azora.com', role: 'Researcher', status: 'active', lastLogin: '1 hour ago' },
    ];

    return (
        <AppLayout appName="Azora Master" userName="System Admin">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>User Management</GradientText>
                    </h1>
                    <p className="text-gray-400">Manage system users and permissions</p>
                </motion.div>

                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </div>

                <AccessibleCard className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-gray-400 font-bold text-sm">User</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-bold text-sm">Role</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-bold text-sm">Status</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-bold text-sm">Last Login</th>
                                    <th className="text-right py-3 px-4 text-gray-400 font-bold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, i) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + (i * 0.05) }}
                                        className="border-b border-border/50 hover:bg-card/30 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div>
                                                <div className="font-bold">{user.name}</div>
                                                <div className="text-sm text-gray-400 flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-400 text-sm">{user.lastLogin}</td>
                                        <td className="py-4 px-4 text-right">
                                            <Button variant="outline" size="sm">
                                                <Shield className="h-4 w-4 mr-2" />
                                                Manage
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
