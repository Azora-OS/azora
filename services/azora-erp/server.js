const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(compression());

// Input validation middleware
const validateInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
        req.body[key] = req.body[key].replace(/javascript:/gi, '');
      }
    });
  }
  next();
};
app.use(validateInput);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 🏢 AZORA ERP - ENTERPRISE RESOURCE PLANNING
console.log('🌟 Azora ERP System - Initializing...');

// In-memory storage for demo purposes
const departments = new Map();
const employees = new Map();
const projects = new Map();
const resources = new Map();
const budgets = new Map();

// 📊 BUSINESS INTELLIGENCE ENGINE
class BusinessIntelligence {
  constructor() {
    this.metrics = new Map();
    this.reports = new Map();
  }

  generateKPIs() {
    return {
      revenue: {
        current: 1250000,
        target: 1500000,
        growth: 15.2,
        trend: 'up'
      },
      expenses: {
        current: 850000,
        budget: 900000,
        variance: -5.6,
        trend: 'down'
      },
      productivity: {
        current: 87.5,
        target: 90,
        improvement: 2.3,
        trend: 'up'
      },
      satisfaction: {
        employee: 8.4,
        customer: 9.1,
        stakeholder: 8.7,
        trend: 'stable'
      }
    };
  }

  generateFinancialReport(period = 'monthly') {
    return {
      period,
      revenue: {
        total: 1250000,
        breakdown: {
          education: 750000,
          finance: 300000,
          marketplace: 200000
        }
      },
      expenses: {
        total: 850000,
        breakdown: {
          salaries: 500000,
          infrastructure: 200000,
          marketing: 100000,
          operations: 50000
        }
      },
      profit: {
        gross: 400000,
        net: 350000,
        margin: 28
      }
    };
  }

  generateHRReport() {
    return {
      totalEmployees: 125,
      departments: {
        engineering: 45,
        education: 30,
        finance: 20,
        marketing: 15,
        operations: 10,
        hr: 5
      },
      performance: {
        average: 8.2,
        topPerformers: 15,
        needsImprovement: 8
      },
      retention: {
        rate: 94.5,
        turnover: 5.5,
        newHires: 12
      }
    };
  }
}

const businessIntelligence = new BusinessIntelligence();

// 💼 RESOURCE MANAGEMENT ENGINE
class ResourceManager {
  constructor() {
    this.allocations = new Map();
    this.utilization = new Map();
  }

  allocateResource(resourceId, departmentId, amount, duration) {
    const allocationId = `alloc_${Date.now()}`;
    const allocation = {
      id: allocationId,
      resourceId,
      departmentId,
      amount,
      duration,
      status: 'ACTIVE',
      allocatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
    };
    
    this.allocations.set(allocationId, allocation);
    return allocation;
  }

  getResourceUtilization(resourceId) {
    const allocations = Array.from(this.allocations.values())
      .filter(alloc => alloc.resourceId === resourceId && alloc.status === 'ACTIVE');
    
    const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
    
    return {
      resourceId,
      totalAllocated,
      utilizationRate: Math.min((totalAllocated / 100) * 100, 100),
      activeAllocations: allocations.length,
      status: totalAllocated > 90 ? 'HIGH' : totalAllocated > 70 ? 'MEDIUM' : 'LOW'
    };
  }

  optimizeAllocations() {
    const recommendations = [];
    
    Array.from(this.allocations.values()).forEach(allocation => {
      const utilization = this.getResourceUtilization(allocation.resourceId);
      
      if (utilization.utilizationRate < 50) {
        recommendations.push({
          type: 'UNDERUTILIZED',
          resourceId: allocation.resourceId,
          suggestion: 'Consider reallocating or reducing allocation',
          potentialSavings: allocation.amount * 0.3
        });
      } else if (utilization.utilizationRate > 95) {
        recommendations.push({
          type: 'OVERALLOCATED',
          resourceId: allocation.resourceId,
          suggestion: 'Consider increasing resource capacity',
          urgency: 'HIGH'
        });
      }
    });
    
    return recommendations;
  }
}

const resourceManager = new ResourceManager();

// 🎯 API ROUTES

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-erp',
    ubuntu: 'I manage because we prosper together',
    departments: departments.size,
    employees: employees.size,
    projects: projects.size,
    timestamp: new Date().toISOString()
  });
});

// Business Intelligence Dashboard
app.get('/api/dashboard/kpis', (req, res) => {
  try {
    const kpis = businessIntelligence.generateKPIs();
    
    res.json({
      success: true,
      data: kpis,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating KPIs:', error);
    res.status(500).json({ error: 'Failed to generate KPIs' });
  }
});

// Financial Reports
app.get('/api/reports/financial', (req, res) => {
  try {
    const { period } = req.query;
    const report = businessIntelligence.generateFinancialReport(period);
    
    res.json({
      success: true,
      data: report,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

// HR Reports
app.get('/api/reports/hr', (req, res) => {
  try {
    const report = businessIntelligence.generateHRReport();
    
    res.json({
      success: true,
      data: report,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating HR report:', error);
    res.status(500).json({ error: 'Failed to generate HR report' });
  }
});

// Department Management
app.post('/api/departments', (req, res) => {
  try {
    const { name, description, managerId, budget } = req.body;
    
    if (!name || !managerId) {
      return res.status(400).json({ error: 'Name and manager ID are required' });
    }
    
    const department = {
      id: `dept_${Date.now()}`,
      name,
      description,
      managerId,
      budget: budget || 0,
      employees: [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    
    departments.set(department.id, department);
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Get all departments
app.get('/api/departments', (req, res) => {
  try {
    const departmentList = Array.from(departments.values());
    
    res.json({
      success: true,
      data: departmentList,
      total: departmentList.length
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Employee Management
app.post('/api/employees', (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      departmentId, 
      position, 
      salary,
      startDate 
    } = req.body;
    
    if (!firstName || !lastName || !email || !departmentId) {
      return res.status(400).json({ 
        error: 'First name, last name, email, and department ID are required' 
      });
    }
    
    const employee = {
      id: `emp_${Date.now()}`,
      firstName,
      lastName,
      email,
      departmentId,
      position,
      salary: salary || 0,
      startDate: startDate || new Date().toISOString(),
      status: 'ACTIVE',
      performance: {
        rating: 0,
        reviews: []
      },
      createdAt: new Date().toISOString()
    };
    
    employees.set(employee.id, employee);
    
    // Add employee to department
    const department = departments.get(departmentId);
    if (department) {
      department.employees.push(employee.id);
      departments.set(departmentId, department);
    }
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Resource Allocation
app.post('/api/resources/allocate', (req, res) => {
  try {
    const { resourceId, departmentId, amount, duration } = req.body;
    
    if (!resourceId || !departmentId || !amount) {
      return res.status(400).json({ 
        error: 'Resource ID, department ID, and amount are required' 
      });
    }
    
    const allocation = resourceManager.allocateResource(
      resourceId, 
      departmentId, 
      amount, 
      duration || 30
    );
    
    res.status(201).json({
      success: true,
      message: 'Resource allocated successfully',
      data: allocation
    });
  } catch (error) {
    console.error('Error allocating resource:', error);
    res.status(500).json({ error: 'Failed to allocate resource' });
  }
});

// Resource Utilization
app.get('/api/resources/:resourceId/utilization', (req, res) => {
  try {
    const { resourceId } = req.params;
    const utilization = resourceManager.getResourceUtilization(resourceId);
    
    res.json({
      success: true,
      data: utilization
    });
  } catch (error) {
    console.error('Error getting resource utilization:', error);
    res.status(500).json({ error: 'Failed to get resource utilization' });
  }
});

// Resource Optimization
app.get('/api/resources/optimize', (req, res) => {
  try {
    const recommendations = resourceManager.optimizeAllocations();
    
    res.json({
      success: true,
      data: recommendations,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Error optimizing resources:', error);
    res.status(500).json({ error: 'Failed to optimize resources' });
  }
});

// Project Management
app.post('/api/projects', (req, res) => {
  try {
    const { 
      name, 
      description, 
      managerId, 
      departmentId, 
      budget, 
      deadline,
      priority 
    } = req.body;
    
    if (!name || !managerId || !departmentId) {
      return res.status(400).json({ 
        error: 'Name, manager ID, and department ID are required' 
      });
    }
    
    const project = {
      id: `proj_${Date.now()}`,
      name,
      description,
      managerId,
      departmentId,
      budget: budget || 0,
      deadline,
      priority: priority || 'MEDIUM',
      status: 'PLANNING',
      progress: 0,
      team: [],
      milestones: [],
      createdAt: new Date().toISOString()
    };
    
    projects.set(project.id, project);
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get all projects
app.get('/api/projects', (req, res) => {
  try {
    const { status, departmentId } = req.query;
    let projectList = Array.from(projects.values());
    
    if (status) {
      projectList = projectList.filter(project => project.status === status);
    }
    
    if (departmentId) {
      projectList = projectList.filter(project => project.departmentId === departmentId);
    }
    
    res.json({
      success: true,
      data: projectList,
      total: projectList.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

const PORT = process.env.PORT || 3022;
app.listen(PORT, () => {
  console.log('🌟 Azora ERP System running on port', PORT);
  console.log('🏢 Features: Business Intelligence, Resource Management, HR, Projects');
  console.log('📊 Analytics: Active');
  console.log('💼 Resource Optimization: Enabled');
  console.log('👥 HR Management: Active');
  console.log('📈 Financial Reporting: Ready');
  console.log('🌍 Ubuntu Philosophy: "I manage because we prosper together"');
});

module.exports = app;