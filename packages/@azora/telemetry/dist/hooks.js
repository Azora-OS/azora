"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useComponentTelemetry = useComponentTelemetry;
exports.useInteractionTelemetry = useInteractionTelemetry;
exports.useRenderTelemetry = useRenderTelemetry;
exports.withTelemetry = withTelemetry;
exports.useErrorTelemetry = useErrorTelemetry;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * React Hooks for Component Telemetry
 * Easy integration for tracking component usage
 */
const react_1 = require("react");
const client_1 = require("./client");
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
function useComponentTelemetry(componentName, props, metadata) {
    const mountTime = (0, react_1.useRef)(Date.now());
    (0, react_1.useEffect)(() => {
        const client = (0, client_1.getTelemetry)();
        if (!client)
            return;
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
function useInteractionTelemetry(componentName) {
    return (0, react_1.useCallback)((interactionType, metadata) => {
        const client = (0, client_1.getTelemetry)();
        if (!client)
            return;
        client.trackComponentInteraction(componentName, interactionType, metadata);
    }, [componentName]);
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
function useRenderTelemetry(componentName) {
    const renderCount = (0, react_1.useRef)(0);
    const renderStart = (0, react_1.useRef)(Date.now());
    (0, react_1.useEffect)(() => {
        renderCount.current += 1;
        const renderDuration = Date.now() - renderStart.current;
        const client = (0, client_1.getTelemetry)();
        if (!client)
            return;
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
function withTelemetry(Component, componentName) {
    const displayName = componentName || Component.displayName || Component.name || 'Component';
    const TrackedComponent = (props) => {
        useComponentTelemetry(displayName, props);
        return (0, jsx_runtime_1.jsx)(Component, { ...props });
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
function useErrorTelemetry(componentName) {
    return (0, react_1.useCallback)((error, metadata) => {
        const client = (0, client_1.getTelemetry)();
        if (!client)
            return;
        client.trackComponentError(componentName, error, metadata);
    }, [componentName]);
}
