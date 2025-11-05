
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

const { app, BrowserWindow } = require('electron');
const { join } = require('path');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'electron-preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the Next.js app
  mainWindow.loadURL('http://localhost:3000');
  
  // For production, load built files
  // mainWindow.loadFile('ui/out/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
