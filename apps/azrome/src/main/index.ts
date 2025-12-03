import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { AzromeAI } from './ai/AzromeAI';
import { AzoraTrackerBlocker } from './privacy/AzoraTrackerBlocker';
import { AzoraPermissionHandler } from './security/AzoraPermissionHandler';
import { AzromeBuilder } from './builder/AzromeBuilder';
import { AzromeUpdater } from './updater/AzromeUpdater';

// Initialize Services
const aiAssistant = new AzromeAI();
const trackerBlocker = new AzoraTrackerBlocker();
const permissionHandler = new AzoraPermissionHandler();
const builder = new AzromeBuilder();
const updater = new AzromeUpdater();

// Global reference to keep window alive
let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Azrome',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/index.js'), // We will create this next
            webviewTag: true // Enable <webview> for the browser functionality
        },
    });

    // In dev, load from vite server if running, else load file
    // For simplicity in this "Foundation" phase, we'll assume built files for now
    // or we can try to detect dev mode.
    // Let's load the built index.html by default.
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Open DevTools
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

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
