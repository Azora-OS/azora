import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  coverLetter: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  aiMatch: number;
  skills: string[];
}

const ApplicationManagement: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/applications/employer/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'reviewing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shortlisted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'hired': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'reviewing': return '👀';
      case 'shortlisted': return '⭐';
      case 'rejected': return '❌';
      case 'hired': return '🎉';
      default: return '📄';
    }
  };

  const filteredApplications = applications.filter(app => {
    const statusMatch = selectedStatus === 'all' || app.status === selectedStatus;
    const jobMatch = selectedJob === 'all' || app.jobId === selectedJob;
    return statusMatch && jobMatch;
  });

  const uniqueJobs = Array.from(new Set(applications.map(app => ({ id: app.jobId, title: app.jobTitle }))))
    .filter((job, index, self) => self.findIndex(j => j.id === job.id) === index);

  const ApplicationCard = ({ application }: { application: Application }) => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {application.applicantName}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              application.aiMatch >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              application.aiMatch >= 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }`}>
              🤖 {application.aiMatch}% Match
            </span>
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-1">{application.jobTitle}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{application.applicantEmail}</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
            {getStatusIcon(application.status)} {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cover Letter:</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
          {application.coverLetter}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {application.skills.map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-medium"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {application.portfolioUrl && (
            <a
              href={application.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm hover:shadow-md transition-all"
            >
              🌐 Portfolio
            </a>
          )}
          {application.resumeUrl && (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm hover:shadow-md transition-all"
            >
              📄 Resume
            </a>
          )}
        </div>

        <div className="flex space-x-2">
          {application.status === 'pending' && (
            <>
              <button
                onClick={() => updateApplicationStatus(application.id, 'reviewing')}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                👀 Review
              </button>
              <button
                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                ❌ Reject
              </button>
            </>
          )}
          {application.status === 'reviewing' && (
            <>
              <button
                onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
              >
                ⭐ Shortlist
              </button>
              <button
                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                ❌ Reject
              </button>
            </>
          )}
          {application.status === 'shortlisted' && (
            <button
              onClick={() => updateApplicationStatus(application.id, 'hired')}
              className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
            >
              🎉 Hire
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          📋 Application Management
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Review and manage job applications with AI-powered insights
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filter by Status
            </label>
            <select
              className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filter by Job
            </label>
            <select
              className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="all">All Jobs</option>
              {uniqueJobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredApplications.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
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
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Applications Found</h3>
          <p className="text-slate-600 dark:text-slate-400">
            {selectedStatus !== 'all' || selectedJob !== 'all' 
              ? 'Try adjusting your filters to see more applications.'
              : 'Applications will appear here once candidates start applying to your jobs.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;