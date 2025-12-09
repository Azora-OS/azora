import React, { useState, useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import FileExplorer from './components/FileExplorer.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import VerificationPanel from './components/VerificationPanel.jsx';
import './styles/App.css';

const App = () => {
  const [version, setVersion] = useState('0.1.0');
  const [currentFolder, setCurrentFolder] = useState('');
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showVerification, setShowVerification] = useState(false);

  const editorRef = useRef(null);
  const monacoEditorRef = useRef(null);

  const [versions, setVersions] = useState({ electron: 'Unknown', node: 'Unknown' });

  useEffect(() => {
    // Get app version
    if (window.electronAPI?.app?.getVersion) {
      window.electronAPI.app.getVersion().then(result => {
        if (result.success && result.version) {
          setVersion(result.version);
        }
      }).catch(console.error);
    }

    // Get electron/node versions
    if (window.electronAPI?.app?.getVersions) {
      window.electronAPI.app.getVersions().then(result => {
         setVersions({ electron: result.electron, node: result.node });
      }).catch(() => {
         // Fallback or ignore
      });
    } else {
       // Fallback for dev mode if API not ready
       setVersions({ electron: '...', node: '...' });
    }

    // Initialize Monaco editor
    if (editorRef.current && !monacoEditorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: '// Welcome to Ascend IDE\n// Constitutional AI Development Environment\n\nconsole.log("Hello, Citadel!");',
        language: 'typescript',
        theme: 'vs-dark',
        fontSize: 14,
        minimap: { enabled: true },
        wordWrap: 'on',
        automaticLayout: true,
      });

      // Handle content changes
      monacoEditorRef.current.onDidChangeModelContent(() => {
        if (activeTab) {
          const content = monacoEditorRef.current?.getValue() || '';
          setTabs((prev) => prev.map((tab) =>
            tab.id === activeTab
              ? { ...tab, content, isDirty: true }
              : tab
          ));
        }
      });
    }

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    // Update editor content when active tab changes
    if (monacoEditorRef.current && activeTab) {
      const tab = tabs.find((t) => t.id === activeTab);
      if (tab) {
        const model = monacoEditorRef.current.getModel();
        if (model) {
          model.setValue(tab.content);
          monaco.editor.setModelLanguage(model, tab.language);
        }
      }
    }
  }, [activeTab, tabs]);

  const handleNewFile = () => {
    const fileName = `untitled-${Date.now()}.ts`;
    const newTab = {
      id: Date.now().toString(),
      name: fileName,
      path: fileName,
      language: 'typescript',
      content: '// New file',
      isDirty: false,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const handleCloseTab = (tabId) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter((tab) => tab.id !== tabId);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[0].id : null);
    }
  };

  const handleSaveFile = async () => {
    if (!activeTab) return;

    const tab = tabs.find((t) => t.id === activeTab);
    if (!tab) return;

    try {
      // Save file using FS API
      const result = await window.electronAPI?.fs.writeFile(tab.path, tab.content);
      
      if (result && result.success) {
        setTabs((prev) => prev.map((t) =>
          t.id === activeTab ? { ...t, isDirty: false } : t
        ));
        console.log('File saved successfully:', tab.path);
      } else {
        console.error('Failed to save file:', result?.error);
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  const handleFileSelect = async (filePath) => {
    // Check if file is already open
    const existingTab = tabs.find((tab) => tab.path === filePath);
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    try {
      // Read file content using FS API
      const result = await window.electronAPI?.fs.readFile(filePath);
      
      if (result && result.success && result.content !== undefined) {
        const fileName = filePath.split(/[/\\]/).pop() || filePath;
        const language = getLanguageFromPath(filePath);

        const newTab = {
          id: Date.now().toString(),
          name: fileName,
          path: filePath,
          language,
          content: result.content,
          isDirty: false,
        };

        setTabs((prev) => [...prev, newTab]);
        setActiveTab(newTab.id);
      } else {
        console.error('Failed to read file:', result?.error);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  const getLanguageFromPath = (filePath) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescriptreact';
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascriptreact';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'scss':
        return 'scss';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="ascend-app">
      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-bar-left">
          <div className="app-icon">⚡</div>
          <div className="app-title">Ascend IDE</div>
          <div className="app-version">v{version}</div>
        </div>
        <div className="title-bar-right">
          <button className="title-button" onClick={() => setShowExplorer(!showExplorer)}>
            📁 Explorer
          </button>
          <button className="title-button" onClick={() => setShowChat(!showChat)}>
            💬 Chat
          </button>
          <button className="title-button" onClick={() => setShowVerification(!showVerification)}>
            🛡️ Verify
          </button>
          <button className="title-button" onClick={handleNewFile}>
            📄 New
          </button>
          <button className="title-button" onClick={handleSaveFile}>
            💾 Save
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* File Explorer */}
        {showExplorer && (
          <FileExplorer
            onFileSelect={handleFileSelect}
            selectedFile={activeTab || undefined}
          />
        )}

        {/* Editor Area */}
        <div className="editor-container">
          {/* Editor Tabs */}
          {tabs.length > 0 && (
            <div className="editor-tabs">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.name}</span>
                  {tab.isDirty && <span className="dirty-indicator">●</span>}
                  <button
                    className="tab-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(tab.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Monaco Editor */}
          {tabs.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-logo">⚡</div>
                <h1>Ascend IDE</h1>
                <p className="welcome-subtitle">Constitutional AI Development Environment</p>
                <p className="welcome-hint">"Where intelligence awakens with constitutional wisdom"</p>
                <div className="welcome-actions">
                  <button className="primary-button" onClick={handleNewFile}>
                    <span className="icon">📄</span> New Sovereign File
                  </button>
                  <button className="secondary-button" onClick={() => setShowChat(true)}>
                    <span className="icon">💬</span> Consult Elara
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div ref={editorRef} className="monaco-editor" />
          )}
        </div>

        {/* Right Side Panels */}
        <div className="right-panels">
          {/* Chat Panel */}
          {showChat && (
            <ChatPanel onClose={() => setShowChat(false)} />
          )}

          {/* Verification Panel */}
          {showVerification && (
            <VerificationPanel onIssueSelect={(issue) => console.log('Issue selected:', issue)} />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span>Ready</span>
          {activeTab && (
            <span>• {tabs.find(t => t.id === activeTab)?.language}</span>
          )}
        </div>
        <div className="status-right">
          <span>Electron {versions.electron}</span>
          <span>• Node {versions.node}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
