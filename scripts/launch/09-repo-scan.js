const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs/REPO-SCAN-REPORT.md');

const IGNORE_DIRS = [
    'node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.gemini', 'tmp'
];

const IGNORE_FILES = [
    'package-lock.json', 'yarn.lock', '.DS_Store', '.env', '.env.local'
];

let stats = {
    files: 0,
    lines: 0,
    tsFiles: 0,
    tsxFiles: 0,
    jsFiles: 0,
    cssFiles: 0,
    jsonFiles: 0,
    mdFiles: 0,
    otherFiles: 0
};

let fileList = [];

function scanDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const relativePath = path.relative(ROOT_DIR, fullPath);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                scanDir(fullPath);
            }
        } else {
            if (!IGNORE_FILES.includes(file)) {
                processFile(fullPath, relativePath);
            }
        }
    }
}

function processFile(filePath, relativePath) {
    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;

    stats.files++;
    stats.lines += lines;

    if (ext === '.ts') stats.tsFiles++;
    else if (ext === '.tsx') stats.tsxFiles++;
    else if (ext === '.js') stats.jsFiles++;
    else if (ext === '.css') stats.cssFiles++;
    else if (ext === '.json') stats.jsonFiles++;
    else if (ext === '.md') stats.mdFiles++;
    else stats.otherFiles++;

    fileList.push({
        path: relativePath,
        lines: lines,
        type: ext
    });
}

function generateReport() {
    const timestamp = new Date().toISOString();

    let report = `# Azora Repository Scan Report\n\n`;
    report += `**Generated**: ${timestamp}\n\n`;

    report += `## 📊 Summary Statistics\n\n`;
    report += `| Metric | Count |\n`;
    report += `|---|---|\n`;
    report += `| **Total Files** | ${stats.files} |\n`;
    report += `| **Total Lines of Code** | ${stats.lines.toLocaleString()} |\n`;
    report += `| TypeScript (.ts) | ${stats.tsFiles} |\n`;
    report += `| React TypeScript (.tsx) | ${stats.tsxFiles} |\n`;
    report += `| JavaScript (.js) | ${stats.jsFiles} |\n`;
    report += `| JSON Configs | ${stats.jsonFiles} |\n`;
    report += `| Styles (.css) | ${stats.cssFiles} |\n`;
    report += `| Documentation (.md) | ${stats.mdFiles} |\n`;

    report += `\n## 📂 File Inventory\n\n`;
    report += `| File Path | Lines | Type |\n`;
    report += `|---|---|---|\n`;

    // Sort by path
    fileList.sort((a, b) => a.path.localeCompare(b.path));

    for (const file of fileList) {
        report += `| \`${file.path}\` | ${file.lines} | ${file.type} |\n`;
    }

    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`✅ Scan complete! Report saved to: ${OUTPUT_FILE}`);
    console.log(`   Total Files: ${stats.files}`);
    console.log(`   Total Lines: ${stats.lines}`);
}

console.log('🔍 Starting Repository Scan...');
scanDir(ROOT_DIR);
generateReport();
