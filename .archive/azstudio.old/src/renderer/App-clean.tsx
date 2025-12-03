import React, { useState, useEffect } from 'react';
import './App-vscodelike.css';

// VS Code-like Layout Components
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import EditorArea from './components/EditorArea';
import PanelArea from './components/PanelArea';
import StatusBar from './components/StatusBar';
import MultiAgentMode from './components/MultiAgentMode';

interface AppState {
  projectPath: string;
  activePanel: 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'database' | 'factory' | 'multiagent';
  activeEditor: string | null;
  openTabs: Array<{ id: string; name: string; content: string; language: string }>;
  aiPanelOpen: boolean;
  terminalOpen: boolean;
  multiAgentMode: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    projectPath: '',
    activePanel: 'explorer',
    activeEditor: null,
    openTabs: [],
    aiPanelOpen: false,
    terminalOpen: false,
    multiAgentMode: false
  });

  useEffect(() => {
    // Initialize AzStudio
    if (window.electronAPI?.app?.getVersion) {
      window.electronAPI.app.getVersion().then((result: any) => {
        console.log('AzStudio v', result.version);
      });
    }
  }, []);

  const handleOpenProject = async () => {
    if (!window.electronAPI?.dialog?.openFolder) return;
    
    const result = await window.electronAPI.dialog.openFolder();
    if (result.success && result.path) {
      setState(prev => ({ ...prev, projectPath: result.path }));
    }
  };

  const handleNewFile = () => {
    const newTab = {
      id: `file-${Date.now()}`,
      name: 'Untitled-1',
      content: '',
      language: 'plaintext'
    };
    
    setState(prev => ({
      ...prev,
      openTabs: [...prev.openTabs, newTab],
      activeEditor: newTab.id
    }));
  };

  const handleSaveFile = async () => {
    if (!state.activeEditor) return;
    
    const activeTab = state.openTabs.find(tab => tab.id === state.activeEditor);
    if (activeTab) {
      // Save logic here
      console.log('Saving:', activeTab.name);
    }
  };

  const handleMultiAgentModeToggle = () => {
    setState(prev => ({ 
      ...prev, 
      multiAgentMode: !prev.multiAgentMode,
      activePanel: !prev.multiAgentMode ? 'multiagent' : 'explorer'
    }));
  };

  return (
    <div className="azstudio">
      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-bar-left">
          <span className="app-title">AzStudio</span>
          {state.projectPath && (
            <span className="project-name">
              - {state.projectPath.split('\\').pop()}
            </span>
          )}
          {state.multiAgentMode && (
            <span className="multi-agent-badge" style={{
              marginLeft: '8px',
              padding: '2px 6px',
              background: '#007acc',
              color: 'white',
              borderRadius: '3px',
              fontSize: '10px'
            }}>
              🤖 Multi-Agent Mode
            </span>
          )}
        </div>
        <div className="title-bar-right">
          <button 
            className="title-bar-button minimize"
            style={{ marginRight: '4px' }}
          >
            −
          </button>
          <button 
            className="title-bar-button maximize"
            style={{ marginRight: '4px' }}
          >
            □
          </button>
          <button 
            className="title-bar-button close"
            style={{ marginRight: '8px' }}
          >
            ×
          </button>
          <button
            onClick={handleMultiAgentModeToggle}
            style={{
              padding: '4px 8px',
              background: state.multiAgentMode ? '#007acc' : '#3e3e3e',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {state.multiAgentMode ? '🤖 Exit' : '🤖 Multi-Agent'}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {state.multiAgentMode ? (
          /* Multi-Agent Mode takes over the entire interface */
          <div style={{ height: '100%', width: '100%' }}>
            <MultiAgentMode 
              projectId={state.projectPath || 'default-project'} 
              onModeChange={(mode) => console.log('Multi-Agent mode changed:', mode)}
            />
          </div>
        ) : (
          <>
            {/* Activity Bar */}
            <ActivityBar
              activePanel={state.activePanel}
              onPanelChange={(panel) => setState(prev => ({ ...prev, activePanel: panel }))}
              onNewFile={handleNewFile}
              onOpenProject={handleOpenProject}
            />

            {/* Sidebar */}
            <Sidebar
              activePanel={state.activePanel}
              projectPath={state.projectPath}
            />

            {/* Editor Area */}
            <EditorArea
              openTabs={state.openTabs}
              activeEditor={state.activeEditor}
              onTabChange={(tabId) => setState(prev => ({ ...prev, activeEditor: tabId }))}
              onSaveFile={handleSaveFile}
            />

            {/* Panel Area */}
            <PanelArea
              aiPanelOpen={state.aiPanelOpen}
              terminalOpen={state.terminalOpen}
              onToggleAI={() => setState(prev => ({ ...prev, aiPanelOpen: !prev.aiPanelOpen }))}
              onToggleTerminal={() => setState(prev => ({ ...prev, terminalOpen: !prev.terminalOpen }))}
            />
          </>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar
        projectPath={state.projectPath}
        openTabsCount={state.openTabs.length}
      />
    </div>
  );
};

export default App;
