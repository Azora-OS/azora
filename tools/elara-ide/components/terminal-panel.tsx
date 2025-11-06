/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { useState } from 'react';
import { Terminal, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export function TerminalPanel() {
  const [expanded, setExpanded] = useState(true);
  const [output, setOutput] = useState([
    { type: 'info', text: 'Welcome to Elara IDE Terminal' },
    { type: 'success', text: '✓ Development server started' },
    { type: 'info', text: '➜ Local:   http://localhost:3002' },
  ]);

  return (
    <div className={`bg-card border-t border-border transition-all duration-300 ${
      expanded ? 'h-64' : 'h-12'
    }`}>
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Terminal</span>
          </div>
          <button className="p-1 hover:bg-accent rounded">
            <Plus className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="h-[calc(100%-3rem)] overflow-y-auto p-4 font-mono text-sm">
          <div className="space-y-1">
            {output.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.type === 'success' ? 'text-green-500' :
                  line.type === 'error' ? 'text-red-500' :
                  'text-muted-foreground'
                }
              >
                {line.text}
              </div>
            ))}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-primary">$</span>
              <input
                type="text"
                className="flex-1 bg-transparent focus:outline-none text-foreground"
                placeholder="Type a command..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
