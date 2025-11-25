#!/usr/bin/env node

/**
 * AZORA SERVICE DISCOVERY SCRIPT
 * 
 * Scans running Node processes and identifies Azora services
 * Generates .azora-services.json configuration file
 * 
 * Usage: node scripts/discover-services.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const KNOWN_SERVICES = {
    'azora-mint': { defaultPort: 3080, healthPath: '/health' },
    'azora-education': { defaultPort: 4201, healthPath: '/health' },
    'azora-marketplace': { defaultPort: 4004, healthPath: '/health' },
    'azora-forge': { defaultPort: 4300, healthPath: '/health' },
    'api-gateway': { defaultPort: 4000, healthPath: '/health' },
    'ai-family-service': { defaultPort: 4100, healthPath: '/health' },
    'auth-service': { defaultPort: 4001, healthPath: '/health' },
    'payment': { defaultPort: 4010, healthPath: '/health' },
};

async function discoverServices() {
    console.log('🔍 Discovering Azora services...\n');

    const services = {};

    // Get all Node processes with ports
    const processes = await getNodeProcesses();

    // Check known services
    for (const [serviceName, config] of Object.entries(KNOWN_SERVICES)) {
        const port = findServicePort(processes, serviceName) || config.defaultPort;
        const url = `http://localhost:${port}`;
        const status = await checkHealth(url, config.healthPath);

        services[serviceName] = {
            port,
            url,
            status,
            healthPath: config.healthPath,
        };

        const statusIcon = status === 'running' ? '✅' : '❌';
        console.log(`${statusIcon} ${serviceName.padEnd(25)} Port: ${port.toString().padEnd(6)} Status: ${status}`);
    }

    // Save to file
    const config = {
        services,
        updated: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    };

    const outputPath = path.join(process.cwd(), '.azora-services.json');
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

    console.log(`\n📝 Service configuration saved to: .azora-services.json`);

    // Summary
    const runningCount = Object.values(services).filter(s => s.status === 'running').length;
    const totalCount = Object.keys(services).length;

    console.log(`\n📊 Summary: ${runningCount}/${totalCount} services running`);

    if (runningCount < totalCount) {
        console.log('\n⚠️  Some services are not running. Start them with:');
        Object.entries(services)
            .filter(([_, s]) => s.status !== 'running')
            .forEach(([name, _]) => {
                console.log(`   cd services/${name} && npm run dev`);
            });
    }

    return config;
}

/**
 * Get all Node processes with ports (Windows PowerShell)
 */
function getNodeProcesses() {
    return new Promise((resolve) => {
        const command = `Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object ProcessName, Id, @{Name="Port";Expression={(Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue).LocalPort}} | ConvertTo-Json`;

        exec(command, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
            if (error) {
                console.warn('Could not get process list, using defaults');
                resolve([]);
                return;
            }

            try {
                const processes = JSON.parse(stdout);
                resolve(Array.isArray(processes) ? processes : [processes]);
            } catch {
                resolve([]);
            }
        });
    });
}

/**
 * Find port for a service from process list
 */
function findServicePort(processes, serviceName) {
    // Look for process with matching name or path
    for (const proc of processes) {
        if (proc.Port && (
            proc.ProcessName?.toLowerCase().includes(serviceName.toLowerCase()) ||
            proc.Path?.toLowerCase().includes(serviceName.toLowerCase())
        )) {
            return proc.Port;
        }
    }
    return null;
}

/**
 * Check if service is healthy
 */
async function checkHealth(url, healthPath) {
    try {
        const response = await fetch(`${url}${healthPath}`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000), // 2 second timeout
        });

        return response.ok ? 'running' : 'unhealthy';
    } catch (error) {
        return 'stopped';
    }
}

// Run if called directly
if (require.main === module) {
    discoverServices()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error:', error.message);
            process.exit(1);
        });
}

module.exports = { discoverServices };
