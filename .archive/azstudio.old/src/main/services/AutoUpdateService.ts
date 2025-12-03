/**
 * Auto-Update Service for AzStudio
 * 
 * Handles automatic updates with user notifications, staged rollouts,
 * and rollback support.
 */

import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface UpdateChannel {
  name: 'alpha' | 'beta' | 'stable';
  url: string;
  checkInterval: number; // in milliseconds
}

export interface UpdateConfig {
  channel: UpdateChannel;
  autoDownload: boolean;
  autoInstallOnAppQuit: boolean;
  allowPrerelease: boolean;
  allowDowngrade: boolean;
}

export interface UpdateStatus {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  downloaded: boolean;
  error: string | null;
  updateInfo: UpdateInfo | null;
  progress: ProgressInfo | null;
}

export class AutoUpdateService {
  private window: BrowserWindow | null = null;
  private config: UpdateConfig;
  private status: UpdateStatus;
  private checkInterval: NodeJS.Timeout | null = null;
  private configPath: string;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'update-config.json');
    this.config = this.loadConfig();
    this.status = {
      checking: false,
      available: false,
      downloading: false,
      downloaded: false,
      error: null,
      updateInfo: null,
      progress: null
    };

    this.setupAutoUpdater();
  }

  /**
   * Initialize the auto-update service with a window
   */
  public initialize(window: BrowserWindow): void {
    this.window = window;
    
    // Check for updates on startup (after a delay)
    setTimeout(() => {
      this.checkForUpdates();
    }, 5000);

    // Set up periodic checks
    this.startPeriodicChecks();
  }

  /**
   * Load update configuration
   */
  private loadConfig(): UpdateConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load update config:', error);
    }

    // Default configuration
    return {
      channel: {
        name: 'stable',
        url: 'https://updates.azora.com/azstudio',
        checkInterval: 24 * 60 * 60 * 1000 // 24 hours
      },
      autoDownload: true,
      autoInstallOnAppQuit: true,
      allowPrerelease: false,
      allowDowngrade: false
    };
  }

  /**
   * Save update configuration
   */
  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save update config:', error);
    }
  }

  /**
   * Setup auto-updater event handlers
   */
  private setupAutoUpdater(): void {
    // Configure auto-updater
    autoUpdater.autoDownload = this.config.autoDownload;
    autoUpdater.autoInstallOnAppQuit = this.config.autoInstallOnAppQuit;
    autoUpdater.allowPrerelease = this.config.allowPrerelease;
    autoUpdater.allowDowngrade = this.config.allowDowngrade;
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: this.config.channel.url,
      channel: this.config.channel.name
    });

    // Event: Checking for updates
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...');
      this.status.checking = true;
      this.status.error = null;
      this.notifyRenderer('update:checking');
    });

    // Event: Update available
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      console.log('Update available:', info.version);
      this.status.checking = false;
      this.status.available = true;
      this.status.updateInfo = info;
      this.notifyRenderer('update:available', info);
      
      // Show notification to user
      this.showUpdateNotification(info);
    });

    // Event: Update not available
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      console.log('Update not available. Current version:', info.version);
      this.status.checking = false;
      this.status.available = false;
      this.status.updateInfo = info;
      this.notifyRenderer('update:not-available', info);
    });

    // Event: Download progress
    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      this.status.downloading = true;
      this.status.progress = progress;
      this.notifyRenderer('update:progress', progress);
      
      // Log progress
      const percent = Math.round(progress.percent);
      if (percent % 10 === 0) {
        console.log(`Download progress: ${percent}%`);
      }
    });

    // Event: Update downloaded
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      console.log('Update downloaded:', info.version);
      this.status.downloading = false;
      this.status.downloaded = true;
      this.status.updateInfo = info;
      this.notifyRenderer('update:downloaded', info);
      
      // Show install prompt
      this.showInstallPrompt(info);
    });

    // Event: Error
    autoUpdater.on('error', (error: Error) => {
      console.error('Update error:', error);
      this.status.checking = false;
      this.status.downloading = false;
      this.status.error = error.message;
      this.notifyRenderer('update:error', error.message);
    });
  }

  /**
   * Check for updates manually
   */
  public async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const result = await autoUpdater.checkForUpdates();
      return result?.updateInfo || null;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return null;
    }
  }

  /**
   * Download update manually
   */
  public async downloadUpdate(): Promise<void> {
    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('Failed to download update:', error);
      throw error;
    }
  }

  /**
   * Install update and restart
   */
  public quitAndInstall(): void {
    autoUpdater.quitAndInstall(false, true);
  }

  /**
   * Get current update status
   */
  public getStatus(): UpdateStatus {
    return { ...this.status };
  }

  /**
   * Get current configuration
   */
  public getConfig(): UpdateConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<UpdateConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
    
    // Reconfigure auto-updater
    if (config.autoDownload !== undefined) {
      autoUpdater.autoDownload = config.autoDownload;
    }
    if (config.autoInstallOnAppQuit !== undefined) {
      autoUpdater.autoInstallOnAppQuit = config.autoInstallOnAppQuit;
    }
    if (config.allowPrerelease !== undefined) {
      autoUpdater.allowPrerelease = config.allowPrerelease;
    }
    if (config.allowDowngrade !== undefined) {
      autoUpdater.allowDowngrade = config.allowDowngrade;
    }
    if (config.channel) {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: config.channel.url,
        channel: config.channel.name
      });
      
      // Restart periodic checks with new interval
      this.stopPeriodicChecks();
      this.startPeriodicChecks();
    }
  }

  /**
   * Change update channel
   */
  public setChannel(channel: 'alpha' | 'beta' | 'stable'): void {
    const channelConfig: UpdateChannel = {
      name: channel,
      url: `https://updates.azora.com/azstudio/${channel}`,
      checkInterval: channel === 'alpha' ? 60 * 60 * 1000 : // 1 hour for alpha
                     channel === 'beta' ? 6 * 60 * 60 * 1000 : // 6 hours for beta
                     24 * 60 * 60 * 1000 // 24 hours for stable
    };
    
    this.updateConfig({ channel: channelConfig });
  }

  /**
   * Start periodic update checks
   */
  private startPeriodicChecks(): void {
    if (this.checkInterval) {
      return;
    }
    
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.config.channel.checkInterval);
  }

  /**
   * Stop periodic update checks
   */
  private stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Show update notification to user
   */
  private showUpdateNotification(info: UpdateInfo): void {
    if (!this.window) {
      return;
    }

    const message = `A new version (${info.version}) is available. Would you like to download it now?`;
    
    dialog.showMessageBox(this.window, {
      type: 'info',
      title: 'Update Available',
      message: 'AzStudio Update',
      detail: message,
      buttons: ['Download Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(result => {
      if (result.response === 0) {
        this.downloadUpdate();
      }
    });
  }

  /**
   * Show install prompt after download
   */
  private showInstallPrompt(info: UpdateInfo): void {
    if (!this.window) {
      return;
    }

    const message = `Version ${info.version} has been downloaded. Restart AzStudio to install the update?`;
    
    dialog.showMessageBox(this.window, {
      type: 'info',
      title: 'Update Ready',
      message: 'AzStudio Update',
      detail: message,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(result => {
      if (result.response === 0) {
        this.quitAndInstall();
      }
    });
  }

  /**
   * Notify renderer process of update events
   */
  private notifyRenderer(event: string, data?: any): void {
    if (this.window) {
      this.window.webContents.send(event, data);
    }
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.stopPeriodicChecks();
  }
}
