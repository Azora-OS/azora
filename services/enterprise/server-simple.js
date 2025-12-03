const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3023;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json());

// Mock data
const licenses = [
    { id: 'lic_1', type: 'enterprise', status: 'active', company: 'Acme Corp', users: 100 },
    { id: 'lic_2', type: 'white-label', status: 'active', company: 'Tech Solutions', users: 50 }
];

const supportTickets = [
    { id: 'tkt_1', subject: 'Integration Help', status: 'open', priority: 'high', company: 'Acme Corp' },
    { id: 'tkt_2', subject: 'Feature Request', status: 'in-progress', priority: 'medium', company: 'Tech Solutions' }
];

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-enterprise', timestamp: new Date().toISOString() });
});

// License Management
app.get('/api/licenses', (req, res) => {
    res.json({ success: true, data: licenses });
});

app.get('/api/licenses/:id', (req, res) => {
    const license = licenses.find(l => l.id === req.params.id);
    if (!license) return res.status(404).json({ success: false, error: 'License not found' });
    res.json({ success: true, data: license });
});

app.post('/api/licenses', (req, res) => {
    const { type, company, users } = req.body;
    const newLicense = {
        id: `lic_${Date.now()}`,
        type,
        company,
        users,
        status: 'active'
    };
    licenses.push(newLicense);
    res.status(201).json({ success: true, data: newLicense });
});

// Support Tickets
app.get('/api/support/tickets', (req, res) => {
    res.json({ success: true, data: supportTickets });
});

app.post('/api/support/tickets', (req, res) => {
    const { subject, priority, company } = req.body;
    const newTicket = {
        id: `tkt_${Date.now()}`,
        subject,
        priority: priority || 'medium',
        company,
        status: 'open'
    };
    supportTickets.push(newTicket);
    res.status(201).json({ success: true, data: newTicket });
});

// White-label Configuration
app.get('/api/white-label/:companyId', (req, res) => {
    res.json({
        success: true,
        data: {
            companyId: req.params.companyId,
            branding: {
                logo: 'https://example.com/logo.png',
                primaryColor: '#007bff',
                secondaryColor: '#6c757d'
            },
            features: ['courses', 'jobs', 'payments']
        }
    });
});

app.listen(PORT, () => {
    console.log(`🏢 Azora Enterprise running on port ${PORT}`);
});
