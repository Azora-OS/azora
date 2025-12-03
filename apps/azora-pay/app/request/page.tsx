'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';
import { useRouter } from 'next/navigation';

export default function RequestPage() {
    const router = useRouter();
    const ubuntuServices = useUbuntuServices();
    const [formData, setFormData] = useState({
        payer: '',
        amount: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            await ubuntuServices.events.publishEvent('payment.requested', {
                payer: formData.payer,
                amount: parseFloat(formData.amount),
                note: formData.note,
                timestamp: new Date().toISOString()
            }, 'azora-pay');

            alert(`Payment request sent to ${formData.payer}`);
            router.push('/');
        } catch (error) {
            console.error('Request failed:', error);
            alert('Request failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2"><GradientText>Request Payment</GradientText></h1>
                    <p className="text-muted-foreground">Ask for payment securely from anyone</p>
                </motion.div>

                <AccessibleCard className="glass-card p-8">
                    <form onSubmit={handleRequest} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Request From</label>
                            <input
                                type="text"
                                placeholder="Username, Email, or Wallet Address"
                                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.payer}
                                onChange={e => setFormData({ ...formData, payer: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Amount (AZR)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none pl-12"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                                <span className="absolute left-4 top-3.5 text-muted-foreground font-bold">AZR</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Note (Optional)</label>
                            <textarea
                                placeholder="What is this for?"
                                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                                rows={3}
                                value={formData.note}
                                onChange={e => setFormData({ ...formData, note: e.target.value })}
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" variant="outline" className="w-full py-6 text-lg" disabled={loading}>
                                {loading ? 'Processing...' : '📥 Send Request'}
                            </Button>
                        </div>
                    </form>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
