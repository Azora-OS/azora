import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

// Simple main process for clean AzStudio
let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hidden',
    frame: false,
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Simple IPC setup
const setupIPC = () => {
  // App info
  ipcMain.handle('app:getVersion', () => ({ success: true, version: app.getVersion() }));
  
  // File operations
  ipcMain.handle('fs:readFile', async (event, filePath: string) => {
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('fs:writeFile', async (event, filePath: string, content: string) => {
    try {
      const fs = require('fs').promises;
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('fs:readDir', async (event, dirPath: string) => {
    try {
      const fs = require('fs').promises;
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const files = items.map(item => ({
        name: item.name,
        path: path.join(dirPath, item.name),
        type: item.isDirectory() ? 'folder' : 'file'
      }));
      return { success: true, files };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('fs:exists', async (event, filePath: string) => {
    try {
      const fs = require('fs').promises;
      await fs.access(filePath);
      return { success: true, exists: true };
    } catch {
      return { success: true, exists: false };
    }
  });
  
  // Dialog operations
  ipcMain.handle('dialog:openFolder', async () => {
    try {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      return { 
        success: !result.canceled, 
        path: result.filePaths[0] || null 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('dialog:openFile', async (event, filters) => {
    try {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: filters || []
      });
      return { 
        success: !result.canceled, 
        path: result.filePaths[0] || null 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
};

app.whenReady().then(() => {
  setupIPC();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
