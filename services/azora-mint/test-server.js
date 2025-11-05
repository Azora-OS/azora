// test-server.js - Simple test server for Proof-of-Knowledge endpoint

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import { processKnowledgeReward } from './dist/controllers/rewardController.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4300;

// Proof-of-Knowledge Protocol Endpoint
app.post('/api/v2/knowledge-reward', processKnowledgeReward);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'azora-mint-test' });
});

app.listen(PORT, async () => {
    console.log(`🚀 Azora Mint Test Server running on port ${PORT}`);
    console.log(`📡 Proof-of-Knowledge endpoint: POST http://localhost:${PORT}/api/v2/knowledge-reward`);

    // Test the endpoint
    console.log('\n🧪 Testing Proof-of-Knowledge endpoint...');
    try {
        const response = await axios.post(`http://localhost:${PORT}/api/v2/knowledge-reward`, {
            transactionId: 'test-tx-001',
            userId: 'user123',
            economyId: 'aZAR',
            amount: 100,
            knowledgeType: 'course_completion',
            knowledgeId: 'course-101',
            signature: 'test-signature'
        });

        console.log('✅ Test successful!');
        console.log('📊 Response:', JSON.stringify(response.data, null, 2));

        // Check if audit log was created
        console.log('\n📋 Checking for audit logs...');
        const fs = await import('fs');
        const path = await import('path');
        const logDir = path.resolve('./logs');
        if (fs.existsSync(logDir)) {
            const files = fs.readdirSync(logDir);
            console.log(`📁 Found ${files.length} audit log files:`, files);
        } else {
            console.log('📁 No logs directory found');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }

    console.log('\n🏁 Test completed. Server will continue running...');
});