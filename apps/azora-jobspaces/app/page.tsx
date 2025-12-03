'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, SignatureStamp, UbuntuPhilosophyCard } from '@azora/shared-design';
import { Button } from '@azora/shared-design/ui';
import { Search, Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';

// Mock data
const JOBS = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Full-time',
    salary: '$120k - $160k',
    tags: ['React', 'TypeScript', 'Next.js'],
    posted: '2 days ago'
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'DesignStudio',
    location: 'New York, NY',
    type: 'Contract',
    salary: '$80 - $120 / hr',
    tags: ['Figma', 'UI/UX', 'Design Systems'],
    posted: '1 day ago'
  },
  {
    id: '3',
    title: 'Backend Developer',
    company: 'DataSystems',
    location: 'London, UK',
    type: 'Full-time',
    salary: '£60k - £80k',
    tags: ['Node.js', 'PostgreSQL', 'AWS'],
    posted: '3 days ago'
  },
  {
    id: '4',
    title: 'Marketing Manager',
    company: 'GrowthCo',
    location: 'Remote',
    type: 'Full-time',
    salary: '$90k - $110k',
    tags: ['SEO', 'Content', 'Social Media'],
    posted: '5 hours ago'
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'AI Labs',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$150k - $200k',
    tags: ['Python', 'Machine Learning', 'PyTorch'],
    posted: '1 week ago'
  }
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', 'Full-time', 'Contract', 'Part-time', 'Freelance'];

  const filteredJobs = JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <AppLayout
      headerActions={
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button size="sm">Post a Job</Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold mb-4">
            Find Your <GradientText>Dream Job</GradientText>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Discover opportunities at top companies and startups. Remote, hybrid, and on-site roles available.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search by job title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-xl bg-card/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
              />
            </div>
            <Button size="lg" className="md:w-48 h-auto text-lg">
              Search
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${selectedType === type
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card/50 text-muted-foreground border-border hover:bg-accent'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              <Link href={`/jobs/${job.id}`}>
                <AccessibleCard className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {job.company[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="text-muted-foreground mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> {job.company} • <MapPin className="h-4 w-4" /> {job.location}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map(tag => (
                          <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="font-bold text-green-500 flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4" /> {job.salary}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" /> {job.posted}
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </div>
                </AccessibleCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <UbuntuPhilosophyCard
          collaborationScore={93}
          communityImpact={90}
          knowledgeSharing={91}
        />
      </div>

      <div className="mt-16">
        <SignatureStamp appName="JobSpaces" department="The Network" />
      </div>
    </AppLayout>
  );
}
