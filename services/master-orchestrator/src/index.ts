/**
 * Master Orchestrator API Server
 * 
 * HTTP API for interacting with the Master Orchestrator
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import MasterOrchestrator from './orchestrator';
import { ALL_SERVICES, getStartupOrder } from './service-config';

const app = express();
const PORT = process.env.ORCHESTRATOR_PORT || 5000;

// Initialize orchestrator
const orchestrator = new MasterOrchestrator();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// HEALTH & STATUS ENDPOINTS
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/status', (req: Request, res: Response) => {
  const status = orchestrator.getStatus();
  res.json(status);
});

app.get('/status/detailed', (req: Request, res: Response) => {
  const status = orchestrator.getStatus();
  const services = status.services.map(health => {
    const discovery = orchestrator.discoverServices('core')
      .concat(orchestrator.discoverServices('b2b'))
      .concat(orchestrator.discoverServices('infrastructure'));
    
    const instance = discovery.find(s => s.health.serviceId === health.serviceId);
    
    return {
      ...health,
      config: instance?.config,
    };
  });

  res.json({
    ...status,
    services,
  });
});

// ============================================================================
// SERVICE MANAGEMENT ENDPOINTS
// ============================================================================

app.post('/services/register', (req: Request, res: Response) => {
  try {
    const config = req.body;
    orchestrator.registerService(config);
    res.json({
      success: true,
      message: `Service ${config.name} registered successfully`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.delete('/services/:serviceId', (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    orchestrator.unregisterService(serviceId);
    res.json({
      success: true,
      message: `Service ${serviceId} unregistered successfully`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/services', (req: Request, res: Response) => {
  const { type } = req.query;
  
  if (type) {
    const services = orchestrator.discoverServices(type as string);
    res.json({
      services: services.map(s => ({
        id: s.config.id,
        name: s.config.name,
        type: s.config.type,
        health: s.health,
      })),
    });
  } else {
    const status = orchestrator.getStatus();
    res.json({
      services: status.services,
    });
  }
});

app.get('/services/:serviceId', (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const allServices = orchestrator.discoverServices('core')
    .concat(orchestrator.discoverServices('b2b'))
    .concat(orchestrator.discoverServices('infrastructure'));
  
  const service = allServices.find(s => s.config.id === serviceId);
  
  if (!service) {
    res.status(404).json({
      error: 'Service not found',
    });
    return;
  }

  res.json({
    config: service.config,
    health: service.health,
    startTime: service.startTime,
  });
});

// ============================================================================
// LOAD BALANCER ENDPOINT
// ============================================================================

app.get('/loadbalancer/:serviceType', (req: Request, res: Response) => {
  const { serviceType } = req.params;
  const instance = orchestrator.getService(serviceType);
  
  if (!instance) {
    res.status(503).json({
      error: `No healthy instances available for service type: ${serviceType}`,
    });
    return;
  }

  res.json({
    serviceId: instance.config.id,
    endpoint: instance.config.endpoint,
    health: instance.health,
  });
});

// ============================================================================
// ORCHESTRATOR CONTROL ENDPOINTS
// ============================================================================

app.post('/orchestrator/start', (req: Request, res: Response) => {
  try {
    orchestrator.start();
    res.json({
      success: true,
      message: 'Orchestrator started successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/orchestrator/stop', (req: Request, res: Response) => {
  try {
    orchestrator.stop();
    res.json({
      success: true,
      message: 'Orchestrator stopped successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeOrchestrator() {
  console.log('[Init] Registering services...');
  
  // Register all services in startup order
  const startupOrder = getStartupOrder();
  startupOrder.forEach(service => {
    orchestrator.registerService(service);
  });

  console.log(`[Init] Registered ${ALL_SERVICES.length} services`);
  
  // Start the orchestrator
  orchestrator.start();
  console.log('[Init] Orchestrator started');

  // Setup event listeners
  const eventEmitter = orchestrator.getEventEmitter();
  
  eventEmitter.on('serviceFailed', (data) => {
    console.error(`[Alert] SERVICE FAILED: ${data.serviceId}`);
    // In production, send alerts to monitoring system
  });
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = app.listen(PORT, () => {
  console.log('='.repeat(80));
  console.log('Azora OS Master Orchestrator');
  console.log('='.repeat(80));
  console.log(`Server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Status: http://localhost:${PORT}/status`);
  console.log('='.repeat(80));
  
  initializeOrchestrator();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Shutdown] SIGTERM received, shutting down gracefully...');
  orchestrator.stop();
  server.close(() => {
    console.log('[Shutdown] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Shutdown] SIGINT received, shutting down gracefully...');
  orchestrator.stop();
  server.close(() => {
    console.log('[Shutdown] Server closed');
    process.exit(0);
  });
});

export default app;
