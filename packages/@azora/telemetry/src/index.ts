/**
 * @azora/telemetry
 * Component usage analytics for Azora OS
 * 
 * Ubuntu principle: "What gets measured gets improved"
 */

// Export client
export { TelemetryClient, initTelemetry, getTelemetry } from './client';
export type { TelemetryEvent, ComponentEvent, TelemetryConfig } from './client';

// Export hooks
export {
  useComponentTelemetry,
  useInteractionTelemetry,
  useRenderTelemetry,
  useErrorTelemetry,
  withTelemetry,
} from './hooks';
