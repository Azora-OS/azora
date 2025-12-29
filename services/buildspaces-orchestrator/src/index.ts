import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

import { spawn as spawnProcess } from 'child_process';
import os from 'os';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.join(os.homedir(), 'azora-workspace');

// Ensure workspace exists
fs.mkdir(WORKSPACE_ROOT, { recursive: true }).catch(console.error);

// --- File System Routes ---

// Get file tree
app.get('/fs/tree', async (_req, res) => {
    try {
        const rootPath = WORKSPACE_ROOT;



        // Flatten tree for the frontend store format
        async function flattenTree(dir: string, parentId: string | null = null): Promise<Record<string, any>> {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            let map: Record<string, any> = {};

            // Add root if we are at root
            if (!parentId) {
                map['root'] = { id: 'root', name: 'root', type: 'directory', children: [], path: '/' };
            }

            const childrenIds: string[] = [];

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(rootPath, fullPath);
                const id = relativePath.replace(/\\/g, '/');

                childrenIds.push(id);

                map[id] = {
                    id,
                    name: entry.name,
                    type: entry.isDirectory() ? 'directory' : 'file',
                    parentId: parentId || 'root',
                    path: '/' + relativePath.replace(/\\/g, '/')
                };

                if (entry.isDirectory()) {
                    const childMap = await flattenTree(fullPath, id);
                    map = { ...map, ...childMap };
                    // Update children of this dir
                    map[id].children = Object.values(childMap)
                        .filter((n: any) => n.parentId === id)
                        .map((n: any) => n.id);
                }
            }

            if (!parentId) {
                map['root'].children = childrenIds;
            }

            return map;
        }

        const fileMap = await flattenTree(rootPath);
        return res.json(fileMap);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// Get file content
app.get('/fs/content', async (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) return res.status(400).json({ error: 'Path required' });

    try {
        const fullPath = path.join(WORKSPACE_ROOT, filePath);
        // Security check
        if (!fullPath.startsWith(WORKSPACE_ROOT)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const content = await fs.readFile(fullPath, 'utf-8');
        return res.json({ content });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// Write file
app.post('/fs/write', async (req, res) => {
    const { path: filePath, content } = req.body;
    if (!filePath) return res.status(400).json({ error: 'Path required' });

    try {
        const fullPath = path.join(WORKSPACE_ROOT, filePath);
        // Security check
        if (!fullPath.startsWith(WORKSPACE_ROOT)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await fs.writeFile(fullPath, content);
        return res.json({ status: 'ok' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// --- Terminal WebSocket ---

const sessions = new Map<string, any>();

wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const type = url.searchParams.get('type');
    const sessionId = url.searchParams.get('sessionId') || 'default';

    if (type === 'terminal') {
        console.log(`Terminal connected: ${sessionId}`);

        // Spawn shell
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        const ptyProcess = spawnProcess(shell, [], {
            cwd: WORKSPACE_ROOT,
            env: process.env,
            shell: true
        });

        sessions.set(sessionId, ptyProcess);

        // Handle output
        ptyProcess.stdout?.on('data', (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data.toString());
            }
        });

        ptyProcess.stderr?.on('data', (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data.toString());
            }
        });

        // Handle input
        ws.on('message', (message) => {
            const msg = message.toString();
            if (ptyProcess.stdin) {
                ptyProcess.stdin.write(msg);
            }
        });

        ws.on('close', () => {
            ptyProcess.kill();
            sessions.delete(sessionId);
        });
    }
});

server.listen(PORT, () => {
    console.log(`BuildSpaces Orchestrator running on port ${PORT}`);
    console.log(`Workspace Root: ${WORKSPACE_ROOT}`);
});
