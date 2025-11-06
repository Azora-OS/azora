/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AZORA OS DESKTOP APPLICATION
Electron-based desktop overlay for Windows integration
*/

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

let mainWindow = null
let tray = null
let elaraProcess = null
let servicesProcess = null
let voiceAssistant = null

// Window configuration
const WINDOW_CONFIG = {
    width: 1200,
    height: 800,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    },
    icon: path.join(__dirname, 'Azora OS Logo.png'),
    show: false, // Start hidden
    skipTaskbar: true // Don't show in taskbar
}

function createMainWindow() {
    console.log('🖥️ Creating Azora OS desktop overlay...')

    mainWindow = new BrowserWindow(WINDOW_CONFIG)

    // Load the overlay HTML
    const overlayPath = path.join(__dirname, 'azora-desktop-overlay.html')
    if (fs.existsSync(overlayPath)) {
        mainWindow.loadFile(overlayPath)
    } else {
        console.error('❌ Overlay HTML file not found:', overlayPath)
        return
    }

    // Window event handlers
    mainWindow.once('ready-to-show', () => {
        console.log('✅ Azora OS overlay ready')
        // Show window after a brief delay for smooth transition
        setTimeout(() => {
            mainWindow.show()
            mainWindow.setAlwaysOnTop(true, 'screen-saver')
        }, 1000)
    })

    mainWindow.on('closed', () => {
        mainWindow = null
        cleanupProcesses()
    })

    // Make window click-through initially (can be toggled)
    mainWindow.setIgnoreMouseEvents(true)

    // Set window to cover the entire screen
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize

    mainWindow.setBounds({
        x: 0,
        y: 0,
        width: width,
        height: height
    })

    // Hide window from taskbar and alt+tab
    mainWindow.setSkipTaskbar(true)
    mainWindow.setVisibleOnAllWorkspaces(true)

    return mainWindow
}

function createSystemTray() {
    console.log('📌 Creating system tray icon...')

    let trayIcon
    const iconPath = path.join(__dirname, 'Azora OS Logo.png')

    if (fs.existsSync(iconPath)) {
        trayIcon = nativeImage.createFromPath(iconPath)
        trayIcon = trayIcon.resize({ width: 16, height: 16 })
    } else {
        // Fallback to default icon
        trayIcon = nativeImage.createFromPath(path.join(__dirname, 'Azora OS Logo.png')) ||
                   nativeImage.createEmpty()
    }

    tray = new Tray(trayIcon)

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Azora OS',
            click: () => {
                if (mainWindow) {
                    mainWindow.show()
                    mainWindow.focus()
                }
            }
        },
        {
            label: 'Hide Overlay',
            click: () => {
                if (mainWindow) {
                    mainWindow.hide()
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Launch Services',
            click: () => launchAzoraServices()
        },
        {
            label: 'Start Elara Voice',
            click: () => startElaraVoice()
        },
        { type: 'separator' },
        {
            label: 'System Status',
            click: () => showSystemStatus()
        },
        { type: 'separator' },
        {
            label: 'Exit Azora OS',
            click: () => {
                const choice = dialog.showMessageBoxSync(mainWindow, {
                    type: 'question',
                    buttons: ['Cancel', 'Exit'],
                    defaultId: 1,
                    title: 'Exit Azora OS',
                    message: 'Are you sure you want to exit Azora OS?',
                    detail: 'This will stop all Azora services and close the overlay.'
                })

                if (choice === 1) {
                    app.quit()
                }
            }
        }
    ])

    tray.setToolTip('Azora OS - AI-Powered Operating System')
    tray.setContextMenu(contextMenu)

    // Tray click handler
    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide()
            } else {
                mainWindow.show()
                mainWindow.focus()
            }
        }
    })

    console.log('✅ System tray created')
    return tray
}

function launchAzoraServices() {
    console.log('🚀 Launching Azora services...')

    if (servicesProcess) {
        console.log('⚠️ Services already running')
        return
    }

    const launcherPath = path.join(__dirname, 'LAUNCH_ALL_SERVICES.js')

    if (!fs.existsSync(launcherPath)) {
        console.error('❌ LAUNCH_ALL_SERVICES.js not found')
        dialog.showErrorBox('Error', 'Azora services launcher not found.')
        return
    }

    servicesProcess = spawn('node', [launcherPath], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
    })

    servicesProcess.stdout.on('data', (data) => {
        console.log(`[SERVICES] ${data.toString().trim()}`)
    })

    servicesProcess.stderr.on('data', (data) => {
        console.error(`[SERVICES ERROR] ${data.toString().trim()}`)
    })

    servicesProcess.on('exit', (code) => {
        console.log(`Azora services exited with code ${code}`)
        servicesProcess = null
    })

    console.log('✅ Azora services launched')

    // Notify user
    tray.displayBalloon({
        title: 'Azora OS',
        content: 'Azora services are starting up...'
    })
}

function startElaraVoice() {
    console.log('🎤 Starting Elara voice assistant...')

    if (voiceAssistant) {
        console.log('⚠️ Voice assistant already running')
        return
    }

    const voiceScript = path.join(__dirname, 'elara-voice-assistant.ps1')

    if (!fs.existsSync(voiceScript)) {
        console.error('❌ Elara voice assistant script not found')
        dialog.showErrorBox('Error', 'Elara voice assistant not found.')
        return
    }

    // Launch PowerShell script
    voiceAssistant = spawn('powershell.exe', [
        '-ExecutionPolicy', 'Bypass',
        '-File', voiceScript,
        '-Continuous'
    ], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
    })

    voiceAssistant.stdout.on('data', (data) => {
        console.log(`[ELARA VOICE] ${data.toString().trim()}`)
    })

    voiceAssistant.stderr.on('data', (data) => {
        console.error(`[ELARA VOICE ERROR] ${data.toString().trim()}`)
    })

    voiceAssistant.on('exit', (code) => {
        console.log(`Elara voice assistant exited with code ${code}`)
        voiceAssistant = null
    })

    console.log('✅ Elara voice assistant started')
}

function startElaraSupreme() {
    console.log('🌌 Starting Elara Supreme...')

    if (elaraProcess) {
        console.log('⚠️ Elara Supreme already running')
        return
    }

    const elaraPath = path.join(__dirname, 'run-azora-supreme.ts')

    if (!fs.existsSync(elaraPath)) {
        console.error('❌ Elara Supreme script not found')
        return
    }

    elaraProcess = spawn('npx', ['tsx', elaraPath], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production' }
    })

    elaraProcess.stdout.on('data', (data) => {
        console.log(`[ELARA SUPREME] ${data.toString().trim()}`)
    })

    elaraProcess.stderr.on('data', (data) => {
        console.error(`[ELARA SUPREME ERROR] ${data.toString().trim()}`)
    })

    elaraProcess.on('exit', (code) => {
        console.log(`Elara Supreme exited with code ${code}`)
        elaraProcess = null
    })

    console.log('✅ Elara Supreme started')
}

function showSystemStatus() {
    // In a real implementation, this would show a detailed system status window
    const statusInfo = `
Azora OS System Status:

• Desktop Overlay: ${mainWindow ? 'Running' : 'Stopped'}
• Azora Services: ${servicesProcess ? 'Running' : 'Stopped'}
• Elara Supreme: ${elaraProcess ? 'Running' : 'Stopped'}
• Voice Assistant: ${voiceAssistant ? 'Running' : 'Stopped'}

• Total Services: 147+
• Active Services: Checking...
• System Health: Monitoring...
`

    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Azora OS Status',
        message: 'System Status',
        detail: statusInfo
    })
}

function cleanupProcesses() {
    console.log('🧹 Cleaning up processes...')

    if (servicesProcess) {
        servicesProcess.kill('SIGTERM')
        servicesProcess = null
    }

    if (elaraProcess) {
        elaraProcess.kill('SIGTERM')
        elaraProcess = null
    }

    if (voiceAssistant) {
        voiceAssistant.kill('SIGTERM')
        voiceAssistant = null
    }
}

// IPC handlers for communication with renderer process
ipcMain.handle('launch-services', async () => {
    launchAzoraServices()
    return { success: true }
})

ipcMain.handle('start-elara', async () => {
    startElaraSupreme()
    return { success: true }
})

ipcMain.handle('start-voice', async () => {
    startElaraVoice()
    return { success: true }
})

ipcMain.handle('get-system-status', async () => {
    return {
        overlay: !!mainWindow,
        services: !!servicesProcess,
        elara: !!elaraProcess,
        voice: !!voiceAssistant
    }
})

// Global keyboard shortcuts
const { globalShortcut } = require('electron')

function registerGlobalShortcuts() {
    // Ctrl+Alt+A to show/hide overlay
    globalShortcut.register('CommandOrControl+Alt+A', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide()
            } else {
                mainWindow.show()
                mainWindow.focus()
            }
        }
    })

    // Ctrl+Alt+V to toggle voice assistant
    globalShortcut.register('CommandOrControl+Alt+V', () => {
        if (voiceAssistant) {
            voiceAssistant.kill('SIGTERM')
            voiceAssistant = null
        } else {
            startElaraVoice()
        }
    })

    console.log('✅ Global shortcuts registered (Ctrl+Alt+A for overlay, Ctrl+Alt+V for voice)')
}

// App event handlers
app.whenReady().then(() => {
    console.log('\n🌟 AZORA OS DESKTOP APPLICATION STARTING...\n')

    // Create system tray first
    createSystemTray()

    // Create main window
    createMainWindow()

    // Register global shortcuts
    registerGlobalShortcuts()

    // Auto-start services after a delay
    setTimeout(() => {
        console.log('🚀 Auto-starting Azora components...')

        // Launch services
        launchAzoraServices()

        // Start Elara Supreme
        setTimeout(() => {
            startElaraSupreme()
        }, 5000)

        // Start voice assistant
        setTimeout(() => {
            startElaraVoice()
        }, 10000)

    }, 2000)

    // Show initial notification
    setTimeout(() => {
        tray.displayBalloon({
            title: 'Azora OS Activated',
            content: 'Welcome to the future of AI computing. Say "Hey Elara" to begin.',
            iconType: 'info'
        })
    }, 3000)
})

app.on('window-all-closed', (e) => {
    // Prevent default quit behavior
    e.preventDefault()

    // Hide window instead of closing
    if (mainWindow) {
        mainWindow.hide()
    }
})

app.on('before-quit', () => {
    console.log('\n🛑 Shutting down Azora OS...\n')

    // Cleanup
    cleanupProcesses()

    // Unregister shortcuts
    globalShortcut.unregisterAll()

    // Destroy tray
    if (tray) {
        tray.destroy()
    }
})

// Handle app activation (macOS)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error)
    dialog.showErrorBox('Azora OS Error', `An unexpected error occurred: ${error.message}`)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled rejection:', reason)
})
