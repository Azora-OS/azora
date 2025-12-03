'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function PollsPage() {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const polls = [
        {
            id: 1,
            question: 'Which integration technique should we review next?',
            options: [
                { id: 1, text: 'Integration by parts', votes: 12 },
                { id: 2, text: 'Substitution method', votes: 8 },
                { id: 3, text: 'Partial fractions', votes: 15 },
                { id: 4, text: 'Trigonometric substitution', votes: 5 }
            ],
            status: 'active',
            totalVotes: 40
        },
        {
            id: 2,
            question: 'How well do you understand today\'s topic?',
            options: [
                { id: 1, text: 'Very well', votes: 18 },
                { id: 2, text: 'Somewhat', votes: 12 },
                { id: 3, text: 'Need more practice', votes: 8 },
                { id: 4, text: 'Confused', votes: 2 }
            ],
            status: 'closed',
            totalVotes: 40
        }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Create Poll</Button>
                    <Button size="sm">View Results</Button>
                </div>
            }
        >
            <div className="max-w-4xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Live Polls</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Interactive classroom engagement</p>
                </motion.div>

                <div className="space-y-6">
                    {polls.map((poll, index) => (
                        <motion.div
                            key={poll.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-bold text-lg">{poll.question}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs ${poll.status === 'active'
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-gray-500/10 text-gray-500'
                                        }`}>
                                        {poll.status}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {poll.options.map((option) => {
                                        const percentage = (option.votes / poll.totalVotes) * 100;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => poll.status === 'active' && setSelectedOption(option.id)}
                                                disabled={poll.status === 'closed'}
                                                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedOption === option.id && poll.status === 'active'
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border bg-card hover:border-primary/50'
                                                    } ${poll.status === 'closed' ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold">{option.text}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {option.votes} votes ({percentage.toFixed(0)}%)
                                                    </span>
                                                </div>
                                                {poll.status === 'closed' && (
                                                    <div className="h-2 bg-card rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {poll.status === 'active' && (
                                    <Button className="w-full">Submit Vote</Button>
                                )}

                                <p className="text-sm text-muted-foreground mt-4">
                                    Total votes: {poll.totalVotes}
                                </p>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Live polls ensure every voice is heard, making learning truly collaborative and responsive to community needs.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
