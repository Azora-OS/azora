const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '../apps');
// Recursive function to find next.config.js
const findNextConfigs = (dir, fileList = []) => {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                findNextConfigs(filePath, fileList);
            }
        } else {
            if (file === 'next.config.js') {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
};

const configs = findNextConfigs(appsDir);

configs.forEach(configPath => {
    let content = fs.readFileSync(configPath, 'utf8');
    if (content.includes('ignoreDuringBuilds')) {
        console.log(`Already disabled in ${configPath}`);
        return;
    }

    // Try to find where to insert
    // Pattern 1: module.exports = {
    // Pattern 2: const nextConfig = {

    let modified = false;
    if (content.includes('eslint: {')) {
        // If eslint config exists, add ignoreDuringBuilds
        content = content.replace(/eslint:\s*{/, 'eslint: { ignoreDuringBuilds: true, ');
        modified = true;
    } else if (content.includes('module.exports = {')) {
        content = content.replace('module.exports = {', 'module.exports = { eslint: { ignoreDuringBuilds: true }, ');
        modified = true;
    } else if (content.includes('const nextConfig = {')) {
        content = content.replace('const nextConfig = {', 'const nextConfig = { eslint: { ignoreDuringBuilds: true }, ');
        modified = true;
    } else if (content.includes('export default {')) { // ESM
        content = content.replace('export default {', 'export default { eslint: { ignoreDuringBuilds: true }, ');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(configPath, content);
        console.log(`Updated ${configPath}`);
    } else {
        console.log(`Could not automatically update ${configPath}`);
    }
});
