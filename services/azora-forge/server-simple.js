const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(compression());
app.use(express.json());

// Sample job listings
const jobs = [
    {
        id: 'job-1',
        title: 'Full Stack Developer',
        description: 'Build modern web applications using React and Node.js',
        budget: 5000,
        currency: 'USD',
        skills: ['React', 'Node.js', 'PostgreSQL'],
        status: 'open',
        postedBy: 'client-1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'job-2',
        title: 'UI/UX Designer',
        description: 'Design beautiful and intuitive user interfaces',
        budget: 3000,
        currency: 'USD',
        skills: ['Figma', 'Adobe XD', 'UI Design'],
        status: 'open',
        postedBy: 'client-2',
        createdAt: new Date().toISOString()
    }
];

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'azora-forge',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        service: 'azora-forge',
        timestamp: new Date().toISOString()
    });
});

// Readiness check
app.get('/api/health/ready', (req, res) => {
    res.json({
        success: true,
        status: 'ready',
        service: 'azora-forge',
        database: 'mock-connected',
        timestamp: new Date().toISOString()
    });
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
    try {
        const { status, skills } = req.query;
        let filteredJobs = [...jobs];

        if (status) {
            filteredJobs = filteredJobs.filter(job => job.status === status);
        }

        if (skills) {
            const skillsArray = skills.split(',');
            filteredJobs = filteredJobs.filter(job =>
                job.skills.some(skill => skillsArray.includes(skill))
            );
        }

        res.json({
            success: true,
            data: filteredJobs,
            count: filteredJobs.length
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get job by ID
app.get('/api/jobs/:id', (req, res) => {
    try {
        const job = jobs.find(j => j.id === req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        res.json({ success: true, data: job });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create job
app.post('/api/jobs', (req, res) => {
    try {
        const { title, description, budget, currency, skills } = req.body;

        const newJob = {
            id: `job-${Date.now()}`,
            title,
            description,
            budget,
            currency: currency || 'USD',
            skills: skills || [],
            status: 'open',
            postedBy: req.body.postedBy || 'anonymous',
            createdAt: new Date().toISOString()
        };

        jobs.push(newJob);

        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get marketplace statistics
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            totalJobs: jobs.length,
            openJobs: jobs.filter(j => j.status === 'open').length,
            totalBudget: jobs.reduce((sum, job) => sum + job.budget, 0),
            topSkills: ['React', 'Node.js', 'UI Design', 'PostgreSQL']
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🔨 Azora Forge Service running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`💼 Jobs API: http://localhost:${PORT}/api/jobs`);
});

module.exports = app;
