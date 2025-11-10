/**
 * Telemetry Provider for Enterprise UI
 * Initializes component tracking
 */
import { useEffect } from 'react';
import { initTelemetry } from '@azora/telemetry';

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize telemetry client
    initTelemetry({
      service: 'enterprise-ui',
      analyticsUrl: import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:8086',
      enabled: import.meta.env.PROD || import.meta.env.VITE_TELEMETRY_ENABLED === 'true',
      batchSize: 10,
      flushInterval: 5000,
      debug: import.meta.env.DEV,
    });

    console.log('[Enterprise UI] Telemetry initialized');
  }, []);

  return <>{children}</>;
}
