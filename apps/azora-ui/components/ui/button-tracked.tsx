/**
 * Button with telemetry tracking
 * Wraps the standard Button component
 */
'use client';

import * as React from 'react';
import { Button as BaseButton } from './button';
import { useComponentTelemetry, useInteractionTelemetry } from '@azora/telemetry';
import type { VariantProps } from 'class-variance-authority';

// Re-export button variants types
type ButtonProps = React.ComponentProps<typeof BaseButton> & {
  trackingName?: string;
};

export function Button({ 
  trackingName = 'Button',
  variant,
  size,
  onClick,
  ...props 
}: ButtonProps) {
  // Track component mount/unmount
  useComponentTelemetry(trackingName, { variant, size });
  
  // Track interactions
  const trackInteraction = useInteractionTelemetry(trackingName);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      trackInteraction('click', { 
        variant, 
        size,
        text: props.children?.toString().slice(0, 50),
      });
      onClick?.(e);
    },
    [onClick, trackInteraction, variant, size, props.children]
  );

  return (
    <BaseButton 
      variant={variant}
      size={size}
      onClick={handleClick}
      {...props}
    />
  );
}
