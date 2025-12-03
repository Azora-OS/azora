import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

interface EditorAreaProps {
  openTabs: Array<{ id: string; name: string; content: string; language: string }>;
  activeEditor: string | null;
  onTabChange: (tabId: string) => void;
  onSaveFile: () => void;
}

const EditorArea: React.FC<EditorAreaProps> = ({
  openTabs,
  activeEditor,
  onTabChange,
  onSaveFile
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      // Initialize Monaco Editor
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: '',
        language: 'typescript',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        bracketPairColorization: { enabled: true },
        guides: {
          indentation: true,
          bracketPairs: true
        }
      });

      // Configure keyboard shortcuts
      monacoEditorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSaveFile();
      });
    }

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (monacoEditorRef.current && activeEditor) {
      const activeTab = openTabs.find(tab => tab.id === activeEditor);
      if (activeTab) {
        monacoEditorRef.current.setValue(activeTab.content);
        monaco.editor.setModelLanguage(monacoEditorRef.current.getModel()!, activeTab.language);
      }
    }
  }, [activeEditor, openTabs]);

  const handleTabClose = (tabId: string) => {
    // Handle tab close logic
    console.log('Closing tab:', tabId);
  };

  const renderWelcomeScreen = () => (
    <div className="welcome-screen">
      <h1>Welcome to AzStudio</h1>
      <p>Your AI-powered development environment with VS Code-like experience</p>
      <div className="welcome-actions">
        <button className="welcome-button">
          📄 New File
        </button>
        <button className="welcome-button secondary">
          📂 Open Folder
        </button>
        <button className="welcome-button secondary">
          🤖 AI Assistant
        </button>
        <button className="welcome-button secondary">
          🧩 Extensions
        </button>
      </div>
      <div style={{ marginTop: '32px', color: '#8c8c8c', fontSize: '14px' }}>
        <p>🚀 Features:</p>
        <ul style={{ textAlign: 'left', marginTop: '8px' }}>
          <li>💬 Built-in AI assistant (ChatGPT/Claude)</li>
          <li>🖥️ Integrated terminal</li>
          <li>🔀 Git source control</li>
          <li>🧩 Extension marketplace</li>
          <li>🎨 VS Code compatible themes</li>
          <li>⚡ Lightning fast Monaco editor</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="editor-area">
      {/* Editor Tabs */}
      <div className="editor-tabs">
        {openTabs.map(tab => (
          <div
            key={tab.id}
            className={`editor-tab ${activeEditor === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.name}</span>
            <button
              className="editor-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                handleTabClose(tab.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Editor Content */}
      <div className="editor-content">
        {openTabs.length > 0 && activeEditor ? (
          <div ref={editorRef} className="monaco-editor" />
        ) : (
          renderWelcomeScreen()
        )}
      </div>
    </div>
  );
};

export default EditorArea;
