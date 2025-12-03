import React, { useRef, useState } from 'react';
import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';
import './DiffViewer.css';

interface DiffViewerProps {
  original: string;
  modified: string;
  language: string;
  originalPath?: string;
  modifiedPath?: string;
  onAccept?: () => void;
  onReject?: () => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  original,
  modified,
  language,
  originalPath = 'Original',
  modifiedPath = 'Modified',
  onAccept,
  onReject,
}) => {
  const diffEditorRef = useRef<monacoEditor.editor.IStandaloneDiffEditor | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleDiffEditorDidMount: DiffOnMount = (editor, monaco) => {
    diffEditorRef.current = editor;
    setIsReady(true);

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace",
      fontLigatures: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      readOnly: true,
      renderSideBySide: true,
      ignoreTrimWhitespace: false,
    });
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject();
    }
  };

  return (
    <div className="diff-viewer">
      <div className="diff-header">
        <div className="diff-paths">
          <span className="diff-path original">{originalPath}</span>
          <span className="diff-separator">↔</span>
          <span className="diff-path modified">{modifiedPath}</span>
        </div>
        <div className="diff-actions">
          {onReject && (
            <button className="diff-button reject" onClick={handleReject}>
              Reject Changes
            </button>
          )}
          {onAccept && (
            <button className="diff-button accept" onClick={handleAccept}>
              Accept Changes
            </button>
          )}
        </div>
      </div>
      <div className="diff-content">
        <DiffEditor
          height="100%"
          language={language}
          original={original}
          modified={modified}
          theme="vs-dark"
          onMount={handleDiffEditorDidMount}
          loading={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#cccccc',
            }}>
              Loading Diff Viewer...
            </div>
          }
        />
      </div>
    </div>
  );
};

export default DiffViewer;
