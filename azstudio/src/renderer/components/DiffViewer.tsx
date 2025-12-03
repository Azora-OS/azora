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

  const handleDiffEditorDidMount: DiffOnMount = (editor, _monaco) => {
    diffEditorRef.current = editor;
    setIsReady(true);
  };

  return (
    <div className="diff-viewer">
      <div className="diff-header">
         <span>{originalPath} ↔ {modifiedPath}</span>
         {isReady && <span> (Ready)</span>}
      </div>
      <DiffEditor
        height="90vh"
        language={language}
        original={original}
        modified={modified}
        onMount={handleDiffEditorDidMount}
      />
      <div className="diff-actions">
        {onAccept && <button onClick={onAccept}>Accept</button>}
        {onReject && <button onClick={onReject}>Reject</button>}
      </div>
    </div>
  );
};

export default DiffViewer;
