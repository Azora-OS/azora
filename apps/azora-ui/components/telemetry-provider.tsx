'use client';

/**
 * Telemetry Provider for Azora UI
 * Initializes component tracking
 */
import { useEffect } from 'react';
import { initTelemetry } from '@azora/telemetry';

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize telemetry client
    initTelemetry({
      service: 'azora-ui',
      analyticsUrl: process.env.NEXT_PUBLIC_ANALYTICS_URL || 'http://localhost:8086',
      enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_TELEMETRY_ENABLED === 'true',
      batchSize: 10,
      flushInterval: 5000,
      debug: process.env.NODE_ENV === 'development',
    });

    console.log('[Azora UI] Telemetry initialized');
  }, []);

  return <>{children}</>;
}
