import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { kycRepository } from './kyc-repository';

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(compression());

// Input validation middleware
const validateInput = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
                req.body[key] = req.body[key].replace(/javascript:/gi, '');
            }
        });
    }
    next();
};
app.use(validateInput);

app.use(express.json({ limit: '10mb' }));

// 🔍 AZORA KYC/AML - COMPLIANCE & VERIFICATION
console.log('🌟 Azora KYC/AML Service - Initializing...');

// 🎯 API ROUTES
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        const stats = await kycRepository.getVerificationStats();
        res.json({
            status: 'healthy',
            service: 'kyc-aml-service',
            ubuntu: 'I verify because we trust together',
            verifications: stats.total,
            pending: stats.pending,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});

// Submit KYC verification
app.post('/api/kyc/verify', async (req: Request, res: Response) => {
    try {
        const { userId, documentType, documentData } = req.body;

        if (!userId || !documentType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const verification = await kycRepository.createVerification({
            userId,
            documentType,
            documentData,
            riskLevel: 'LOW'
        });

        // Log compliance audit
        await kycRepository.logComplianceAudit({
            userId,
            action: 'VERIFICATION_SUBMITTED',
            details: {
                verificationId: verification.id,
                documentType,
                submissionMethod: 'api'
            },
            performedBy: userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        // Create initial risk assessment
        await kycRepository.createRiskAssessment({
            userId,
            assessmentType: 'AML',
            riskScore: 10,
            riskLevel: 'LOW',
            factors: {
                documentType,
                submissionMethod: 'api',
                initialAssessment: true
            },
            recommendations: 'Pending manual review',
            assessedBy: 'system'
        });

        res.status(201).json({
            success: true,
            message: 'KYC verification submitted',
            data: verification
        });
    } catch (error) {
        console.error('Error submitting verification:', error);
        res.status(500).json({ error: 'Failed to submit verification' });
    }
});

// Get verification status
app.get('/api/kyc/:userId/status', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const userVerifications = await kycRepository.getUserVerifications(userId);

        if (!userVerifications || userVerifications.length === 0) {
            return res.status(404).json({ error: 'No verification found' });
        }

        // Get latest verification
        const latestVerification = userVerifications[0];

        // Get latest risk assessment
        const riskAssessment = await kycRepository.getLatestRiskAssessment(userId, 'AML');

        res.json({
            success: true,
            data: {
                verification: latestVerification,
                riskAssessment,
                totalVerifications: userVerifications.length
            }
        });
    } catch (error) {
        console.error('Error getting verification status:', error);
        res.status(500).json({ error: 'Failed to get verification status' });
    }
});

// Get all verifications (admin)
app.get('/api/kyc/verifications', async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        let verifications;
        if (status && typeof status === 'string') {
            verifications = await kycRepository.getVerificationsByStatus(status);
        } else {
            const stats = await kycRepository.getVerificationStats();
            verifications = [];
            res.json({
                success: true,
                data: {
                    stats,
                    message: 'Use ?status=PENDING|APPROVED|REJECTED to filter'
                }
            });
            return;
        }

        res.json({
            success: true,
            data: verifications
        });
    } catch (error) {
        console.error('Error getting verifications:', error);
        res.status(500).json({ error: 'Failed to get verifications' });
    }
});

// Update verification status (admin)
app.put('/api/kyc/verify/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, reviewedBy, reviewNotes } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const verification = await kycRepository.updateVerificationStatus(
            id,
            status,
            reviewedBy,
            reviewNotes
        );

        // Log compliance audit
        await kycRepository.logComplianceAudit({
            userId: verification.userId,
            action: `VERIFICATION_${status}`,
            details: {
                verificationId: id,
                status,
                reviewedBy,
                reviewNotes
            },
            performedBy: reviewedBy || 'system',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Verification status updated',
            data: verification
        });
    } catch (error) {
        console.error('Error updating verification:', error);
        res.status(500).json({ error: 'Failed to update verification' });
    }
});

// Get risk assessments
app.get('/api/kyc/:userId/risk', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const assessments = await kycRepository.getUserRiskAssessments(userId);

        res.json({
            success: true,
            data: assessments
        });
    } catch (error) {
        console.error('Error getting risk assessments:', error);
        res.status(500).json({ error: 'Failed to get risk assessments' });
    }
});

// Get high risk users (admin)
app.get('/api/kyc/high-risk', async (req: Request, res: Response) => {
    try {
        const highRiskUsers = await kycRepository.getHighRiskUsers();

        res.json({
            success: true,
            data: highRiskUsers
        });
    } catch (error) {
        console.error('Error getting high risk users:', error);
        res.status(500).json({ error: 'Failed to get high risk users' });
    }
});

// Get audit trail
app.get('/api/kyc/:userId/audit', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

        const auditTrail = await kycRepository.getUserAuditTrail(userId, limit);

        res.json({
            success: true,
            data: auditTrail
        });
    } catch (error) {
        console.error('Error getting audit trail:', error);
        res.status(500).json({ error: 'Failed to get audit trail' });
    }
});

// Get statistics (admin)
app.get('/api/kyc/stats', async (req: Request, res: Response) => {
    try {
        const verificationStats = await kycRepository.getVerificationStats();
        const riskDistribution = await kycRepository.getRiskDistribution();

        res.json({
            success: true,
            data: {
                verifications: verificationStats,
                riskDistribution
            }
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

const PORT = process.env.PORT || 3027;
app.listen(PORT, () => {
    console.log('🌟 Azora KYC/AML Service running on port', PORT);
    console.log('🔍 Database-backed compliance and verification');
    console.log('🛡️ Constitutional AI Operating System');
});

export default app;
