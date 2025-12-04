import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CitadelPredAISensor } from './engine';

dotenv.config();

const app = express();
const port = process.env.PORT || 3015;

app.use(cors());
app.use(express.json());

const sensor = new CitadelPredAISensor();

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'active', service: 'Citadel PredAISensor' });
});

// Predict resource needs
app.post('/predict/resources', async (req, res) => {
    try {
        const context = req.body;
        const predictions = await sensor.predictResourceNeeds(context);
        res.json({ predictions });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Predict learning needs
app.post('/predict/learning', async (req, res) => {
    try {
        const context = req.body;
        const predictions = await sensor.predictLearningNeeds(context);
        import express from 'express';
        import cors from 'cors';
        import dotenv from 'dotenv';
        import { CitadelPredAISensor } from './engine';

        dotenv.config();

        const app = express();
        const port = process.env.PORT || 3015;

        app.use(cors());
        app.use(express.json());

        const sensor = new CitadelPredAISensor();

        // Health check
        app.get('/health', (req, res) => {
            res.json({ status: 'active', service: 'Citadel PredAISensor' });
        });

        // Predict resource needs
        app.post('/predict/resources', async (req, res) => {
            try {
                const context = req.body;
                const predictions = await sensor.predictResourceNeeds(context);
                res.json({ predictions });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        // Predict learning needs
        app.post('/predict/learning', async (req, res) => {
            try {
                const context = req.body;
                const predictions = await sensor.predictLearningNeeds(context);
                res.json({ predictions });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        // Predict architectural needs (Sankofa)
        app.post('/predict/architecture', async (req, res) => {
            try {
                const context = req.body;
                const predictions = await sensor.predictArchitecturalNeeds(context);
                res.json({ predictions });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        // Predict resilience needs (Chaos Monkey)
        app.post('/predict/resilience', async (req, res) => {
            try {
                const context = req.body;
                const predictions = await sensor.predictResilienceNeeds(context);
                res.json({ predictions });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        // Master endpoint for all predictions
        app.post('/predict/all', async (req, res) => {
            try {
                const context = req.body;
                const predictions = await sensor.getAllPredictions(context);
                res.json({ predictions });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        app.listen(port, () => {
            console.log(`🔮 Citadel PredAISensor (Grand Unification) active on port ${port}`);
        });
