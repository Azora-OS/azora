"use client";

import { useState, createContext, useContext, ReactNode } from "react";

// File node types
export interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    language?: string;
    children?: FileNode[];
    isOpen?: boolean;
    modified?: boolean;
    path: string;
}

// File system context
interface FileSystemContextType {
    files: FileNode[];
    activeFile: FileNode | null;
    openFiles: FileNode[];
    setFiles: (files: FileNode[]) => void;
    setActiveFile: (file: FileNode | null) => void;
    openFile: (file: FileNode) => void;
    closeFile: (fileId: string) => void;
    createFile: (path: string, name: string, type: 'file' | 'folder') => void;
    deleteFile: (path: string) => void;
    renameFile: (path: string, newName: string) => void;
    saveFile: (path: string, content: string) => void;
    toggleFolder: (path: string) => void;
    getFileByPath: (path: string) => FileNode | null;
}

const FileSystemContext = createContext<FileSystemContextType | null>(null);

// Default project structure
const defaultFiles: FileNode[] = [
    {
        id: '1',
        name: 'my-project',
        type: 'folder',
        path: '/my-project',
        isOpen: true,
        children: [
            {
                id: '2',
                name: 'src',
                type: 'folder',
                path: '/my-project/src',
                isOpen: true,
                children: [
                    {
                        id: '3',
                        name: 'index.ts',
                        type: 'file',
                        path: '/my-project/src/index.ts',
                        language: 'typescript',
                        content: `// Welcome to the Code Chamber
// Your AI-powered development environment by The Citadel

function greet(name: string): string {
  return \`Hello, \${name}! Welcome to Azora BuildSpaces.\`;
}

// Try asking Themba to help you build something!
console.log(greet("Builder"));
`
                    },
                    {
                        id: '4',
                        name: 'utils.ts',
                        type: 'file',
                        path: '/my-project/src/utils.ts',
                        language: 'typescript',
                        content: `// Utility functions

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}
`
                    },
                    {
                        id: '5',
                        name: 'types.ts',
                        type: 'file',
                        path: '/my-project/src/types.ts',
                        language: 'typescript',
                        content: `// Type definitions

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: User;
}
`
                    }
                ]
            },
            {
                id: '6',
                name: 'public',
                type: 'folder',
                path: '/my-project/public',
                isOpen: false,
                children: [
                    {
                        id: '7',
                        name: 'index.html',
                        type: 'file',
                        path: '/my-project/public/index.html',
                        language: 'html',
                        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My BuildSpaces Project</title>
</head>
<body>
  <div id="app"></div>
  <script src="/src/index.ts" type="module"></script>
</body>
</html>
`
                    }
                ]
            },
            {
                id: '8',
                name: 'package.json',
                type: 'file',
                path: '/my-project/package.json',
                language: 'json',
                content: `{
  "name": "my-buildspaces-project",
  "version": "1.0.0",
  "description": "A project built in Azora BuildSpaces",
  "main": "src/index.ts",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
`
            },
            {
                id: '9',
                name: 'tsconfig.json',
                type: 'file',
                path: '/my-project/tsconfig.json',
                language: 'json',
                content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
`
            },
            {
                id: '10',
                name: 'README.md',
                type: 'file',
                path: '/my-project/README.md',
                language: 'markdown',
                content: `# My BuildSpaces Project

Built with ❤️ in Azora BuildSpaces by The Citadel.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- TypeScript support
- Vite for fast development
- AI-powered assistance from Themba
`
            }
        ]
    }
];

// Provider component
export function FileSystemProvider({ children }: { children: ReactNode }) {
    const [files, setFiles] = useState<FileNode[]>(defaultFiles);
    const [activeFile, setActiveFile] = useState<FileNode | null>(null);
    const [openFiles, setOpenFiles] = useState<FileNode[]>([]);

    const openFile = (file: FileNode) => {
        if (file.type !== 'file') return;

        if (!openFiles.find(f => f.id === file.id)) {
            setOpenFiles(prev => [...prev, file]);
        }
        setActiveFile(file);
    };

    const closeFile = (fileId: string) => {
        setOpenFiles(prev => prev.filter(f => f.id !== fileId));
        if (activeFile?.id === fileId) {
            const remaining = openFiles.filter(f => f.id !== fileId);
            setActiveFile(remaining.length > 0 ? remaining[remaining.length - 1] : null);
        }
    };

    const createFile = (parentPath: string, name: string, type: 'file' | 'folder') => {
        const newFile: FileNode = {
            id: Date.now().toString(),
            name,
            type,
            path: `${parentPath}/${name}`,
            content: type === 'file' ? '' : undefined,
            children: type === 'folder' ? [] : undefined,
            language: type === 'file' ? getLanguageFromName(name) : undefined
        };

        const addToParent = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === parentPath && node.type === 'folder') {
                    return {
                        ...node,
                        children: [...(node.children || []), newFile]
                    };
                }
                if (node.children) {
                    return {
                        ...node,
                        children: addToParent(node.children)
                    };
                }
                return node;
            });
        };

        setFiles(addToParent(files));
    };

    const deleteFile = (path: string) => {
        const removeFromTree = (nodes: FileNode[]): FileNode[] => {
            return nodes
                .filter(node => node.path !== path)
                .map(node => ({
                    ...node,
                    children: node.children ? removeFromTree(node.children) : undefined
                }));
        };

        setFiles(removeFromTree(files));
        setOpenFiles(prev => prev.filter(f => f.path !== path));
        if (activeFile?.path === path) {
            setActiveFile(null);
        }
    };

    const renameFile = (path: string, newName: string) => {
        const updateName = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === path) {
                    const newPath = path.replace(/[^/]+$/, newName);
                    return { ...node, name: newName, path: newPath };
                }
                if (node.children) {
                    return { ...node, children: updateName(node.children) };
                }
                return node;
            });
        };

        setFiles(updateName(files));
    };

    const saveFile = (path: string, content: string) => {
        const updateContent = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === path) {
                    return { ...node, content, modified: false };
                }
                if (node.children) {
                    return { ...node, children: updateContent(node.children) };
                }
                return node;
            });
        };

        setFiles(updateContent(files));

        // Update in open files too
        setOpenFiles(prev => prev.map(f =>
            f.path === path ? { ...f, content, modified: false } : f
        ));

        if (activeFile?.path === path) {
            setActiveFile({ ...activeFile, content, modified: false });
        }
    };

    const toggleFolder = (path: string) => {
        const toggle = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === path && node.type === 'folder') {
                    return { ...node, isOpen: !node.isOpen };
                }
                if (node.children) {
                    return { ...node, children: toggle(node.children) };
                }
                return node;
            });
        };

        setFiles(toggle(files));
    };

    const getFileByPath = (path: string): FileNode | null => {
        const find = (nodes: FileNode[]): FileNode | null => {
            for (const node of nodes) {
                if (node.path === path) return node;
                if (node.children) {
                    const found = find(node.children);
                    if (found) return found;
                }
            }
            return null;
        };

        return find(files);
    };

    return (
        <FileSystemContext.Provider value={{
            files,
            activeFile,
            openFiles,
            setFiles,
            setActiveFile,
            openFile,
            closeFile,
            createFile,
            deleteFile,
            renameFile,
            saveFile,
            toggleFolder,
            getFileByPath
        }}>
            {children}
        </FileSystemContext.Provider>
    );
}

// Hook to use file system
export function useFileSystem() {
    const context = useContext(FileSystemContext);
    if (!context) {
        throw new Error('useFileSystem must be used within a FileSystemProvider');
    }
    return context;
}

// Helper to get language from filename
function getLanguageFromName(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'rs': 'rust',
        'go': 'go',
        'json': 'json',
        'md': 'markdown',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'yaml': 'yaml',
        'yml': 'yaml',
        'sql': 'sql',
    };
    return langMap[ext || ''] || 'plaintext';
}
