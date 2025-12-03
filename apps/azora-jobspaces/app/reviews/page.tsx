'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function ReviewsPage() {
    const reviews = [
        { id: 1, from: 'Sarah M.', rating: 5, comment: 'Excellent work! Very professional and delivered on time.', project: 'DeFi Platform', date: '2024-11-15' },
        { id: 2, from: 'Azora BuildSpaces', rating: 5, comment: 'Outstanding developer. Highly recommend!', project: 'NFT Marketplace', date: '2024-11-01' },
        { id: 3, from: 'James K.', rating: 4, comment: 'Great communication and quality work.', project: 'Smart Contract Audit', date: '2024-10-20' }
    ];

    const stats = { average: 4.9, total: 47, fiveStar: 42, fourStar: 4, threeStar: 1, twoStar: 0, oneStar: 0 };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2"><GradientText>Reviews & Ratings</GradientText></h1>
                    <p className="text-muted-foreground">Client feedback and testimonials</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-center mb-6">
                            <div className="text-6xl font-bold text-primary mb-2">{stats.average}</div>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-500 text-2xl">⭐</span>)}
                            </div>
                            <p className="text-sm text-muted-foreground">Based on {stats.total} reviews</p>
                        </div>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = stats[`${['oneStar', 'twoStar', 'threeStar', 'fourStar', 'fiveStar'][rating - 1]}` as keyof typeof stats] as number;
                                return (
                                    <div key={rating} className="flex items-center gap-2">
                                        <span className="text-sm w-8">{rating}⭐</span>
                                        <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500" style={{ width: `${(count / stats.total) * 100}%` }} />
                                        </div>
                                        <span className="text-sm w-8 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </AccessibleCard>

                    <div className="lg:col-span-2 space-y-4">
                        {reviews.map((review, index) => (
                            <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                                <AccessibleCard className="glass-card p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold">{review.from}</h3>
                                            <p className="text-sm text-muted-foreground">{review.project}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(review.rating)].map((_, i) => <span key={i} className="text-yellow-500">⭐</span>)}
                                        </div>
                                    </div>
                                    <p className="text-sm mb-2">{review.comment}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                                </AccessibleCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
