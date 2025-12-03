import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { tamperProofRepository } from './tamper-proof-repository';
import crypto from 'crypto';

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// 🔒 AZORA TAMPER-PROOF DATA SERVICE
console.log('🌟 Azora Tamper-Proof Data Service - Initializing...');

// 🎯 API ROUTES
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        const stats = await tamperProofRepository.getStats();
        res.json({
            status: 'healthy',
            service: 'tamper-proof-data-service',
            ubuntu: 'I protect because we value truth',
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});

// Store data
app.post('/api/data', async (req: Request, res: Response) => {
    try {
        const { userId, dataType, data, metadata } = req.body;

        if (!userId || !dataType || !data) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create hash
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');

        // Create signature (mock for now, would use keys in prod)
        const secret = process.env.SIGNATURE_SECRET || 'azora-tamper-proof-secret';
        const signatureData = `${dataHash}:${userId}:${secret}`;
        const signature = crypto.createHmac('sha256', secret).update(signatureData).digest('hex');

        const storedData = await tamperProofRepository.storeData({
            userId,
            dataType,
            data,
            dataHash,
            signature,
            metadata
        });

        // Log audit
        await tamperProofRepository.addToAuditTrail({
            dataId: storedData.id,
            action: 'CREATE',
            userId,
            dataType,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            data: {
                id: storedData.id,
                dataHash,
                signature,
                createdAt: storedData.createdAt
            }
        });
    } catch (error) {
        console.error('Error storing data:', error);
        res.status(500).json({ error: 'Failed to store data' });
    }
});

// Retrieve and verify data
app.get('/api/data/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId as string; // Ideally from auth middleware

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = await tamperProofRepository.retrieveData(id);

        if (!data) {
            return res.status(404).json({ error: 'Data not found' });
        }

        if (data.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Verify integrity
        const isValid = await tamperProofRepository.verifyDataIntegrity(id);

        // Log audit
        await tamperProofRepository.addToAuditTrail({
            dataId: id,
            action: 'READ',
            userId,
            dataType: data.dataType,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: {
                ...data,
                isValid
            }
        });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

// Verify data integrity endpoint
app.post('/api/data/:id/verify', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const isValid = await tamperProofRepository.verifyDataIntegrity(id);

        res.json({
            success: true,
            isValid
        });
    } catch (error) {
        console.error('Error verifying data:', error);
        res.status(500).json({ error: 'Failed to verify data' });
    }
});

// Get user data list
app.get('/api/user/:userId/data', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const dataList = await tamperProofRepository.listUserData(userId);

        res.json({
            success: true,
            data: dataList
        });
    } catch (error) {
        console.error('Error listing user data:', error);
        res.status(500).json({ error: 'Failed to list user data' });
    }
});

const PORT = process.env.PORT || 3028;
app.listen(PORT, () => {
    console.log('🌟 Azora Tamper-Proof Data Service running on port', PORT);
    console.log('🔒 Database-backed integrity protection enabled');
});

export default app;
