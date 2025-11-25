'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, Star } from 'lucide-react';
import { useState } from 'react';

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const results = [
        { id: 1, title: 'Introduction to Machine Learning', type: 'PDF', author: 'Dr. Smith', rating: 4.8, pages: 245 },
        { id: 2, title: 'Advanced Physics', type: 'Video', author: 'Prof. Johnson', rating: 4.9, duration: '12h' },
        { id: 3, title: 'Chemistry Fundamentals', type: 'PDF', author: 'Dr. Lee', rating: 4.7, pages: 180 },
    ];

    return (
        <AppLayout appName="Azora Library" userName="Scholar">
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Advanced Search</GradientText>
                    </h1>
                    <p className="text-gray-400">Find exactly what you're looking for</p>
                </motion.div>

                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search resources, authors, topics..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {results.map((result, i) => (
                        <motion.div key={result.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="p-3 rounded-xl bg-blue-500/20">
                                            <BookOpen className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1">{result.title}</h3>
                                            <p className="text-gray-400 text-sm mb-3">{result.author}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                                                    {result.type}
                                                </span>
                                                <span>{result.pages ? `${result.pages} pages` : result.duration}</span>
                                                <span className="flex items-center gap-1 text-yellow-400">
                                                    <Star className="h-4 w-4 fill-current" />
                                                    {result.rating}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="primary">View</Button>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
