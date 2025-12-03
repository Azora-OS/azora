const fs = require('fs');
const path = require('path');

function findPackageJsons(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      // skip node_modules
      if (item.name === 'node_modules') continue;
      results.push(...findPackageJsons(itemPath));
    } else if (item.isFile() && item.name === 'package.json') {
      results.push(itemPath);
    }
  }
  return results;
}

const root = path.resolve(__dirname, '..');
const packageJsonPaths = findPackageJsons(root);
const nameMap = new Map();

for (const p of packageJsonPaths) {
  try {
    const content = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (content.name) {
      const arr = nameMap.get(content.name) || [];
      arr.push(p);
      nameMap.set(content.name, arr);
    }
  } catch (e) {
    console.error('Failed to parse', p, e.message);
  }
}

let foundDuplicates = false;
for (const [name, paths] of nameMap.entries()) {
  if (paths.length > 1) {
    foundDuplicates = true;
    console.log('DUPLICATE:', name);
    for (const p of paths) console.log('  -', p);
  }
}

if (!foundDuplicates) console.log('No duplicate package names found');
