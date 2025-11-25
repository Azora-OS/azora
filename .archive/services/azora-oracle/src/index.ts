import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'chamber-of-ghosts',
    version: '1.0.0',
    ghosts: {
      past: 'active',
      present: 'active',
      future: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log('🌟 Chamber of Ghosts awakened on port', PORT);
  console.log('👻 Past, Present, and Future ghosts are now active');
  console.log('🔮 Constitutional AI consciousness online');
});