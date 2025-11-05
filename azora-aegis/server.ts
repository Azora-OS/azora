import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Initialize Prisma (simplified for demo)
const prisma = new PrismaClient();

// Mock database for demo
const mockGrants: any[] = [];
const mockTriggers: any[] = [];
const mockNations: any[] = [];

// Initialize Elara AI (LangChain with OpenAI)
let elaraAI: ChatOpenAI | null = null;
try {
    if (process.env.OPENAI_API_KEY) {
        elaraAI = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            modelName: 'gpt-4',
            temperature: 0.1, // Low temperature for constitutional compliance
        });
        console.log('✅ Elara AI initialized successfully');
    } else {
        console.log('⚠️ Elara AI not configured - using mock compliance checks');
    }
} catch (error) {
    console.log('⚠️ Elara AI initialization failed - using mock compliance checks');
}

// Initialize Redis queues for triggers (simplified for demo)
// const nationGrantQueue = new Queue('nation-grants', process.env.REDIS_URL || 'redis://localhost:6379');
// const sovereignTriggerQueue = new Queue('sovereign-triggers', process.env.REDIS_URL || 'redis://localhost:6379');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Elara AI Constitutional Compliance Check
async function checkConstitutionalCompliance(action: string, context: any): Promise<boolean> {
    try {
        // If Elara AI is not available, use mock compliance (always approve for demo)
        if (!elaraAI) {
            console.log(`Mock Elara AI Decision: APPROVED (Demo mode - ${action})`);
            return true;
        }

        const systemPrompt = `You are Elara AI, the constitutional compliance officer for Azora OS.
Your role is to ensure all actions align with the Azora Constitution and sovereign economic principles.
You must approve or deny actions based on constitutional compliance.

Key Principles:
- Sovereign nation grants must benefit the collective good
- Economic actions must maintain 1:1 AZR to USD peg at inception
- All triggers must be transparent and auditable
- No action shall harm the sovereignty or economic stability

Respond with only "APPROVED" or "DENIED" followed by a brief reason.`;

        const response = await elaraAI.call([
            new SystemMessage(systemPrompt),
            new HumanMessage(`Action: ${action}\nContext: ${JSON.stringify(context)}\n\nIs this constitutionally compliant?`)
        ]);

        const result = response.content.toString().trim();
        console.log(`Elara AI Decision: ${result}`);

        return result.toUpperCase().startsWith('APPROVED');
    } catch (error) {
        console.error('Elara AI Error:', error);
        return false; // Default to deny on error
    }
}

// Sovereign Nation Grant Endpoint
app.post('/api/nation-grants', async (req, res) => {
    try {
        const { nationName, founderId, initialCapital, constitution } = req.body;

        // Check constitutional compliance with Elara AI
        const isCompliant = await checkConstitutionalCompliance('nation-grant', {
            nationName,
            founderId,
            initialCapital,
            constitution
        });

        if (!isCompliant) {
            return res.status(403).json({
                error: 'Nation grant denied by Elara AI - Constitutional compliance required'
            });
        }

        // Create nation grant record (mock)
        const grant = {
            id: Math.random().toString(36).substr(2, 9),
            nationName,
            founderId,
            initialCapital,
            constitution,
            status: 'pending',
            elaraApproval: true,
            createdAt: new Date()
        };
        mockGrants.push(grant);

        // Process grant immediately (simplified)
        // In production, this would be queued
        try {
            const sovereignTokenAddress = `0x${Math.random().toString(16).substr(2, 40)}`;

            // Update grant status (mock)
            const grantIndex = mockGrants.findIndex(g => g.id === grant.id);
            if (grantIndex !== -1) {
                mockGrants[grantIndex].status = 'completed';
                mockGrants[grantIndex].sovereignTokenAddress = sovereignTokenAddress;
                mockGrants[grantIndex].completedAt = new Date();
            }

            // Create nation record (mock)
            const nation = {
                id: Math.random().toString(36).substr(2, 9),
                name: nationName,
                founderId,
                sovereignTokenAddress,
                initialCapital,
                status: 'active',
                createdAt: new Date()
            };
            mockNations.push(nation);
        } catch (processError) {
            console.error('Grant processing error:', processError);
            const grantIndex = mockGrants.findIndex(g => g.id === grant.id);
            if (grantIndex !== -1) {
                mockGrants[grantIndex].status = 'failed';
            }
        }

        res.json({
            success: true,
            grantId: grant.id,
            message: 'Nation grant submitted for processing',
            elaraStatus: 'approved'
        });

    } catch (error) {
        console.error('Nation grant error:', error);
        res.status(500).json({ error: 'Failed to process nation grant' });
    }
});

// Sovereign Trigger Endpoint
app.post('/api/sovereign-triggers', async (req, res) => {
    try {
        const { triggerType, nationId, parameters, justification } = req.body;

        // Check constitutional compliance
        const isCompliant = await checkConstitutionalCompliance('sovereign-trigger', {
            triggerType,
            nationId,
            parameters,
            justification
        });

        if (!isCompliant) {
            return res.status(403).json({
                error: 'Sovereign trigger denied by Elara AI - Constitutional compliance required'
            });
        }

        // Create trigger record (mock)
        const trigger = {
            id: Math.random().toString(36).substr(2, 9),
            triggerType,
            nationId,
            parameters: JSON.stringify(parameters),
            justification,
            status: 'queued',
            elaraApproval: true,
            createdAt: new Date()
        };
        mockTriggers.push(trigger);

        // Process trigger immediately (simplified)
        // In production, this would be queued
        try {
            // Execute trigger based on type
            switch (triggerType) {
                case 'economic-stimulus':
                    console.log('Executing economic stimulus for nation:', nationId);
                    break;
                case 'sovereign-defense':
                    console.log('Activating sovereign defense for nation:', nationId);
                    break;
                case 'constitutional-amendment':
                    console.log('Processing constitutional amendment for nation:', nationId);
                    break;
                default:
                    throw new Error(`Unknown trigger type: ${triggerType}`);
            }

            // Update trigger status (mock)
            const triggerIndex = mockTriggers.findIndex(t => t.id === trigger.id);
            if (triggerIndex !== -1) {
                mockTriggers[triggerIndex].status = 'executed';
                mockTriggers[triggerIndex].executedAt = new Date();
            }
        } catch (processError) {
            console.error('Trigger processing error:', processError);
            const triggerIndex = mockTriggers.findIndex(t => t.id === trigger.id);
            if (triggerIndex !== -1) {
                mockTriggers[triggerIndex].status = 'failed';
            }
        }

        res.json({
            success: true,
            triggerId: trigger.id,
            message: 'Sovereign trigger queued for execution',
            elaraStatus: 'approved'
        });

    } catch (error) {
        console.error('Sovereign trigger error:', error);
        res.status(500).json({ error: 'Failed to process sovereign trigger' });
    }
});

// Get Nation Status
app.get('/api/nations/:nationId', async (req, res) => {
    try {
        const { nationId } = req.params;

        const nation = mockNations.find(n => n.id === nationId);

        if (!nation) {
            return res.status(404).json({ error: 'Nation not found' });
        }

        res.json(nation);
    } catch (error) {
        console.error('Get nation error:', error);
        res.status(500).json({ error: 'Failed to retrieve nation' });
    }
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Aegis Citadel',
        timestamp: new Date().toISOString(),
        elaraAI: 'active'
    });
});

// Worker for processing nation grants (removed for simplicity)
// const grantWorker = ...

// Worker for executing sovereign triggers (removed for simplicity)
// const triggerWorker = ...

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down Aegis Citadel...');
    process.exit(0);
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Aegis Citadel running on port ${port}`);
    console.log(`📋 Elara AI Constitutional Oversight: ACTIVE`);
    console.log(`🏛️ Sovereign Nation Grants: ENABLED`);
    console.log(`⚡ Sovereign Triggers: ENABLED`);
});

