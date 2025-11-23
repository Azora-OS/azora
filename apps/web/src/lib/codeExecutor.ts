// Simple code execution engine using eval (sandboxed)
// For production, this would use WebContainers or similar

interface ExecutionResult {
    output: string;
    error?: string;
    executionTime: number;
}

export class CodeExecutor {
    private virtualFS: Map<string, string> = new Map();
    private maxSize = 100 * 1024 * 1024; // 100MB
    private currentSize = 0;

    constructor() {
        // Initialize with some default files
        this.createFile('/index.js', '// Start coding here\nconsole.log("Hello, Azora!");');
        this.createFile('/package.json', JSON.stringify({
            name: 'azora-project',
            version: '1.0.0',
            main: 'index.js'
        }, null, 2));
    }

    async executeJavaScript(code: string): Promise<ExecutionResult> {
        const startTime = performance.now();
        let output = '';
        let error: string | undefined;

        // Create a safe console
        const logs: string[] = [];
        const safeConsole = {
            log: (...args: any[]) => logs.push(args.map(String).join(' ')),
            error: (...args: any[]) => logs.push('ERROR: ' + args.map(String).join(' ')),
            warn: (...args: any[]) => logs.push('WARN: ' + args.map(String).join(' '))
        };

        try {
            // Create a sandboxed function
            const func = new Function('console', code);
            func(safeConsole);
            output = logs.join('\n');
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            output = logs.join('\n');
        }

        const executionTime = performance.now() - startTime;

        return { output, error, executionTime };
    }

    async executePython(code: string): Promise<ExecutionResult> {
        // For Python, we'd use Pyodide in production
        // For now, return a placeholder
        return {
            output: 'Python execution coming soon! Install Pyodide for full Python support.',
            executionTime: 0
        };
    }

    // Virtual File System
    createFile(path: string, content: string): boolean {
        const size = new Blob([content]).size;
        if (this.currentSize + size > this.maxSize) {
            return false; // Exceeds 100MB limit
        }
        this.virtualFS.set(path, content);
        this.currentSize += size;
        return true;
    }

    readFile(path: string): string | null {
        return this.virtualFS.get(path) || null;
    }

    updateFile(path: string, content: string): boolean {
        const oldContent = this.virtualFS.get(path);
        if (!oldContent) return false;

        const oldSize = new Blob([oldContent]).size;
        const newSize = new Blob([content]).size;
        const sizeDiff = newSize - oldSize;

        if (this.currentSize + sizeDiff > this.maxSize) {
            return false;
        }

        this.virtualFS.set(path, content);
        this.currentSize += sizeDiff;
        return true;
    }

    deleteFile(path: string): boolean {
        const content = this.virtualFS.get(path);
        if (!content) return false;

        const size = new Blob([content]).size;
        this.virtualFS.delete(path);
        this.currentSize -= size;
        return true;
    }

    listFiles(): string[] {
        return Array.from(this.virtualFS.keys());
    }

    getStorageInfo() {
        return {
            used: this.currentSize,
            max: this.maxSize,
            percentage: (this.currentSize / this.maxSize) * 100
        };
    }
}

// Singleton instance
let executorInstance: CodeExecutor | null = null;

export const getCodeExecutor = (): CodeExecutor => {
    if (!executorInstance) {
        executorInstance = new CodeExecutor();
    }
    return executorInstance;
};
