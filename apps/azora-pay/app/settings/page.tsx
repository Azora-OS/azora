'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function SettingsPage() {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2"><GradientText>Settings</GradientText></h1>
                    <p className="text-muted-foreground">Configure your Azora Pay preferences</p>
                </motion.div>

                <div className="space-y-6">
                    <AccessibleCard className="glass-card p-6">
                        <h3 className="text-xl font-bold mb-4">General</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Default Currency</p>
                                    <p className="text-sm text-muted-foreground">Currency used for display</p>
                                </div>
                                <select className="bg-card border border-border rounded px-3 py-1">
                                    <option>AZR (Azora Token)</option>
                                    <option>USD</option>
                                    <option>EUR</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Language</p>
                                    <p className="text-sm text-muted-foreground">Interface language</p>
                                </div>
                                <select className="bg-card border border-border rounded px-3 py-1">
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h3 className="text-xl font-bold mb-4">Notifications</h3>
                        <div className="space-y-4">
                            {['Payment Received', 'Payment Sent', 'Payment Requests', 'Security Alerts'].map(setting => (
                                <div key={setting} className="flex items-center justify-between">
                                    <p className="font-medium">{setting}</p>
                                    <input type="checkbox" defaultChecked className="toggle" />
                                </div>
                            ))}
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h3 className="text-xl font-bold mb-4">Security</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Two-Factor Authentication</p>
                                    <p className="text-sm text-muted-foreground">Extra layer of security</p>
                                </div>
                                <Button variant="outline" size="sm">Enable</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Change PIN</p>
                                    <p className="text-sm text-muted-foreground">Update your transaction PIN</p>
                                </div>
                                <Button variant="outline" size="sm">Update</Button>
                            </div>
                        </div>
                    </AccessibleCard>

                    <div className="flex justify-end gap-4">
                        <Button variant="ghost">Cancel</Button>
                        <Button>Save Changes</Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
