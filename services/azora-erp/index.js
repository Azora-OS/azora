const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3022;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-erp', 
    timestamp: new Date().toISOString() 
  });
});

// Business modules endpoint
app.get('/api/modules', (req, res) => {
  const modules = [
    {
      id: 'finance',
      name: 'Financial Management',
      status: 'active'
    },
    {
      id: 'hr',
      name: 'Human Resources',
      status: 'active'
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      status: 'active'
    }
  ];
  
  res.json({ modules, count: modules.length });
});

// Resource allocation endpoint
app.post('/api/allocations', (req, res) => {
  const { resource, department, amount } = req.body;
  
  const allocation = {
    id: `alloc_${Date.now()}`,
    resource,
    department,
    amount,
    allocatedAt: new Date().toISOString()
  };
  
  res.status(201).json(allocation);
});

// Business analytics endpoint
app.get('/api/analytics', (req, res) => {
  const analytics = {
    revenue: 1250000,
    expenses: 850000,
    profit: 400000,
    employees: 125,
    departments: 8
  };
  
  res.json(analytics);
});

app.listen(PORT, () => {
  console.log(`Azora ERP Service running on port ${PORT}`);
});

module.exports = app;