'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Star, BookOpen, Eye } from 'lucide-react';

export default function ResourceDetailPage() {
    const router = useRouter();

    const resource = {
        title: 'Introduction to Machine Learning',
        author: 'Dr. John Smith',
        type: 'PDF',
        pages: 245,
        rating: 4.8,
        reviews: 156,
        downloads: 1234,
        published: '2024-06-15',
        description: 'A comprehensive introduction to machine learning concepts, algorithms, and applications. Perfect for beginners and intermediate learners.',
        topics: ['Supervised Learning', 'Neural Networks', 'Deep Learning', 'Model Training'],
    };

    return (
        <AppLayout appName="Azora Library" userName="Scholar">
            <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Library
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <h1 className="text-4xl font-bold mb-4">
                                <GradientText>{resource.title}</GradientText>
                            </h1>
                            <div className="flex items-center gap-4 text-gray-400 mb-6">
                                <span>By {resource.author}</span>
                                <span>•</span>
                                <span>{resource.published}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-yellow-400">
                                    <Star className="h-4 w-4 fill-current" />
                                    {resource.rating} ({resource.reviews} reviews)
                                </span>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-6">{resource.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {resource.topics.map((topic, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <AccessibleCard className="p-6">
                                <h2 className="text-xl font-bold mb-4">Preview</h2>
                                <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                    <BookOpen className="h-16 w-16 text-primary" />
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    </div>

                    <div className="space-y-4">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <AccessibleCard className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Type</div>
                                        <div className="font-bold">{resource.type}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Pages</div>
                                        <div className="font-bold">{resource.pages}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Downloads</div>
                                        <div className="font-bold">{resource.downloads.toLocaleString()}</div>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                            <div className="space-y-2">
                                <Button variant="primary" className="w-full">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Read Now
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
