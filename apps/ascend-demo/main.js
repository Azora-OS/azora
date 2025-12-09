const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Import our mock AzStudio services
const {
  MockAIOrchestrator,
  MockConstitutionalValidator,
  MockKnowledgeOceanService,
  MockChatSessionsService,
  MockVerificationPipeline
} = require('../ascend-vscode/mock-azstudio.js');

let mainWindow;
let aiOrchestrator;
let constitutionalValidator;
let knowledgeOcean;
let chatSessions;
let verificationPipeline;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1a1a',
      symbolColor: '#ffffff'
    },
    icon: path.join(__dirname, '../resources/icons/code.ico'),
    title: 'Ascend IDE - Citadel\'s Advance Intelligence'
  });

  // Load the HTML file
  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initializeAzStudio() {
  console.log('🚀 Initializing AzStudio Services...');

  try {
    // Initialize AzStudio services
    aiOrchestrator = new MockAIOrchestrator();
    constitutionalValidator = MockConstitutionalValidator.getInstance();
    knowledgeOcean = new MockKnowledgeOceanService();
    chatSessions = new MockChatSessionsService();
    verificationPipeline = new MockVerificationPipeline();

    console.log('✅ AzStudio services initialized successfully');

    // Simulate awakening ceremony
    console.log('🎭 Starting Awakening Ceremony...');
    console.log('🔥 Constitutional AI systems online');
    console.log('🧠 Knowledge Ocean initialized');
    console.log('🤖 AI Orchestrator ready');
    console.log('✨ Ascend IDE is operational');

  } catch (error) {
    console.error('❌ Failed to initialize AzStudio services:', error);
  }
}

// IPC handlers for AzStudio services
ipcMain.handle('ascend:generateCode', async (event, prompt, context) => {
  try {
    console.log(`[IPC] Generating code for: ${prompt}`);
    const code = await aiOrchestrator.generateCode(prompt, context);
    return { success: true, code };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ascend:analyzeCode', async (event, code) => {
  try {
    console.log(`[IPC] Analyzing code (${code.length} chars)`);
    const analysis = await aiOrchestrator.analyzeCode(code);
    return { success: true, analysis };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ascend:validateAction', async (event, action) => {
  try {
    console.log(`[IPC] Validating action: ${JSON.stringify(action)}`);
    const isValid = await constitutionalValidator.validateAction(action);
    return { success: true, valid: isValid };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ascend:verifyCompliance', async (event, code) => {
  try {
    console.log(`[IPC] Verifying compliance for ${code.length} chars of code`);
    const compliance = await constitutionalValidator.verifyCompliance(code);
    return { success: true, compliance };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ascend:getGuidelines', async () => {
  try {
    console.log(`[IPC] Getting constitutional guidelines`);
    const guidelines = await constitutionalValidator.getGuidelines();
    return { success: true, guidelines };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ascend:searchKnowledge', async (event, query) => {
  try {
    console.log(`[IPC] Searching knowledge for: ${query}`);
    const results = await knowledgeOcean.search(query);
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ascend:createChatSession', async (event, agentId) => {
  try {
    console.log(`[IPC] Creating chat session for agent: ${agentId}`);
    const session = await chatSessions.createSession(agentId);
    return { success: true, session };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ascend:sendChatMessage', async (event, sessionId, message) => {
  try {
    console.log(`[IPC] Sending chat message to session: ${sessionId}`);
    const response = await chatSessions.sendMessage(sessionId, message);
    return { success: true, response };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ascend:runVerification', async (event, code) => {
  try {
    console.log(`[IPC] Running verification pipeline`);
    const result = await verificationPipeline.run(code);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ascend:getVerificationStatus', async () => {
  try {
    console.log(`[IPC] Getting verification status`);
    const status = await verificationPipeline.getStatus();
    return { success: true, status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(async () => {
  await initializeAzStudio();
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
