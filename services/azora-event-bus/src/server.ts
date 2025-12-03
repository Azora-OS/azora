import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { eventBus } from './event-bus';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3035;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-event-bus', timestamp: new Date().toISOString() });
});

// Subscribe
app.post('/api/subscribe', (req, res) => {
    const { serviceUrl, events } = req.body;
    eventBus.subscribe(serviceUrl, events);
    res.json({ success: true, message: 'Subscribed successfully' });
});

// Publish
app.post('/api/publish', async (req, res) => {
    try {
        const { type, payload } = req.body;
        await eventBus.publish({ type, payload });
        res.json({ success: true, message: 'Event published' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Dead Letter Queue
app.get('/api/dlq', (req, res) => {
    res.json({ success: true, dlq: eventBus.getDeadLetterQueue() });
});

app.listen(PORT, () => {
    console.log(`📡 Azora Event Bus running on port ${PORT}`);
});
