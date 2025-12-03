import React, { useState, useEffect } from 'react';
import { JobService, Job } from '../services/job-service';
import { EscrowService } from '../services/escrow-service';

export const JobListing: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

    const jobService = new JobService();
    const escrowService = new EscrowService();

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        // Mock fetching jobs - in real app would use jobService.getJobs()
        // const fetchedJobs = await jobService.getJobs();
        const mockJobs: Job[] = [
            { id: '1', title: 'Smart Contract Developer', description: 'Build DeFi protocols', budget: 5000, skills: ['Solidity', 'React'], ethicalCheck: true },
            { id: '2', title: 'UI/UX Designer', description: 'Design Azora mobile app', budget: 3000, skills: ['Figma', 'Mobile'], ethicalCheck: true },
        ];
        setJobs(mockJobs);
        setLoading(false);
    };

    const handleApply = async (job: Job) => {
        setApplyingJobId(job.id);
        try {
            // In a real flow, this would open an application modal
            // For now, we'll simulate creating an escrow agreement initiation
            console.log(`Applying for job: ${job.title}`);
            alert(`Application submitted for ${job.title}!`);
        } catch (error) {
            console.error('Application failed:', error);
        } finally {
            setApplyingJobId(null);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(filter.toLowerCase()) ||
        job.description.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="job-listing-page">
            <header className="page-header">
                <h1>Azora Jobspaces</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for jobs..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="loading">Loading jobs...</div>
            ) : (
                <div className="jobs-grid">
                    {filteredJobs.map(job => (
                        <div key={job.id} className="job-card">
                            <div className="job-header">
                                <h3>{job.title}</h3>
                                <span className="budget">{job.budget} AZR</span>
                            </div>
                            <p className="description">{job.description}</p>
                            <div className="skills">
                                {job.skills.map(skill => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                            <div className="job-footer">
                                {job.ethicalCheck && (
                                    <span className="ethical-badge">✅ Ethically Verified</span>
                                )}
                                <button
                                    className="apply-button"
                                    onClick={() => handleApply(job)}
                                    disabled={applyingJobId === job.id}
                                >
                                    {applyingJobId === job.id ? 'Applying...' : 'Apply Now'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .job-listing-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          margin-bottom: 40px;
          text-align: center;
        }

        .page-header h1 {
          color: #333;
          margin-bottom: 20px;
        }

        .search-bar input {
          width: 100%;
          max-width: 500px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 25px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s;
        }

        .search-bar input:focus {
          border-color: #667eea;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
        }

        .job-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
        }

        .job-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .job-header h3 {
          margin: 0;
          font-size: 18px;
          color: #2d3748;
        }

        .budget {
          font-weight: bold;
          color: #48bb78;
          background: #f0fff4;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 14px;
        }

        .description {
          color: #718096;
          margin-bottom: 20px;
          line-height: 1.5;
          flex-grow: 1;
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .skill-tag {
          background: #edf2f7;
          color: #4a5568;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
        }

        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .ethical-badge {
          font-size: 12px;
          color: #38a169;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .apply-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s;
        }

        .apply-button:hover:not(:disabled) {
          background: #5a67d8;
        }

        .apply-button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .loading {
          text-align: center;
          padding: 50px;
          color: #718096;
        }
      `}</style>
        </div>
    );
};
