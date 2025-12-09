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
            // In a real implementation, this would fetch from S3/Redis via API
            // For now, we simulate a file tree structure
            const mockFiles: Record<string, FileNode> = {
                'root': { id: 'root', name: 'root', type: 'directory', children: ['src', 'package.json', 'README.md'], path: '/' },
                'src': { id: 'src', name: 'src', type: 'directory', children: ['app', 'components', 'lib'], parentId: 'root', path: '/src' },
                'app': { id: 'app', name: 'app', type: 'directory', children: ['page.tsx', 'layout.tsx', 'globals.css'], parentId: 'src', path: '/src/app' },
                'components': { id: 'components', name: 'components', type: 'directory', children: [], parentId: 'src', path: '/src/components' },
                'lib': { id: 'lib', name: 'lib', type: 'directory', children: [], parentId: 'src', path: '/src/lib' },
                'page.tsx': { id: 'page.tsx', name: 'page.tsx', type: 'file', content: '// Page content', parentId: 'app', path: '/src/app/page.tsx' },
                'layout.tsx': { id: 'layout.tsx', name: 'layout.tsx', type: 'file', content: '// Layout content', parentId: 'app', path: '/src/app/layout.tsx' },
                'globals.css': { id: 'globals.css', name: 'globals.css', type: 'file', content: '/* Global styles */', parentId: 'app', path: '/src/app/globals.css' },
                'package.json': { id: 'package.json', name: 'package.json', type: 'file', content: '{}', parentId: 'root', path: '/package.json' },
                'README.md': { id: 'README.md', name: 'README.md', type: 'file', content: '# Project', parentId: 'root', path: '/README.md' }
            }

            set({ fileMap: mockFiles, rootId: 'root', isLoading: false })
        } catch (error) {
            console.error(error)
            set({ isLoading: false })
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

    readFile: (id) => get().fileMap[id]?.content,

    writeFile: async (id, content) => {
        set(state => ({
            fileMap: {
                ...state.fileMap,
                [id]: { ...state.fileMap[id], content }
            }
        }))
        // Debounced save to backend would happen here
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
