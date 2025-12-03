const fs = require('fs');
const path = require('path');

const dirs = ['apps', 'services', 'packages'];
const rootDir = path.join(__dirname, '..');

dirs.forEach(dirName => {
    const dirPath = path.join(rootDir, dirName);
    if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath).filter(file => fs.statSync(path.join(dirPath, file)).isDirectory());

    items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const packageJsonPath = path.join(itemPath, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            let modified = false;

            const updateDep = (deps, name, version) => {
                if (deps && deps[name]) {
                    deps[name] = version;
                    modified = true;
                    console.log(`Updated ${name} in ${item}`);
                }
            };

            const addDevDep = (deps, name, version) => {
                if (!deps) {
                    packageJson.devDependencies = {};
                    deps = packageJson.devDependencies;
                }
                if (!deps[name]) {
                    deps[name] = version;
                    modified = true;
                    console.log(`Added ${name} to ${item}`);
                } else if (deps[name] !== version) {
                    deps[name] = version;
                    modified = true;
                    console.log(`Updated ${name} in ${item}`);
                }
            };

            // Update typescript and eslint if they exist
            updateDep(packageJson.dependencies, 'typescript', '5.4.5');
            updateDep(packageJson.devDependencies, 'typescript', '5.4.5');

            updateDep(packageJson.dependencies, 'eslint', '^8.56.0');
            updateDep(packageJson.devDependencies, 'eslint', '^8.56.0');

            // If typescript is present, ensure typescript-eslint plugins are present in devDependencies
            const hasTs = (packageJson.dependencies && packageJson.dependencies.typescript) ||
                (packageJson.devDependencies && packageJson.devDependencies.typescript);

            if (hasTs) {
                addDevDep(packageJson.devDependencies, '@typescript-eslint/eslint-plugin', '^7.0.0');
                addDevDep(packageJson.devDependencies, '@typescript-eslint/parser', '^7.0.0');
            }

            if (modified) {
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            }
        }
    });
});
