'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function SkillsPage() {
    const skills = [
        { name: 'React', level: 95, category: 'Frontend', verified: true },
        { name: 'Node.js', level: 90, category: 'Backend', verified: true },
        { name: 'Blockchain', level: 85, category: 'Web3', verified: true },
        { name: 'TypeScript', level: 92, category: 'Languages', verified: true },
        { name: 'Smart Contracts', level: 80, category: 'Web3', verified: false },
        { name: 'Web3.js', level: 88, category: 'Web3', verified: true }
    ];

    const categories = ['All', 'Frontend', 'Backend', 'Web3', 'Languages'];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Take Assessment</Button>
                    <Button size="sm">Add Skill</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2"><GradientText>Skills</GradientText></h1>
                    <p className="text-muted-foreground">Showcase your expertise with verified skills</p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{skills.length}</div>
                        <div className="text-sm text-muted-foreground">Total Skills</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">{skills.filter(s => s.verified).length}</div>
                        <div className="text-sm text-muted-foreground">Verified</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">{Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length)}</div>
                        <div className="text-sm text-muted-foreground">Avg Level</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">12</div>
                        <div className="text-sm text-muted-foreground">Endorsements</div>
                    </AccessibleCard>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {categories.map(cat => (
                        <Button key={cat} variant="outline" size="sm">{cat}</Button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map((skill, index) => (
                        <motion.div key={skill.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg">{skill.name}</h3>
                                        <p className="text-sm text-muted-foreground">{skill.category}</p>
                                    </div>
                                    {skill.verified && <span className="text-green-500 text-sm">✓ Verified</span>}
                                </div>
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Proficiency</span>
                                        <span className="font-semibold">{skill.level}%</span>
                                    </div>
                                    <div className="h-2 bg-card rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary to-primary/50" style={{ width: `${skill.level}%` }} />
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Skills are verified through community endorsements and assessments, ensuring authentic expertise.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
