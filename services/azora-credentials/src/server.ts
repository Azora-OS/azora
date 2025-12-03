import express from 'express';
import dotenv from 'dotenv';
import credentialRoutes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4010;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-credentials' });
});

// Routes
app.use('/api/credentials', credentialRoutes);

app.listen(PORT, () => {
    console.log(`🎓 Azora Credentials Service running on port ${PORT}`);
    console.log(`📊 Tracking learning and building credits`);
    console.log(`🏆 Managing Azora Sapiens Academy credentials`);
});

export default app;
