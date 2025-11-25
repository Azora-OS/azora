const fs = require('fs');
const path = require('path');

const servicesDir = path.join(process.cwd(), 'services');
const outputFile = path.join(process.cwd(), 'docs', 'SERVICE-AUDIT-REPORT.md');

const serviceCategories = {
    ai: [],
    auth: [],
    payment: [],
    education: [],
    blockchain: [],
    marketplace: [],
    infrastructure: [],
    governance: [],
    analytics: [],
    other: []
};

function categorizeService(serviceName) {
    const name = serviceName.toLowerCase();

    if (name.includes('ai') || name.includes('elara') || name.includes('quantum')) return 'ai';
    if (name.includes('auth')) return 'auth';
    if (name.includes('pay') || name.includes('finance') || name.includes('billing') || name.includes('treasury')) return 'payment';
    if (name.includes('education') || name.includes('sapiens') || name.includes('classroom') || name.includes('learning')) return 'education';
    if (name.includes('blockchain') || name.includes('ledger') || name.includes('mint') || name.includes('token')) return 'blockchain';
    if (name.includes('marketplace') || name.includes('market')) return 'marketplace';
    if (name.includes('gateway') || name.includes('monitor') || name.includes('health')) return 'infrastructure';
    if (name.includes('governance') || name.includes('court') || name.includes('judiciary') || name.includes('constitutional')) return 'governance';
    if (name.includes('analytics') || name.includes('tracking')) return 'analytics';

    return 'other';
}

function analyzeService(servicePath, serviceName) {
    const packageJsonPath = path.join(servicePath, 'package.json');
    const indexFiles = ['index.js', 'index.ts', 'server.js', 'server.ts', 'app.js', 'app.ts'];

    let hasPackageJson = fs.existsSync(packageJsonPath);
    let hasEntryPoint = indexFiles.some(file => fs.existsSync(path.join(servicePath, file)));
    let hasDockerfile = fs.existsSync(path.join(servicePath, 'Dockerfile'));
    let hasTests = fs.existsSync(path.join(servicePath, '__tests__')) || fs.existsSync(path.join(servicePath, 'tests'));

    let description = '';
    let port = '';

    if (hasPackageJson) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            description = pkg.description || '';
        } catch (e) { }
    }

    return {
        name: serviceName,
        category: categorizeService(serviceName),
        hasPackageJson,
        hasEntryPoint,
        hasDockerfile,
        hasTests,
        description,
        status: hasEntryPoint ? '✅ Active' : '⚠️ Scaffold'
    };
}

function generateReport() {
    console.log('🔍 Scanning services directory...');

    const services = fs.readdirSync(servicesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            const servicePath = path.join(servicesDir, dirent.name);
            return analyzeService(servicePath, dirent.name);
        });

    // Categorize services
    services.forEach(service => {
        serviceCategories[service.category].push(service);
    });

    // Generate markdown report
    let report = `# Service Audit Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Services:** ${services.length}\n\n`;
    report += `---\n\n`;

    // Summary by category
    report += `## Summary by Category\n\n`;
    report += `| Category | Count | Active | Scaffolds |\n`;
    report += `|----------|-------|--------|----------|\n`;

    Object.keys(serviceCategories).forEach(category => {
        const categoryServices = serviceCategories[category];
        const active = categoryServices.filter(s => s.status === '✅ Active').length;
        const scaffolds = categoryServices.filter(s => s.status === '⚠️ Scaffold').length;
        report += `| ${category.toUpperCase()} | ${categoryServices.length} | ${active} | ${scaffolds} |\n`;
    });

    report += `\n---\n\n`;

    // Detailed breakdown by category
    Object.keys(serviceCategories).forEach(category => {
        const categoryServices = serviceCategories[category];
        if (categoryServices.length === 0) return;

        report += `## ${category.toUpperCase()} Services (${categoryServices.length})\n\n`;
        report += `| Service | Status | Package.json | Entry Point | Docker | Tests | Description |\n`;
        report += `|---------|--------|--------------|-------------|--------|-------|-------------|\n`;

        categoryServices.forEach(service => {
            report += `| ${service.name} | ${service.status} | ${service.hasPackageJson ? '✅' : '❌'} | ${service.hasEntryPoint ? '✅' : '❌'} | ${service.hasDockerfile ? '✅' : '❌'} | ${service.hasTests ? '✅' : '❌'} | ${service.description} |\n`;
        });

        report += `\n`;
    });

    // Duplication analysis
    report += `---\n\n## 🚨 Potential Duplicates\n\n`;

    const duplicateGroups = [
        { name: 'AI Orchestration', services: serviceCategories.ai.filter(s => s.name.includes('orchestrat')) },
        { name: 'Authentication', services: serviceCategories.auth },
        { name: 'Payment/Finance', services: serviceCategories.payment },
        { name: 'Blockchain/Ledger', services: serviceCategories.blockchain },
        { name: 'Marketplace', services: serviceCategories.marketplace },
        { name: 'API Gateway', services: serviceCategories.infrastructure.filter(s => s.name.includes('gateway')) }
    ];

    duplicateGroups.forEach(group => {
        if (group.services.length > 1) {
            report += `### ${group.name} (${group.services.length} services)\n\n`;
            group.services.forEach(s => {
                report += `- **${s.name}** - ${s.status}\n`;
            });
            report += `\n`;
        }
    });

    // Write report
    fs.writeFileSync(outputFile, report);
    console.log(`✅ Audit report generated: ${outputFile}`);
    console.log(`   Total Services: ${services.length}`);
    console.log(`   Active: ${services.filter(s => s.status === '✅ Active').length}`);
    console.log(`   Scaffolds: ${services.filter(s => s.status === '⚠️ Scaffold').length}`);
}

generateReport();
