#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

class MobileService {
  constructor() {
    this.apps = new Map();
    this.builds = [];
    this.notifications = [];
    this.initApps();
  }

  initApps() {
    this.apps.set('student-portal', {
      id: 'student-portal',
      name: 'Azora Student Portal',
      platform: 'react-native',
      version: '1.0.0',
      features: ['offline-learning', 'push-notifications', 'biometric-auth'],
      status: 'development'
    });
  }

  createBuild(appId, platform, config = {}) {
    const build = {
      id: `build_${Date.now()}`,
      appId,
      platform,
      version: config.version || '1.0.0',
      buildNumber: Date.now(),
      status: 'building',
      startedAt: new Date(),
      config
    };

    this.builds.push(build);
    this.simulateBuild(build);
    return build;
  }

  simulateBuild(build) {
    const steps = [
      'Initializing build environment',
      'Installing dependencies',
      'Compiling React Native code',
      'Bundling JavaScript',
      'Generating native code',
      'Building APK/IPA',
      'Running tests',
      'Build complete'
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      build.currentStep = steps[step - 1];
      build.progress = Math.round((step / steps.length) * 100);

      if (step >= steps.length) {
        build.status = 'completed';
        build.completedAt = new Date();
        build.downloadUrl = `https://builds.azora.world/${build.id}/${build.platform}`;
        clearInterval(interval);
      }
    }, 2000);
  }

  sendPushNotification(userId, notification) {
    const push = {
      id: `push_${Date.now()}`,
      userId,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sentAt: new Date(),
      status: 'sent'
    };

    this.notifications.push(push);
    return push;
  }

  generateAppConfig(appId, platform) {
    const baseConfig = {
      appId,
      platform,
      apiUrl: 'https://api.azora.world',
      features: {
        offlineLearning: true,
        pushNotifications: true,
        biometricAuth: true,
        darkMode: true
      },
      theme: {
        primaryColor: '#9333EA',
        secondaryColor: '#4ECDC4',
        accentColor: '#FFD700'
      }
    };

    if (platform === 'ios') {
      baseConfig.bundleId = 'world.azora.student';
      baseConfig.teamId = 'AZORA_TEAM_ID';
    } else if (platform === 'android') {
      baseConfig.packageName = 'world.azora.student';
      baseConfig.keystore = 'azora-release.keystore';
    }

    return baseConfig;
  }

  getOfflineCapabilities() {
    return {
      courses: {
        downloadable: true,
        storage: 'local-sqlite',
        syncStrategy: 'incremental'
      },
      videos: {
        downloadable: true,
        quality: ['720p', '480p', '360p'],
        compression: 'h264'
      },
      assessments: {
        offline: true,
        syncOnConnection: true
      },
      progress: {
        localTracking: true,
        syncInterval: '5min'
      }
    };
  }
}

const mobile = new MobileService();

app.get('/api/apps', (req, res) => {
  res.json({ success: true, data: Array.from(mobile.apps.values()) });
});

app.post('/api/builds', (req, res) => {
  try {
    const { appId, platform, config } = req.body;
    const build = mobile.createBuild(appId, platform, config);
    res.json({ success: true, data: build });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/builds', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const builds = mobile.builds.slice(-limit);
  res.json({ success: true, data: builds });
});

app.get('/api/builds/:id', (req, res) => {
  const build = mobile.builds.find(b => b.id === req.params.id);
  if (!build) {
    return res.status(404).json({ success: false, error: 'Build not found' });
  }
  res.json({ success: true, data: build });
});

app.post('/api/notifications/send', (req, res) => {
  try {
    const { userId, notification } = req.body;
    const push = mobile.sendPushNotification(userId, notification);
    res.json({ success: true, data: push });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/config/:appId/:platform', (req, res) => {
  try {
    const config = mobile.generateAppConfig(req.params.appId, req.params.platform);
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/offline-capabilities', (req, res) => {
  const capabilities = mobile.getOfflineCapabilities();
  res.json({ success: true, data: capabilities });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Mobile Service',
    status: 'healthy',
    timestamp: new Date(),
    stats: { apps: mobile.apps.size, builds: mobile.builds.length },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4020;
app.listen(PORT, () => {
  console.log(`📱 Mobile Service running on port ${PORT}`);
});

module.exports = app;