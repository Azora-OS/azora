/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { 
  FileCode2, 
  Search, 
  GitBranch, 
  Bug, 
  Package, 
  Settings,
  Sparkles
} from 'lucide-react';

export function Sidebar() {
  const tools = [
    { icon: FileCode2, label: 'Explorer', active: true },
    { icon: Search, label: 'Search' },
    { icon: GitBranch, label: 'Source Control' },
    { icon: Bug, label: 'Debug' },
    { icon: Package, label: 'Extensions' },
    { icon: Sparkles, label: 'Elara AI' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 space-y-4">
      {tools.map((tool, idx) => (
        <button
          key={idx}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
            tool.active
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
          }`}
          title={tool.label}
        >
          <tool.icon className="w-6 h-6" />
        </button>
      ))}
    </div>
  );
}
