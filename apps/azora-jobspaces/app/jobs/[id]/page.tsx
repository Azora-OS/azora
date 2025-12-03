'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard';
import { PremiumButton } from '../../components/PremiumButton';
import { Navbar } from '../../components/Navbar';
import { ApplicationModal } from '../../components/ApplicationModal';

// Mock data
const JOB_DETAILS = {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Full-time',
    salary: '$120k - $160k',
    description: `We are looking for a Senior Frontend Engineer to join our team. You will be responsible for building high-quality, responsive web applications using React, Next.js, and TypeScript.

  Responsibilities:
  - Develop new features and maintain existing ones.
  - Collaborate with designers and backend engineers.
  - Optimize applications for maximum speed and scalability.
  - Mentor junior developers.

  Requirements:
  - 5+ years of experience with modern JavaScript frameworks.
  - Strong proficiency in React and TypeScript.
  - Experience with state management (Redux, Zustand, etc.).
  - Familiarity with CI/CD pipelines.
  `,
    requirements: [
        '5+ years of experience',
        'React, Next.js, TypeScript',
        'Strong communication skills',
        'Experience with Tailwind CSS'
    ],
    benefits: [
        'Competitive salary',
        'Remote work',
        'Health insurance',
        '401(k) matching'
    ],
    posted: '2 days ago'
};

export default function JobDetailsPage({ params: _params }: { params: { id: string } }) {
    const router = useRouter();
    const [isApplying, setIsApplying] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const job = JOB_DETAILS;

    const handleApplyClick = () => {
        setIsModalOpen(true);
    };

    const handleApplicationSubmit = async (data: any) => {
        setIsApplying(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/applications');
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <GlassCard className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold text-blue-400">
                                            {job.company[0]}
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold mb-1">{job.title}</h1>
                                            <div className="text-xl text-blue-200">{job.company}</div>
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <div className="text-2xl font-bold text-green-400">{job.salary}</div>
                                        <div className="text-blue-300">{job.posted}</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-8">
                                    <div className="flex items-center gap-2 text-blue-200 bg-white/5 px-3 py-1.5 rounded-lg">
                                        <span>📍</span> {job.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-200 bg-white/5 px-3 py-1.5 rounded-lg">
                                        <span>💼</span> {job.type}
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-200 bg-white/5 px-3 py-1.5 rounded-lg md:hidden">
                                        <span>💰</span> {job.salary}
                                    </div>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <h3 className="text-xl font-bold mb-4 text-blue-300">About the Role</h3>
                                    <div className="whitespace-pre-line text-blue-100 mb-8">
                                        {job.description}
                                    </div>

                                    <h3 className="text-xl font-bold mb-4 text-blue-300">Requirements</h3>
                                    <ul className="list-disc list-inside text-blue-100 mb-8 space-y-2">
                                        {job.requirements.map((req, i) => (
                                            <li key={i}>{req}</li>
                                        ))}
                                    </ul>

                                    <h3 className="text-xl font-bold mb-4 text-blue-300">Benefits</h3>
                                    <ul className="list-disc list-inside text-blue-100 space-y-2">
                                        {job.benefits.map((benefit, i) => (
                                            <li key={i}>{benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard className="p-6 sticky top-24">
                                <h3 className="text-xl font-bold mb-6">Interested in this job?</h3>

                                <PremiumButton
                                    className="w-full justify-center py-4 text-lg mb-4"
                                    onClick={handleApplyClick}
                                    disabled={isApplying}
                                >
                                    {isApplying ? 'Applied' : 'Apply Now'}
                                </PremiumButton>

                                <ApplicationModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    jobTitle={job.title}
                                    companyName={job.company}
                                    onSubmit={handleApplicationSubmit}
                                />

                                <PremiumButton
                                    variant="outline"
                                    className="w-full justify-center py-3 mb-6"
                                >
                                    Save for Later
                                </PremiumButton>

                                <div className="text-sm text-blue-300 text-center">
                                    <p className="mb-2">Application deadline: 30 Nov 2025</p>
                                    <p>24 people have applied</p>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
