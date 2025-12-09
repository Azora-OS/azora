import React, { useState, useEffect } from 'react';
import './App.css';

const App: React.FC = () => {
  const [version, setVersion] = useState<string>('0.1.0');
  const [apiAvailable, setApiAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check if electronAPI is available
    if (window.electronAPI) {
      setApiAvailable(true);
      // Safe to call API
      window.electronAPI.app.getVersion().then(result => {
        if (result.success && result.version) {
          setVersion(result.version);
        }
      }).catch(err => {
        console.log('API not ready yet:', err);
      });
    } else {
      console.log('electronAPI not available');
    }
  }, []);

  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      color: '#cccccc',
      padding: '20px',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#61dafb' }}>🚀 AzStudio is Working!</h1>
      <p>Version: {version}</p>
      <p>API Available: {apiAvailable ? '✅ Yes' : '❌ No'}</p>
      <p>Timestamp: {new Date().toISOString()}</p>

      <div style={{ marginTop: '20px' }}>
        <h2>System Info:</h2>
        <p>Electron: {process.versions.electron}</p>
        <p>Node: {process.versions.node}</p>
        <p>Chrome: {process.versions.chrome}</p>
      </div>

      <button
        style={{
          backgroundColor: '#61dafb',
          color: '#282c34',
          padding: '10px 20px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
        onClick={() => alert('React event working! AzStudio is fully functional.')}
      >
        Test Alert
      </button>
    </div>
  );
};

export default App;
