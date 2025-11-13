#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

class APIIntegrationService {
  constructor() {
    this.integrations = new Map();
    this.clientLibraries = new Map();
    this.apiMappings = new Map();
    this.initIntegrations();
  }

  initIntegrations() {
    this.integrations.set('student-portal', {
      id: 'student-portal',
      name: 'Student Portal Integration',
      endpoints: [
        { service: 'ai-family', path: '/api/chat', method: 'POST' },
        { service: 'sapiens', path: '/api/tutor', method: 'POST' },
        { service: 'lms', path: '/api/courses', method: 'GET' }
      ],
      status: 'active'
    });
  }

  generateClientLibrary(appName, services) {
    const library = {
      id: `lib_${Date.now()}`,
      appName,
      services,
      generatedAt: new Date(),
      version: '1.0.0',
      code: this.generateClientCode(services)
    };

    this.clientLibraries.set(library.id, library);
    return library;
  }

  generateClientCode(services) {
    const imports = services.map(service => 
      `import { ${this.toCamelCase(service)}API } from './services/${service}';`
    ).join('\n');

    const apiClass = `
class AzoraAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'http://localhost:4000';
    this.token = config.token;
    this.timeout = config.timeout || 10000;
    
    ${services.map(service => 
      `this.${this.toCamelCase(service)} = new ${this.toCamelCase(service)}API(this);`
    ).join('\n    ')}
  }

  async request(endpoint, options = {}) {
    const url = \`\${this.baseURL}\${endpoint}\`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': \`Bearer \${this.token}\` })
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(\`API Error: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
}

${services.map(service => this.generateServiceClass(service)).join('\n\n')}

export default AzoraAPI;
    `;

    return { imports, apiClass };
  }

  generateServiceClass(serviceName) {
    const className = this.toCamelCase(serviceName) + 'API';
    
    return `
class ${className} {
  constructor(api) {
    this.api = api;
  }

  async get${this.toPascalCase(serviceName)}Data() {
    return this.api.request('/api/${serviceName}');
  }

  async create${this.toPascalCase(serviceName)}(data) {
    return this.api.request('/api/${serviceName}', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update${this.toPascalCase(serviceName)}(id, data) {
    return this.api.request(\`/api/${serviceName}/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete${this.toPascalCase(serviceName)}(id) {
    return this.api.request(\`/api/${serviceName}/\${id}\`, {
      method: 'DELETE'
    });
  }
}`;
  }

  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  toPascalCase(str) {
    return str.replace(/(^|-)([a-z])/g, (g) => g.slice(-1).toUpperCase());
  }

  createAPIMapping(frontendApp, backendServices) {
    const mapping = {
      id: `mapping_${Date.now()}`,
      frontendApp,
      backendServices,
      routes: this.generateRouteMapping(backendServices),
      createdAt: new Date()
    };

    this.apiMappings.set(mapping.id, mapping);
    return mapping;
  }

  generateRouteMapping(services) {
    const routes = {};
    
    services.forEach(service => {
      routes[service] = {
        baseUrl: `http://localhost:${this.getServicePort(service)}`,
        endpoints: {
          list: `GET /api/${service}`,
          create: `POST /api/${service}`,
          read: `GET /api/${service}/:id`,
          update: `PUT /api/${service}/:id`,
          delete: `DELETE /api/${service}/:id`,
          health: `GET /health`
        }
      };
    });

    return routes;
  }

  getServicePort(service) {
    const portMap = {
      'ai-family': 4010,
      'sapiens': 4011,
      'mint': 4012,
      'forge': 4013,
      'lms': 4015,
      'nexus': 4016,
      'analytics': 4017,
      'aegis': 4018
    };
    return portMap[service] || 4000;
  }

  generateSDK(platform, services) {
    const sdk = {
      id: `sdk_${Date.now()}`,
      platform,
      services,
      generatedAt: new Date(),
      files: {}
    };

    if (platform === 'react') {
      sdk.files['index.js'] = this.generateReactSDK(services);
      sdk.files['hooks.js'] = this.generateReactHooks(services);
    } else if (platform === 'react-native') {
      sdk.files['index.js'] = this.generateReactNativeSDK(services);
      sdk.files['storage.js'] = this.generateOfflineStorage(services);
    }

    return sdk;
  }

  generateReactSDK(services) {
    return `
import React, { createContext, useContext, useState } from 'react';
import AzoraAPI from './api';

const AzoraContext = createContext();

export const AzoraProvider = ({ children, config }) => {
  const [api] = useState(() => new AzoraAPI(config));
  
  return (
    <AzoraContext.Provider value={api}>
      {children}
    </AzoraContext.Provider>
  );
};

export const useAzora = () => {
  const context = useContext(AzoraContext);
  if (!context) {
    throw new Error('useAzora must be used within AzoraProvider');
  }
  return context;
};
    `;
  }

  generateReactHooks(services) {
    return services.map(service => `
export const use${this.toPascalCase(service)} = () => {
  const api = useAzora();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch${this.toPascalCase(service)} = async () => {
    setLoading(true);
    try {
      const result = await api.${this.toCamelCase(service)}.get${this.toPascalCase(service)}Data();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetch${this.toPascalCase(service)} };
};
    `).join('\n');
  }

  generateReactNativeSDK(services) {
    return `
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

class AzoraMobileAPI extends AzoraAPI {
  constructor(config) {
    super(config);
    this.offlineQueue = [];
    this.setupOfflineHandling();
  }

  async setupOfflineHandling() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processOfflineQueue();
      }
    });
  }

  async request(endpoint, options = {}) {
    const isOnline = await NetInfo.fetch().then(state => state.isConnected);
    
    if (!isOnline && options.method !== 'GET') {
      this.offlineQueue.push({ endpoint, options });
      throw new Error('Request queued for when online');
    }

    return super.request(endpoint, options);
  }

  async processOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const { endpoint, options } = this.offlineQueue.shift();
      try {
        await super.request(endpoint, options);
      } catch (error) {
        console.error('Failed to process offline request:', error);
      }
    }
  }
}

export default AzoraMobileAPI;
    `;
  }
}

const apiIntegration = new APIIntegrationService();

app.get('/api/integrations', (req, res) => {
  res.json({ success: true, data: Array.from(apiIntegration.integrations.values()) });
});

app.post('/api/client-library/generate', (req, res) => {
  try {
    const { appName, services } = req.body;
    const library = apiIntegration.generateClientLibrary(appName, services);
    res.json({ success: true, data: library });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/mapping/create', (req, res) => {
  try {
    const { frontendApp, backendServices } = req.body;
    const mapping = apiIntegration.createAPIMapping(frontendApp, backendServices);
    res.json({ success: true, data: mapping });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/sdk/generate', (req, res) => {
  try {
    const { platform, services } = req.body;
    const sdk = apiIntegration.generateSDK(platform, services);
    res.json({ success: true, data: sdk });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/mappings', (req, res) => {
  res.json({ success: true, data: Array.from(apiIntegration.apiMappings.values()) });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'API Integration Service',
    status: 'healthy',
    timestamp: new Date(),
    stats: { integrations: apiIntegration.integrations.size, libraries: apiIntegration.clientLibraries.size },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4021;
app.listen(PORT, () => {
  console.log(`🔗 API Integration Service running on port ${PORT}`);
});

module.exports = app;