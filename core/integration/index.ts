/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AI INTEGRATION - MAIN EXPORT
*/

export { aiHub, ElaraAITutor, ConstitutionalAI, AIRecommendationEngine } from './ai-integration-hub';
export { v0Bridge, V0MasterUIBridge } from './v0-master-ui-bridge';
export { azoraAPI, AzoraAPIClient, AZORA_API_CONFIG } from './api-gateway-config';
export { 
  aiContextMiddleware, 
  constitutionalValidation, 
  guardianVerification,
  injectRecommendations,
  elaraTutoringEndpoint,
  aiHealthCheck
} from './ai-middleware';
export { initializeAIWebSocket, aiWebSocketHandler } from './ai-websocket-handler';
export { default as aiRoutes } from './ai-routes';
export { AIIntegrationExamples } from './ai-integration-example';
