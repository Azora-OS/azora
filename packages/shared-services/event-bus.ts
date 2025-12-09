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
 */
export const eventBus = new EventBusClass(
  process.env.REDIS_URL || 'redis://localhost:6379'
);

/**
 * Export EventBus class for custom instances
 */
export { EventBusClass as EventBus };

export default eventBus;
