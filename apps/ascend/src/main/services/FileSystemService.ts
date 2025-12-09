import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileEntry[];
}

export class FileSystemService {
  constructor(private mainWindow: BrowserWindow) {
    this.setupIPC();
  }

  private setupIPC() {
    // Open Folder Dialog
    ipcMain.handle('fs:openFolder', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true };
      }

      const folderPath = result.filePaths[0];
      return { canceled: false, path: folderPath };
    });

    // Read Directory
    ipcMain.handle('fs:readDir', async (_event, dirPath: string) => {
      try {
        const entries = await this.readDirectoryRecursively(dirPath);
        return { success: true, entries };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Read File
    ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return { success: true, content };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Write File
    ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
      try {
        await fs.outputFile(filePath, content, 'utf-8');
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Create File/Folder
    ipcMain.handle('fs:createEntry', async (_event, entryPath: string, type: 'file' | 'directory') => {
      try {
        if (type === 'directory') {
          await fs.ensureDir(entryPath);
        } else {
          await fs.ensureFile(entryPath);
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
    
    // Delete Entry
    ipcMain.handle('fs:deleteEntry', async (_event, entryPath: string) => {
      try {
        await fs.remove(entryPath);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
  }

  private async readDirectoryRecursively(dirPath: string, depth: number = 0, maxDepth: number = 2): Promise<FileEntry[]> {
    if (depth > maxDepth) return [];

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const result: FileEntry[] = [];

    for (const entry of entries) {
      // Skip hidden files/folders (simple check)
      if (entry.name.startsWith('.') && entry.name !== '.gitignore') continue;
      if (entry.name === 'node_modules') continue; // Skip node_modules for performance

      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        result.push({
          name: entry.name,
          path: fullPath,
          type: 'directory',
          // We don't recursively read everything initially for performance
          // The client can request subdirectories as needed
          children: [] 
        });
      } else {
        result.push({
          name: entry.name,
          path: fullPath,
          type: 'file'
        });
      }
    }

    // Sort: directories first, then files
    return result.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });
  }
}
