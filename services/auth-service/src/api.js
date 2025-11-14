const express = require('express');
const { register, login, verifyEmail, forgotPassword, resetPassword, getProfile, refresh, logout } = require('./auth');
const { setupMfa, verifyMfa, disableMfa } = require('./mfa');
const { getSessions, revokeSession } = require('./session');
const { getPermissions } = require('./rbac');
const { handleGoogleOAuth, handleGitHubOAuth, handleAppleOAuth } = require('./oauth');
const { reportSafetyIncident } = require('./safety');

const router = express.Router();

// Core Authentication
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', getProfile);
router.post('/refresh', refresh);
router.post('/logout', logout);

// MFA
router.post('/mfa/setup', setupMfa);
router.post('/mfa/verify', verifyMfa);
router.post('/mfa/disable', disableMfa);

// Session Management
router.get('/sessions', getSessions);
router.delete('/sessions/:sessionId', revokeSession);

// RBAC
router.get('/permissions', getPermissions);

// OAuth
router.post('/auth/google/callback', handleGoogleOAuth);
router.post('/auth/github/callback', handleGitHubOAuth);
router.post('/auth/apple/callback', handleAppleOAuth);

// Safety
router.post('/safety/report', reportSafetyIncident);

module.exports = router;
