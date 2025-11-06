/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { Download, FileCode, Play, Save } from 'lucide-react';
import { useState } from 'react';

interface CodeEditorProps {
  activeFile: string | null;
}

export function CodeEditor({ activeFile }: CodeEditorProps) {
  const [code, setCode] = useState(`// Welcome to Elara IDE
// AI-Powered Development Platform

function greet(name: string) {
  return \`Hello, \${name}! Welcome to Elara IDE.\`;
}

// Ask Elara for help with:
// - Code generation
// - Debugging
// - Refactoring
// - Testing
// - Documentation

// Example code will be shown in editor
`);

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Editor Header */}
      <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {activeFile || 'welcome.ts'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-accent rounded" title="Save">
            <Save className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-accent rounded" title="Run">
            <Play className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-accent rounded" title="Export">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full p-4 bg-background text-foreground font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-card border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>TypeScript</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}
