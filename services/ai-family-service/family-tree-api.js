
// Family Tree API for the AI Family

const express = require('express');
const personalityManager = require('./personality-manager');
const chatEngine = require('./chat-engine');

const app = express();
app.use(express.json());

// Get all personalities
app.get('/personalities', (req, res) => {
    res.json(personalityManager.getAllPersonalities());
});

// Get a specific personality
app.get('/personalities/:name', (req, res) => {
    const personality = personalityManager.getPersonality(req.params.name);
    if (personality) {
        res.json(personality.getPersonality());
    } else {
        res.status(404).send('Personality not found');
    }
});

// Switch personality
app.post('/chat/personality', (req, res) => {
    const { name } = req.body;
    const result = chatEngine.setPersonality(name);
    res.send(result);
});

// Send a chat message
app.post('/chat/message', (req, res) => {
    const { message } = req.body;
    const response = chatEngine.sendMessage(message);
    res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`AI Family Service listening on port ${PORT}`);
});

module.exports = app;
