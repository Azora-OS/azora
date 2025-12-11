import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import educationRoutes from './routes/education';
import authenticateToken from './middleware/auth';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Inject prisma into requests
app.use((req, res, next) => {
  (req as any).prisma = prisma;
  next();
});

app.use(authenticateToken);

app.use('/api/sapiens', educationRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(port, () => {
  console.log(`[sapiens-education-service] running on port ${port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
