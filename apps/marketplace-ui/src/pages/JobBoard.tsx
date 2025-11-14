import React, { useState } from 'react';
import { useJobs, useJobApplication } from '../hooks/use-jobs';
import { useAuth } from '../hooks/use-auth';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  description: string;
  postedAt: string;
  aiMatch: number;
}

const JobBoard: React.FC = () => {
  const { user } = useAuth();
  const { data: jobsData, isLoading: loading, error } = useJobs();
  const { mutate: applyToJob, isPending: isApplying } = useJobApplication();
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
    skills: ''
  });

  const jobs = jobsData?.jobs || [];

  const handleApply = (jobId: string) => {
    if (!user?.id) return;
    applyToJob({ jobId, userId: user.id });
  };

  const JobCard = ({ job }: { job: Job }) => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {job.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              job.aiMatch >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              job.aiMatch >= 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }`}>
              🤖 {job.aiMatch}% Match
            </span>
          </div>
          <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mb-1">{job.company}</p>
          <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
            <span className="flex items-center">📍 {job.location}</span>
            <span className="flex items-center">💼 {job.type}</span>
            <span className="flex items-center">💰 {job.salary}</span>
          </div>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {job.postedAt}
        </div>
      </div>

      <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex space-x-3">
        <button 
          onClick={() => handleApply(job.id)}
          disabled={isApplying || !user}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-medium disabled:opacity-50"
        >
          {isApplying ? '⏳ Applying...' : '🚀 Apply Now'}
        </button>
        <button className="px-4 py-2 bg-white/70 dark:bg-slate-700/70 backdrop-blur-xl border border-white/20 dark:border-slate-600/50 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-slate-900 dark:text-white">
          💾 Save
        </button>
        <button className="px-4 py-2 bg-white/70 dark:bg-slate-700/70 backdrop-blur-xl border border-white/20 dark:border-slate-600/50 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-slate-900 dark:text-white">
          📤 Share
        </button>
      </div>
    </div>
  );

  const FilterCard = () => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 sticky top-8">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">🔍 Smart Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Search Jobs
          </label>
          <input
            type="text"
            placeholder="AI Engineer, React Developer..."
            className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Job Type
          </label>
          <select
            className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Location
          </label>
          <select
            className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          >
            <option value="">All Locations</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Skills
          </label>
          <input
            type="text"
            placeholder="React, Python, AI..."
            className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={filters.skills}
            onChange={(e) => setFilters({...filters, skills: e.target.value})}
          />
        </div>

        <button className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-medium">
          🎯 Apply Filters
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">🔥 Trending Skills</h4>
        <div className="flex flex-wrap gap-2">
          {['React', 'AI/ML', 'Blockchain', 'Python', 'TypeScript'].map((skill) => (
            <button
              key={skill}
              className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm hover:shadow-md transition-all duration-300"
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          🚀 Azora Forge
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
          AI-Powered Job Marketplace for the Constitutional AI Era
        </p>
        
        <div className="flex items-center justify-center space-x-8 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>{jobs.length} Active Jobs</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span>3,891 Talented Freelancers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <span>98.7% AI Match Accuracy</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterCard />
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Perfect Matches for You
            </h2>
            <div className="flex items-center space-x-3">
              <select className="px-4 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white">
                <option>Sort by AI Match</option>
                <option>Sort by Date</option>
                <option>Sort by Salary</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-medium">
              🔄 Load More Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobBoard;