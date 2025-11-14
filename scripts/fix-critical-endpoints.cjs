#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CRITICAL_SERVICES = [
  'api-gateway',
  'azora-education',
  'azora-mint',
  'azora-forge',
  'azora-pay-service',
  'auth-service'
];

const FIXES = {
  'api-gateway/routes/unified-routes.js': [
    {
      find: /\/\/ TODO: Connect to real wallet service\s+res\.json\(\{ balance: 0 \}\);/,
      replace: `const wallet = await fetch(\`\${process.env.MINT_URL}/api/wallet/\${userId}\`).then(r => r.json());
    res.json(wallet);`
    },
    {
      find: /\/\/ TODO: Connect to real transaction service\s+res\.json\(\[\]\);/,
      replace: `const txs = await fetch(\`\${process.env.MINT_URL}/api/transactions?userId=\${userId}\`).then(r => r.json());
    res.json(txs);`
    },
    {
      find: /\/\/ TODO: Connect to real notifications service\s+res\.json\(\[\]\);/,
      replace: `const notifications = await fetch(\`\${process.env.NOTIFICATION_URL}/api/notifications/\${userId}\`).then(r => r.json());
    res.json(notifications);`
    }
  ]
};

function applyFixes() {
  let fixed = 0;
  
  CRITICAL_SERVICES.forEach(service => {
    const servicePath = path.join(__dirname, '../services', service);
    
    Object.entries(FIXES).forEach(([file, replacements]) => {
      const filePath = path.join(__dirname, '../services', file);
      
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        replacements.forEach(({ find, replace }) => {
          if (find.test(content)) {
            content = content.replace(find, replace);
            fixed++;
          }
        });
        
        fs.writeFileSync(filePath, content);
        console.log(`✓ Fixed ${file}`);
      }
    });
  });
  
  console.log(`\n✅ Fixed ${fixed} critical endpoints`);
}

applyFixes();
