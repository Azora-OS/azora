// Azora OS API Template
const { Router } = require('express');
const { body, validationResult } = require('express-validator');

class AzoraAPITemplate {
  constructor(resourceName) {
    this.resourceName = resourceName;
    this.router = Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // GET all resources
    this.router.get(`/${this.resourceName}`, this.getAll.bind(this));
    
    // GET single resource
    this.router.get(`/${this.resourceName}/:id`, this.getById.bind(this));
    
    // POST create resource
    this.router.post(`/${this.resourceName}`, 
      this.getValidationRules(),
      this.create.bind(this)
    );
    
    // PUT update resource
    this.router.put(`/${this.resourceName}/:id`,
      this.getValidationRules(),
      this.update.bind(this)
    );
    
    // DELETE resource
    this.router.delete(`/${this.resourceName}/:id`, this.delete.bind(this));
  }

  getValidationRules() {
    // Override in specific implementations
    return [];
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await this.service.findAll({
        page: parseInt(page),
        limit: parseInt(limit)
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const result = await this.service.findById(req.params.id);
      if (!result) {
        return res.status(404).json({ error: `${this.resourceName} not found` });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const result = await this.service.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const result = await this.service.update(req.params.id, req.body);
      if (!result) {
        return res.status(404).json({ error: `${this.resourceName} not found` });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await this.service.delete(req.params.id);
      if (!result) {
        return res.status(404).json({ error: `${this.resourceName} not found` });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getRouter() {
    return this.router;
  }
}

module.exports = AzoraAPITemplate;

// monitoring-service specific implementation
class Monitoring-serviceAPI extends AzoraAPITemplate {
  constructor() {
    super('monitoring-service');
    // Initialize service layer here
    this.service = new Monitoring-serviceService();
  }

  getValidationRules() {
    return [
      body('name').notEmpty().withMessage('Name is required'),
      // Add more validation rules as needed
    ];
  }
}

// Service layer placeholder
class Monitoring-serviceService {
  async findAll(options) {
    // Implement database query
    return { data: [], total: 0, page: options.page, limit: options.limit };
  }

  async findById(id) {
    // Implement database query
    return { id, name: 'Sample monitoring-service' };
  }

  async create(data) {
    // Implement database insert
    return { id: Date.now(), ...data };
  }

  async update(id, data) {
    // Implement database update
    return { id, ...data };
  }

  async delete(id) {
    // Implement database delete
    return true;
  }
}

module.exports = Monitoring-serviceAPI;