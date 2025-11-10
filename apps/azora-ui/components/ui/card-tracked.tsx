/**
 * Card with telemetry tracking
 * Wraps the standard Card component
 */
'use client';

import * as React from 'react';
import { Card as BaseCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
import { useComponentTelemetry } from '@azora/telemetry';

type CardProps = React.ComponentProps<typeof BaseCard> & {
  trackingName?: string;
  trackingMetadata?: Record<string, any>;
};

export function Card({ 
  trackingName = 'Card',
  trackingMetadata,
  ...props 
}: CardProps) {
  useComponentTelemetry(trackingName, {}, trackingMetadata);
  return <BaseCard {...props} />;
}

// Re-export sub-components (no tracking needed for these)
export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
