'use client';

import { AppLayout, AccessibleCard, GradientText, Button, UbuntuPhilosophyCard } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, Users, Calendar, PlayCircle, Plus, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const activeSessions = [
    { id: 1, title: 'Advanced Mathematics', instructor: 'Dr. Smith', participants: 24, duration: '45 min', status: 'live' },
    { id: 2, title: 'Physics Lab', instructor: 'Prof. Johnson', participants: 18, duration: '1h 30min', status: 'live' },
  ];

  const upcomingSessions = [
    { id: 3, title: 'Chemistry 101', instructor: 'Dr. Lee', time: 'Today, 2:00 PM', participants: 30 },
    { id: 4, title: 'Biology Seminar', instructor: 'Prof. Davis', time: 'Today, 4:00 PM', participants: 25 },
  ];

  return (
    <AppLayout appName="Azora Classroom" userName="Educator">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter">
            <GradientText>Azora Classroom</GradientText>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Live Virtual Classrooms and Collaboration
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AccessibleCard className="p-6 border-green-500/50">
              <div className="flex items-center gap-3 mb-2">
                <Video className="h-6 w-6 text-green-400" />
                <div className="text-gray-400 text-sm">Live Now</div>
              </div>
              <div className="text-3xl font-bold text-green-400">{activeSessions.length}</div>
            </AccessibleCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <AccessibleCard className="p-6 border-blue-500/50">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-6 w-6 text-blue-400" />
                <div className="text-gray-400 text-sm">Participants</div>
              </div>
              <div className="text-3xl font-bold text-blue-400">{activeSessions.reduce((sum, s) => sum + s.participants, 0)}</div>
            </AccessibleCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AccessibleCard className="p-6 border-purple-500/50">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-6 w-6 text-purple-400" />
                <div className="text-gray-400 text-sm">Upcoming</div>
              </div>
              <div className="text-3xl font-bold text-purple-400">{upcomingSessions.length}</div>
            </AccessibleCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Button variant="primary" className="w-full h-full" onClick={() => router.push('/create')}>
              <Plus className="h-5 w-5 mr-2" />
              Create Session
            </Button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AccessibleCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Live Sessions</h2>
            <div className="space-y-4">
              {activeSessions.map((session, i) => (
                <motion.div key={session.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + (i * 0.05) }}
                  className="p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/20">
                        <Video className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{session.title}</h3>
                        <p className="text-gray-400 text-sm">{session.instructor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{session.participants}</div>
                        <div className="text-gray-400 text-xs">participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{session.duration}</div>
                        <div className="text-gray-400 text-xs">duration</div>
                      </div>
                      <Button variant="primary">Join Session</Button>
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
              <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
              <div className="space-y-3">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="p-4 rounded-xl bg-card/30 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{session.title}</h3>
                      <p className="text-gray-400 text-sm">{session.instructor}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {session.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{session.participants}</div>
                      <div className="text-gray-400 text-xs">enrolled</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/schedule')}>
                View Full Schedule
              </Button>
            </AccessibleCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <AccessibleCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/sessions')}>
                  <Video className="h-5 w-5 mr-3" />
                  Browse All Sessions
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/recordings')}>
                  <PlayCircle className="h-5 w-5 mr-3" />
                  View Recordings
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/schedule')}>
                  <Calendar className="h-5 w-5 mr-3" />
                  Manage Schedule
                </Button>
              </div>
            </AccessibleCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <UbuntuPhilosophyCard
              collaborationScore={92}
              communityImpact={89}
              knowledgeSharing={94}
            />
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
