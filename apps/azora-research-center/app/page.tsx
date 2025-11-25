'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FlaskConical, FileText, Users, DollarSign, Plus, CheckCircle, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const projects = [
    { id: 1, title: 'Quantum Computing Research', status: 'active', team: 8, progress: 65, funding: '$250K' },
    { id: 2, title: 'AI Ethics Framework', status: 'active', team: 5, progress: 42, funding: '$180K' },
    { id: 3, title: 'Climate Change Modeling', status: 'review', team: 12, progress: 88, funding: '$500K' },
  ];

  return (
    <AppLayout appName="Azora Research Center" userName="Researcher">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter">
            <GradientText>Azora Research Center</GradientText>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Academic Research and Collaboration Platform</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AccessibleCard className="p-6 border-blue-500/50">
              <div className="flex items-center gap-3 mb-2">
                <FlaskConical className="h-6 w-6 text-blue-400" />
                <div className="text-gray-400 text-sm">Active Projects</div>
              </div>
              <div className="text-3xl font-bold text-blue-400">{projects.filter(p => p.status === 'active').length}</div>
            </AccessibleCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <AccessibleCard className="p-6 border-purple-500/50">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-6 w-6 text-purple-400" />
                <div className="text-gray-400 text-sm">Publications</div>
              </div>
              <div className="text-3xl font-bold text-purple-400">47</div>
            </AccessibleCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AccessibleCard className="p-6 border-green-500/50">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-6 w-6 text-green-400" />
                <div className="text-gray-400 text-sm">Total Funding</div>
              </div>
              <div className="text-3xl font-bold text-green-400">$2.4M</div>
            </AccessibleCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Button variant="primary" className="w-full h-full" onClick={() => router.push('/projects')}>
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AccessibleCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Research Projects</h2>
            <div className="space-y-4">
              {projects.map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + (i * 0.05) }}
                  className="p-6 rounded-xl bg-card/30 hover:bg-card/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.team} members
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {project.funding}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{project.progress}%</div>
                      <div className="text-gray-400 text-xs">complete</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </AccessibleCard>
        </motion.div>
      </div>
    </AppLayout>
  );
}
