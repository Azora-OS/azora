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
export declare function useComponentTelemetry(componentName: string, props?: Record<string, any>, metadata?: Record<string, any>): void;
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
export declare function useInteractionTelemetry(componentName: string): (interactionType: string, metadata?: Record<string, any>) => void;
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
export declare function useRenderTelemetry(componentName: string): void;
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
export declare function withTelemetry<P extends object>(Component: React.ComponentType<P>, componentName?: string): {
    (props: P): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
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
export declare function useErrorTelemetry(componentName: string): (error: Error, metadata?: Record<string, any>) => void;
//# sourceMappingURL=hooks.d.ts.map