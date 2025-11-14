#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');

// Generic CRUD endpoints for any service
const GENERIC_CRUD = (resourceName) => `
router.get('/api/${resourceName}', async (req, res) => {
  const items = await prisma.${resourceName}.findMany({ take: 50 });
  res.json({ success: true, data: items });
});

router.get('/api/${resourceName}/:id', async (req, res) => {
  const item = await prisma.${resourceName}.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: item });
});

router.post('/api/${resourceName}', async (req, res) => {
  const item = await prisma.${resourceName}.create({ data: req.body });
  res.json({ success: true, data: item });
});

router.put('/api/${resourceName}/:id', async (req, res) => {
  const item = await prisma.${resourceName}.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
});

router.delete('/api/${resourceName}/:id', async (req, res) => {
  await prisma.${resourceName}.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});`;

const SERVICE_CONFIGS = [
  { name: 'azora-workspace', resource: 'workspace' },
  { name: 'azora-content', resource: 'content' },
  { name: 'azora-classroom', resource: 'classroom' },
  { name: 'azora-library', resource: 'book' },
  { name: 'reporting-service', resource: 'report' },
  { name: 'search-service', resource: 'searchIndex' },
  { name: 'file-storage-service', resource: 'file' },
  { name: 'recommendation-engine', resource: 'recommendation' }
];

function implementGenericService(serviceName, resourceName) {
  const servicePath = path.join(SERVICES_DIR, serviceName);
  if (!fs.existsSync(servicePath)) {
    return false;
  }
  
  const routesPath = path.join(servicePath, 'routes.js');
  if (fs.existsSync(routesPath)) {
    return false;
  }
  
  const content = `const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

${GENERIC_CRUD(resourceName)}

module.exports = router;
`;
  
  fs.writeFileSync(routesPath, content);
  
  // Update index.js
  const indexPath = path.join(servicePath, 'index.js');
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    if (!indexContent.includes('./routes')) {
      indexContent = indexContent.replace(
        /app\.listen\(/,
        `const routes = require('./routes');\napp.use(routes);\n\napp.listen(`
      );
      fs.writeFileSync(indexPath, indexContent);
    }
  }
  
  return true;
}

function main() {
  console.log('⚡ Bulk Endpoint Generator\n');
  
  let implemented = 0;
  
  SERVICE_CONFIGS.forEach(({ name, resource }) => {
    if (implementGenericService(name, resource)) {
      console.log(`✓ ${name} (${resource})`);
      implemented++;
    }
  });
  
  console.log(`\n✅ Generated ${implemented} services`);
  console.log(`📊 Added ${implemented * 5} CRUD endpoints`);
}

main();
