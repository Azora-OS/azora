const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '../services');
const services = fs.readdirSync(servicesDir).filter(file => fs.statSync(path.join(servicesDir, file)).isDirectory());

services.forEach(service => {
    const servicePath = path.join(servicesDir, service);
    const packageJsonPath = path.join(servicePath, 'package.json');
    const tsconfigPath = path.join(servicePath, 'tsconfig.json');

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let modified = false;

        // Check if it's a TS project
        if (fs.existsSync(tsconfigPath)) {
            // Fix package.json
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }
            if (!packageJson.scripts.build) {
                packageJson.scripts.build = 'tsc';
                modified = true;
                console.log(`Added build script to ${service}`);
            }
            if (packageJson.scripts.start && packageJson.scripts.start === 'node index.js') {
                packageJson.scripts.start = 'node dist/index.js';
                modified = true;
                console.log(`Fixed start script in ${service}`);
            } else if (packageJson.scripts.start && packageJson.scripts.start === 'node server.js') {
                // Check if server.ts exists or if it should be dist/server.js
                if (fs.existsSync(path.join(servicePath, 'src/server.ts')) || fs.existsSync(path.join(servicePath, 'server.ts'))) {
                    packageJson.scripts.start = 'node dist/server.js';
                    modified = true;
                    console.log(`Fixed start script in ${service} (server.js)`);
                }
            }

            if (modified) {
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            }

            // Fix tsconfig.json
            const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
            // Simple regex replace to avoid parsing comments/trailing commas if standard JSON parser fails (tsconfig allows comments)
            // But assuming standard JSON for now or simple structure.
            // Actually, let's try to parse it. If it fails, we might need a more robust approach.
            try {
                const tsconfig = JSON.parse(tsconfigContent);
                if (tsconfig.compilerOptions && tsconfig.compilerOptions.noEmit !== false) {
                    tsconfig.compilerOptions.noEmit = false;
                    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
                    console.log(`Fixed noEmit in ${service}`);
                }
            } catch (e) {
                console.log(`Could not parse tsconfig.json for ${service}, skipping tsconfig fix. Error: ${e.message}`);
            }
        }
    }
});
