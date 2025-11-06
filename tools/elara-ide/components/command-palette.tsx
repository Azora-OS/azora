/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import {
  FileCode,
  FileText,
  GitBranch,
  RefreshCw, Save,
  Search,
  Settings,
  Sparkles,
  Terminal,
  Wand2,
  Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  onClose: () => void;
  activeFile?: string | null;
}

export function CommandPalette({ onClose, activeFile }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // AI Commands
    {
      id: 'ai-generate',
      label: 'AI: Generate Code',
      icon: <Sparkles className="w-4 h-4" />,
      category: 'AI',
      action: () => {
        console.log('Generate code with AI');
        onClose();
      },
      keywords: ['generate', 'ai', 'create', 'new'],
    },
    {
      id: 'ai-explain',
      label: 'AI: Explain Code',
      icon: <FileText className="w-4 h-4" />,
      category: 'AI',
      action: () => {
        console.log('Explain code');
        onClose();
      },
      keywords: ['explain', 'what', 'how', 'understand'],
    },
    {
      id: 'ai-refactor',
      label: 'AI: Refactor Code',
      icon: <Wand2 className="w-4 h-4" />,
      category: 'AI',
      action: () => {
        console.log('Refactor code');
        onClose();
      },
      keywords: ['refactor', 'optimize', 'improve', 'clean'],
    },
    {
      id: 'ai-debug',
      label: 'AI: Debug Error',
      icon: <Zap className="w-4 h-4" />,
      category: 'AI',
      action: () => {
        console.log('Debug error');
        onClose();
      },
      keywords: ['debug', 'error', 'fix', 'bug'],
    },

    // File Commands
    {
      id: 'file-new',
      label: 'New File',
      icon: <FileCode className="w-4 h-4" />,
      category: 'File',
      action: () => {
        console.log('New file');
        onClose();
      },
      keywords: ['new', 'file', 'create'],
    },
    {
      id: 'file-save',
      label: 'Save File',
      icon: <Save className="w-4 h-4" />,
      category: 'File',
      action: () => {
        console.log('Save file');
        onClose();
      },
      keywords: ['save', 'file'],
    },
    {
      id: 'file-reload',
      label: 'Reload File',
      icon: <RefreshCw className="w-4 h-4" />,
      category: 'File',
      action: () => {
        console.log('Reload file');
        onClose();
      },
      keywords: ['reload', 'refresh'],
    },

    // Git Commands
    {
      id: 'git-status',
      label: 'Git: Status',
      icon: <GitBranch className="w-4 h-4" />,
      category: 'Git',
      action: () => {
        console.log('Git status');
        onClose();
      },
      keywords: ['git', 'status', 'branch'],
    },
    {
      id: 'git-commit',
      label: 'Git: Commit (AI)',
      icon: <Sparkles className="w-4 h-4" />,
      category: 'Git',
      action: () => {
        console.log('AI commit');
        onClose();
      },
      keywords: ['commit', 'git', 'ai'],
    },

    // Terminal
    {
      id: 'terminal-new',
      label: 'New Terminal',
      icon: <Terminal className="w-4 h-4" />,
      category: 'Terminal',
      action: () => {
        console.log('New terminal');
        onClose();
      },
      keywords: ['terminal', 'shell', 'cmd'],
    },

    // Settings
    {
      id: 'settings',
      label: 'Open Settings',
      icon: <Settings className="w-4 h-4" />,
      category: 'Settings',
      action: () => {
        console.log('Open settings');
        onClose();
      },
      keywords: ['settings', 'preferences', 'config'],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((kw) => kw.includes(searchLower)) ||
      cmd.category.toLowerCase().includes(searchLower)
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    inputRef.current?.focus();
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const executeCommand = (command: Command) => {
    command.action();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[60vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search... (AI commands start with 'AI:')"
              className="flex-1 bg-background border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
            />
            <kbd className="px-2 py-1 bg-accent rounded text-xs text-muted-foreground">
              ESC
            </kbd>
          </div>
        </div>

        {/* Commands List */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category} className="py-2">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">
                {category}
              </div>
              {cmds.map((cmd, idx) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                const isSelected = globalIndex === selectedIndex;

                return (
                  <div
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    className={`px-4 py-2 flex items-center space-x-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className={isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}>
                      {cmd.icon}
                    </div>
                    <span className="flex-1 text-sm">{cmd.label}</span>
                    {cmd.id === 'git-commit' && (
                      <span className="text-xs px-2 py-0.5 bg-primary/20 rounded">
                        AI
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p>No commands found</p>
              <p className="text-xs mt-2">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-card/50 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-accent rounded">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-accent rounded">Enter</kbd> Select
            </span>
          </div>
          <div>
            {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

