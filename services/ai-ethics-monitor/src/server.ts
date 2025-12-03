import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ethicsMonitor } from './ethics-monitor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3033;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'ai-ethics-monitor', timestamp: new Date().toISOString() });
});

// Report Violation
app.post('/api/violations', async (req, res) => {
    try {
        const { serviceId, description, severity } = req.body;
        const violation = await ethicsMonitor.reportViolation(serviceId, description, severity);
        res.json({ success: true, violation });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Compliance Report
app.get('/api/compliance/:serviceId', async (req, res) => {
    try {
        const report = await ethicsMonitor.getComplianceReport(req.params.serviceId);
        res.json({ success: true, report });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Resolve Violation
app.post('/api/violations/:id/resolve', async (req, res) => {
    try {
        const violation = await ethicsMonitor.resolveViolation(req.params.id);
        if (!violation) return res.status(404).json({ success: false, error: 'Violation not found' });
        res.json({ success: true, violation });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🛡️ AI Ethics Monitor running on port ${PORT}`);
});
