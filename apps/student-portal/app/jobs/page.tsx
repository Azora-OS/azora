'use client';
import { useState } from 'react';

const DEMO_JOBS = [
  { id: '1', title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', salary: '500 AZR/month', type: 'Full-time' },
  { id: '2', title: 'Content Writer', company: 'MediaHub', location: 'Remote', salary: '300 AZR/month', type: 'Part-time' },
  { id: '3', title: 'Data Analyst', company: 'DataCo', location: 'Hybrid', salary: '600 AZR/month', type: 'Full-time' },
  { id: '4', title: 'Graphic Designer', company: 'DesignStudio', location: 'Remote', salary: '400 AZR/month', type: 'Freelance' },
  { id: '5', title: 'Virtual Assistant', company: 'BizSupport', location: 'Remote', salary: '250 AZR/month', type: 'Part-time' },
];

export default function JobsPage() {
  const [jobs] = useState(DEMO_JOBS);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Find Jobs</h1>

        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-2">{job.company} • {job.location}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">{job.type}</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold">{job.salary}</span>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
