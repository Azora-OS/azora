'use client';

import { AppLayout, AccessibleCard, GradientText, Button, UbuntuPhilosophyCard } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Search, FolderOpen, Download, Star, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const resources = [
    { id: 1, title: 'Introduction to Machine Learning', type: 'PDF', author: 'Dr. Smith', pages: 245, downloads: 1234, rating: 4.8 },
    { id: 2, title: 'Advanced Physics Lectures', type: 'Video', author: 'Prof. Johnson', duration: '12h 30m', downloads: 892, rating: 4.9 },
    { id: 3, title: 'Chemistry Lab Manual', type: 'PDF', author: 'Dr. Lee', pages: 180, downloads: 756, rating: 4.7 },
    { id: 4, title: 'Mathematics Problem Sets', type: 'Document', author: 'Prof. Davis', pages: 95, downloads: 1456, rating: 4.6 },
  ];

  const collections = [
    { id: 1, name: 'Computer Science Essentials', resources: 24, subscribers: 456 },
    { id: 2, name: 'Physics Research Papers', resources: 18, subscribers: 234 },
    { id: 3, name: 'Mathematics References', resources: 32, subscribers: 678 },
  ];

  return (
    <AppLayout appName="Azora Library" userName="Scholar">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter">
            <GradientText>Azora Library</GradientText>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Knowledge Base and Research Hub</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AccessibleCard className="p-6 border-blue-500/50">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <div className="text-gray-400 text-sm">Total Resources</div>
              </div>
              <div className="text-3xl font-bold text-blue-400">12,456</div>
            </AccessibleCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <AccessibleCard className="p-6 border-purple-500/50">
              <div className="flex items-center gap-3 mb-2">
                <FolderOpen className="h-6 w-6 text-purple-400" />
                <div className="text-gray-400 text-sm">Collections</div>
              </div>
              <div className="text-3xl font-bold text-purple-400">{collections.length}</div>
            </AccessibleCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AccessibleCard className="p-6 border-green-500/50">
              <div className="flex items-center gap-3 mb-2">
                <Download className="h-6 w-6 text-green-400" />
                <div className="text-gray-400 text-sm">Downloads</div>
              </div>
              <div className="text-3xl font-bold text-green-400">45.2K</div>
            </AccessibleCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Button variant="primary" className="w-full h-full" onClick={() => router.push('/search')}>
              <Search className="h-5 w-5 mr-2" />
              Advanced Search
            </Button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AccessibleCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Popular Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource, i) => (
                <motion.div key={resource.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + (i * 0.05) }}
                  className="p-6 rounded-xl bg-card/30 hover:bg-card/50 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{resource.title}</h3>
                      <p className="text-gray-400 text-sm">{resource.author}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                      {resource.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-400">
                      <span>{resource.pages ? `${resource.pages} pages` : resource.duration}</span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {resource.downloads}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      {resource.rating}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AccessibleCard>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <AccessibleCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Featured Collections</h2>
              <div className="space-y-3">
                {collections.map(collection => (
                  <div key={collection.id} className="p-4 rounded-xl bg-card/30 flex items-center justify-between cursor-pointer hover:bg-card/50 transition-all"
                    onClick={() => router.push('/collections')}>
                    <div>
                      <h3 className="font-bold">{collection.name}</h3>
                      <p className="text-gray-400 text-sm">{collection.resources} resources</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{collection.subscribers}</div>
                      <div className="text-gray-400 text-xs">subscribers</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/collections')}>
                Browse All Collections
              </Button>
            </AccessibleCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <AccessibleCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Recently Added</h2>
              <div className="space-y-3">
                {resources.slice(0, 3).map(resource => (
                  <div key={resource.id} className="p-3 rounded-xl bg-card/30 flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{resource.title}</h3>
                      <p className="text-gray-400 text-xs">{resource.author}</p>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </AccessibleCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <UbuntuPhilosophyCard
              collaborationScore={88}
              communityImpact={91}
              knowledgeSharing={96}
            />
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
