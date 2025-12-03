const express = require('express');
const router = express.Router();
const { generateAccessToken, generateRefreshToken } = require('../middleware/jwt');

// OAuth Configuration
const OAUTH_PROVIDERS = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4004/api/oauth/google/callback',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:4004/api/oauth/github/callback',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user'
  }
};

// Google OAuth
router.get('/google', (req, res) => {
  const config = OAUTH_PROVIDERS.google;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  });
  res.redirect(`${config.authUrl}?${params}`);
});

router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.status(400).json({ error: 'OAuth authorization failed', details: error });
  }

  try {
    const config = OAUTH_PROVIDERS.google;
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();
    
    const userResponse = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const userInfo = await userResponse.json();
    
    const user = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      provider: 'google',
      role: 'student'
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'OAuth authentication failed', details: err.message });
  }
});

// GitHub OAuth
router.get('/github', (req, res) => {
  const config = OAUTH_PROVIDERS.github;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: 'user:email'
  });
  res.redirect(`${config.authUrl}?${params}`);
});

router.get('/github/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.status(400).json({ error: 'OAuth authorization failed', details: error });
  }

  try {
    const config = OAUTH_PROVIDERS.github;
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri
      })
    });

    const tokens = await tokenResponse.json();
    
    const userResponse = await fetch(config.userInfoUrl, {
      headers: { 
        Authorization: `Bearer ${tokens.access_token}`,
        'User-Agent': 'Azora-Auth'
      }
    });
    
    const userInfo = await userResponse.json();
    
    const user = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || userInfo.login,
      picture: userInfo.avatar_url,
      provider: 'github',
      role: 'student'
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'OAuth authentication failed', details: err.message });
  }
});

module.exports = router;
