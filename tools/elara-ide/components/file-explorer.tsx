/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { FileCode, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FileExplorerProps {
  files: string[];
  activeFile: string | null;
  onFileSelect: (file: string) => void;
}

export function FileExplorer({ files, activeFile, onFileSelect }: FileExplorerProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">EXPLORER</h2>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 py-2 px-2 hover:bg-accent rounded cursor-pointer">
              <Folder className="w-4 h-4 text-blue-500" />
              <span className="text-sm">src</span>
            </div>
            <div className="ml-4 space-y-1">
              <div className="flex items-center space-x-2 py-2 px-2 hover:bg-accent rounded cursor-pointer">
                <FileCode className="w-4 h-4 text-green-500" />
                <span className="text-sm">app.tsx</span>
              </div>
              <div className="flex items-center space-x-2 py-2 px-2 hover:bg-accent rounded cursor-pointer">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="text-sm">main.ts</span>
              </div>
            </div>
          </div>
          
          {files.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>No files open</p>
              <p className="text-xs mt-2">Open a folder to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
