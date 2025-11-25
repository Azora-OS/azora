const fs = require('fs');
const path = require('path');

function findPackageJsons(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                findPackageJsons(filePath, fileList);
            }
        } else {
            if (file === 'package.json') {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

const rootDir = process.cwd();
console.log(`Scanning for package.json files in ${rootDir}...\n`);
const packageJsons = findPackageJsons(rootDir);

let hasError = false;

packageJsons.forEach(filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
    } catch (error) {
        console.error(`\n❌ INVALID: ${filePath}`);
        console.error(`Error: ${error.message}\n`);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        console.error('Content around line 22:');
        console.error(lines.slice(19, 25).map((l, i) => `${20 + i}: ${l}`).join('\n'));
        console.error('\n');
        hasError = true;
    }
});

if (hasError) {
    console.log('Found invalid package.json files.');
    process.exit(1);
} else {
    console.log('All package.json files are valid.');
    process.exit(0);
}
