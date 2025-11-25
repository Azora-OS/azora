'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Download, Eye } from 'lucide-react';

export default function PublicationsPage() {
    const router = useRouter();

    const publications = [
        { id: 1, title: 'Quantum Entanglement in Computing', authors: 'Smith et al.', journal: 'Nature Physics', year: 2024, citations: 45 },
        { id: 2, title: 'AI Ethics Framework for Healthcare', authors: 'Johnson & Lee', journal: 'AI & Society', year: 2024, citations: 32 },
        { id: 3, title: 'Climate Modeling with ML', authors: 'Davis et al.', journal: 'Science', year: 2023, citations: 78 },
    ];

    return (
        <AppLayout appName="Azora Research Center" userName="Researcher">
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Publications</GradientText>
                    </h1>
                    <p className="text-gray-400">Research papers and publications</p>
                </motion.div>

                <div className="space-y-4">
                    {publications.map((pub, i) => (
                        <motion.div key={pub.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="p-3 rounded-xl bg-purple-500/20">
                                            <FileText className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1">{pub.title}</h3>
                                            <p className="text-gray-400 text-sm mb-2">{pub.authors}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span>{pub.journal}</span>
                                                <span>•</span>
                                                <span>{pub.year}</span>
                                                <span>•</span>
                                                <span>{pub.citations} citations</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
