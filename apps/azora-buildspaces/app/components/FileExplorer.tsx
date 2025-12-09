"use client";

import { useState } from "react";
import {
    ChevronRight, ChevronDown, FileCode, Folder, FolderOpen,
    Plus, Trash2, Edit2, MoreHorizontal, File
} from "lucide-react";
import { FileNode, useFileSystem } from "./VirtualFileSystem";

interface FileExplorerProps {
    onFileSelect?: (file: FileNode) => void;
}

// File icon based on extension
function getFileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
        'ts': '📘',
        'tsx': '⚛️',
        'js': '📒',
        'jsx': '⚛️',
        'py': '🐍',
        'rs': '🦀',
        'go': '🐹',
        'json': '📋',
        'md': '📝',
        'html': '🌐',
        'css': '🎨',
        'scss': '🎨',
        'yaml': '⚙️',
        'yml': '⚙️',
        'sql': '🗃️',
        'env': '🔐',
        'gitignore': '📦',
    };
    return iconMap[ext || ''] || '📄';
}

// File tree node component
function FileTreeNode({
    node,
    depth = 0,
    onSelect
}: {
    node: FileNode;
    depth?: number;
    onSelect?: (file: FileNode) => void;
}) {
    const { activeFile, toggleFolder, openFile, deleteFile, renameFile } = useFileSystem();
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(node.name);
    const [showMenu, setShowMenu] = useState(false);

    const isActive = activeFile?.id === node.id;

    const handleClick = () => {
        if (node.type === 'folder') {
            toggleFolder(node.path);
        } else {
            openFile(node);
            onSelect?.(node);
        }
    };

    const handleRename = () => {
        if (newName && newName !== node.name) {
            renameFile(node.path, newName);
        }
        setIsRenaming(false);
    };

    const handleDelete = () => {
        if (confirm(`Delete ${node.name}?`)) {
            deleteFile(node.path);
        }
        setShowMenu(false);
    };

    return (
        <div>
            <div
                className={`group flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                    }`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={handleClick}
            >
                {node.type === 'folder' ? (
                    <>
                        {node.isOpen ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        {node.isOpen ? (
                            <FolderOpen className="w-4 h-4 text-yellow-500" />
                        ) : (
                            <Folder className="w-4 h-4 text-yellow-500" />
                        )}
                    </>
                ) : (
                    <>
                        <span className="w-4" />
                        <span>{getFileIcon(node.name)}</span>
                    </>
                )}

                {isRenaming ? (
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        className="flex-1 bg-muted border border-border rounded px-1 text-xs"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className={`flex-1 truncate ${node.modified ? 'italic' : ''}`}>
                        {node.name}
                        {node.modified && <span className="text-yellow-500 ml-1">●</span>}
                    </span>
                )}

                {/* Action buttons */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1 hover:bg-muted rounded"
                    >
                        <MoreHorizontal className="w-3 h-3" />
                    </button>
                </div>

                {/* Context menu */}
                {showMenu && (
                    <div
                        className="absolute right-0 mt-1 bg-card border border-border rounded shadow-lg py-1 z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                setIsRenaming(true);
                                setShowMenu(false);
                            }}
                            className="w-full px-3 py-1 text-left text-sm hover:bg-muted flex items-center gap-2"
                        >
                            <Edit2 className="w-3 h-3" />
                            Rename
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-full px-3 py-1 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-500"
                        >
                            <Trash2 className="w-3 h-3" />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Children */}
            {node.type === 'folder' && node.isOpen && node.children && (
                <div>
                    {node.children.map((child) => (
                        <FileTreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function FileExplorer({ onFileSelect }: FileExplorerProps) {
    const { files, createFile } = useFileSystem();
    const [showNewFile, setShowNewFile] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file');

    const handleCreateFile = () => {
        if (newFileName) {
            // Create in root project folder
            const projectPath = files[0]?.path || '/project';
            createFile(projectPath, newFileName, newFileType);
            setNewFileName('');
            setShowNewFile(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Explorer
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            setNewFileType('file');
                            setShowNewFile(true);
                        }}
                        className="p-1 hover:bg-muted rounded"
                        title="New File"
                    >
                        <File className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            setNewFileType('folder');
                            setShowNewFile(true);
                        }}
                        className="p-1 hover:bg-muted rounded"
                        title="New Folder"
                    >
                        <Folder className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* New file input */}
            {showNewFile && (
                <div className="p-2 border-b border-border flex items-center gap-2">
                    {newFileType === 'folder' ? (
                        <Folder className="w-4 h-4 text-yellow-500" />
                    ) : (
                        <File className="w-4 h-4" />
                    )}
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onBlur={() => !newFileName && setShowNewFile(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateFile();
                            if (e.key === 'Escape') setShowNewFile(false);
                        }}
                        placeholder={`New ${newFileType}...`}
                        className="flex-1 bg-muted border border-border rounded px-2 py-1 text-sm"
                        autoFocus
                    />
                </div>
            )}

            {/* File tree */}
            <div className="flex-1 overflow-auto py-2">
                {files.map((node) => (
                    <FileTreeNode
                        key={node.id}
                        node={node}
                        onSelect={onFileSelect}
                    />
                ))}
            </div>
        </div>
    );
}
