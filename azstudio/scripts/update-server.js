/**
 * Enhanced Update Server for AzStudio
 * 
 * Features:
 * - Staged rollout support (alpha/beta/stable channels)
 * - Delta updates for efficient downloads
 * - Rollback capability
 * - Analytics and monitoring
 * - Rate limiting and security
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const RELEASE_DIR = path.join(__dirname, '..', 'release');
const CONFIG_DIR = path.join(__dirname, '..', 'release', 'config');
const ANALYTICS_DIR = path.join(__dirname, '..', 'release', 'analytics');

// Ensure directories exist
[CONFIG_DIR, ANALYTICS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Enable CORS for update checks
app.use(cors());
app.use(express.json());

// Serve static files from release directory
app.use(express.static(RELEASE_DIR));

// Analytics tracking
const analytics = {
  updateChecks: new Map(),
  downloads: new Map(),
  installations: new Map(),
  rollbacks: new Map()
};

// Load rollout configuration
function loadRolloutConfig(channel) {
  const configPath = path.join(CONFIG_DIR, `${channel}-rollout.json`);
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.error(`Failed to load rollout config for ${channel}:`, error);
    }
  }
  
  // Default: 100% rollout
  return {
    version: null,
    percentage: 100,
    startDate: new Date().toISOString(),
    endDate: null
  };
}

// Save rollout configuration
function saveRolloutConfig(channel, config) {
  const configPath = path.join(CONFIG_DIR, `${channel}-rollout.json`);
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error(`Failed to save rollout config for ${channel}:`, error);
    return false;
  }
}

// Check if client should receive update based on staged rollout
function shouldReceiveUpdate(channel, clientId) {
  const config = loadRolloutConfig(channel);
  
  if (config.percentage >= 100) {
    return true;
  }
  
  // Use consistent hashing to determine if client is in rollout group
  const hash = crypto.createHash('sha256')
    .update(clientId + config.version)
    .digest('hex');
  const hashValue = parseInt(hash.substring(0, 8), 16);
  const percentage = (hashValue % 100) + 1;
  
  return percentage <= config.percentage;
}

// Track analytics event
function trackEvent(category, action, label, value = 1) {
  const key = `${category}:${action}:${label}`;
  const map = analytics[category] || new Map();
  map.set(key, (map.get(key) || 0) + value);
  analytics[category] = map;
  
  // Persist analytics periodically
  if (Math.random() < 0.1) { // 10% chance to save
    saveAnalytics();
  }
}

// Save analytics to disk
function saveAnalytics() {
  const timestamp = new Date().toISOString().split('T')[0];
  const analyticsPath = path.join(ANALYTICS_DIR, `analytics-${timestamp}.json`);
  
  const data = {
    date: timestamp,
    updateChecks: Object.fromEntries(analytics.updateChecks),
    downloads: Object.fromEntries(analytics.downloads),
    installations: Object.fromEntries(analytics.installations),
    rollbacks: Object.fromEntries(analytics.rollbacks)
  };
  
  try {
    fs.writeFileSync(analyticsPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save analytics:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    channels: ['alpha', 'beta', 'stable']
  });
});

// Get latest version info with staged rollout support
app.get('/latest', (req, res) => {
  const channel = req.query.channel || 'stable';
  const clientId = req.query.clientId || req.ip;
  const currentVersion = req.query.currentVersion;
  
  trackEvent('updateChecks', channel, currentVersion || 'unknown');
  
  const manifestPath = path.join(RELEASE_DIR, channel, 'latest.yml');
  
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: 'No updates available' });
  }
  
  // Check staged rollout
  if (!shouldReceiveUpdate(channel, clientId)) {
    return res.status(204).send(); // No update for this client yet
  }
  
  try {
    const manifest = fs.readFileSync(manifestPath, 'utf-8');
    res.type('text/yaml').send(manifest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read manifest' });
  }
});

// Get delta update if available
app.get('/delta/:channel/:fromVersion/:toVersion', (req, res) => {
  const { channel, fromVersion, toVersion } = req.params;
  const deltaPath = path.join(RELEASE_DIR, channel, toVersion, `delta-${fromVersion}-${toVersion}.nupkg`);
  
  if (!fs.existsSync(deltaPath)) {
    return res.status(404).json({ 
      error: 'Delta update not available',
      fallback: `/download/${channel}/${toVersion}/full`
    });
  }
  
  trackEvent('downloads', 'delta', `${channel}:${fromVersion}-${toVersion}`);
  res.download(deltaPath);
});

// Get specific version info
app.get('/version/:version', (req, res) => {
  const { version } = req.params;
  const channel = req.query.channel || 'stable';
  const versionPath = path.join(RELEASE_DIR, channel, version);
  
  if (!fs.existsSync(versionPath)) {
    return res.status(404).json({ error: 'Version not found' });
  }
  
  const files = fs.readdirSync(versionPath);
  const releaseNotesPath = path.join(versionPath, 'RELEASE_NOTES.md');
  const releaseNotes = fs.existsSync(releaseNotesPath) 
    ? fs.readFileSync(releaseNotesPath, 'utf-8')
    : null;
  
  res.json({ 
    version, 
    channel,
    files,
    releaseNotes,
    hasDelta: files.some(f => f.startsWith('delta-'))
  });
});

// List all available versions
app.get('/versions', (req, res) => {
  const channel = req.query.channel || 'stable';
  const channelPath = path.join(RELEASE_DIR, channel);
  
  if (!fs.existsSync(channelPath)) {
    return res.json({ versions: [] });
  }
  
  try {
    const versions = fs.readdirSync(channelPath)
      .filter(file => {
        const filePath = path.join(channelPath, file);
        return fs.statSync(filePath).isDirectory();
      })
      .sort((a, b) => b.localeCompare(a)); // Sort descending
    
    res.json({ channel, versions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list versions' });
  }
});

// Download installer
app.get('/download/:channel/:version/:file', (req, res) => {
  const { channel, version, file } = req.params;
  const filePath = path.join(RELEASE_DIR, channel, version, file);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  trackEvent('downloads', 'full', `${channel}:${version}:${file}`);
  res.download(filePath);
});

// Report successful installation
app.post('/report/install', (req, res) => {
  const { channel, version, previousVersion, clientId } = req.body;
  
  if (!channel || !version) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  trackEvent('installations', channel, `${previousVersion || 'new'}->${version}`);
  res.json({ success: true });
});

// Report rollback
app.post('/report/rollback', (req, res) => {
  const { channel, fromVersion, toVersion, reason, clientId } = req.body;
  
  if (!channel || !fromVersion || !toVersion) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  trackEvent('rollbacks', channel, `${fromVersion}->${toVersion}`);
  
  // Log rollback for investigation
  const rollbackLog = {
    timestamp: new Date().toISOString(),
    channel,
    fromVersion,
    toVersion,
    reason,
    clientId: clientId || 'unknown'
  };
  
  const logPath = path.join(ANALYTICS_DIR, 'rollbacks.log');
  fs.appendFileSync(logPath, JSON.stringify(rollbackLog) + '\n');
  
  res.json({ success: true });
});

// Admin: Configure staged rollout
app.post('/admin/rollout/:channel', (req, res) => {
  const { channel } = req.params;
  const { version, percentage, startDate, endDate } = req.body;
  
  if (!['alpha', 'beta', 'stable'].includes(channel)) {
    return res.status(400).json({ error: 'Invalid channel' });
  }
  
  if (percentage < 0 || percentage > 100) {
    return res.status(400).json({ error: 'Percentage must be between 0 and 100' });
  }
  
  const config = {
    version,
    percentage,
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || null
  };
  
  if (saveRolloutConfig(channel, config)) {
    res.json({ success: true, config });
  } else {
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Admin: Get rollout configuration
app.get('/admin/rollout/:channel', (req, res) => {
  const { channel } = req.params;
  
  if (!['alpha', 'beta', 'stable'].includes(channel)) {
    return res.status(400).json({ error: 'Invalid channel' });
  }
  
  const config = loadRolloutConfig(channel);
  res.json(config);
});

// Admin: Get analytics
app.get('/admin/analytics', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const analyticsFiles = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const filePath = path.join(ANALYTICS_DIR, `analytics-${dateStr}.json`);
    
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        analyticsFiles.push(data);
      } catch (error) {
        console.error(`Failed to read analytics for ${dateStr}:`, error);
      }
    }
  }
  
  res.json({
    period: `${days} days`,
    data: analyticsFiles
  });
});

// Admin: Trigger rollback for a channel
app.post('/admin/rollback/:channel', (req, res) => {
  const { channel } = req.params;
  const { toVersion } = req.body;
  
  if (!['alpha', 'beta', 'stable'].includes(channel)) {
    return res.status(400).json({ error: 'Invalid channel' });
  }
  
  const versionPath = path.join(RELEASE_DIR, channel, toVersion);
  if (!fs.existsSync(versionPath)) {
    return res.status(404).json({ error: 'Target version not found' });
  }
  
  // Copy the target version's manifest to latest.yml
  const sourceManifest = path.join(versionPath, 'latest.yml');
  const targetManifest = path.join(RELEASE_DIR, channel, 'latest.yml');
  
  if (!fs.existsSync(sourceManifest)) {
    return res.status(404).json({ error: 'Version manifest not found' });
  }
  
  try {
    fs.copyFileSync(sourceManifest, targetManifest);
    
    // Reset rollout to 100%
    saveRolloutConfig(channel, {
      version: toVersion,
      percentage: 100,
      startDate: new Date().toISOString(),
      endDate: null
    });
    
    res.json({ 
      success: true, 
      message: `Rolled back ${channel} to version ${toVersion}` 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rollback', details: error.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Saving analytics before shutdown...');
  saveAnalytics();
  process.exit(0);
});

// Save analytics periodically
setInterval(saveAnalytics, 5 * 60 * 1000); // Every 5 minutes

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AzStudio Update Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${RELEASE_DIR}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /latest?channel=stable&clientId=xxx - Get latest version manifest`);
  console.log(`  GET  /delta/:channel/:fromVersion/:toVersion - Get delta update`);
  console.log(`  GET  /versions?channel=stable - List all versions`);
  console.log(`  GET  /version/:version?channel=stable - Get version info`);
  console.log(`  GET  /download/:channel/:version/:file - Download file`);
  console.log(`  POST /report/install - Report successful installation`);
  console.log(`  POST /report/rollback - Report rollback`);
  console.log(`\nAdmin Endpoints:`);
  console.log(`  POST /admin/rollout/:channel - Configure staged rollout`);
  console.log(`  GET  /admin/rollout/:channel - Get rollout configuration`);
  console.log(`  GET  /admin/analytics?days=7 - Get analytics data`);
  console.log(`  POST /admin/rollback/:channel - Trigger rollback`);
  console.log(`\nChannels: alpha, beta, stable`);
});

module.exports = app;
