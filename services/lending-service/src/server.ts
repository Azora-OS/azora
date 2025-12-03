import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { lendingRepository } from './lending-repository';

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// 🏦 AZORA LENDING SERVICE
console.log('🌟 Azora Lending Service - Initializing...');

// 🎯 API ROUTES
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        const stats = await lendingRepository.getStats();
        res.json({
            status: 'healthy',
            service: 'lending-service',
            ubuntu: 'I lend because we grow together',
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});

// Get loan products
app.get('/api/products', async (req: Request, res: Response) => {
    try {
        const products = await lendingRepository.getActiveLoanProducts();
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ error: 'Failed to get loan products' });
    }
});

// Apply for a loan
app.post('/api/loans', async (req: Request, res: Response) => {
    try {
        const { userId, productId, amount } = req.body;

        if (!userId || !productId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const loan = await lendingRepository.createLoan({
            userId,
            productId,
            amount,
            startDate: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Loan application submitted',
            data: loan
        });
    } catch (error) {
        console.error('Error creating loan:', error);
        res.status(500).json({ error: 'Failed to create loan' });
    }
});

// Get user loans
app.get('/api/loans/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const loans = await lendingRepository.getUserLoans(userId);

        res.json({
            success: true,
            data: loans
        });
    } catch (error) {
        console.error('Error getting user loans:', error);
        res.status(500).json({ error: 'Failed to get user loans' });
    }
});

// Get loan details
app.get('/api/loan/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const loan = await lendingRepository.getLoan(id);

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        res.json({
            success: true,
            data: loan
        });
    } catch (error) {
        console.error('Error getting loan:', error);
        res.status(500).json({ error: 'Failed to get loan' });
    }
});

// Add collateral
app.post('/api/loan/:id/collateral', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type, value, description } = req.body;

        const collateral = await lendingRepository.addCollateral({
            loanId: id,
            type,
            value,
            description
        });

        res.status(201).json({
            success: true,
            data: collateral
        });
    } catch (error) {
        console.error('Error adding collateral:', error);
        res.status(500).json({ error: 'Failed to add collateral' });
    }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log('🌟 Azora Lending Service running on port', PORT);
    console.log('🏦 Database-backed lending enabled');
});

export default app;
