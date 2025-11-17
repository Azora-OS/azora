const request = require('supertest');
const app = require('../server');

describe('Azora ERP Service', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('azora-erp');
      expect(response.body.ubuntu).toBe('I manage because we prosper together');
    });
  });

  describe('Business Intelligence API', () => {
    it('should get KPIs dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/kpis')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('revenue');
      expect(response.body.data).toHaveProperty('expenses');
      expect(response.body.data).toHaveProperty('productivity');
      expect(response.body.data).toHaveProperty('satisfaction');
    });

    it('should generate financial report', async () => {
      const response = await request(app)
        .get('/api/reports/financial?period=monthly')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('revenue');
      expect(response.body.data).toHaveProperty('expenses');
      expect(response.body.data).toHaveProperty('profit');
      expect(response.body.data.period).toBe('monthly');
    });

    it('should generate HR report', async () => {
      const response = await request(app)
        .get('/api/reports/hr')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalEmployees');
      expect(response.body.data).toHaveProperty('departments');
      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data).toHaveProperty('retention');
    });
  });

  describe('Department Management API', () => {
    it('should create a new department', async () => {
      const departmentData = {
        name: 'Test Department',
        description: 'A test department for unit testing',
        managerId: 'test-manager-1',
        budget: 100000
      };

      const response = await request(app)
        .post('/api/departments')
        .send(departmentData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Department created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(departmentData.name);
    });

    it('should get all departments', async () => {
      const response = await request(app)
        .get('/api/departments')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require name and manager ID for department creation', async () => {
      const invalidData = {
        description: 'Missing required fields'
      };

      const response = await request(app)
        .post('/api/departments')
        .send(invalidData)
        .expect(400);
      
      expect(response.body.error).toBe('Name and manager ID are required');
    });
  });

  describe('Employee Management API', () => {
    let departmentId;

    beforeEach(async () => {
      // Create a test department first
      const departmentData = {
        name: 'Employee Test Department',
        description: 'Test department for employee tests',
        managerId: 'test-manager-1',
        budget: 50000
      };

      const deptResponse = await request(app)
        .post('/api/departments')
        .send(departmentData);
      
      departmentId = deptResponse.body.data.id;
    });

    it('should create a new employee', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@azora.world',
        departmentId: departmentId,
        position: 'Software Engineer',
        salary: 75000
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Employee created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.firstName).toBe(employeeData.firstName);
    });

    it('should require required fields for employee creation', async () => {
      const invalidData = {
        firstName: 'John'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/employees')
        .send(invalidData)
        .expect(400);
      
      expect(response.body.error).toBe('First name, last name, email, and department ID are required');
    });
  });

  describe('Resource Management API', () => {
    it('should allocate a resource', async () => {
      const allocationData = {
        resourceId: 'resource-1',
        departmentId: 'dept-1',
        amount: 50,
        duration: 30
      };

      const response = await request(app)
        .post('/api/resources/allocate')
        .send(allocationData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Resource allocated successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.resourceId).toBe(allocationData.resourceId);
    });

    it('should get resource utilization', async () => {
      // First allocate a resource
      const allocationData = {
        resourceId: 'resource-test-1',
        departmentId: 'dept-1',
        amount: 75,
        duration: 30
      };

      await request(app)
        .post('/api/resources/allocate')
        .send(allocationData);

      // Then get utilization
      const response = await request(app)
        .get('/api/resources/resource-test-1/utilization')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resourceId');
      expect(response.body.data).toHaveProperty('totalAllocated');
      expect(response.body.data).toHaveProperty('utilizationRate');
    });

    it('should get resource optimization recommendations', async () => {
      const response = await request(app)
        .get('/api/resources/optimize')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require required fields for resource allocation', async () => {
      const invalidData = {
        resourceId: 'resource-1'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/resources/allocate')
        .send(invalidData)
        .expect(400);
      
      expect(response.body.error).toBe('Resource ID, department ID, and amount are required');
    });
  });

  describe('Project Management API', () => {
    let departmentId;

    beforeEach(async () => {
      // Create a test department first
      const departmentData = {
        name: 'Project Test Department',
        description: 'Test department for project tests',
        managerId: 'test-manager-1',
        budget: 200000
      };

      const deptResponse = await request(app)
        .post('/api/departments')
        .send(departmentData);
      
      departmentId = deptResponse.body.data.id;
    });

    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project for unit testing',
        managerId: 'test-manager-1',
        departmentId: departmentId,
        budget: 50000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Project created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(projectData.name);
    });

    it('should get all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter projects by status', async () => {
      // Create a project first
      const projectData = {
        name: 'Status Filter Test Project',
        description: 'Test project for status filtering',
        managerId: 'test-manager-1',
        departmentId: departmentId
      };

      await request(app)
        .post('/api/projects')
        .send(projectData);

      // Filter by status
      const response = await request(app)
        .get('/api/projects?status=PLANNING')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require required fields for project creation', async () => {
      const invalidData = {
        name: 'Test Project'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/projects')
        .send(invalidData)
        .expect(400);
      
      expect(response.body.error).toBe('Name, manager ID, and department ID are required');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });
  });
});