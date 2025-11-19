import React, { useState } from 'react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  skills: string[];
}

export function Marketplace() {
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'Cape Town',
      salary: 'R45,000 - R65,000',
      type: 'Full-time',
      skills: ['React', 'TypeScript', 'CSS']
    },
    {
      id: '2',
      title: 'Data Analyst',
      company: 'DataFlow',
      location: 'Johannesburg',
      salary: 'R35,000 - R50,000',
      type: 'Remote',
      skills: ['Python', 'SQL', 'Excel']
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Durban',
      salary: 'R40,000 - R55,000',
      type: 'Contract',
      skills: ['Figma', 'Sketch', 'Prototyping']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || job.type.toLowerCase() === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Job Marketplace</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="remote">Remote</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      <div className="grid gap-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                <p className="text-gray-600">{job.company} • {job.location}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {job.type}
              </span>
            </div>
            
            <p className="text-lg font-medium text-green-600 mb-4">{job.salary}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.map((skill) => (
                <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Apply Now
              </button>
              <button className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
                Save Job
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}