// test-request.js

import axios from 'axios';

async function testKnowledgeReward() {
    try {
        const response = await axios.post('http://localhost:4300/api/v2/knowledge-reward', {
            transactionId: 'test-tx-001',
            userId: 'user123',
            economyId: 'aZAR',
            amount: 100,
            knowledgeType: 'course_completion',
            knowledgeId: 'course-101',
            signature: 'test-signature'
        });

        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testKnowledgeReward();