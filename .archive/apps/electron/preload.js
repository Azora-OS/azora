const { contextBridge, ipcRenderer } = require('electron');

// Elazar Control API
contextBridge.exposeInMainWorld('azoraAPI', {
  // Elazar Control
  getElazarStatus: () => ipcRenderer.invoke('get-elazar-status'),

  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),

  // Zero-rated network detection
  detectZeroRated: () => ipcRenderer.invoke('detect-zero-rated'),

  // Platform info
  platform: process.platform,
  versions: process.versions
});

// Constitutional Framework Integration
contextBridge.exposeInMainWorld('constitutionalAPI', {
  verifyCompliance: () => {
    return {
      elazarControl: 'azora-elazar-control-2025',
      constitutionalAuth: 'enabled',
      zeroRatedEnabled: true,
      timestamp: new Date().toISOString()
    };
  },

  getZeroRatedNetworks: () => {
    return [
      'MTN South Africa', 'Vodacom South Africa', 'Telkom South Africa',
      'Airtel Nigeria', 'MTN Nigeria', 'Glo Nigeria', '9mobile Nigeria',
      'Safaricom Kenya', 'Airtel Kenya', 'MTN Uganda', 'Airtel Uganda',
      'Vodafone Ghana', 'MTN Ghana', 'Orange Senegal', 'Free Senegal'
    ];
  }
});

// Security: Remove this in production if not needed
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    versions: process.versions
  });
}