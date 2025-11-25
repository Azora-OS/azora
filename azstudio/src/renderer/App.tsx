import React, { useState, useEffect } from 'react';
import './App.css';
import FileExplorer from './components/FileExplorer';
import MonacoEditor from './components/MonacoEditor';
import EditorTabs, { EditorTab } from './components/EditorTabs';

const App: React.FC = () => {
  const [version, setVersion] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Get app version
    window.electronAPI.app.getVersion().then(result => {
      if (result.success && result.version) {
        setVersion(result.version);
      }
    });

    // Setup update listeners
    window.electronAPI.onUpdateAvailable(() => {
      setUpdateStatus('Update available! Downloading...');
    });

    window.electronAPI.onUpdateDownloaded(() => {
      setUpdateStatus('Update downloaded! Restart to install.');
    });

    window.electronAPI.onUpdateError((error) => {
      setUpdateStatus(`Update error: ${error}`);
    });
  }, []);

  const handleOpenFolder = async () => {
    const result = await window.electronAPI.dialog.openFolder();
    if (result.success && result.path) {
      setCurrentFolder(result.path);
      
      // Start indexing the project
      console.log('Starting project indexing...');
      const indexResult = await window.electronAPI.project.index(result.path);
      if (indexResult.success) {
        console.log('Project indexed:', indexResult.graph);
      } else {
        console.error('Failed to index project:', indexResult.error);
      }
    }
  };

  const getLanguageFromPath = (filePath: string): string => {
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

  const handleFileSelect = async (filePath: string) => {
    // Check if file is already open
    const existingTab = openTabs.find(tab => tab.path === filePath);
    if (existingTab) {
      setActiveTab(filePath);
      return;
    }

    // Read file content
    const result = await window.electronAPI.fs.readFile(filePath);
    if (result.success && result.content !== undefined) {
      const fileName = filePath.split(/[/\\]/).pop() || filePath;
      const language = getLanguageFromPath(filePath);

      // Add new tab
      const newTab: EditorTab = {
        path: filePath,
        name: fileName,
        isDirty: false,
        language,
      };

      setOpenTabs([...openTabs, newTab]);
      setActiveTab(filePath);
      
      // Store file content
      const newContents = new Map(fileContents);
      newContents.set(filePath, result.content);
      setFileContents(newContents);
    }
  };

  const handleTabClose = (filePath: string) => {
    const newTabs = openTabs.filter(tab => tab.path !== filePath);
    setOpenTabs(newTabs);

    // Remove from file contents
    const newContents = new Map(fileContents);
    newContents.delete(filePath);
    setFileContents(newContents);

    // Update active tab
    if (activeTab === filePath) {
      if (newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].path);
      } else {
        setActiveTab(null);
      }
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      const newContents = new Map(fileContents);
      newContents.set(activeTab, value);
      setFileContents(newContents);

      // Mark tab as dirty
      const newTabs = openTabs.map(tab => {
        if (tab.path === activeTab) {
          return { ...tab, isDirty: true };
        }
        return tab;
      });
      setOpenTabs(newTabs);
    }
  };

  const handleSave = async () => {
    if (activeTab) {
      const content = fileContents.get(activeTab);
      if (content !== undefined) {
        const result = await window.electronAPI.fs.writeFile(activeTab, content);
        if (result.success) {
          // Mark tab as clean
          const newTabs = openTabs.map(tab => {
            if (tab.path === activeTab) {
              return { ...tab, isDirty: false };
            }
            return tab;
          });
          setOpenTabs(newTabs);
        }
      }
    }
  };

  const handleMinimize = () => {
    window.electronAPI.window.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI.window.maximize();
  };

  const handleClose = () => {
    window.electronAPI.window.close();
  };

  const activeTabData = openTabs.find(tab => tab.path === activeTab);
  const activeContent = activeTab ? fileContents.get(activeTab) || '' : '';

  return (
    <div className="app">
      {/* Custom Title Bar */}
      <div className="title-bar">
        <div className="title-bar-left">
          <div className="app-icon">⚡</div>
          <div className="app-title">AzStudio</div>
          {currentFolder && (
            <div className="current-folder">{currentFolder}</div>
          )}
        </div>
        <div className="title-bar-right">
          <button className="title-bar-button" onClick={handleMinimize}>
            ─
          </button>
          <button className="title-bar-button" onClick={handleMaximize}>
            □
          </button>
          <button className="title-bar-button close" onClick={handleClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!currentFolder ? (
          <div className="welcome-screen">
            <div className="logo">⚡</div>
            <h1>Welcome to AzStudio</h1>
            <p className="subtitle">
              AI-Powered Desktop IDE for Building Azora Platforms
            </p>
            <p className="version">Version {version}</p>
            
            <div className="actions">
              <button className="primary-button" onClick={handleOpenFolder}>
                Open Folder
              </button>
              <button className="secondary-button">
                New Project
              </button>
            </div>

            {updateStatus && (
              <div className="update-status">
                {updateStatus}
              </div>
            )}

            <div className="features">
              <div className="feature">
                <div className="feature-icon">🎨</div>
                <h3>Visual Builder</h3>
                <p>Design UIs and services with drag-and-drop</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🤖</div>
                <h3>AI-Powered</h3>
                <p>Generate code with intelligent assistance</p>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <h3>Fast Development</h3>
                <p>Build platforms 10-100x faster</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="workspace">
            <FileExplorer
              rootPath={currentFolder}
              onFileSelect={handleFileSelect}
              selectedFile={activeTab || undefined}
            />
            <div className="editor-area">
              <EditorTabs
                tabs={openTabs}
                activeTab={activeTab}
                onTabSelect={setActiveTab}
                onTabClose={handleTabClose}
              />
              {activeTab && activeTabData ? (
                <MonacoEditor
                  value={activeContent}
                  language={activeTabData.language}
                  path={activeTab}
                  onChange={handleEditorChange}
                  onSave={handleSave}
                />
              ) : (
                <div className="no-file-open">
                  <div className="no-file-icon">📄</div>
                  <p>No file open</p>
                  <p className="no-file-hint">Select a file from the explorer to start editing</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className="status-item">
            {activeTab ? `${activeTabData?.name}${activeTabData?.isDirty ? ' ●' : ''}` : 'Ready'}
          </span>
          {activeTab && (
            <span className="status-item">{activeTabData?.language}</span>
          )}
        </div>
        <div className="status-right">
          <span className="status-item">Electron {process.versions.electron}</span>
          <span className="status-item">Node {process.versions.node}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
