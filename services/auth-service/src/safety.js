const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'azora-secret-key-2025';

const reportSafetyIncident = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { type, severity, latitude, longitude, description } = req.body;

    if (!type || !severity || !latitude || !longitude || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const incident = await prisma.safetyIncident.create({
      data: {
        userId: decoded.userId,
        type,
        severity,
        latitude,
        longitude,
        description
      }
    });

    res.json({ success: true, incident });
  } catch (error) {
    console.error('Report safety incident error:', error);
    res.status(500).json({ error: 'Failed to report safety incident' });
  }
};

module.exports = { reportSafetyIncident };
