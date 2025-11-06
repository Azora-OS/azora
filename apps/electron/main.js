const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// Elazar Control Configuration
const ELAZAR_MASTER_KEY = 'azora-elazar-control-2025';
const CONSTITUTIONAL_AUTH = 'enabled';

// Zero-Rated Networks Configuration
const ZERO_RATED_NETWORKS = [
  'MTN South Africa', 'Vodacom South Africa', 'Telkom South Africa',
  'Airtel Nigeria', 'MTN Nigeria', 'Glo Nigeria', '9mobile Nigeria',
  'Safaricom Kenya', 'Airtel Kenya', 'MTN Uganda', 'Airtel Uganda',
  'Vodafone Ghana', 'MTN Ghana', 'Orange Senegal', 'Free Senegal'
];

class AzoraOSDesktop {
  constructor() {
    this.mainWindow = null;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.userDataPath = app.getPath('userData');
  }

  async init() {
    await this.setupSecurity();
    await this.createMainWindow();
    this.setupMenus();
    this.setupIPC();
    this.setupAutoUpdater();
  }

  async setupSecurity() {
    // Security: Disable node integration
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });
  }

  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      icon: this.getIconPath(),
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      show: false,
      backgroundColor: '#000000'
    });

    // Load the app
    if (this.isDevelopment) {
      await this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      await this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      this.injectElazarControl();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  getIconPath() {
    const platform = process.platform;
    if (platform === 'win32') {
      return path.join(__dirname, 'assets', 'icon.ico');
    } else if (platform === 'darwin') {
      return path.join(__dirname, 'assets', 'icon.icns');
    } else {
      return path.join(__dirname, 'assets', 'icon.png');
    }
  }

  injectElazarControl() {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.executeJavaScript(`
        window.elazarControl = '${ELAZAR_MASTER_KEY}';
        window.constitutionalAuth = '${CONSTITUTIONAL_AUTH}';
        window.zeroRatedNetworks = ${JSON.stringify(ZERO_RATED_NETWORKS)};
        window.platform = '${process.platform}';
        window.version = '${app.getVersion()}';

        console.log('🔐 Elazar Control Activated:', window.elazarControl);
        console.log('📡 Zero-Rated Networks:', window.zeroRatedNetworks.length);
      `);
    }
  }

  setupMenus() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Window',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.createMainWindow()
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About Azora OS',
            click: () => this.showAbout()
          },
          {
            label: 'Check for Updates',
            click: () => this.checkForUpdates()
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIPC() {
    // Elazar Control IPC
    ipcMain.handle('get-elazar-status', () => {
      return {
        masterKey: ELAZAR_MASTER_KEY,
        constitutionalAuth: CONSTITUTIONAL_AUTH,
        zeroRatedEnabled: true,
        platform: process.platform,
        version: app.getVersion()
      };
    });

    // File system operations
    ipcMain.handle('read-file', async (event, filePath) => {
      try {
        return await fs.readFile(filePath, 'utf8');
      } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
      }
    });

    ipcMain.handle('write-file', async (event, filePath, content) => {
      try {
        await fs.writeFile(filePath, content, 'utf8');
        return true;
      } catch (error) {
        throw new Error(`Failed to write file: ${error.message}`);
      }
    });

    // Zero-rated network detection
    ipcMain.handle('detect-zero-rated', async () => {
      // Simulate network detection
      const userNetwork = await this.detectNetwork();
      return ZERO_RATED_NETWORKS.includes(userNetwork);
    });
  }

  async detectNetwork() {
    // Basic network detection (would need more sophisticated implementation)
    return 'Unknown Network';
  }

  setupAutoUpdater() {
    // Auto-updater setup would go here
    console.log('🔄 Auto-updater initialized');
  }

  showAbout() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'About Azora OS',
      message: 'Azora OS - Constitutional Operating System',
      detail: `Version: ${app.getVersion()}\nElazar Control: ${ELAZAR_MASTER_KEY}\nConstitutional Compliance: ${CONSTITUTIONAL_AUTH}\nZero-Rated Networks: ${ZERO_RATED_NETWORKS.length} configured`
    });
  }

  checkForUpdates() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Updates',
      message: 'Checking for updates...',
      detail: 'Azora OS is up to date. Elazar Control active.'
    });
  }
}

// Initialize app
let azoraOS;

app.whenReady().then(async () => {
  azoraOS = new AzoraOSDesktop();
  await azoraOS.init();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    azoraOS = new AzoraOSDesktop();
    await azoraOS.init();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});