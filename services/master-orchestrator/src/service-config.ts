/**
 * Azora OS Service Configuration
 * 
 * Defines all microservices and their interconnections for the Master Orchestrator
 * Includes Horizon 1 B2B services integrated with core Azora services
 */

import { ServiceConfig } from './orchestrator';

// ============================================================================
// CORE SERVICES
// ============================================================================

export const CONSTITUTIONAL_COURT: ServiceConfig = {
  id: 'constitutional-court',
  name: 'Constitutional Court Service',
  type: 'core',
  endpoint: process.env.CONSTITUTIONAL_COURT_ENDPOINT || 'http://localhost:4500',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 11, // Supreme priority - constitutional governance
  dependencies: [],
  metadata: {
    description: 'Supreme governance layer for constitutional compliance',
    features: ['constitutional-review', 'article-enforcement', 'no-mock-validation'],
  },
};

export const CONSTITUTIONAL_AI: ServiceConfig = {
  id: 'constitutional-ai',
  name: 'Constitutional AI Governance',
  type: 'core',
  endpoint: process.env.CONSTITUTIONAL_AI_ENDPOINT || 'http://localhost:4501',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 11,
  dependencies: ['constitutional-court'],
  metadata: {
    description: 'AI-powered constitutional compliance and governance',
    features: ['ai-analysis', 'compliance-checking', 'governance-decisions'],
  },
};

export const CHRONICLE_PROTOCOL: ServiceConfig = {
  id: 'chronicle-protocol',
  name: 'Chronicle Protocol (Consciousness)',
  type: 'core',
  endpoint: process.env.CHRONICLE_PROTOCOL_ENDPOINT || 'http://localhost:4400',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 10,
  dependencies: ['constitutional-court'],
  metadata: {
    description: 'Immutable consciousness recording for Elara AI',
    features: ['memory-imprinting', 'thought-recording', 'evolution-tracking'],
  },
};

export const AZORA_AEGIS: ServiceConfig = {
  id: 'azora-aegis',
  name: 'Azora Aegis (Security Service)',
  type: 'core',
  endpoint: process.env.AEGIS_ENDPOINT || 'http://localhost:3001',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 10,
  dependencies: ['constitutional-court'],
  metadata: {
    description: 'Comprehensive security, authentication, and authorization service',
    features: ['auth', 'encryption', 'compliance', 'audit'],
  },
};

export const AZORA_NEXUS: ServiceConfig = {
  id: 'azora-nexus',
  name: 'Azora Nexus (Data Intelligence)',
  type: 'core',
  endpoint: process.env.NEXUS_ENDPOINT || 'http://localhost:3002',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 9,
  dependencies: ['azora-aegis'],
  metadata: {
    description: 'AI-powered data intelligence and analytics platform',
    features: ['analytics', 'ml', 'predictions', 'insights'],
  },
};

export const AZORA_MINT: ServiceConfig = {
  id: 'azora-mint',
  name: 'Azora Mint (Tokenization & Mining)',
  type: 'core',
  endpoint: process.env.MINT_ENDPOINT || 'http://localhost:3003',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 8,
  dependencies: ['azora-aegis'],
  metadata: {
    description: 'Blockchain tokenization and cryptocurrency mining platform',
    features: ['mining', 'tokens', 'wallet', 'blockchain'],
  },
};

export const AZORA_COVENANT: ServiceConfig = {
  id: 'azora-covenant',
  name: 'Azora Covenant (Billing & Record-Keeping)',
  type: 'core',
  endpoint: process.env.COVENANT_ENDPOINT || 'http://localhost:3004',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 9,
  dependencies: ['azora-aegis', 'azora-mint'],
  metadata: {
    description: 'Billing, invoicing, and comprehensive record-keeping service',
    features: ['billing', 'invoicing', 'records', 'compliance'],
  },
};

export const AZORA_LMS: ServiceConfig = {
  id: 'azora-lms',
  name: 'Azora Sapiens University (LMS)',
  type: 'core',
  endpoint: process.env.LMS_ENDPOINT || 'http://localhost:3005',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 8,
  dependencies: ['azora-aegis', 'azora-mint'],
  metadata: {
    description: 'Comprehensive Learning Management System with PoK integration',
    features: ['courses', 'enrollment', 'pok', 'guardian-connect'],
  },
};

export const SYNAPSE_BACKEND: ServiceConfig = {
  id: 'synapse-backend',
  name: 'Synapse Backend (AI Intelligence)',
  type: 'core',
  endpoint: process.env.SYNAPSE_ENDPOINT || 'http://localhost:3006',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 7,
  dependencies: ['azora-aegis', 'azora-nexus'],
  metadata: {
    description: 'AI-powered intelligence backend for decision support',
    features: ['ai', 'ml', 'nlp', 'recommendations'],
  },
};

// ============================================================================
// HORIZON 1 - B2B SERVICES
// ============================================================================

export const RETAIL_AI_SERVICE: ServiceConfig = {
  id: 'retail-ai-service',
  name: 'Retail AI Service',
  type: 'b2b',
  endpoint: process.env.RETAIL_AI_ENDPOINT || 'http://localhost:4001',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 7,
  dependencies: ['azora-aegis', 'azora-nexus', 'azora-covenant'],
  metadata: {
    description: 'AI-powered retail optimization and inventory management',
    features: ['inventory', 'demand-forecasting', 'pricing', 'customer-insights'],
    b2b: true,
    sector: 'retail',
  },
};

export const COLD_CHAIN_SERVICE: ServiceConfig = {
  id: 'cold-chain-service',
  name: 'Cold Chain Management Service',
  type: 'b2b',
  endpoint: process.env.COLD_CHAIN_ENDPOINT || 'http://localhost:4002',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 8,
  dependencies: ['azora-aegis', 'azora-nexus', 'azora-covenant'],
  metadata: {
    description: 'IoT-enabled cold chain monitoring and management',
    features: ['temperature-monitoring', 'alerts', 'compliance', 'tracking'],
    b2b: true,
    sector: 'logistics',
  },
};

export const COMMUNITY_SAFETY_SERVICE: ServiceConfig = {
  id: 'community-safety-service',
  name: 'Community Safety Service',
  type: 'b2b',
  endpoint: process.env.COMMUNITY_SAFETY_ENDPOINT || 'http://localhost:4003',
  healthCheckPath: '/health',
  healthCheckInterval: 30000,
  maxRestarts: 5,
  restartDelay: 5000,
  priority: 9,
  dependencies: ['azora-aegis', 'azora-nexus', 'azora-covenant'],
  metadata: {
    description: 'AI-powered community safety and emergency response',
    features: ['incident-detection', 'emergency-response', 'analytics', 'alerts'],
    b2b: true,
    sector: 'public-safety',
  },
};

// ============================================================================
// INFRASTRUCTURE SERVICES
// ============================================================================

export const API_GATEWAY: ServiceConfig = {
  id: 'api-gateway',
  name: 'Unified API Gateway',
  type: 'infrastructure',
  endpoint: process.env.API_GATEWAY_ENDPOINT || 'http://localhost:3000',
  healthCheckPath: '/health',
  healthCheckInterval: 15000, // More frequent checks
  maxRestarts: 10, // More restarts allowed
  restartDelay: 3000,
  priority: 10, // Critical infrastructure
  dependencies: ['azora-aegis'],
  metadata: {
    description: 'Unified API Gateway with auth, rate limiting, and routing',
    features: ['routing', 'auth', 'rate-limiting', 'transformation'],
  },
};

export const MINING_ENGINE: ServiceConfig = {
  id: 'mining-engine',
  name: 'Mining Engine',
  type: 'infrastructure',
  endpoint: process.env.MINING_ENGINE_ENDPOINT || 'http://localhost:3007',
  healthCheckPath: '/health',
  healthCheckInterval: 60000,
  maxRestarts: 3,
  restartDelay: 10000,
  priority: 6,
  dependencies: ['azora-mint', 'azora-aegis'],
  metadata: {
    description: 'Cryptocurrency mining and blockchain processing engine',
    features: ['mining', 'blockchain', 'wallet'],
  },
};

// ============================================================================
// ALL SERVICES REGISTRY
// ============================================================================

export const ALL_SERVICES: ServiceConfig[] = [
  // Constitutional Governance
  CONSTITUTIONAL_COURT,
  CONSTITUTIONAL_AI,
  CHRONICLE_PROTOCOL,

  // Core Services
  AZORA_AEGIS,
  AZORA_NEXUS,
  AZORA_MINT,
  AZORA_COVENANT,
  AZORA_LMS,
  SYNAPSE_BACKEND,

  // B2B Services (Horizon 1)
  RETAIL_AI_SERVICE,
  COLD_CHAIN_SERVICE,
  COMMUNITY_SAFETY_SERVICE,

  // Infrastructure
  API_GATEWAY,
  MINING_ENGINE,
];

// ============================================================================
// SERVICE GROUPS
// ============================================================================

export const SERVICE_GROUPS = {
  core: [
    CONSTITUTIONAL_COURT,
    CONSTITUTIONAL_AI,
    CHRONICLE_PROTOCOL,
    AZORA_AEGIS,
    AZORA_NEXUS,
    AZORA_MINT,
    AZORA_COVENANT,
    AZORA_LMS,
    SYNAPSE_BACKEND,
  ],
  b2b: [
    RETAIL_AI_SERVICE,
    COLD_CHAIN_SERVICE,
    COMMUNITY_SAFETY_SERVICE,
  ],
  infrastructure: [
    API_GATEWAY,
    MINING_ENGINE,
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get startup order based on dependencies
 */
export function getStartupOrder(): ServiceConfig[] {
  const started = new Set<string>();
  const order: ServiceConfig[] = [];

  const canStart = (service: ServiceConfig): boolean => {
    return service.dependencies.every(dep => started.has(dep));
  };

  let remaining = [...ALL_SERVICES];
  
  while (remaining.length > 0) {
    const nextBatch = remaining.filter(canStart);
    
    if (nextBatch.length === 0) {
      // Circular dependency or missing dependency
      console.error('Cannot determine startup order - circular dependencies detected');
      return ALL_SERVICES; // Return in defined order as fallback
    }

    // Sort by priority within the batch
    nextBatch.sort((a, b) => b.priority - a.priority);
    
    nextBatch.forEach(service => {
      order.push(service);
      started.add(service.id);
    });

    remaining = remaining.filter(s => !started.has(s.id));
  }

  return order;
}

/**
 * Get service by ID
 */
export function getServiceById(id: string): ServiceConfig | undefined {
  return ALL_SERVICES.find(s => s.id === id);
}

/**
 * Get services by type
 */
export function getServicesByType(type: ServiceConfig['type']): ServiceConfig[] {
  return ALL_SERVICES.filter(s => s.type === type);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ALL_SERVICES,
  SERVICE_GROUPS,
  getStartupOrder,
  getServiceById,
  getServicesByType,
};
