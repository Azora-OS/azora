/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Job Board - Job Listings Component
 * Browse and search for jobs with filtering
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Filter,
  Search,
  ChevronRight,
  Bookmark,
  ExternalLink,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';

// ===== INTERFACES =====

interface Job {
  id: string;
  jobNumber: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  skillsRequired: Skill[];
  educationLevel: string;
  experienceYears: number;
  employmentType: string;
  location: string;
  remote: boolean;
  hybrid: boolean;
  salary: {
    min: number;
    max: number;
    period: string;
    negotiable: boolean;
  };
  currency: string;
  postedDate: Date;
  applicationDeadline: Date;
  applicants: number;
  category: string;
  verified: boolean;
  urgentHiring: boolean;
  matchScore?: number;
}

interface Skill {
  name: string;
  level: string;
  verified: boolean;
}

interface Filters {
  keywords: string;
  categories: string[];
  employmentTypes: string[];
  locations: string[];
  remote: boolean;
  salaryMin: number;
  experienceYears: number;
}

// ===== COMPONENT =====

export default function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<Filters>({
    keywords: '',
    categories: [],
    employmentTypes: [],
    locations: [],
    remote: false,
    salaryMin: 0,
    experienceYears: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, jobs]);

  const loadJobs = async () => {
    // In production, fetch from API
    const mockJobs: Job[] = [
      {
        id: '1',
        jobNumber: 'JOB-10001',
        title: 'Junior Software Developer',
        company: 'TechCorp Africa',
        companyLogo: '/logos/techcorp.png',
        description: 'Join our innovative team building cutting-edge web applications...',
        skillsRequired: [
          { name: 'JavaScript', level: 'intermediate', verified: false },
          { name: 'React', level: 'intermediate', verified: false },
          { name: 'Node.js', level: 'beginner', verified: false },
        ],
        educationLevel: 'bachelors',
        experienceYears: 1,
        employmentType: 'full-time',
        location: 'Johannesburg, South Africa',
        remote: true,
        hybrid: true,
        salary: {
          min: 300000,
          max: 450000,
          period: 'annual',
          negotiable: true,
        },
        currency: 'ZAR',
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        applicants: 12,
        category: 'technology',
        verified: true,
        urgentHiring: false,
        matchScore: 85,
      },
      {
        id: '2',
        jobNumber: 'JOB-10002',
        title: 'Data Analyst',
        company: 'FinanceHub',
        description: 'Analyze financial data and provide insights...',
        skillsRequired: [
          { name: 'Python', level: 'intermediate', verified: false },
          { name: 'SQL', level: 'intermediate', verified: false },
          { name: 'Excel', level: 'advanced', verified: false },
        ],
        educationLevel: 'bachelors',
        experienceYears: 2,
        employmentType: 'full-time',
        location: 'Cape Town, South Africa',
        remote: false,
        hybrid: true,
        salary: {
          min: 350000,
          max: 500000,
          period: 'annual',
          negotiable: false,
        },
        currency: 'ZAR',
        postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        applicants: 24,
        category: 'finance',
        verified: true,
        urgentHiring: true,
        matchScore: 72,
      },
      {
        id: '3',
        jobNumber: 'JOB-10003',
        title: 'Marketing Intern',
        company: 'BrandWorks',
        description: 'Learn digital marketing in a fast-paced agency...',
        skillsRequired: [
          { name: 'Social Media', level: 'intermediate', verified: false },
          { name: 'Content Writing', level: 'intermediate', verified: false },
        ],
        educationLevel: 'any',
        experienceYears: 0,
        employmentType: 'internship',
        location: 'Durban, South Africa',
        remote: true,
        hybrid: false,
        salary: {
          min: 5000,
          max: 8000,
          period: 'monthly',
          negotiable: false,
        },
        currency: 'ZAR',
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        applicants: 45,
        category: 'marketing',
        verified: true,
        urgentHiring: false,
        matchScore: 68,
      },
    ];

    setJobs(mockJobs);
    setFilteredJobs(mockJobs);
    setLoading(false);
  };

  const applyFilters = () => {
    let results = [...jobs];

    // Keywords filter
    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase();
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(keywords) ||
          job.description.toLowerCase().includes(keywords) ||
          job.company.toLowerCase().includes(keywords)
      );
    }

    // Categories filter
    if (filters.categories.length > 0) {
      results = results.filter((job) => filters.categories.includes(job.category));
    }

    // Employment types filter
    if (filters.employmentTypes.length > 0) {
      results = results.filter((job) => filters.employmentTypes.includes(job.employmentType));
    }

    // Remote filter
    if (filters.remote) {
      results = results.filter((job) => job.remote);
    }

    // Salary filter
    if (filters.salaryMin > 0) {
      results = results.filter((job) => job.salary.min >= filters.salaryMin);
    }

    // Experience filter
    if (filters.experienceYears > 0) {
      results = results.filter((job) => job.experienceYears <= filters.experienceYears);
    }

    setFilteredJobs(results);
  };

  const toggleSaveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
    } else {
      newSaved.add(jobId);
    }
    setSavedJobs(newSaved);
  };

  const formatSalary = (salary: Job['salary'], currency: string) => {
    const format = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    });

    if (salary.min === salary.max) {
      return `${format.format(salary.min)} ${salary.period}`;
    }

    return `${format.format(salary.min)} - ${format.format(salary.max)} ${salary.period}`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getMatchColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Job</h1>
              <p className="mt-1 text-gray-600">
                {filteredJobs.length} opportunities available
              </p>
            </div>
            <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>My Applications</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-6 flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or keywords..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.keywords}
                onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <div className="space-y-2">
                    {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={filters.employmentTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({
                                ...filters,
                                employmentTypes: [...filters.employmentTypes, type],
                              });
                            } else {
                              setFilters({
                                ...filters,
                                employmentTypes: filters.employmentTypes.filter((t) => t !== type),
                              });
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-600 capitalize">
                          {type.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Location
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={filters.remote}
                      onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                    />
                    <span className="ml-2 text-sm text-gray-600">Remote Only</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Salary (ZAR)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0"
                    value={filters.salaryMin || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, salaryMin: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Experience (years)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0"
                    value={filters.experienceYears || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, experienceYears: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() =>
                    setFilters({
                      keywords: '',
                      categories: [],
                      employmentTypes: [],
                      locations: [],
                      remote: false,
                      salaryMin: 0,
                      experienceYears: 0,
                    })
                  }
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Job Listings */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  {/* Left Content */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {/* Company Logo */}
                      <div className="h-16 w-16 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-8 w-8 text-indigo-600" />
                      </div>

                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer">
                              {job.title}
                            </h3>
                            <p className="text-gray-600 mt-1 flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {job.company}
                              {job.verified && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  ✓ Verified
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Match Score */}
                          {job.matchScore && (
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(
                                job.matchScore
                              )}`}
                            >
                              {job.matchScore}% Match
                            </div>
                          )}
                        </div>

                        {/* Job Details */}
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                            {job.remote && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Remote
                              </span>
                            )}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatSalary(job.salary, job.currency)}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.employmentType.replace('-', ' ')}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {getTimeAgo(job.postedDate)}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {job.applicants} applicants
                          </span>
                        </div>

                        {/* Skills Required */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.skillsRequired.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {job.skillsRequired.length > 5 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                              +{job.skillsRequired.length - 5} more
                            </span>
                          )}
                        </div>

                        {/* Description Preview */}
                        <p className="mt-4 text-gray-600 line-clamp-2">{job.description}</p>

                        {/* Urgent Hiring Badge */}
                        {job.urgentHiring && (
                          <div className="mt-3 inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Urgent Hiring
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-end space-y-3 ml-6">
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      className={`p-2 rounded-lg border ${
                        savedJobs.has(job.id)
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Bookmark className="h-5 w-5" fill={savedJobs.has(job.id) ? 'currentColor' : 'none'} />
                    </button>

                    <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                      <span>Apply Now</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                      <ExternalLink className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
