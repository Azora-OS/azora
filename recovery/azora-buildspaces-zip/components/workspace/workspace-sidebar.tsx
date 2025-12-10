"use client"

import { useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  FileCode,
  Folder,
  FolderOpen,
  Plus,
  Search,
  RefreshCw,
  MoreVertical,
  FileText,
  FileJson,
  FileCog,
  ImageIcon,
  GitBranch,
  Star,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

interface WorkspaceSidebarProps {
  activeFile: string
  onFileSelect: (file: string) => void
  activePanel: "files" | "search" | "git" | "extensions"
}

const fileTree = [
  {
    name: "app",
    type: "folder",
    children: [
      { name: "page.tsx", type: "file" },
      { name: "layout.tsx", type: "file" },
      { name: "globals.css", type: "file" },
      {
        name: "api",
        type: "folder",
        children: [
          {
            name: "auth",
            type: "folder",
            children: [
              { name: "login", type: "folder", children: [{ name: "route.ts", type: "file" }] },
              { name: "register", type: "folder", children: [{ name: "route.ts", type: "file" }] },
            ],
          },
        ],
      },
      {
        name: "dashboard",
        type: "folder",
        children: [
          { name: "page.tsx", type: "file" },
          { name: "loading.tsx", type: "file" },
        ],
      },
    ],
  },
  {
    name: "components",
    type: "folder",
    children: [
      {
        name: "auth",
        type: "folder",
        children: [
          { name: "login-form.tsx", type: "file" },
          { name: "signup-form.tsx", type: "file" },
        ],
      },
      {
        name: "ui",
        type: "folder",
        children: [
          { name: "button.tsx", type: "file" },
          { name: "card.tsx", type: "file" },
          { name: "input.tsx", type: "file" },
        ],
      },
      { name: "header.tsx", type: "file" },
      { name: "footer.tsx", type: "file" },
    ],
  },
  {
    name: "lib",
    type: "folder",
    children: [
      { name: "utils.ts", type: "file" },
      { name: "api.ts", type: "file" },
      { name: "auth.ts", type: "file" },
    ],
  },
  { name: "package.json", type: "file" },
  { name: "tailwind.config.js", type: "file" },
  { name: "tsconfig.json", type: "file" },
]

const recentFiles = [
  { name: "page.tsx", path: "app/page.tsx", time: "2 min ago" },
  { name: "login-form.tsx", path: "components/auth/login-form.tsx", time: "5 min ago" },
  { name: "route.ts", path: "app/api/auth/login/route.ts", time: "12 min ago" },
  { name: "layout.tsx", path: "app/layout.tsx", time: "1 hour ago" },
]

const gitChanges = [
  { name: "page.tsx", status: "modified", path: "app/page.tsx" },
  { name: "login-form.tsx", status: "added", path: "components/auth/login-form.tsx" },
  { name: "globals.css", status: "modified", path: "app/globals.css" },
]

const searchResults = [
  { file: "page.tsx", line: 12, content: "export default function HomePage()" },
  { file: "layout.tsx", line: 8, content: "export default function RootLayout" },
  { file: "button.tsx", line: 5, content: "export function Button(props)" },
]

const getFileIcon = (name: string) => {
  if (name.endsWith(".tsx") || name.endsWith(".ts")) return FileCode
  if (name.endsWith(".json")) return FileJson
  if (name.endsWith(".css")) return FileCog
  if (name.endsWith(".svg") || name.endsWith(".ico") || name.endsWith(".png")) return ImageIcon
  return FileText
}

const getFileIconColor = (name: string) => {
  if (name.endsWith(".tsx")) return "text-blue-400"
  if (name.endsWith(".ts")) return "text-blue-500"
  if (name.endsWith(".css")) return "text-pink-400"
  if (name.endsWith(".json")) return "text-yellow-400"
  return "text-muted-foreground"
}

interface FileNodeProps {
  node: any
  depth: number
  activeFile: string
  onFileSelect: (file: string) => void
}

function FileNode({ node, depth, activeFile, onFileSelect }: FileNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 2)
  const isFolder = node.type === "folder"
  const isActive = node.name === activeFile
  const FileIcon = getFileIcon(node.name)

  return (
    <div>
      <button
        onClick={() => (isFolder ? setIsOpen(!isOpen) : onFileSelect(node.name))}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm rounded-md transition-all group ${
          isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <FileIcon className={`w-4 h-4 shrink-0 ${getFileIconColor(node.name)}`} />
          </>
        )}
        <span className="truncate flex-1 text-left text-xs">{node.name}</span>

        {!isFolder && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted shrink-0"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Star className="w-3 h-3 mr-2" />
                Add to favorites
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-3 h-3 mr-2" />
                Copy path
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="w-3 h-3 mr-2" />
                Open in new tab
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="w-3 h-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </button>

      <AnimatePresence>
        {isFolder && isOpen && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {node.children.map((child: any) => (
              <FileNode
                key={child.name}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function WorkspaceSidebar({ activeFile, onFileSelect, activePanel }: WorkspaceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="p-2 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-sidebar-accent text-sm">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activePanel === "search" ? "Search in files..." : "Filter files..."}
            className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activePanel === "files" && (
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Explorer</span>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Plus className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Recent Files Section */}
            <div className="mb-3">
              <button className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                <Clock className="w-3 h-3" />
                <span>Recent</span>
              </button>
              <div className="ml-4 space-y-0.5">
                {recentFiles.slice(0, 3).map((file) => (
                  <button
                    key={file.path}
                    onClick={() => onFileSelect(file.name)}
                    className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
                      activeFile === file.name
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <FileCode className={`w-3 h-3 ${getFileIconColor(file.name)}`} />
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Tree */}
            {fileTree.map((node) => (
              <FileNode key={node.name} node={node} depth={0} activeFile={activeFile} onFileSelect={onFileSelect} />
            ))}
          </div>
        )}

        {activePanel === "search" && (
          <div className="p-2 space-y-2">
            <div className="flex items-center gap-2 px-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Results</span>
              <span className="text-[10px] text-muted-foreground">{searchResults.length} matches</span>
            </div>
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => onFileSelect(result.file)}
                className="w-full p-2 rounded-lg hover:bg-sidebar-accent text-left transition-colors"
              >
                <div className="flex items-center gap-2 text-xs">
                  <FileCode className={`w-3 h-3 ${getFileIconColor(result.file)}`} />
                  <span className="font-medium">{result.file}</span>
                  <span className="text-muted-foreground">:{result.line}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 truncate font-mono">{result.content}</p>
              </button>
            ))}
          </div>
        )}

        {activePanel === "git" && (
          <div className="p-2 space-y-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
              <GitBranch className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <div className="text-xs font-medium">main</div>
                <div className="text-[10px] text-muted-foreground">Current branch</div>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Changes ({gitChanges.length})
              </h4>
              {gitChanges.map((change) => (
                <button
                  key={change.path}
                  onClick={() => onFileSelect(change.name)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent text-left"
                >
                  <FileCode className={`w-3 h-3 ${getFileIconColor(change.name)}`} />
                  <span className="text-xs flex-1 truncate">{change.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      change.status === "added" ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-500"
                    }`}
                  >
                    {change.status === "added" ? "A" : "M"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activePanel === "extensions" && (
          <div className="p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Extensions</p>
            <p className="text-xs text-muted-foreground mt-1">
              Browse and install extensions to enhance your workspace
            </p>
            <Button size="sm" className="mt-4">
              Browse Extensions
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
