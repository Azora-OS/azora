/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SHARED EVENT BUS
Event bus integration for shared services
*/

import { EventBus as EventBusClass } from '@azora/event-bus';

/**
 * Shared event bus instance
 * Provides event-driven communication across services
 * 
 * Note: Defaults to localhost for development. In production, REDIS_URL must be set
 * to point to a production Redis instance. The EventBus will log warnings if Redis
 * connection fails, allowing graceful degradation in development environments.
 */
export const eventBus = new EventBusClass(
  process.env.REDIS_URL || 'redis://localhost:6379'
);

/**
 * Export EventBus class for custom instances
 */
export { EventBusClass as EventBus };

export default eventBus;
