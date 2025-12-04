const fs = require('fs');
const path = require('path');
const summaryPath = path.resolve(__dirname, '..', 'workspace-audit-summary.json');
if (!fs.existsSync(summaryPath)) {
  console.error('workspace-audit-summary.json not found at', summaryPath);
  process.exit(1);
}
const s = require(summaryPath);
const d = s.duplicates || [];
let md = '# Duplicate packages found\n\n';
d.forEach(dd => {
  md += '## ' + dd.name + '\n';
  dd.locations.forEach(l => {
    md += '- ' + l.path + ' (v' + l.version + ')\n';
  });
  if (dd.name.startsWith('@azora/')) {
    md += '\nSuggested action: move package to packages/* as canonical library if it\'s a shared library; otherwise rename to avoid duplication.\n\n';
  } else if (dd.name === 'azstudio' || dd.name.startsWith('vscode')) {
    md += '\nSuggested action: archive copy likely legacy; exclude archive/ from workspaces (done) and delete or archive the duplicate copy.\n\n';
  } else {
    md += '\nSuggested action: Check which copy is canonical and remove the duplicate.\n\n';
  }
});
fs.writeFileSync(path.resolve(process.cwd(), 'duplicates-report.md'), md);
console.log('duplicates-report.md written');
