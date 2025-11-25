'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FolderOpen, BookOpen, Users } from 'lucide-react';

export default function CollectionsPage() {
    const router = useRouter();

    const collections = [
        { id: 1, name: 'Computer Science Essentials', resources: 24, subscribers: 456, description: 'Core CS concepts and algorithms' },
        { id: 2, name: 'Physics Research Papers', resources: 18, subscribers: 234, description: 'Latest physics research and discoveries' },
        { id: 3, name: 'Mathematics References', resources: 32, subscribers: 678, description: 'Comprehensive math resources' },
        { id: 4, name: 'Biology Fundamentals', resources: 15, subscribers: 345, description: 'Essential biology topics' },
    ];

    return (
        <AppLayout appName="Azora Library" userName="Scholar">
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Collections</GradientText>
                    </h1>
                    <p className="text-gray-400">Curated resource collections by topic</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {collections.map((collection, i) => (
                        <motion.div key={collection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-purple-500/20">
                                        <FolderOpen className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{collection.name}</h3>
                                        <p className="text-gray-400 text-sm mb-4">{collection.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                {collection.resources} resources
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {collection.subscribers} subscribers
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">Browse Collection</Button>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
