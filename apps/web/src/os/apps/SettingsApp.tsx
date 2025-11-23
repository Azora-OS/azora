import React, { useState } from 'react';
import {
    User, Lock, Bell, Monitor, Globe, Shield,
    CreditCard, Moon, Sun, Smartphone, LogOut, Mail,
    Key, Trash2, Download, Eye, EyeOff, Check
} from 'lucide-react';
import { useProfile } from '@azora/api-client/react-query-hooks';

export const SettingsApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const { data: profileData, isLoading: isProfileLoading } = useProfile();
    const [showPassword, setShowPassword] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        marketing: false
    });

    const user = profileData?.data || {
        firstName: 'Azora',
        lastName: 'Admin',
        email: 'admin@azora.world',
        bio: 'Administrator of the Azora OS ecosystem.'
    };

    return (
        <div className="flex h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
                <div className="p-6">
                    <h2 className="font-bold text-xl mb-6">Settings</h2>
                    <nav className="space-y-1">
                        {[
                            { id: 'profile', icon: User, label: 'Profile' },
                            { id: 'account', icon: Lock, label: 'Account Security' },
                            { id: 'notifications', icon: Bell, label: 'Notifications' },
                            { id: 'appearance', icon: Monitor, label: 'Appearance' },
                            { id: 'billing', icon: CreditCard, label: 'Billing & Plans' },
                            { id: 'language', icon: Globe, label: 'Language & Region' },
                            { id: 'privacy', icon: Shield, label: 'Privacy & Data' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-purple-500 text-white shadow-lg'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={18} />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-3xl mx-auto p-12">
                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Public Profile</h2>
                                <p className="text-white/40 text-sm">Manage how you appear to others on Azora OS.</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 border-4 border-slate-900 shadow-xl flex items-center justify-center text-3xl font-bold">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                                <div>
                                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                                        Change Avatar
                                    </button>
                                    <p className="text-xs text-white/40 mt-2">JPG, GIF or PNG. Max 1MB.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">First Name</label>
                                        <input
                                            type="text"
                                            defaultValue={isProfileLoading ? '...' : user.firstName}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Last Name</label>
                                        <input
                                            type="text"
                                            defaultValue={isProfileLoading ? '...' : user.lastName}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/60">Bio</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50 h-32 resize-none"
                                        defaultValue={isProfileLoading ? '...' : user.bio}
                                    />
                                </div>
                                <button className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Account Security</h2>
                                <p className="text-white/40 text-sm">Manage your password and security settings.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="text-purple-400" size={20} />
                                            <div>
                                                <p className="font-medium">Email Address</p>
                                                <p className="text-sm text-white/40">{user.email}</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                                            Change
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Key className="text-purple-400" size={20} />
                                            <div>
                                                <p className="font-medium">Password</p>
                                                <p className="text-sm text-white/40">Last changed 30 days ago</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                                            Update
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Shield className="text-green-400" size={20} />
                                            <div>
                                                <p className="font-medium">Two-Factor Authentication</p>
                                                <p className="text-sm text-white/40">Add an extra layer of security</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                                            Enabled
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Trash2 className="text-red-400" size={20} />
                                        <p className="font-medium text-red-400">Delete Account</p>
                                    </div>
                                    <p className="text-sm text-white/60 mb-4">Permanently delete your account and all associated data.</p>
                                    <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Notifications</h2>
                                <p className="text-white/40 text-sm">Manage how you receive notifications.</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                                    { key: 'push', label: 'Push Notifications', desc: 'Browser and mobile notifications' },
                                    { key: 'sms', label: 'SMS Notifications', desc: 'Text message alerts' },
                                    { key: 'marketing', label: 'Marketing Emails', desc: 'Product updates and offers' }
                                ].map(item => (
                                    <div key={item.key} className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium mb-1">{item.label}</p>
                                                <p className="text-sm text-white/40">{item.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-purple-500' : 'bg-white/20'
                                                    }`}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : ''
                                                    }`} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Appearance</h2>
                                <p className="text-white/40 text-sm">Customize the look and feel of your workspace.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg mb-4">Theme</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'light', label: 'Light', icon: Sun },
                                        { id: 'dark', label: 'Dark', icon: Moon },
                                        { id: 'system', label: 'System', icon: Smartphone },
                                    ].map((theme) => (
                                        <button key={theme.id} className={`p-6 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme.id === 'dark'
                                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                            }`}>
                                            <theme.icon size={32} />
                                            <span className="text-sm font-medium">{theme.label}</span>
                                            {theme.id === 'dark' && <Check size={16} className="absolute top-2 right-2" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h3 className="font-bold text-lg">Accent Color</h3>
                                <div className="flex gap-3">
                                    {[
                                        { color: 'bg-blue-500', active: false },
                                        { color: 'bg-purple-500', active: true },
                                        { color: 'bg-emerald-500', active: false },
                                        { color: 'bg-amber-500', active: false },
                                        { color: 'bg-pink-500', active: false },
                                        { color: 'bg-red-500', active: false }
                                    ].map((item, i) => (
                                        <button key={i} className={`w-10 h-10 rounded-full ${item.color} ${item.active ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''} hover:scale-110 transition-transform`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Billing & Plans</h2>
                                <p className="text-white/40 text-sm">Manage your subscription and payment methods.</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-white/60 mb-1">Current Plan</p>
                                        <h3 className="text-2xl font-bold">Pro Plan</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold">$29</p>
                                        <p className="text-sm text-white/60">/month</p>
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors">
                                    Upgrade to Enterprise
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Payment Methods</h3>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="text-purple-400" size={24} />
                                            <div>
                                                <p className="font-medium">•••• •••• •••• 4242</p>
                                                <p className="text-sm text-white/40">Expires 12/25</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Billing History</h3>
                                {[
                                    { date: 'Nov 1, 2025', amount: '$29.00', status: 'Paid' },
                                    { date: 'Oct 1, 2025', amount: '$29.00', status: 'Paid' },
                                    { date: 'Sep 1, 2025', amount: '$29.00', status: 'Paid' }
                                ].map((invoice, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{invoice.date}</p>
                                            <p className="text-sm text-white/40">{invoice.amount}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                                                {invoice.status}
                                            </span>
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'language' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Language & Region</h2>
                                <p className="text-white/40 text-sm">Set your preferred language and regional settings.</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-white/60 mb-2 block">Language</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50">
                                        <option>English (US)</option>
                                        <option>English (UK)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                        <option>Zulu</option>
                                        <option>Xhosa</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-white/60 mb-2 block">Timezone</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50">
                                        <option>Africa/Johannesburg (GMT+2)</option>
                                        <option>America/New_York (GMT-5)</option>
                                        <option>Europe/London (GMT+0)</option>
                                        <option>Asia/Tokyo (GMT+9)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-white/60 mb-2 block">Date Format</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50">
                                        <option>MM/DD/YYYY</option>
                                        <option>DD/MM/YYYY</option>
                                        <option>YYYY-MM-DD</option>
                                    </select>
                                </div>

                                <button className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Privacy & Data</h2>
                                <p className="text-white/40 text-sm">Control your data and privacy settings.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="font-medium mb-1">Profile Visibility</p>
                                            <p className="text-sm text-white/40">Who can see your profile</p>
                                        </div>
                                        <select className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none">
                                            <option>Everyone</option>
                                            <option>Connections Only</option>
                                            <option>Private</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="font-medium mb-1">Activity Status</p>
                                            <p className="text-sm text-white/40">Show when you're online</p>
                                        </div>
                                        <button className="relative w-12 h-6 bg-purple-500 rounded-full">
                                            <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="font-medium mb-1">Data Collection</p>
                                            <p className="text-sm text-white/40">Allow analytics and usage data</p>
                                        </div>
                                        <button className="relative w-12 h-6 bg-purple-500 rounded-full">
                                            <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Download className="text-blue-400" size={20} />
                                        <p className="font-medium">Download Your Data</p>
                                    </div>
                                    <p className="text-sm text-white/60 mb-4">Request a copy of all your data stored on Azora OS.</p>
                                    <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors">
                                        Request Data Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
