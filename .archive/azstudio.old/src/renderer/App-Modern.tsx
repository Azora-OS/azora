import React, { useState, useEffect, useRef } from 'react';
import './App-Modern.css';

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isFolder?: boolean;
  children?: ProjectFile[];
  isOpen?: boolean;
}

interface AIAssistant {
  id: string;
  name: string;
  type: 'code' | 'chat' | 'design' | 'debug' | 'review';
  status: 'active' | 'idle' | 'thinking' | 'error';
  icon: string;
  description: string;
  capabilities: string[];
}

const App: React.FC = () => {
  const [projectPath, setProjectPath] = useState<string>('');
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [openFiles, setOpenFiles] = useState<ProjectFile[]>([]);
  const [fileTree, setFileTree] = useState<ProjectFile[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [activeRightPanel, setActiveRightPanel] = useState<'ai' | 'knowledge' | 'build'>('ai');
  const [activeBottomPanel, setActiveBottomPanel] = useState<'terminal' | 'output' | 'problems'>('terminal');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [aiAssistants, setAiAssistants] = useState<AIAssistant[]>([
    {
      id: 'azora-code',
      name: 'Azora Code',
      type: 'code',
      status: 'active',
      icon: '🚀',
      description: 'Primary coding assistant with full-stack capabilities',
      capabilities: ['code_generation', 'debugging', 'refactoring', 'architecture_design']
    },
    {
      id: 'design-assistant',
      name: 'Design Assistant',
      type: 'design',
      status: 'idle',
      icon: '🎨',
      description: 'UI/UX design and component architecture',
      capabilities: ['component_design', 'ui_generation', 'styling', 'accessibility']
    },
    {
      id: 'debug-agent',
      name: 'Debug Agent',
      type: 'debug',
      status: 'idle',
      icon: '🔍',
      description: 'Advanced debugging and error resolution',
      capabilities: ['error_analysis', 'performance_optimization', 'security_audit']
    }
  ]);
  const [activeAssistant, setActiveAssistant] = useState<string>('azora-code');
  const [multiAgentMode, setMultiAgentMode] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['$ AzStudio Terminal Ready', '']);
  const [aiChat, setAiChat] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date, assistantId?: string}>>([]);
  const [aiInput, setAiInput] = useState('');

  const sidebarRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Services will be initialized as needed
  // const [multiAgentRuntime] = useState(() => new MultiAgentRuntime());
  // const [elaraOrchestrator] = useState(() => new ElaraOrchestrator());
  // const [knowledgeOcean] = useState(() => new KnowledgeOcean());
  // const [buildSpacesAPI] = useState(() => new BuildSpacesAPI());

  useEffect(() => {
    // Initialize AzStudio
    if (window.electronAPI?.app?.getVersion) {
      window.electronAPI.app.getVersion().then((result: any) => {
        console.log('AzStudio v', result.version);
        setTerminalOutput(prev => [...prev, `AzStudio v${result.version} initialized`]);
      });
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault();
        setActiveBottomPanel(prev => prev === 'terminal' ? null : 'terminal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenProject = async () => {
    if (!window.electronAPI?.dialog?.openFolder) return;
    
    const result = await window.electronAPI.dialog.openFolder();
    if (result.success && result.path) {
      setProjectPath(result.path);
      loadProjectFiles(result.path);
      setTerminalOutput(prev => [...prev, `Project opened: ${result.path}`]);
    }
  };

  const loadProjectFiles = async (path: string) => {
    // Mock file tree for now
    const mockTree: ProjectFile[] = [
      {
        id: '1',
        name: 'src',
        path: `${path}/src`,
        content: '',
        language: 'folder',
        isFolder: true,
        isOpen: true,
        children: [
          { id: '2', name: 'main.ts', path: `${path}/src/main.ts`, content: '// Main entry point', language: 'typescript' },
          { id: '3', name: 'App.tsx', path: `${path}/src/App.tsx`, content: 'export default function App() {}', language: 'typescript' },
        ]
      },
      { id: '4', name: 'package.json', path: `${path}/package.json`, content: '{}', language: 'json' },
    ];
    setFileTree(mockTree);
  };

  const handleFileClick = (file: ProjectFile) => {
    if (file.isFolder) {
      // Toggle folder
      setFileTree(prev => toggleFolder(prev, file.id));
    } else {
      setActiveFile(file);
      if (!openFiles.find(f => f.id === file.id)) {
        setOpenFiles(prev => [...prev, file]);
      }
    }
  };

  const toggleFolder = (tree: ProjectFile[], folderId: string): ProjectFile[] => {
    return tree.map(item => {
      if (item.id === folderId) {
        return { ...item, isOpen: !item.isOpen };
      }
      if (item.children) {
        return { ...item, children: toggleFolder(item.children, folderId) };
      }
      return item;
    });
  };

  const handleAIMessage = () => {
    if (!aiInput.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user' as const,
      content: aiInput,
      timestamp: new Date(),
      assistantId: activeAssistant
    };
    setAiChat(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const assistant = aiAssistants.find(a => a.id === activeAssistant);
      const aiResponse = { 
        role: 'assistant' as const,
        content: `I understand you want to: "${aiInput}". As ${assistant?.name || 'AzStudio AI'}, I'll help you with that request using AzStudio's advanced capabilities.`,
        timestamp: new Date(),
        assistantId: activeAssistant
      };
      setAiChat(prev => [...prev, aiResponse]);
    }, 1000);
    
    setAiInput('');
  };

  const renderFileTree = (files: ProjectFile[], depth = 0) => {
    return files.map(file => (
      <div key={file.id} style={{ paddingLeft: `${depth * 16}px` }}>
        <div
          className={`file-tree-item ${activeFile?.id === file.id ? 'active' : ''}`}
          onClick={() => handleFileClick(file)}
        >
          <span className="file-icon">
            {file.isFolder ? (file.isOpen ? '📂' : '📁') : '📄'}
          </span>
          <span className="file-name">{file.name}</span>
        </div>
        {file.isFolder && file.isOpen && file.children && (
          <div className="file-children">
            {renderFileTree(file.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="azstudio-modern">
      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-bar-left">
          <div className="app-logo">🚀</div>
          <span className="app-name">AzStudio</span>
          {projectPath && (
            <span className="project-path">
              {projectPath.split('\\').pop()}
            </span>
          )}
          {multiAgentMode && (
            <div className="multi-agent-indicator">
              🤖 Multi-Agent Active
            </div>
          )}
        </div>
        <div className="title-bar-center">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search files (Ctrl+P)" 
              onFocus={() => setShowCommandPalette(true)}
            />
          </div>
        </div>
        <div className="title-bar-right">
          <button className="title-button" onClick={() => setMultiAgentMode(!multiAgentMode)}>
            {multiAgentMode ? '🤖' : '🧠'}
          </button>
          <button className="title-button" onClick={handleOpenProject}>
            📁
          </button>
          <button className="title-button minimize">−</button>
          <button className="title-button maximize">□</button>
          <button className="title-button close">×</button>
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="command-palette-overlay" onClick={() => setShowCommandPalette(false)}>
          <div className="command-palette" onClick={(e) => e.stopPropagation()}>
            <div className="command-palette-header">
              <span>🚀 AzStudio Commands</span>
              <button onClick={() => setShowCommandPalette(false)}>×</button>
            </div>
            <div className="command-list">
              <div className="command-item">📁 Open Project...</div>
              <div className="command-item">📄 New File</div>
              <div className="command-item">🤖 Toggle Multi-Agent Mode</div>
              <div className="command-item">🎨 Design Mode</div>
              <div className="command-item">🔍 Debug Mode</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <div 
          ref={sidebarRef}
          className="sidebar"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="sidebar-tabs">
            <div className="sidebar-tab active">📁 Explorer</div>
            <div className="sidebar-tab">🔍 Search</div>
            <div className="sidebar-tab">🌊 Knowledge</div>
            <div className="sidebar-tab">⚙️ Settings</div>
          </div>
          <div className="sidebar-content">
            {projectPath ? (
              <div className="file-tree">
                {renderFileTree(fileTree)}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <p>No project opened</p>
                <button onClick={handleOpenProject}>Open Project</button>
              </div>
            )}
          </div>
          <div className="resize-handle" 
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startWidth = sidebarWidth;
              
              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = startWidth + (e.clientX - startX);
                setSidebarWidth(Math.max(200, Math.min(400, newWidth)));
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </div>

        {/* Editor Area */}
        <div className="editor-area">
          {/* Open Tabs */}
          <div className="tab-bar">
            {openFiles.map(file => (
              <div 
                key={file.id}
                className={`tab ${activeFile?.id === file.id ? 'active' : ''}`}
                onClick={() => setActiveFile(file)}
              >
                <span className="tab-icon">📄</span>
                <span className="tab-name">{file.name}</span>
                <button 
                  className="tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFiles(prev => prev.filter(f => f.id !== file.id));
                    if (activeFile?.id === file.id) {
                      setActiveFile(null);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="editor">
            {activeFile ? (
              <div className="editor-content">
                <div className="editor-header">
                  <span className="file-path">{activeFile.path}</span>
                  <div className="editor-actions">
                    <button>💾</button>
                    <button>🔄</button>
                    <button>🤖</button>
                  </div>
                </div>
                <div className="code-editor">
                  <textarea 
                    className="code-input"
                    value={activeFile.content}
                    onChange={(e) => {
                      const updatedFile = { ...activeFile, content: e.target.value };
                      setActiveFile(updatedFile);
                      setOpenFiles(prev => prev.map(f => f.id === activeFile.id ? updatedFile : f));
                    }}
                    placeholder="Start coding..."
                  />
                </div>
              </div>
            ) : (
              <div className="editor-welcome">
                <div className="welcome-icon">🚀</div>
                <h1>Welcome to AzStudio</h1>
                <p>The AI-powered development environment for building Azora platforms</p>
                <div className="welcome-actions">
                  <button onClick={handleOpenProject}>📁 Open Project</button>
                  <button>📄 New File</button>
                  <button onClick={() => setMultiAgentMode(true)}>🤖 Multi-Agent Mode</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        {rightPanelWidth > 0 && (
          <div 
            ref={rightPanelRef}
            className="right-panel"
            style={{ width: `${rightPanelWidth}px` }}
          >
            <div className="panel-tabs">
              <div 
                className={`panel-tab ${activeRightPanel === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveRightPanel('ai')}
              >
                🤖 AI Assistant
              </div>
              <div 
                className={`panel-tab ${activeRightPanel === 'knowledge' ? 'active' : ''}`}
                onClick={() => setActiveRightPanel('knowledge')}
              >
                🌊 Knowledge
              </div>
              <div 
                className={`panel-tab ${activeRightPanel === 'build' ? 'active' : ''}`}
                onClick={() => setActiveRightPanel('build')}
              >
                ⚡ Build
              </div>
            </div>

            <div className="panel-content">
              {activeRightPanel === 'ai' && (
                <div className="ai-assistant">
                  <div className="ai-header">
                    <div className="ai-assistants">
                      {aiAssistants.map(assistant => (
                        <div 
                          key={assistant.id} 
                          className={`ai-assistant ${assistant.status} ${activeAssistant === assistant.id ? 'active' : ''}`}
                          onClick={() => setActiveAssistant(assistant.id)}
                        >
                          <span className="ai-icon">{assistant.icon}</span>
                          <div className="ai-info">
                            <span className="ai-name">{assistant.name}</span>
                            <span className="ai-description">{assistant.description}</span>
                          </div>
                          <div className={`ai-status ${assistant.status}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ai-chat">
                    <div className="chat-messages">
                      {aiChat.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                          <div className="message-content">{msg.content}</div>
                          <div className="message-time">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="chat-input">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAIMessage()}
                        placeholder="Ask AzStudio AI anything..."
                      />
                      <button onClick={handleAIMessage}>🚀</button>
                    </div>
                  </div>
                </div>
              )}

              {activeRightPanel === 'knowledge' && (
                <div className="knowledge-panel">
                  <h3>🌊 Knowledge Ocean</h3>
                  <div className="knowledge-search">
                    <input type="text" placeholder="Search knowledge base..." />
                  </div>
                  <div className="knowledge-items">
                    <div className="knowledge-item">
                      <h4>Azora Architecture</h4>
                      <p>Complete guide to Azora platform architecture...</p>
                    </div>
                    <div className="knowledge-item">
                      <h4>Multi-Agent Systems</h4>
                      <p>Understanding AzStudio's multi-agent capabilities...</p>
                    </div>
                  </div>
                </div>
              )}

              {activeRightPanel === 'build' && (
                <div className="build-panel">
                  <h3>⚡ Build Spaces</h3>
                  <div className="build-actions">
                    <button>🔨 Build Project</button>
                    <button>🚀 Deploy</button>
                    <button>📊 Analytics</button>
                  </div>
                  <div className="build-log">
                    <div className="log-entry">Build ready</div>
                  </div>
                </div>
              )}
            </div>

            <div className="resize-handle" 
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = rightPanelWidth;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const newWidth = startWidth - (e.clientX - startX);
                  setRightPanelWidth(Math.max(0, Math.min(500, newWidth)));
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>
        )}

        {/* Bottom Panel */}
        {bottomPanelHeight > 0 && (
          <div 
            ref={bottomPanelRef}
            className="bottom-panel"
            style={{ height: `${bottomPanelHeight}px` }}
          >
            <div className="panel-tabs horizontal">
              <div 
                className={`panel-tab ${activeBottomPanel === 'terminal' ? 'active' : ''}`}
                onClick={() => setActiveBottomPanel('terminal')}
              >
                💻 Terminal
              </div>
              <div 
                className={`panel-tab ${activeBottomPanel === 'output' ? 'active' : ''}`}
                onClick={() => setActiveBottomPanel('output')}
              >
                📄 Output
              </div>
              <div 
                className={`panel-tab ${activeBottomPanel === 'problems' ? 'active' : ''}`}
                onClick={() => setActiveBottomPanel('problems')}
              >
                ⚠️ Problems
              </div>
            </div>

            <div className="panel-content">
              {activeBottomPanel === 'terminal' && (
                <div className="terminal">
                  <div className="terminal-output" ref={terminalRef}>
                    {terminalOutput.map((line, index) => (
                      <div key={index} className="terminal-line">{line}</div>
                    ))}
                  </div>
                  <div className="terminal-input">
                    <span className="prompt">$</span>
                    <input 
                      type="text" 
                      placeholder="Type command..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = (e.target as HTMLInputElement).value;
                          setTerminalOutput(prev => [...prev, `$ ${input}`, 'Command executed']);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {activeBottomPanel === 'output' && (
                <div className="output">
                  <div className="output-line">Build completed successfully</div>
                  <div className="output-line">No issues found</div>
                </div>
              )}

              {activeBottomPanel === 'problems' && (
                <div className="problems">
                  <div className="problem-item success">✅ No problems detected</div>
                </div>
              )}
            </div>

            <div className="resize-handle horizontal" 
              onMouseDown={(e) => {
                const startY = e.clientY;
                const startHeight = bottomPanelHeight;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const newHeight = startHeight - (e.clientY - startY);
                  setBottomPanelHeight(Math.max(0, Math.min(400, newHeight)));
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className="status-item">🚀 AzStudio</span>
          {activeFile && (
            <span className="status-item">{activeFile.language}</span>
          )}
          <span className="status-item">UTF-8</span>
        </div>
        <div className="status-center">
          {multiAgentMode && (
            <span className="status-item multi-agent">🤖 Multi-Agent Mode</span>
          )}
        </div>
        <div className="status-right">
          <span className="status-item">Ln 1, Col 1</span>
          <span className="status-item">Spaces: 2</span>
          <span className="status-item">✅ Ready</span>
        </div>
      </div>
    </div>
  );
};

export default App;
