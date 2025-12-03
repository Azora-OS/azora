'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

interface JobMetrics {
    jobs: {
        total: number;
        active: number;
        companiesHiring: number;
    };
    applications: {
        total: number;
        acceptanceRate: number;
    };
}

export default function JobsPage() {
    const [filter, setFilter] = useState<'all' | 'remote' | 'onsite' | 'hybrid'>('all');
    const [category, setCategory] = useState<string>('all');
    const [metrics, setMetrics] = useState<JobMetrics | null>(null);
    const [metricsLoading, setMetricsLoading] = useState<boolean>(true);

    const marketplaceApiBase = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || 'http://localhost:4004';

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setMetricsLoading(true);
                const response = await fetch(`${marketplaceApiBase}/api/job-metrics`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = await response.json();
                setMetrics({
                    jobs: {
                        total: data.jobs?.total ?? 0,
                        active: data.jobs?.active ?? 0,
                        companiesHiring: data.jobs?.companiesHiring ?? 0,
                    },
                    applications: {
                        total: data.applications?.total ?? 0,
                        acceptanceRate: data.applications?.acceptanceRate ?? 0,
                    },
                });
            } catch (error) {
                setMetrics(null);
            } finally {
                setMetricsLoading(false);
            }
        };

        fetchMetrics();
    }, [marketplaceApiBase]);

    const renderNumericMetric = (value: number | undefined) => {
        if (metricsLoading) return '—';
        if (!metrics) return 'N/A';
        return value ?? 0;
    };

    const renderRateMetric = (value: number | undefined) => {
        if (metricsLoading) return '—';
        if (!metrics) return 'N/A';
        const rate = Math.round((value ?? 0) * 100);
        return `${rate}%`;
    };

    const jobs = [
        {
            id: 1,
            title: 'Senior Full-Stack Developer',
            company: 'Azora BuildSpaces',
            location: 'Remote',
            type: 'Full-time',
            salary: '80,000 - 120,000 AZR/year',
            category: 'Engineering',
            posted: '2 days ago',
            applicants: 24,
            description: 'Build the future of decentralized education platforms',
            skills: ['React', 'Node.js', 'Blockchain', 'TypeScript']
        },
        {
            id: 2,
            title: 'AI/ML Engineer',
            company: 'Azora Oracle',
            location: 'Hybrid - Johannesburg',
            type: 'Full-time',
            salary: '90,000 - 140,000 AZR/year',
            category: 'AI/ML',
            posted: '1 week ago',
            applicants: 45,
            description: 'Develop constitutional AI systems for education',
            skills: ['Python', 'TensorFlow', 'NLP', 'Ethics']
        },
        {
            id: 3,
            title: 'UX/UI Designer',
            company: 'Azora Design Studio',
            location: 'Remote',
            type: 'Contract',
            salary: '60,000 - 90,000 AZR/year',
            category: 'Design',
            posted: '3 days ago',
            applicants: 18,
            description: 'Create beautiful, accessible learning experiences',
            skills: ['Figma', 'Design Systems', 'Accessibility', 'User Research']
        },
        {
            id: 4,
            title: 'Blockchain Developer',
            company: 'Azora Mint',
            location: 'Remote',
            type: 'Full-time',
            salary: '100,000 - 150,000 AZR/year',
            category: 'Blockchain',
            posted: '1 day ago',
            applicants: 32,
            description: 'Build secure, scalable token economics systems',
            skills: ['Solidity', 'Web3.js', 'Smart Contracts', 'Security']
        }
    ];

    const categories = ['all', 'Engineering', 'AI/ML', 'Design', 'Blockchain', 'Education', 'Business'];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Saved Jobs</Button>
                    <Button size="sm" href="/jobs/create">Post a Job</Button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Job Marketplace</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Ubuntu-based professional opportunities</p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">
                            {renderNumericMetric(metrics?.jobs.active)}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Jobs</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">
                            {renderNumericMetric(metrics?.jobs.companiesHiring)}
                        </div>
                        <div className="text-sm text-muted-foreground">Companies Hiring</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">
                            {renderNumericMetric(metrics?.applications.total)}
                        </div>
                        <div className="text-sm text-muted-foreground">Applications</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">
                            {renderRateMetric(metrics?.applications.acceptanceRate)}
                        </div>
                        <div className="text-sm text-muted-foreground">Match Rate</div>
                    </AccessibleCard>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'remote', 'onsite', 'hybrid'].map((f) => (
                            <Button
                                key={f}
                                variant={filter === f ? 'default' : 'outline'}
                                onClick={() => setFilter(f as any)}
                                size="sm"
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Button>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={category === cat ? 'default' : 'outline'}
                                onClick={() => setCategory(cat)}
                                size="sm"
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {jobs.map((job, index) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <AccessibleCard className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl mb-1">{job.title}</h3>
                                            <p className="text-muted-foreground mb-2">{job.company}</p>
                                            <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                <span>📍 {job.location}</span>
                                                <span>•</span>
                                                <span>💼 {job.type}</span>
                                                <span>•</span>
                                                <span>💰 {job.salary}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {job.skills.map((skill) => (
                                                    <span key={skill} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Posted {job.posted}</span>
                                                <span>•</span>
                                                <span>{job.applicants} applicants</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="flex-1">Apply Now</Button>
                                        <Button variant="outline">Save</Button>
                                    </div>
                                </AccessibleCard>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">AI Job Matching</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Our AI analyzes your skills and experience to find the perfect matches.
                            </p>
                            <Button className="w-full">Get Matched</Button>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground italic mb-2">
                                "Ngiyakwazi ngoba sikwazi"
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Fair matching, secure escrow, and community-driven professional growth.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
