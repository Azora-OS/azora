import { FileChange } from './ChangesetManager';
import * as path from 'path';

export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  requestSchema?: Record<string, any>;
  responseSchema?: Record<string, any>;
  requiresAuth?: boolean;
}

export interface APIConnection {
  componentId: string;
  endpointId: string;
  operation: 'query' | 'mutation';
  onSuccess?: string; // Callback function name
  onError?: string; // Error handler function name
  optimisticUpdate?: boolean;
}

export interface ReactQueryHookOptions {
  hookName: string;
  endpoint: APIEndpoint;
  connection: APIConnection;
  includeOptimisticUpdates?: boolean;
}

export class APIConnectionManager {
  /**
   * Generate React Query hooks for API connections
   */
  generateReactQueryHook(options: ReactQueryHookOptions, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const hookPath = path.join(outputDir, 'hooks', `${this.toKebabCase(options.hookName)}.ts`);
    
    changes.push({
      path: hookPath,
      type: 'create',
      content: this.generateHookContent(options),
    });

    return changes;
  }

  /**
   * Generate hook content based on operation type
   */
  private generateHookContent(options: ReactQueryHookOptions): string {
    const { hookName, endpoint, connection } = options;
    
    if (connection.operation === 'query') {
      return this.generateQueryHook(hookName, endpoint, connection);
    } else {
      return this.generateMutationHook(hookName, endpoint, connection);
    }
  }

  /**
   * Generate a React Query useQuery hook
   */
  private generateQueryHook(hookName: string, endpoint: APIEndpoint, _connection: APIConnection): string {
    const functionName = this.toCamelCase(hookName);
    const queryKey = this.generateQueryKey(endpoint);
    const fetchFunction = this.generateFetchFunction(endpoint);
    
    return `import { useQuery, UseQueryOptions } from '@tanstack/react-query';

${this.generateTypeDefinitions(endpoint)}

${fetchFunction}

export function ${functionName}(
  ${this.generateHookParameters(endpoint)},
  options?: Omit<UseQueryOptions<${this.getResponseType(endpoint)}, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ${queryKey},
    queryFn: () => fetch${this.toPascalCase(hookName)}(${this.generateFetchParams(endpoint)}),
    ...options,
  });
}

// Usage example:
// const { data, isLoading, error, refetch } = ${functionName}();
`;
  }

  /**
   * Generate a React Query useMutation hook
   */
  private generateMutationHook(hookName: string, endpoint: APIEndpoint, connection: APIConnection): string {
    const functionName = this.toCamelCase(hookName);
    const fetchFunction = this.generateFetchFunction(endpoint);
    const hasOptimistic = connection.optimisticUpdate;
    
    return `import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';

${this.generateTypeDefinitions(endpoint)}

${fetchFunction}

export function ${functionName}(
  options?: UseMutationOptions<${this.getResponseType(endpoint)}, Error, ${this.getRequestType(endpoint)}>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fetch${this.toPascalCase(hookName)},
    ${hasOptimistic ? this.generateOptimisticUpdate(endpoint) : ''}
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['${this.getResourceName(endpoint)}'] });
      ${connection.onSuccess ? `options?.onSuccess?.(data);` : ''}
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      ${connection.onError ? `options?.onError?.(error);` : ''}
    },
    ...options,
  });
}

// Usage example:
// const mutation = ${functionName}();
// mutation.mutate(${this.getRequestType(endpoint) !== 'void' ? '{ /* data */ }' : ''});
`;
  }

  /**
   * Generate fetch function for API endpoint
   */
  private generateFetchFunction(endpoint: APIEndpoint): string {
    const functionName = `fetch${this.toPascalCase(endpoint.id)}`;
    const hasRequestBody = ['POST', 'PUT', 'PATCH'].includes(endpoint.method);
    const params = hasRequestBody ? `data: ${this.getRequestType(endpoint)}` : this.generatePathParams(endpoint);
    
    return `async function ${functionName}(${params}): Promise<${this.getResponseType(endpoint)}> {
  const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || ''}${this.interpolatePath(endpoint.path)}\`, {
    method: '${endpoint.method}',
    headers: {
      'Content-Type': 'application/json',
      ${endpoint.requiresAuth ? `'Authorization': \`Bearer \${localStorage.getItem('token')}\`,` : ''}
    },
    ${hasRequestBody ? 'body: JSON.stringify(data),' : ''}
  });

  if (!response.ok) {
    throw new Error(\`API error: \${response.status} \${response.statusText}\`);
  }

  return response.json();
}
`;
  }

  /**
   * Generate TypeScript type definitions from schemas
   */
  private generateTypeDefinitions(endpoint: APIEndpoint): string {
    const types: string[] = [];
    
    if (endpoint.requestSchema) {
      types.push(`export interface ${this.toPascalCase(endpoint.id)}Request {
  ${this.schemaToTypeFields(endpoint.requestSchema)}
}`);
    }
    
    if (endpoint.responseSchema) {
      types.push(`export interface ${this.toPascalCase(endpoint.id)}Response {
  ${this.schemaToTypeFields(endpoint.responseSchema)}
}`);
    }
    
    return types.join('\n\n');
  }

  /**
   * Convert schema object to TypeScript interface fields
   */
  private schemaToTypeFields(schema: Record<string, any>): string {
    return Object.entries(schema)
      .map(([key, value]) => {
        const type = this.inferTypeFromSchema(value);
        const optional = value.optional ? '?' : '';
        return `  ${key}${optional}: ${type};`;
      })
      .join('\n');
  }

  /**
   * Infer TypeScript type from schema definition
   */
  private inferTypeFromSchema(value: any): string {
    if (typeof value === 'string') {
      return value; // Already a type string
    }
    
    if (value.type === 'array') {
      return `${this.inferTypeFromSchema(value.items)}[]`;
    }
    
    if (value.type === 'object') {
      return 'Record<string, any>'; // Simplified for now
    }
    
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'Date',
      any: 'any',
    };
    
    return typeMap[value.type] || 'any';
  }

  /**
   * Generate query key for React Query
   */
  private generateQueryKey(endpoint: APIEndpoint): string {
    const resourceName = this.getResourceName(endpoint);
    const pathParams = this.extractPathParams(endpoint.path);
    
    if (pathParams.length > 0) {
      return `['${resourceName}', ${pathParams.join(', ')}]`;
    }
    
    return `['${resourceName}']`;
  }

  /**
   * Extract resource name from endpoint path
   */
  private getResourceName(endpoint: APIEndpoint): string {
    // Extract first non-api path segment as resource name
    const match = endpoint.path.match(/^\/(?:api\/)?([^\/]+)/);
    return match ? match[1] : 'resource';
  }

  /**
   * Extract path parameters from endpoint path
   */
  private extractPathParams(path: string): string[] {
    const matches = path.match(/:(\w+)/g);
    return matches ? matches.map(m => m.substring(1)) : [];
  }

  /**
   * Generate path parameters for function signature
   */
  private generatePathParams(endpoint: APIEndpoint): string {
    const params = this.extractPathParams(endpoint.path);
    return params.map(p => `${p}: string | number`).join(', ');
  }

  /**
   * Interpolate path parameters in endpoint path
   */
  private interpolatePath(path: string): string {
    return path.replace(/:(\w+)/g, '${$1}');
  }

  /**
   * Generate fetch function parameters
   */
  private generateFetchParams(endpoint: APIEndpoint): string {
    const params = this.extractPathParams(endpoint.path);
    return params.join(', ');
  }

  /**
   * Generate hook parameters
   */
  private generateHookParameters(endpoint: APIEndpoint): string {
    const params = this.extractPathParams(endpoint.path);
    if (params.length === 0) return '';
    return params.map(p => `${p}: string | number`).join(', ');
  }

  /**
   * Get request type name
   */
  private getRequestType(endpoint: APIEndpoint): string {
    if (!endpoint.requestSchema) return 'void';
    return `${this.toPascalCase(endpoint.id)}Request`;
  }

  /**
   * Get response type name
   */
  private getResponseType(endpoint: APIEndpoint): string {
    if (!endpoint.responseSchema) return 'any';
    return `${this.toPascalCase(endpoint.id)}Response`;
  }

  /**
   * Generate optimistic update logic
   */
  private generateOptimisticUpdate(endpoint: APIEndpoint): string {
    const resourceName = this.getResourceName(endpoint);
    
    return `onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['${resourceName}'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['${resourceName}']);

      // Optimistically update
      queryClient.setQueryData(['${resourceName}'], (old: any) => {
        // Implement optimistic update logic based on your data structure
        return newData;
      });

      // Return context with snapshot
      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['${resourceName}'], context.previousData);
      }
    },`;
  }

  /**
   * Generate component with API connection
   */
  generateConnectedComponent(
    componentId: string,
    endpoint: APIEndpoint,
    connection: APIConnection,
    outputDir: string
  ): FileChange[] {
    const changes: FileChange[] = [];
    const componentPath = path.join(outputDir, 'components', `${this.toKebabCase(componentId)}.tsx`);
    const hookName = `use${this.toPascalCase(endpoint.id)}`;
    
    // Generate the hook first
    changes.push(...this.generateReactQueryHook({
      hookName,
      endpoint,
      connection,
    }, outputDir));
    
    // Generate component that uses the hook
    changes.push({
      path: componentPath,
      type: 'create',
      content: this.generateComponentWithHook(componentId, hookName, connection),
    });
    
    return changes;
  }

  /**
   * Generate component code that uses the API hook
   */
  private generateComponentWithHook(componentId: string, hookName: string, connection: APIConnection): string {
    const componentName = this.toPascalCase(componentId);
    const isQuery = connection.operation === 'query';
    
    if (isQuery) {
      return `'use client';

import React from 'react';
import { ${this.toCamelCase(hookName)} } from '@/hooks/${this.toKebabCase(hookName)}';

export default function ${componentName}() {
  const { data, isLoading, error, refetch } = ${this.toCamelCase(hookName)}();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Render your data here */}
      <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
`;
    } else {
      return `'use client';

import React from 'react';
import { ${this.toCamelCase(hookName)} } from '@/hooks/${this.toKebabCase(hookName)}';

export default function ${componentName}() {
  const mutation = ${this.toCamelCase(hookName)}();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Collect form data and call mutation
    mutation.mutate({
      // Add your data here
    });
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Add your form fields here */}
        
        <button 
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Submitting...' : 'Submit'}
        </button>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Error: {mutation.error.message}</p>
          </div>
        )}

        {mutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">Success!</p>
          </div>
        )}
      </form>
    </div>
  );
}
`;
    }
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str.replace(/[-_\s:]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^[a-z]/, c => c.toUpperCase());
  }

  /**
   * Convert string to camelCase
   */
  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  /**
   * Convert string to kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_:]+/g, '-')
      .toLowerCase();
  }
}
