/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { AdvancedCodeEditor } from '@/components/advanced-code-editor';
import { AIChatAdvanced } from '@/components/ai-chat-advanced';
import { CommandPalette } from '@/components/command-palette';
import { FileExplorer } from '@/components/file-explorer';
import { IDELayout } from '@/components/ide-layout';
import { Sidebar } from '@/components/sidebar';
import { TerminalPanel } from '@/components/terminal-panel';
import { useCallback, useEffect, useState } from 'react';

export default function Home() {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [fileContent, setFileContent] = useState<Record<string, string>>({});
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const handleFileSelect = useCallback((file: string) => {
    setActiveFile(file);
    if (!fileContent[file]) {
      setFileContent((prev) => ({
        ...prev,
        [file]: '',
      }));
    }
  }, [fileContent]);

  const handleSave = useCallback(async (content: string) => {
    if (!activeFile) return;
    setFileContent((prev) => ({
      ...prev,
      [activeFile]: content,
    }));
    console.log('Saved:', activeFile);
  }, [activeFile]);

  const handleAIRequest = useCallback(async (request: string, context: string): Promise<string> => {
    // TODO: Integrate with Elara core API
    return `AI Response for: ${request}`;
  }, []);

  const handleApplyCode = useCallback((code: string) => {
    if (activeFile) {
      setFileContent((prev) => ({
        ...prev,
        [activeFile]: code,
      }));
    }
  }, [activeFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape' && showCommandPalette) {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette]);

  return (
    <IDELayout>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex min-h-0">
            <FileExplorer
              files={files}
              activeFile={activeFile}
              onFileSelect={handleFileSelect}
            />
            <AdvancedCodeEditor
              activeFile={activeFile}
              fileContent={fileContent[activeFile || '']}
              onSave={handleSave}
              onAIRequest={handleAIRequest}
            />
            <AIChatAdvanced
              codeContext={fileContent[activeFile || '']}
              activeFile={activeFile}
              onApplyCode={handleApplyCode}
            />
          </div>
          <TerminalPanel />
        </div>
      </div>

      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          activeFile={activeFile}
        />
      )}
    </IDELayout>
  );
}
