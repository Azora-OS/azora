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
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Organization Settings</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Configure your enterprise environment</p>
                </motion.div>

                <div className="space-y-6">
                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">General Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Organization Name</label>
                                <input type="text" defaultValue="Acme Corp" className="w-full px-4 py-2 rounded-lg bg-card border border-border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Contact Email</label>
                                <input type="email" defaultValue="admin@acme.com" className="w-full px-4 py-2 rounded-lg bg-card border border-border" />
                            </div>
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Security & Access</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                                    <p className="text-sm text-muted-foreground">Require 2FA for all members</p>
                                </div>
                                <input type="checkbox" defaultChecked className="toggle" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">SSO Integration</h3>
                                    <p className="text-sm text-muted-foreground">Enable Single Sign-On</p>
                                </div>
                                <Button variant="outline" size="sm">Configure</Button>
                            </div>
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Notifications</h2>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked /> Email alerts for critical issues
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked /> Weekly performance reports
                            </label>
                        </div>
                    </AccessibleCard>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Changes</Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
