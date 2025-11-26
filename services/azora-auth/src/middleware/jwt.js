const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_ALGORITHM = 'RS256';
const TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

const revokedTokens = new Set();

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

function generateAccessToken(payload) {
  return jwt.sign(payload, privateKey, {
    algorithm: JWT_ALGORITHM,
    expiresIn: TOKEN_EXPIRY
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, privateKey, {
    algorithm: JWT_ALGORITHM,
    expiresIn: REFRESH_TOKEN_EXPIRY
  });
}

function verifyToken(token) {
  if (revokedTokens.has(token)) {
    throw new Error('Token has been revoked');
  }
  return jwt.verify(token, publicKey, { algorithms: [JWT_ALGORITHM] });
}

function revokeToken(token) {
  revokedTokens.add(token);
  setTimeout(() => revokedTokens.delete(token), 3600000);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  revokeToken,
  authenticateToken,
  publicKey,
  privateKey
};
