import { create } from 'zustand'

export type FileType = 'file' | 'directory'

export interface FileNode {
    id: string
    name: string
    type: FileType
    content?: string
    children?: string[] // IDs of children
    parentId?: string | null
    isOpen?: boolean
    path: string
}

interface FileSystemState {
    rootId: string | null
    activeFileId: string | null
    openFiles: string[] // Array of file IDs
    fileMap: Record<string, FileNode> // Quick lookup by ID

    // Actions
    createFile: (parentId: string | null, name: string, content?: string) => Promise<string>
    createDirectory: (parentId: string | null, name: string) => Promise<string>
    readFile: (id: string) => string | undefined
    writeFile: (id: string, content: string) => Promise<void>
    deleteNode: (id: string) => Promise<void>
    renameNode: (id: string, newName: string) => Promise<void>
    openFile: (id: string) => void
    closeFile: (id: string) => void
    setActiveFile: (id: string) => void

    // Project Management
    isLoading: boolean
    loadProject: (projectId: string) => Promise<void>
    saveProject: () => Promise<void>
}

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9)

export const useFileSystem = create<FileSystemState>((set, get) => ({
    rootId: null,
    activeFileId: null,
    openFiles: [],
    fileMap: {},
    isLoading: false,

    loadProject: async (_projectId) => {
        set({ isLoading: true })
        try {
            // Fetch real file tree from orchestrator
            const res = await fetch('http://localhost:3001/fs/tree');
            if (!res.ok) throw new Error('Failed to load project');

            const fileMap = await res.json();
            set({ fileMap, rootId: 'root', isLoading: false })
        } catch (error) {
            console.error("Failed to load project from orchestrator:", error)
            set({ isLoading: false })

            // Fallback for demo if orchestrator is down (optional, but good for UX)
            // For "No Mock" compliance, we should probably show an error instead of falling back to mocks
            // But for stability during dev, maybe keep a minimal fallback or just error.
            // Let's stick to "No Mock" and leave it empty/error state if backend fails.
        }
    },

    saveProject: async () => {
        // Sync all dirty files to S3
        // const state = get()
        // Implementation would iterate over dirty files and push to API
    },

    createFile: async (parentId, name, content = '') => {
        const id = generateId()
        const parent = get().fileMap[parentId || 'root']
        const path = `${parent.path}/${name}`

        const newNode: FileNode = {
            id,
            name,
            type: 'file',
            content,
            parentId: parentId || 'root',
            path
        }

        set(state => {
            const newFileMap = { ...state.fileMap, [id]: newNode }
            if (parent) {
                const newParent = { ...parent, children: [...(parent.children || []), id] }
                newFileMap[parent.id] = newParent
            }
            return { fileMap: newFileMap }
        })

        // Sync to backend
        return id
    },

    createDirectory: async (parentId, name) => {
        const id = generateId()
        const parent = get().fileMap[parentId || 'root']
        const path = `${parent.path}/${name}`

        const newNode: FileNode = {
            id,
            name,
            type: 'directory',
            children: [],
            parentId: parentId || 'root',
            path
        }

        set(state => {
            const newFileMap = { ...state.fileMap, [id]: newNode }
            if (parent) {
                const newParent = { ...parent, children: [...(parent.children || []), id] }
                newFileMap[parent.id] = newParent
            }
            return { fileMap: newFileMap }
        })

        return id
    },

    readFile: (id) => {
        const node = get().fileMap[id];
        // If content is missing, we should fetch it (async) but this is a sync selector.
        // For now, assume content is loaded or we trigger a load.
        // In a real app, we'd have `fetchContent(id)` action.
        // Let's add a quick fetch if content is undefined? 
        // No, that causes side effects in render.
        // We'll rely on loadProject loading tree, but content might be lazy.
        // For this prototype, we'll assume content is in the map or we need to add a `fetchFileContent` action.
        return node?.content;
    },

    fetchFileContent: async (id: string) => {
        const node = get().fileMap[id];
        if (!node || node.type !== 'file') return;

        try {
            const res = await fetch(`http://localhost:3001/fs/content?path=${encodeURIComponent(node.path)}`);
            if (res.ok) {
                const { content } = await res.json();
                set(state => ({
                    fileMap: {
                        ...state.fileMap,
                        [id]: { ...state.fileMap[id], content }
                    }
                }));
            }
        } catch (e) {
            console.error("Failed to fetch content:", e);
        }
    },

    writeFile: async (id, content) => {
        const node = get().fileMap[id];
        if (!node) return;

        set(state => ({
            fileMap: {
                ...state.fileMap,
                [id]: { ...state.fileMap[id], content }
            }
        }))

        // Sync to backend
        try {
            await fetch('http://localhost:3001/fs/write', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: node.path, content })
            });
        } catch (e) {
            console.error("Failed to save file:", e);
        }
    },

    deleteNode: async (id) => {
        set(state => {
            const node = state.fileMap[id]
            const newFileMap = { ...state.fileMap }

            // Remove from parent's children
            if (node.parentId && newFileMap[node.parentId]) {
                const parent = newFileMap[node.parentId]
                newFileMap[node.parentId] = {
                    ...parent,
                    children: parent.children?.filter(childId => childId !== id)
                }
            }

            delete newFileMap[id]

            return {
                fileMap: newFileMap,
                openFiles: state.openFiles.filter(f => f !== id),
                activeFileId: state.activeFileId === id ? null : state.activeFileId
            }
        })
    },

    renameNode: async (id, newName) => {
        set(state => {
            const node = state.fileMap[id]
            const parent = state.fileMap[node.parentId!]
            const newPath = `${parent.path}/${newName}`

            return {
                fileMap: {
                    ...state.fileMap,
                    [id]: { ...node, name: newName, path: newPath }
                }
            }
        })
    },

    openFile: (id) => {
        set(state => {
            if (!state.openFiles.includes(id)) {
                return {
                    openFiles: [...state.openFiles, id],
                    activeFileId: id
                }
            }
            return { activeFileId: id }
        })
    },

    closeFile: (id) => {
        set(state => {
            const newOpenFiles = state.openFiles.filter(f => f !== id)
            let newActiveId = state.activeFileId
            if (state.activeFileId === id) {
                newActiveId = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null
            }
            return {
                openFiles: newOpenFiles,
                activeFileId: newActiveId
            }
        })
    },

    setActiveFile: (id) => set({ activeFileId: id })
}))
