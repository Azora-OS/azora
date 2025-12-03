'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function MethodsPage() {
    const methods = [
        { id: 1, type: 'Wallet', name: 'Azora Mint Wallet', number: '...8f3c', default: true, icon: '🪙' },
        { id: 2, type: 'Card', name: 'Visa ending in 4242', number: '**** 4242', default: false, icon: '💳' },
        { id: 3, type: 'Bank', name: 'Citadel Bank', number: '**** 9876', default: false, icon: '🏦' },
    ];

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2"><GradientText>Payment Methods</GradientText></h1>
                    <p className="text-muted-foreground">Manage your linked accounts and cards</p>
                </motion.div>

                <div className="grid gap-6">
                    {methods.map((method, index) => (
                        <motion.div
                            key={method.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">{method.icon}</div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{method.name}</h3>
                                            {method.default && (
                                                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">Default</span>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground">{method.number}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Edit</Button>
                                    {!method.default && <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-500">Remove</Button>}
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Button variant="outline" className="w-full py-8 border-dashed border-2">
                            + Add New Payment Method
                        </Button>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
