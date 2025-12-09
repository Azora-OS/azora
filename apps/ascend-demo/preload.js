const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Ascend AI services
  generateCode: (prompt, context) => ipcRenderer.invoke('ascend:generateCode', prompt, context),
  analyzeCode: (code) => ipcRenderer.invoke('ascend:analyzeCode', code),
  validateAction: (action) => ipcRenderer.invoke('ascend:validateAction', action),
  verifyCompliance: (code) => ipcRenderer.invoke('ascend:verifyCompliance', code),
  getGuidelines: () => ipcRenderer.invoke('ascend:getGuidelines'),

  // Knowledge services
  searchKnowledge: (query) => ipcRenderer.invoke('ascend:searchKnowledge', query),

  // Chat services
  createChatSession: (agentId) => ipcRenderer.invoke('ascend:createChatSession', agentId),
  sendChatMessage: (sessionId, message) => ipcRenderer.invoke('ascend:sendChatMessage', sessionId, message),

  // Verification services
  runVerification: (code) => ipcRenderer.invoke('ascend:runVerification', code),
  getVerificationStatus: () => ipcRenderer.invoke('ascend:getVerificationStatus'),

  // App info
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
