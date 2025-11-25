const fs = require('fs');
const path = require('path');

function findPackageJsons(dir, fileList = []) {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if (file === 'node_modules' || file === '.git') return;
            const filePath = path.join(dir, file);
            try {
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    findPackageJsons(filePath, fileList);
                } else if (file === 'package.json') {
                    fileList.push(filePath);
                }
            } catch (e) {
                // Skip files we can't access
            }
        });
    } catch (e) {
        // Skip directories we can't access
    }
    return fileList;
}

const rootDir = process.cwd();
const packageJsons = findPackageJsons(rootDir);
const names = {};

packageJsons.forEach(filePath => {
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const name = content.name;
        if (name) {
            if (!names[name]) {
                names[name] = [];
            }
            names[name].push(filePath);
        }
    } catch (e) {
        // Skip invalid files
    }
});

console.log('\nDuplicate package names:\n');
let found = false;
Object.keys(names).forEach(name => {
    if (names[name].length > 1) {
        console.log(`${name} (${names[name].length} occurrences):`);
        names[name].forEach(p => console.log(`  - ${p}`));
        console.log('');
        found = true;
    }
});

if (!found) {
    console.log('No duplicates found.');
}
