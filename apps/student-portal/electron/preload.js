/**
 * Azora Student Portal - Electron Preload Script
 * 
 * This script runs before the web page loads and exposes safe APIs to the renderer process.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use ipcRenderer
// without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Store operations
  store: {
    get: (key) => ipcRenderer.invoke('get-store-value', key),
    set: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
    delete: (key) => ipcRenderer.invoke('delete-store-value', key),
  },

  // Window controls
  window: {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
  },

  // Auto-updater
  updater: {
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback),
    restartApp: () => ipcRenderer.send('restart-app'),
  },

  // Mining operations
  mining: {
    start: (config) => ipcRenderer.invoke('start-mining', config),
    stop: () => ipcRenderer.invoke('stop-mining'),
    getStats: () => ipcRenderer.invoke('get-mining-stats'),
  },

  // System info
  system: {
    getInfo: () => ipcRenderer.invoke('get-system-info'),
  },

  // Notifications
  notification: {
    show: (title, body) => ipcRenderer.send('show-notification', { title, body }),
  },

  // Platform detection
  platform: process.platform,
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
});

// Log that preload script has loaded
console.log('✅ Electron preload script loaded');
console.log(`🖥️  Platform: ${process.platform}`);
