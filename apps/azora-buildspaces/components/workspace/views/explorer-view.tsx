"use client"

import { useFileSystem } from "@/lib/stores/file-system"
import { ChevronRight, ChevronDown, File, Folder } from "lucide-react"
import { useState } from "react"

export function ExplorerView() {
    const { fileMap, openFile, activeFileId } = useFileSystem()

    // Simple flat list for now, recursive tree later
    const files = Object.values(fileMap)

    return (
        <div className="flex flex-col h-full">
            <div className="p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Folders</span>
            </div>
            <div className="flex-1 overflow-auto">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={`flex items-center gap-1.5 px-3 py-1 text-sm cursor-pointer select-none transition-colors ${activeFileId === file.id
                                ? "bg-accent/20 text-accent"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                        onClick={() => openFile(file.id)}
                        style={{ paddingLeft: file.parentId ? '24px' : '12px' }}
                    >
                        {file.type === 'directory' ? (
                            <Folder className="w-4 h-4 text-blue-400" />
                        ) : (
                            <File className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="truncate">{file.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
