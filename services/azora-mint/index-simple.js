const express = require('express');
const app = express();

app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'azora-mint',
        timestamp: new Date()
    });
});

const PORT = process.env.PORT || 3080;
app.listen(PORT, () => console.log(`Azora Mint on ${PORT}`));
module.exports = app;
