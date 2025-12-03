'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function GovernancePage() {
    const [selectedProposal, setSelectedProposal] = useState<any>(null);
    const ubuntuServices = useUbuntuServices();

    const proposals = [
        {
            id: 1,
            title: 'Increase CitadelFund Allocation to 15%',
            description: 'Proposal to increase the CitadelFund allocation from 10% to 15% to support more students',
            status: 'active',
            votesFor: 12450,
            votesAgainst: 3200,
            quorum: 15000,
            endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            proposer: 'Community DAO',
            category: 'Economics'
        },
        {
            id: 2,
            title: 'Add New AI Tutor - NIA for Data Science',
            description: 'Proposal to integrate NIA AI agent for specialized data science tutoring',
            status: 'active',
            votesFor: 18900,
            votesAgainst: 1100,
            quorum: 15000,
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            proposer: 'Azora BuildSpaces',
            category: 'Features'
        },
        {
            id: 3,
            title: 'Reduce Transaction Fees by 50%',
            description: 'Lower transaction fees to make the platform more accessible',
            status: 'passed',
            votesFor: 25000,
            votesAgainst: 2000,
            quorum: 15000,
            endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            proposer: 'Sarah M.',
            category: 'Economics'
        }
    ];

    const handleVote = async (proposalId: number, vote: 'for' | 'against') => {
        await ubuntuServices.events.publishEvent('governance.voted', {
            userId: 'demo-student-001',
            proposalId,
            vote,
            timestamp: new Date().toISOString()
        }, 'azora-mint');

        alert(`Vote recorded: ${vote.toUpperCase()}! (Feature coming soon)`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-500/10 text-blue-500';
            case 'passed': return 'bg-green-500/10 text-green-500';
            case 'rejected': return 'bg-red-500/10 text-red-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">My Votes</Button>
                    <Button size="sm">Create Proposal</Button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Governance</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Community-driven decision making</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{proposals.filter(p => p.status === 'active').length}</div>
                        <div className="text-sm text-muted-foreground">Active Proposals</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">{proposals.filter(p => p.status === 'passed').length}</div>
                        <div className="text-sm text-muted-foreground">Passed</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">1,890</div>
                        <div className="text-sm text-muted-foreground">Your Voting Power</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">12</div>
                        <div className="text-sm text-muted-foreground">Your Votes Cast</div>
                    </AccessibleCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold">Active Proposals</h2>
                        {proposals.map((proposal, index) => (
                            <motion.div
                                key={proposal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <AccessibleCard className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedProposal(proposal)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-lg">{proposal.title}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(proposal.status)}`}>
                                                    {proposal.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Proposed by {proposal.proposer}</span>
                                                <span>•</span>
                                                <span>{proposal.category}</span>
                                                <span>•</span>
                                                <span>Ends {proposal.endDate.toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Voting Progress */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-500">For: {proposal.votesFor.toLocaleString()}</span>
                                            <span className="text-red-500">Against: {proposal.votesAgainst.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-card rounded-full overflow-hidden flex">
                                            <div
                                                className="bg-green-500"
                                                style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                                            />
                                            <div
                                                className="bg-red-500"
                                                style={{ width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Quorum: {((proposal.votesFor + proposal.votesAgainst) / proposal.quorum * 100).toFixed(1)}% ({proposal.votesFor + proposal.votesAgainst} / {proposal.quorum})
                                        </div>
                                    </div>

                                    {proposal.status === 'active' && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-green-500 text-green-500 hover:bg-green-500/10"
                                                onClick={(e) => { e.stopPropagation(); handleVote(proposal.id, 'for'); }}
                                            >
                                                ✓ Vote For
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                                                onClick={(e) => { e.stopPropagation(); handleVote(proposal.id, 'against'); }}
                                            >
                                                ✗ Vote Against
                                            </Button>
                                        </div>
                                    )}
                                </AccessibleCard>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Your Voting Power</h3>
                            <div className="text-center py-4">
                                <div className="text-5xl font-bold text-primary mb-2">1,890</div>
                                <p className="text-sm text-muted-foreground">AZR tokens = votes</p>
                            </div>
                            <div className="space-y-2 text-sm mt-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Wallet Balance:</span>
                                    <span className="font-semibold">1,890 AZR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Staked:</span>
                                    <span className="font-semibold">0 AZR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delegated:</span>
                                    <span className="font-semibold">0 AZR</span>
                                </div>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">How Governance Works</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>1️⃣ Anyone can create proposals</li>
                                <li>2️⃣ Community discusses and debates</li>
                                <li>3️⃣ Token holders vote (1 AZR = 1 vote)</li>
                                <li>4️⃣ Proposals need 66% approval</li>
                                <li>5️⃣ Passed proposals are implemented</li>
                            </ul>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground italic mb-2">
                                "Ngiyakwazi ngoba sikwazi"
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Governance decisions benefit the entire community. Your vote shapes our collective future.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
