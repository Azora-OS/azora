const fs = require('fs');
const path = require('path');

// Fix React duplicate instance issues by ensuring all packages use peerDependencies
const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(file => {
    const fullPath = path.join(packagesDir, file);
    return fs.statSync(fullPath).isDirectory();
});

packages.forEach(pkg => {
    const pkgPath = path.join(packagesDir, pkg);
    const packageJsonPath = path.join(pkgPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let modified = false;

        // Move react and react-dom to peerDependencies if they're in dependencies
        if (packageJson.dependencies) {
            const reactDeps = ['react', 'react-dom'];
            reactDeps.forEach(dep => {
                if (packageJson.dependencies[dep]) {
                    // Ensure peerDependencies exists
                    if (!packageJson.peerDependencies) {
                        packageJson.peerDependencies = {};
                    }

                    // Move to peerDependencies
                    packageJson.peerDependencies[dep] = packageJson.dependencies[dep];
                    delete packageJson.dependencies[dep];
                    modified = true;
                    console.log(`Moved ${dep} to peerDependencies in ${pkg}`);
                }
            });
        }

        if (modified) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }
    }
});

console.log('Done! Run npm install to update dependencies.');
