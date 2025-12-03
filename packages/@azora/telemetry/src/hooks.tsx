/**
 * React Hooks for Component Telemetry
 * Easy integration for tracking component usage
 */
import { useEffect, useRef, useCallback } from 'react';
import { getTelemetry } from './client';

/**
 * Hook to track component mount/unmount
 * 
 * @example
 * ```tsx
 * function MyButton({ variant }: ButtonProps) {
 *   useComponentTelemetry('Button', { variant });
 *   return <button>Click me</button>;
 * }
 * ```
 */
export function useComponentTelemetry(
  componentName: string,
  props?: Record<string, any>,
  metadata?: Record<string, any>
) {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const client = getTelemetry();
    if (!client) {return;}

    // Track mount
    client.trackComponentMount(componentName, props, metadata);

    // Track unmount with duration
    return () => {
      const duration = Date.now() - mountTime.current;
      client.trackComponentUnmount(componentName, duration);
    };
  }, [componentName]); // Only track on initial mount
}

/**
 * Hook to track component interactions
 * Returns a tracking function
 * 
 * @example
 * ```tsx
 * function MyButton() {
 *   const trackInteraction = useInteractionTelemetry('Button');
 *   
 *   return (
 *     <button onClick={() => trackInteraction('click', { buttonId: '123' })}>
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */
export function useInteractionTelemetry(componentName: string) {
  return useCallback(
    (interactionType: string, metadata?: Record<string, any>) => {
      const client = getTelemetry();
      if (!client) {return;}
      
      client.trackComponentInteraction(componentName, interactionType, metadata);
    },
    [componentName]
  );
}

/**
 * Hook to track component renders with performance
 * Measures render time and count
 * 
 * @example
 * ```tsx
 * function MyComplexComponent() {
 *   useRenderTelemetry('ComplexComponent');
 *   return <div>Complex UI</div>;
 * }
 * ```
 */
export function useRenderTelemetry(componentName: string) {
  const renderCount = useRef(0);
  const renderStart = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderDuration = Date.now() - renderStart.current;

    const client = getTelemetry();
    if (!client) {return;}

    client.trackComponentRender(componentName, renderDuration, renderCount.current);
    
    // Reset timer for next render
    renderStart.current = Date.now();
  });
}

/**
 * HOC to wrap components with telemetry
 * Automatically tracks mount/unmount
 * 
 * @example
 * ```tsx
 * const TrackedButton = withTelemetry(Button, 'Button');
 * 
 * // Or with display name
 * export default withTelemetry(MyComponent, 'MyComponent');
 * ```
 */
export function withTelemetry<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  const TrackedComponent = (props: P) => {
    useComponentTelemetry(displayName, props as Record<string, any>);
    return <Component {...props} />;
  };

  TrackedComponent.displayName = `withTelemetry(${displayName})`;
  
  return TrackedComponent;
}

/**
 * Hook to track errors in components
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const trackError = useErrorTelemetry('MyComponent');
 *   
 *   try {
 *     riskyOperation();
 *   } catch (error) {
 *     trackError(error as Error, { context: 'riskyOperation' });
 *   }
 * }
 * ```
 */
export function useErrorTelemetry(componentName: string) {
  return useCallback(
    (error: Error, metadata?: Record<string, any>) => {
      const client = getTelemetry();
      if (!client) {return;}
      
      client.trackComponentError(componentName, error, metadata);
    },
    [componentName]
  );
}
