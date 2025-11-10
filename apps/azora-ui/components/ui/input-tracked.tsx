/**
 * Input with telemetry tracking
 * Wraps the standard Input component
 */
'use client';

import * as React from 'react';
import { Input as BaseInput } from './input';
import { useComponentTelemetry, useInteractionTelemetry } from '@azora/telemetry';

type InputProps = React.ComponentProps<typeof BaseInput> & {
  trackingName?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ trackingName = 'Input', type, onFocus, onChange, ...props }, ref) => {
    // Track component mount/unmount
    useComponentTelemetry(trackingName, { type });
    
    // Track interactions
    const trackInteraction = useInteractionTelemetry(trackingName);

    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        trackInteraction('focus', { type });
        onFocus?.(e);
      },
      [onFocus, trackInteraction, type]
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        trackInteraction('change', { type, hasValue: !!e.target.value });
        onChange?.(e);
      },
      [onChange, trackInteraction, type]
    );

    return (
      <BaseInput 
        ref={ref}
        type={type}
        onFocus={handleFocus}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
