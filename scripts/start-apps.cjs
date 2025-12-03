const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting all apps...');

const apps = [
    { name: 'student-portal', port: 3000 },
    { name: 'azora-enterprise-ui', port: 3001 },
    { name: 'azora-marketplace-ui', port: 3002 },
    { name: 'azora-pay-ui', port: 3003 },
    { name: 'master-ui', port: 3100 }
];

apps.forEach(app => {
    const appPath = path.join(__dirname, '..', 'apps', app.name);
    if (fs.existsSync(appPath)) {
        console.log(`🚀 Starting ${app.name} on port ${app.port}...`);
        // Use --port flag for next dev
        const args = ['run', 'dev', '--', '--port', app.port.toString()];

        // For master-ui, the script already includes --port, but overriding it or appending might be tricky.
        // master-ui script: "dev": "next dev --port 3100"
        // If we add -- --port 3100 it might duplicate.
        // Let's check if we can just run 'npm run dev' and rely on package.json for master-ui
        // But for others we need to inject port.

        let finalArgs = ['run', 'dev'];
        if (app.name !== 'master-ui') {
            finalArgs.push('--');
            finalArgs.push('--port');
            finalArgs.push(app.port.toString());
        }

        // Use npm.cmd on Windows
        const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

        // Using shell: true is often safer for npm scripts
        const proc = spawn(npmCmd, finalArgs, {
            cwd: appPath,
            stdio: 'pipe',
            shell: true,
            detached: true
        });

        proc.stdout.on('data', (data) => {
            console.log(`[${app.name}] ${data}`);
        });

        proc.stderr.on('data', (data) => {
            console.error(`[${app.name}] ${data}`);
        });

        proc.on('close', (code) => {
            console.log(`[${app.name}] exited with code ${code}`);
        });

        // Don't unref if we want to see output, but for "launch all" maybe we do want to detach?
        // The user wants to "launch" them.
        // If I keep them attached, this script will never exit.
        // I'll unref them so the script exits and leaves them running?
        // But then we lose logs.
        // I'll keep them attached for a bit or just let them run.
        // Actually, the user probably wants them running in the background or in terminals.
        // Since I can't open new terminals easily for the user, I'll spawn them detached.

        proc.unref();
    }
});

console.log('✅ Apps starting in background...');
