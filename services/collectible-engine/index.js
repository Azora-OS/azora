import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Generate Collectible Card SVG
app.post('/generate-card', (req, res) => {
    const { username, stats, rarity } = req.body;

    // Real SVG generation logic
    const color = rarity === 'legendary' ? '#FFD700' : rarity === 'rare' ? '#C0C0C0' : '#CD7F32';

    const svg = `
    <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1e1e1e" rx="15" />
      <rect x="10" y="10" width="280" height="380" fill="none" stroke="${color}" stroke-width="5" rx="10" />
      <text x="150" y="50" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${username}</text>
      <text x="150" y="350" font-family="Arial" font-size="18" fill="${color}" text-anchor="middle">${rarity.toUpperCase()}</text>
      <text x="20" y="100" font-family="Arial" font-size="14" fill="#ccc">Commits: ${stats.commits}</text>
      <text x="20" y="130" font-family="Arial" font-size="14" fill="#ccc">PRs: ${stats.prs}</text>
    </svg>
  `;

    res.json({ svg });
});

app.listen(PORT, () => {
    console.log(`Collectible Engine running on port ${PORT}`);
});
