'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function ReviewPage() {
    const reviews = [
        { id: 1, title: 'Scalable Consensus Mechanisms', author: 'Dr. A. Smith', deadline: '2 days left', status: 'pending' },
        { id: 2, title: 'AI Ethics in Education', author: 'Prof. B. Jones', deadline: '5 days left', status: 'pending' },
        { id: 3, title: 'Zero-Knowledge Proofs for Privacy', author: 'C. Lee', deadline: 'Completed', status: 'submitted' }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button size="sm">My Reviews</Button>
                    <Button variant="outline" size="sm">Volunteer</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Peer Review</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Validate and improve community research</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">12</div>
                        <div className="text-sm text-muted-foreground">Reviews Completed</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">4.8</div>
                        <div className="text-sm text-muted-foreground">Reviewer Rating</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">150</div>
                        <div className="text-sm text-muted-foreground">AZR Earned</div>
                    </AccessibleCard>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Assigned Reviews</h2>
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{review.title}</h3>
                                        <p className="text-sm text-muted-foreground">by {review.author}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-semibold ${review.status === 'pending' ? 'text-orange-500' : 'text-green-500'}`}>
                                            {review.deadline}
                                        </div>
                                        <Button size="sm" className="mt-2" variant={review.status === 'pending' ? 'default' : 'outline'}>
                                            {review.status === 'pending' ? 'Start Review' : 'View Report'}
                                        </Button>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Peer review is a communal act of quality assurance. By constructively critiquing each other's work, we elevate the standard of knowledge for everyone.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
