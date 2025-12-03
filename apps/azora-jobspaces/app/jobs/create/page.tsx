'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function CreateJobPage() {
    const [jobData, setJobData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        salary: '',
        category: '',
        description: '',
        requirements: '',
        skills: ''
    });
    const ubuntuServices = useUbuntuServices();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await ubuntuServices.events.publishEvent('job.created', {
            userId: 'demo-user-001',
            jobData,
            timestamp: new Date().toISOString()
        }, 'azora-jobspaces');

        alert('Job posted successfully! (Feature coming soon)');
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" href="/jobs">Cancel</Button>
                    <Button size="sm" onClick={handleSubmit}>Publish Job</Button>
                </div>
            }
        >
            <div className="max-w-4xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Post a Job</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Find the perfect candidate for your team</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Job Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Job Title *</label>
                                <input
                                    type="text"
                                    value={jobData.title}
                                    onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                                    placeholder="e.g. Senior Full-Stack Developer"
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Company *</label>
                                    <input
                                        type="text"
                                        value={jobData.company}
                                        onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                                        placeholder="Your company name"
                                        className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Location *</label>
                                    <input
                                        type="text"
                                        value={jobData.location}
                                        onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                                        placeholder="Remote, Hybrid, or City"
                                        className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Job Type *</label>
                                    <select
                                        value={jobData.type}
                                        onChange={(e) => setJobData({ ...jobData, type: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Salary Range (AZR) *</label>
                                    <input
                                        type="text"
                                        value={jobData.salary}
                                        onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                                        placeholder="e.g. 80,000 - 120,000/year"
                                        className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Category *</label>
                                <select
                                    value={jobData.category}
                                    onChange={(e) => setJobData({ ...jobData, category: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    <option value="engineering">Engineering</option>
                                    <option value="ai-ml">AI/ML</option>
                                    <option value="design">Design</option>
                                    <option value="blockchain">Blockchain</option>
                                    <option value="education">Education</option>
                                    <option value="business">Business</option>
                                </select>
                            </div>
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Job Description</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Description *</label>
                                <textarea
                                    value={jobData.description}
                                    onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                                    placeholder="Describe the role, responsibilities, and what makes it exciting..."
                                    rows={6}
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Requirements *</label>
                                <textarea
                                    value={jobData.requirements}
                                    onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
                                    placeholder="List the required qualifications, experience, and education..."
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Skills (comma-separated) *</label>
                                <input
                                    type="text"
                                    value={jobData.skills}
                                    onChange={(e) => setJobData({ ...jobData, skills: e.target.value })}
                                    placeholder="e.g. React, Node.js, TypeScript, Blockchain"
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Escrow & Payment</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            All payments are secured through blockchain escrow to protect both parties.
                        </p>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm text-blue-500">
                                💡 Posting fee: 50 AZR (refunded when position is filled)
                            </p>
                        </div>
                    </AccessibleCard>

                    <div className="flex gap-4">
                        <Button type="submit" size="lg" className="flex-1">
                            Publish Job
                        </Button>
                        <Button type="button" variant="outline" size="lg" href="/jobs">
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
