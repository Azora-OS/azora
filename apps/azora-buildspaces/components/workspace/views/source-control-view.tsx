"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Check,
    Plus,
    Minus,
    GitBranch,
    GitCommit,
    GitMerge,
    RefreshCw,
    MoreVertical,
    FileText,
    Folder,
    Code,
    Settings
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock Git data - in real implementation, this would come from Git API
const mockChanges = [
    { id: '1', file: 'src/app/page.tsx', status: 'modified', staged: false },
    { id: '2', file: 'src/components/Button.tsx', status: 'added', staged: true },
    { id: '3', file: 'package.json', status: 'modified', staged: false },
    { id: '4', file: 'old-file.js', status: 'deleted', staged: false },
]

const mockCommits = [
    {
        id: 'abc123',
        message: 'Add user authentication flow',
        author: 'Alice Johnson',
        date: '2 hours ago',
        files: 5
    },
    {
        id: 'def456',
        message: 'Update UI components',
        author: 'Bob Smith',
        date: '1 day ago',
        files: 12
    },
    {
        id: 'ghi789',
        message: 'Initial project setup',
        author: 'Alice Johnson',
        date: '3 days ago',
        files: 25
    },
]

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'modified': return <Code className="w-4 h-4 text-yellow-500" />
        case 'added': return <Plus className="w-4 h-4 text-green-500" />
        case 'deleted': return <Minus className="w-4 h-4 text-red-500" />
        default: return <FileText className="w-4 h-4 text-gray-400" />
    }
}

const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
        case 'tsx':
        case 'ts':
        case 'jsx':
        case 'js':
            return <Code className="w-4 h-4 text-blue-400" />
        case 'json':
            return <Settings className="w-4 h-4 text-yellow-400" />
        default:
            return <FileText className="w-4 h-4 text-gray-400" />
    }
}

export function SourceControlView() {
    const [commitMessage, setCommitMessage] = useState('')
    const [activeTab, setActiveTab] = useState('changes')

    const stagedChanges = mockChanges.filter(c => c.staged)
    const unstagedChanges = mockChanges.filter(c => !c.staged)

    const handleStage = (changeId: string) => {
        // In real implementation, stage the file
        console.log('Staging file:', changeId)
    }

    const handleUnstage = (changeId: string) => {
        // In real implementation, unstage the file
        console.log('Unstaging file:', changeId)
    }

    const handleCommit = () => {
        if (commitMessage.trim()) {
            // In real implementation, commit the changes
            console.log('Committing with message:', commitMessage)
            setCommitMessage('')
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">main</span>
                        <Badge variant="outline" className="text-xs">↑2 ↓1</Badge>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-6 h-6">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <GitBranch className="w-4 h-4 mr-2" />
                                Create Branch
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <GitMerge className="w-4 h-4 mr-2" />
                                Merge Branch
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Pull
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <GitBranch className="w-4 h-4 mr-2" />
                                Push
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Commit Input */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Commit message..."
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                handleCommit()
                            }
                        }}
                    />
                    <Button
                        size="sm"
                        onClick={handleCommit}
                        disabled={!commitMessage.trim() || stagedChanges.length === 0}
                        className="px-3"
                    >
                        <Check className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mx-3 mt-3">
                    <TabsTrigger value="changes" className="text-xs">
                        Changes ({mockChanges.length})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">
                        History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="changes" className="flex-1 mt-0">
                    <ScrollArea className="h-full">
                        <div className="p-3 space-y-4">
                            {/* Staged Changes */}
                            {stagedChanges.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Staged Changes ({stagedChanges.length})
                                    </h4>
                                    <div className="space-y-1">
                                        {stagedChanges.map((change) => (
                                            <div key={change.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                                                {getStatusIcon(change.status)}
                                                {getFileIcon(change.file)}
                                                <span className="text-sm flex-1 truncate">{change.file}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUnstage(change.id)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Unstaged Changes */}
                            {unstagedChanges.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Changes ({unstagedChanges.length})
                                    </h4>
                                    <div className="space-y-1">
                                        {unstagedChanges.map((change) => (
                                            <div key={change.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                                                {getStatusIcon(change.status)}
                                                {getFileIcon(change.file)}
                                                <span className="text-sm flex-1 truncate">{change.file}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleStage(change.id)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mockChanges.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <GitBranch className="w-8 h-8 opacity-20 mb-2" />
                                    <p className="text-sm">No changes detected.</p>
                                    <p className="text-xs">Your working directory is clean.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="history" className="flex-1 mt-0">
                    <ScrollArea className="h-full">
                        <div className="p-3 space-y-3">
                            {mockCommits.map((commit) => (
                                <div key={commit.id} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 border border-border/50">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <GitCommit className="w-4 h-4 text-primary" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{commit.message}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <span>{commit.author}</span>
                                            <span>•</span>
                                            <span>{commit.date}</span>
                                            <span>•</span>
                                            <span>{commit.files} files</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono mt-1">
                                            {commit.id.slice(0, 7)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    )
}
