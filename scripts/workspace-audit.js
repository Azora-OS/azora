const fs = require('fs');
const path = require('path');
// replaced glob usage with recursive findFiles function (native)

function findFiles(dir, pattern) {
  const out = [];
  function recurse(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'build'].includes(e.name)) continue;
        recurse(full);
      } else if (e.isFile() && e.name === pattern) {
        out.push(path.relative(dir, full));
      }
    }
  }
  recurse(dir);
  return out;
}

function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading', filePath, err.message);
    return null;
  }
}

const root = process.cwd();
const files = findFiles(root, 'package.json');

const packages = new Map();
const referenced = new Set();
const esbuildRefs = new Map();

for (const f of files) {
  const p = readJSON(path.resolve(root, f));
  if (!p) continue;
  const name = p.name || `<no-name>${f}`;
  const version = p.version || '0.0.0';
  const key = name;
  if (!packages.has(key)) packages.set(key, []);
  packages.get(key).push({ path: f, version });

  // scan deps
  const gatherDeps = (deps) => {
    if (!deps) return;
    for (const depName of Object.keys(deps)) {
      if (depName.startsWith('@azora/')) {
        referenced.add(depName);
      }
      if (depName === 'esbuild') {
        if (!esbuildRefs.has(name)) esbuildRefs.set(name, []);
        esbuildRefs.get(name).push({ path: f, version: deps[depName] });
      }
    }
  };
  gatherDeps(p.dependencies);
  gatherDeps(p.devDependencies);
  gatherDeps(p.peerDependencies);
  gatherDeps(p.optionalDependencies);
}

// find duplicates
const duplicates = [];
for (const [k, arr] of packages.entries()) {
  if (arr.length > 1) {
    duplicates.push({ name: k, locations: arr });
  }
}

// missing references
const missing = [...referenced].filter(r => !packages.has(r));

// esbuild versions unique
const esbuildByPackage = {};
for (const [pkg, uses] of esbuildRefs.entries()) {
  esbuildByPackage[pkg] = uses;
}

console.log('--- workspace packages ---');
console.log('total package.json files found:', files.length);
console.log('unique package names:', packages.size);
console.log('');

console.log('--- duplicates (same name multiple locations) ---');
console.log(JSON.stringify(duplicates, null, 2));
console.log('');

console.log('--- referenced @azora/* dependencies not found in workspace ---');
console.log(JSON.stringify(missing, null, 2));
console.log('');

console.log('--- esbuild versions and references ---');
console.log(JSON.stringify(esbuildByPackage, null, 2));
console.log('');

console.log('--- all package names & locations ---');
const out = {};
for (const [k, arr] of packages.entries()) out[k] = arr;
console.log(JSON.stringify(out, null, 2));

// write summary file
const summary = {
  totalFiles: files.length,
  uniquePackageNames: packages.size,
  duplicates,
  missing,
  esbuildByPackage,
  allPackages: out
};

fs.writeFileSync('workspace-audit-summary.json', JSON.stringify(summary, null, 2));
console.log('Summary written to workspace-audit-summary.json');
