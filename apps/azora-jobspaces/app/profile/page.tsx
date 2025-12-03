'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function ProfilePage() {
    const profile = {
        name: 'Alex Johnson',
        title: 'Full-Stack Developer & Blockchain Enthusiast',
        location: 'Johannesburg, South Africa',
        hourlyRate: '150 AZR/hour',
        availability: 'Available for hire',
        skills: ['React', 'Node.js', 'Blockchain', 'TypeScript', 'Smart Contracts', 'Web3'],
        experience: [
            { company: 'Azora BuildSpaces', role: 'Senior Developer', period: '2023 - Present' },
            { company: 'Tech Startup', role: 'Full-Stack Developer', period: '2021 - 2023' }
        ],
        portfolio: [
            { title: 'DeFi Platform', description: 'Built decentralized finance application', image: '💼' },
            { title: 'NFT Marketplace', description: 'Created NFT trading platform', image: '🎨' }
        ],
        reviews: { rating: 4.9, count: 47 }
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit Profile</Button>
                    <Button size="sm">Share Profile</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Professional Profile</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Showcase your skills and experience</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6 text-center">
                            <div className="text-8xl mb-4">👤</div>
                            <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                            <p className="text-muted-foreground mb-2">{profile.title}</p>
                            <p className="text-sm text-muted-foreground mb-4">📍 {profile.location}</p>
                            <div className="flex items-center justify-center gap-1 mb-4">
                                <span className="text-yellow-500">⭐</span>
                                <span className="font-bold">{profile.reviews.rating}</span>
                                <span className="text-sm text-muted-foreground">({profile.reviews.count} reviews)</span>
                            </div>
                            <div className="space-y-2">
                                <Button className="w-full">Hire Me</Button>
                                <Button variant="outline" className="w-full">Send Message</Button>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Rate & Availability</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hourly Rate:</span>
                                    <span className="font-semibold text-primary">{profile.hourlyRate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className="font-semibold text-green-500">{profile.availability}</span>
                                </div>
                            </div>
                        </AccessibleCard>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-2xl font-bold mb-4">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill) => (
                                    <span key={skill} className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-2xl font-bold mb-4">Experience</h2>
                            <div className="space-y-4">
                                {profile.experience.map((exp, index) => (
                                    <div key={index} className="border-l-2 border-primary pl-4">
                                        <h3 className="font-bold">{exp.role}</h3>
                                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                                        <p className="text-xs text-muted-foreground">{exp.period}</p>
                                    </div>
                                ))}
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {profile.portfolio.map((item, index) => (
                                    <div key={index} className="p-4 rounded-lg bg-card border border-border">
                                        <div className="text-4xl mb-2">{item.image}</div>
                                        <h3 className="font-bold mb-1">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
