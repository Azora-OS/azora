// Azora OS Web API
// Cross-platform authentication and unity services

const express = require('express');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('dist'));

// In-memory storage for demo (use database in production)
let authTokens = new Map();
let deviceFingerprints = new Set();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        platform: 'web',
        timestamp: new Date().toISOString(),
        unity_features: [
            'cross_platform_authentication',
            'device_fingerprinting',
            'account_theft_protection',
            'real_time_sync'
        ]
    });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password, deviceFingerprint, platform, useBiometrics } = req.body;

        // Validate input
        if (!username || !password || !deviceFingerprint) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['username', 'password', 'deviceFingerprint']
            });
        }

        // Simulate authentication (replace with real auth logic)
        if (username === 'demo' && password === 'demo') {
            const token = crypto.randomBytes(32).toString('hex');
            const tokenData = {
                token,
                username,
                deviceFingerprint,
                platform: platform || 'web',
                issuedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                useBiometrics: useBiometrics || false
            };

            authTokens.set(token, tokenData);
            deviceFingerprints.add(deviceFingerprint);

            res.json({
                success: true,
                token,
                user: { username },
                deviceFingerprint,
                platform: tokenData.platform,
                expiresAt: tokenData.expiresAt
            });
        } else {
            res.status(401).json({
                error: 'Invalid credentials',
                platform: platform || 'web'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/validate', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const tokenData = authTokens.get(token);

        if (!tokenData) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Check if token is expired
        if (new Date() > new Date(tokenData.expiresAt)) {
            authTokens.delete(token);
            return res.status(401).json({ error: 'Token expired' });
        }

        res.json({
            valid: true,
            user: { username: tokenData.username },
            deviceFingerprint: tokenData.deviceFingerprint,
            platform: tokenData.platform
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/sign', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.substring(7);
        const tokenData = authTokens.get(token);

        if (!tokenData) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const { data, deviceFingerprint, timestamp } = req.body;

        if (!data || !deviceFingerprint) {
            return res.status(400).json({ error: 'Missing data or deviceFingerprint' });
        }

        // Verify device fingerprint matches token
        if (deviceFingerprint !== tokenData.deviceFingerprint) {
            return res.status(403).json({ error: 'Device fingerprint mismatch' });
        }

        // Create signature
        const signatureData = `${data}|${deviceFingerprint}|${timestamp}`;
        const signature = crypto.createHash('sha256').update(signatureData).digest('hex');

        res.json({
            signature,
            signedData: data,
            deviceFingerprint,
            timestamp: timestamp || new Date().toISOString(),
            platform: tokenData.platform
        });
    } catch (error) {
        console.error('Signing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/verify', (req, res) => {
    try {
        const { data, signature, timestamp } = req.body;

        if (!data || !signature) {
            return res.status(400).json({ error: 'Missing data or signature' });
        }

        // Recreate signature for verification
        const expectedSignatureData = `${data}||${timestamp || ''}`;
        const expectedSignature = crypto.createHash('sha256').update(expectedSignatureData).digest('hex');

        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );

        res.json({
            isValid,
            verifiedData: data,
            timestamp: timestamp || new Date().toISOString()
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/lock', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.substring(7);
        const tokenData = authTokens.get(token);

        if (!tokenData) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Lock account across all platforms (invalidate token)
        authTokens.delete(token);

        // In production, this would trigger cross-platform account locking
        res.json({
            success: true,
            message: 'Account locked across all platforms',
            lockedAt: new Date().toISOString(),
            platform: tokenData.platform
        });
    } catch (error) {
        console.error('Account lock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/trust', (req, res) => {
    try {
        const { deviceFingerprint, platform, timestamp } = req.body;

        if (!deviceFingerprint) {
            return res.status(400).json({ error: 'Missing deviceFingerprint' });
        }

        // Check if device is in trusted fingerprints
        const isTrusted = deviceFingerprints.has(deviceFingerprint);

        res.json({
            isTrusted,
            deviceFingerprint,
            platform: platform || 'web',
            timestamp: timestamp || new Date().toISOString(),
            trustLevel: isTrusted ? 'high' : 'unknown'
        });
    } catch (error) {
        console.error('Device trust check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Unity endpoints
app.get('/api/unity/status', (req, res) => {
    res.json({
        unity_status: 'active',
        platforms_connected: ['web', 'android', 'ios', 'windows', 'linux'],
        cross_platform_sync: 'enabled',
        account_theft_protection: 'active',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/unity/sync', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.substring(7);
        const tokenData = authTokens.get(token);

        if (!tokenData) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Simulate cross-platform sync
        res.json({
            sync_status: 'completed',
            platforms_synced: ['web', 'android', 'ios', 'windows', 'linux'],
            data_synced: ['user_profile', 'preferences', 'security_settings'],
            last_sync: new Date().toISOString(),
            next_sync: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
            platform: tokenData.platform
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Constitution endpoint
app.get('/api/constitution/status', (req, res) => {
    res.json({
        constitutional_compliance: 'active',
        founder_compensation_system: 'operational',
        reference: 'Article VII, Section 3',
        last_audit: new Date().toISOString(),
        compliance_level: 'high'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /api/health',
            'POST /api/auth/login',
            'GET /api/auth/validate',
            'POST /api/auth/sign',
            'POST /api/auth/verify',
            'POST /api/auth/lock',
            'POST /api/auth/trust',
            'GET /api/unity/status',
            'POST /api/unity/sync',
            'GET /api/constitution/status'
        ]
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🌐 Azora OS Web API running on port ${PORT}`);
        console.log(`📱 Cross-platform unity features enabled`);
        console.log(`🔐 Constitutional compliance active`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
}

module.exports = app;