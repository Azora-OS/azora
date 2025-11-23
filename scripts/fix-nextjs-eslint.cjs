const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '../apps');
const apps = fs.readdirSync(appsDir).filter(file => fs.statSync(path.join(appsDir, file)).isDirectory());

apps.forEach(app => {
    const appPath = path.join(appsDir, app);
    const packageJsonPath = path.join(appPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let modified = false;

        // Check if it's a Next.js app
        const hasNext = (packageJson.dependencies && packageJson.dependencies.next) ||
            (packageJson.devDependencies && packageJson.devDependencies.next);

        if (hasNext) {
            // Downgrade typescript-eslint to v6 for Next.js 14 compatibility
            if (packageJson.devDependencies) {
                if (packageJson.devDependencies['@typescript-eslint/eslint-plugin']) {
                    packageJson.devDependencies['@typescript-eslint/eslint-plugin'] = '^6.21.0';
                    modified = true;
                    console.log(`Downgraded @typescript-eslint/eslint-plugin in ${app}`);
                }
                if (packageJson.devDependencies['@typescript-eslint/parser']) {
                    packageJson.devDependencies['@typescript-eslint/parser'] = '^6.21.0';
                    modified = true;
                    console.log(`Downgraded @typescript-eslint/parser in ${app}`);
                }
            }

            if (modified) {
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            }
        }
    }
});

console.log('Done! Run npm install to update dependencies.');
