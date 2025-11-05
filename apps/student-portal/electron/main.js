/**
 * Azora Student Portal - Electron Main Process
 * 
 * This file creates the desktop application window and handles system-level operations.
 */

const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');

// Initialize electron-store for persistent data
const store = new Store();

let mainWindow;
let tray;

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    icon: path.join(__dirname, '../public/branding/icon.png'),
    titleBarStyle: 'hidden',
    backgroundColor: '#000000',
    show: false, // Don't show until ready
  });

  // Load the app
  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startURL);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Auto-update in production
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create system tray
  createTray();
}

// Create system tray icon
function createTray() {
  const iconPath = path.join(__dirname, '../public/branding/tray-icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Azora',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Hide',
      click: () => {
        mainWindow.hide();
      },
    },
    { type: 'separator' },
    {
      label: 'Mining Status',
      submenu: [
        { label: 'Active', type: 'radio', checked: true },
        { label: 'Paused', type: 'radio' },
        { label: 'Stopped', type: 'radio' },
      ],
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Azora Student Portal');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// App lifecycle events
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('delete-store-value', (event, key) => {
  store.delete(key);
  return true;
});

ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available');
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('App is up to date');
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater: ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  sendStatusToWindow(log_message);
  mainWindow.webContents.send('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
  mainWindow.webContents.send('update-downloaded', info);
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});

function sendStatusToWindow(text) {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', text);
  }
}

// Mining control (for Mint-Mine Engine)
ipcMain.handle('start-mining', async (event, config) => {
  // Implement mining logic here
  return { success: true, message: 'Mining started' };
});

ipcMain.handle('stop-mining', async () => {
  // Implement stop mining logic
  return { success: true, message: 'Mining stopped' };
});

ipcMain.handle('get-mining-stats', async () => {
  // Return current mining statistics
  return {
    active: false,
    hashrate: '0 H/s',
    earnings: '0 AZR',
    uptime: '0h 0m',
  };
});

// System info
ipcMain.handle('get-system-info', async () => {
  const os = require('os');
  return {
    platform: process.platform,
    arch: process.arch,
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    appVersion: app.getVersion(),
  };
});

// Notification support
ipcMain.on('show-notification', (event, { title, body }) => {
  const { Notification } = require('electron');
  new Notification({ title, body }).show();
});

console.log('🚀 Azora Student Portal - Electron Main Process Started');
console.log(`📦 Version: ${app.getVersion()}`);
console.log(`🔧 Development Mode: ${isDev}`);
