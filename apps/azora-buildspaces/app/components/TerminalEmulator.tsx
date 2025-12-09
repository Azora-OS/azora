"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from "lucide-react";

interface TerminalLine {
    id: string;
    type: 'input' | 'output' | 'error' | 'system';
    content: string;
    timestamp: Date;
}

interface TerminalProps {
    onClose?: () => void;
    onMaximize?: () => void;
    isMaximized?: boolean;
    initialCommands?: string[];
    cwd?: string;
}

// Simulated file system for web-based terminal
const virtualFS: Record<string, string> = {
    '/home/builder/project/index.ts': `// Main entry point
export function main() {
  console.log("Hello from BuildSpaces!");
}`,
    '/home/builder/project/utils.ts': `export function add(a: number, b: number) {
  return a + b;
}`,
    '/home/builder/project/package.json': `{
  "name": "my-project",
  "version": "1.0.0",
  "main": "index.ts"
}`,
};

export default function TerminalEmulator({
    onClose,
    onMaximize,
    isMaximized = false,
    initialCommands = [],
    cwd: initialCwd = '/home/builder/project'
}: TerminalProps) {
    const [lines, setLines] = useState<TerminalLine[]>([
        {
            id: '0',
            type: 'system',
            content: '🏛️ Azora BuildSpaces Terminal v1.0.0',
            timestamp: new Date()
        },
        {
            id: '1',
            type: 'system',
            content: 'Type "help" for available commands.',
            timestamp: new Date()
        }
    ]);
    const [currentInput, setCurrentInput] = useState('');
    const [cwd, setCwd] = useState(initialCwd);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isRunning, setIsRunning] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [lines]);

    // Focus input on click
    const focusInput = () => inputRef.current?.focus();

    // Execute command
    const executeCommand = async (command: string) => {
        const trimmedCmd = command.trim();
        if (!trimmedCmd) return;

        // Add to history
        setCommandHistory(prev => [...prev, trimmedCmd]);
        setHistoryIndex(-1);

        // Add input line
        const inputLine: TerminalLine = {
            id: Date.now().toString(),
            type: 'input',
            content: `${getPrompt()} ${trimmedCmd}`,
            timestamp: new Date()
        };
        setLines(prev => [...prev, inputLine]);
        setCurrentInput('');

        // Parse and execute
        const parts = trimmedCmd.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        setIsRunning(true);

        try {
            const output = await processCommand(cmd, args);
            if (output) {
                const outputLines = output.split('\n').map((content, i) => ({
                    id: `${Date.now()}-${i}`,
                    type: output.startsWith('Error:') ? 'error' as const : 'output' as const,
                    content,
                    timestamp: new Date()
                }));
                setLines(prev => [...prev, ...outputLines]);
            }
        } catch (error) {
            setLines(prev => [...prev, {
                id: Date.now().toString(),
                type: 'error',
                content: `Error: ${error}`,
                timestamp: new Date()
            }]);
        }

        setIsRunning(false);
    };

    const getPrompt = () => `builder@buildspaces:${cwd.replace('/home/builder', '~')}$`;

    // Process commands
    const processCommand = async (cmd: string, args: string[]): Promise<string> => {
        switch (cmd) {
            case 'help':
                return `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  ls            - List directory contents
  cd <dir>      - Change directory
  pwd           - Print working directory
  cat <file>    - Show file contents
  mkdir <dir>   - Create directory
  touch <file>  - Create empty file
  echo <text>   - Print text
  node <file>   - Run JavaScript/TypeScript file
  npm <cmd>     - Run npm commands (simulated)
  git <cmd>     - Run git commands (connects to GitHub API)
  whoami        - Show current user
  date          - Show current date/time
  env           - Show environment variables
  exit          - Close terminal`;

            case 'clear':
                setLines([]);
                return '';

            case 'ls':
                const dir = args[0] || cwd;
                const filesInDir = Object.keys(virtualFS)
                    .filter(path => path.startsWith(dir) && path !== dir)
                    .map(path => {
                        const relativePath = path.replace(dir + '/', '');
                        const firstPart = relativePath.split('/')[0];
                        return firstPart;
                    })
                    .filter((v, i, a) => a.indexOf(v) === i); // unique
                return filesInDir.length > 0
                    ? filesInDir.join('  ')
                    : 'No files found';

            case 'cd':
                if (!args[0] || args[0] === '~') {
                    setCwd('/home/builder');
                    return '';
                }
                if (args[0] === '..') {
                    const newCwd = cwd.split('/').slice(0, -1).join('/') || '/';
                    setCwd(newCwd);
                    return '';
                }
                const newPath = args[0].startsWith('/')
                    ? args[0]
                    : `${cwd}/${args[0]}`;
                setCwd(newPath);
                return '';

            case 'pwd':
                return cwd;

            case 'cat':
                if (!args[0]) return 'Error: No file specified';
                const filePath = args[0].startsWith('/')
                    ? args[0]
                    : `${cwd}/${args[0]}`;
                return virtualFS[filePath] || `Error: File not found: ${args[0]}`;

            case 'mkdir':
                return `Created directory: ${args[0] || 'unnamed'}`;

            case 'touch':
                if (!args[0]) return 'Error: No filename specified';
                const newFilePath = args[0].startsWith('/')
                    ? args[0]
                    : `${cwd}/${args[0]}`;
                virtualFS[newFilePath] = '';
                return `Created: ${args[0]}`;

            case 'echo':
                return args.join(' ');

            case 'whoami':
                return 'builder';

            case 'date':
                return new Date().toString();

            case 'env':
                return `NODE_ENV=development
BUILDSPACES_VERSION=1.0.0
USER=builder
HOME=/home/builder
PWD=${cwd}`;

            case 'node':
            case 'npx':
            case 'ts-node':
                if (!args[0]) return 'Error: No file specified';
                // Simulate execution
                await new Promise(r => setTimeout(r, 500));
                return `Executing ${args[0]}...
Hello from BuildSpaces!
[Process exited with code 0]`;

            case 'npm':
                const npmCmd = args[0];
                switch (npmCmd) {
                    case 'install':
                    case 'i':
                        await new Promise(r => setTimeout(r, 1000));
                        return `added 42 packages in 2.1s`;
                    case 'run':
                        await new Promise(r => setTimeout(r, 500));
                        return `> ${args[1] || 'start'}
Running...`;
                    case 'test':
                        await new Promise(r => setTimeout(r, 800));
                        return `PASS  All tests passed
Tests: 5 passed, 5 total
Time: 1.2s`;
                    default:
                        return `npm ${args.join(' ')}: command executed`;
                }

            case 'git':
                const gitCmd = args[0];
                switch (gitCmd) {
                    case 'status':
                        return `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean`;
                    case 'log':
                        return `commit abc123 (HEAD -> main, origin/main)
Author: Builder <builder@azora.io>
Date:   ${new Date().toDateString()}

    Initial commit`;
                    case 'branch':
                        return `* main
  feature/code-chamber
  feature/github-integration`;
                    default:
                        return `git ${args.join(' ')}: Use GitHub panel for full Git operations`;
                }

            case 'exit':
                onClose?.();
                return '';

            default:
                return `Command not found: ${cmd}. Type "help" for available commands.`;
        }
    };

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            executeCommand(currentInput);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex < commandHistory.length - 1
                    ? historyIndex + 1
                    : historyIndex;
                setHistoryIndex(newIndex);
                setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
            } else {
                setHistoryIndex(-1);
                setCurrentInput('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Simple autocomplete for files
            const parts = currentInput.split(' ');
            const lastPart = parts[parts.length - 1];
            const matches = Object.keys(virtualFS)
                .map(p => p.split('/').pop() || '')
                .filter(f => f.startsWith(lastPart));
            if (matches.length === 1) {
                parts[parts.length - 1] = matches[0];
                setCurrentInput(parts.join(' '));
            }
        } else if (e.key === 'c' && e.ctrlKey) {
            setLines(prev => [...prev, {
                id: Date.now().toString(),
                type: 'system',
                content: '^C',
                timestamp: new Date()
            }]);
            setCurrentInput('');
            setIsRunning(false);
        }
    };

    return (
        <div className="h-full bg-black text-green-400 font-mono text-sm flex flex-col">
            {/* Terminal Header */}
            <div className="bg-zinc-900 px-3 py-2 flex items-center justify-between border-b border-zinc-700">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4" />
                    <span className="text-xs text-zinc-400">Terminal — {cwd}</span>
                </div>
                <div className="flex items-center gap-1">
                    {onMaximize && (
                        <button
                            onClick={onMaximize}
                            className="p-1 hover:bg-zinc-700 rounded"
                        >
                            {isMaximized ? (
                                <Minimize2 className="w-3 h-3 text-zinc-400" />
                            ) : (
                                <Maximize2 className="w-3 h-3 text-zinc-400" />
                            )}
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-zinc-700 rounded"
                        >
                            <X className="w-3 h-3 text-zinc-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Terminal Content */}
            <div
                ref={terminalRef}
                className="flex-1 overflow-auto p-3 cursor-text"
                onClick={focusInput}
            >
                {lines.map((line) => (
                    <div
                        key={line.id}
                        className={`leading-relaxed ${line.type === 'error' ? 'text-red-400' :
                                line.type === 'system' ? 'text-blue-400' :
                                    line.type === 'input' ? 'text-white' :
                                        'text-green-400'
                            }`}
                    >
                        {line.content || ' '}
                    </div>
                ))}

                {/* Current Input Line */}
                <div className="flex items-center">
                    <span className="text-cyan-400">{getPrompt()}</span>
                    <span className="ml-2">{currentInput}</span>
                    <span className="animate-pulse">▋</span>
                </div>

                {/* Hidden input for keyboard capture */}
                <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="absolute opacity-0 pointer-events-none"
                    autoFocus
                />
            </div>
        </div>
    );
}
