import { APIConnectionManager, APIEndpoint, APIConnection } from '../APIConnectionManager';

describe('APIConnectionManager', () => {
  let manager: APIConnectionManager;

  beforeEach(() => {
    manager = new APIConnectionManager();
  });

  describe('generateReactQueryHook', () => {
    it('should generate a query hook for GET endpoint', () => {
      const endpoint: APIEndpoint = {
        id: 'getUsers',
        method: 'GET',
        path: '/api/users',
        responseSchema: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
        },
      };

      const connection: APIConnection = {
        componentId: 'user-list',
        endpointId: 'getUsers',
        operation: 'query',
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'useGetUsers', endpoint, connection },
        '/test/output'
      );

      expect(changes).toHaveLength(1);
      expect(changes[0].path).toContain('hooks');
      expect(changes[0].path).toContain('use-get-users.ts');
      expect(changes[0].content).toContain('useQuery');
      expect(changes[0].content).toContain('export function useGetUsers');
      expect(changes[0].content).toContain("queryKey: ['users']");
    });

    it('should generate a mutation hook for POST endpoint', () => {
      const endpoint: APIEndpoint = {
        id: 'createUser',
        method: 'POST',
        path: '/api/users',
        requestSchema: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
        responseSchema: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
        },
      };

      const connection: APIConnection = {
        componentId: 'user-form',
        endpointId: 'createUser',
        operation: 'mutation',
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'useCreateUser', endpoint, connection },
        '/test/output'
      );

      expect(changes).toHaveLength(1);
      expect(changes[0].content).toContain('useMutation');
      expect(changes[0].content).toContain('export function useCreateUser');
      expect(changes[0].content).toContain('mutationFn');
    });

    it('should handle path parameters in query hooks', () => {
      const endpoint: APIEndpoint = {
        id: 'getUserById',
        method: 'GET',
        path: '/api/users/:id',
        responseSchema: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      };

      const connection: APIConnection = {
        componentId: 'user-detail',
        endpointId: 'getUserById',
        operation: 'query',
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'useGetUserById', endpoint, connection },
        '/test/output'
      );

      expect(changes[0].content).toContain('id: string | number');
      expect(changes[0].content).toContain("queryKey: ['users', id]");
      expect(changes[0].content).toContain('${id}');
    });

    it('should include authorization header when requiresAuth is true', () => {
      const endpoint: APIEndpoint = {
        id: 'getProfile',
        method: 'GET',
        path: '/api/profile',
        requiresAuth: true,
        responseSchema: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      };

      const connection: APIConnection = {
        componentId: 'profile',
        endpointId: 'getProfile',
        operation: 'query',
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'useGetProfile', endpoint, connection },
        '/test/output'
      );

      expect(changes[0].content).toContain('Authorization');
      expect(changes[0].content).toContain('Bearer');
      expect(changes[0].content).toContain("localStorage.getItem('token')");
    });

    it('should generate optimistic updates for mutations when enabled', () => {
      const endpoint: APIEndpoint = {
        id: 'updateUser',
        method: 'PUT',
        path: '/api/users/:id',
        requestSchema: {
          name: { type: 'string' },
        },
        responseSchema: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      };

      const connection: APIConnection = {
        componentId: 'user-form',
        endpointId: 'updateUser',
        operation: 'mutation',
        optimisticUpdate: true,
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'useUpdateUser', endpoint, connection },
        '/test/output'
      );

      expect(changes[0].content).toContain('onMutate');
      expect(changes[0].content).toContain('cancelQueries');
      expect(changes[0].content).toContain('previousData');
      expect(changes[0].content).toContain('setQueryData');
    });

    it('should generate TypeScript interfaces from schemas', () => {
      const endpoint: APIEndpoint = {
        id: 'createPost',
        method: 'POST',
        path: '/api/posts',
        requestSchema: {
          title: { type: 'string' },
          content: { type: 'string' },
          published: { type: 'boolean', optional: true },
        },
        responseSchema: {
          id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          published: { type: 'boolean' },
          createdAt: { type: 'date' },
        },
      };

      const connection: APIConnection = {
        componentId: 'post-form',
        endpointId: 'createPost',
        operation: 'mutation',
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'useCreatePost', endpoint, connection },
        '/test/output'
      );

      expect(changes[0].content).toContain('export interface CreatePostRequest');
      expect(changes[0].content).toContain('title: string');
      expect(changes[0].content).toContain('published?: boolean');
      expect(changes[0].content).toContain('export interface CreatePostResponse');
      expect(changes[0].content).toContain('createdAt: Date');
    });

    it('should handle array types in schemas', () => {
      const endpoint: APIEndpoint = {
        id: 'getUsers',
        method: 'GET',
        path: '/api/users',
        responseSchema: {
          users: { type: 'array', items: { type: 'object' } },
          total: { type: 'number' },
        },
      };

      const connection: APIConnection = {
        componentId: 'user-list',
        endpointId: 'getUsers',
        operation: 'query',
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'useGetUsers', endpoint, connection },
        '/test/output'
      );

      expect(changes[0].content).toContain('users: Record<string, any>[]');
    });
  });

  describe('generateConnectedComponent', () => {
    it('should generate component with query hook', () => {
      const endpoint: APIEndpoint = {
        id: 'getUsers',
        method: 'GET',
        path: '/api/users',
        responseSchema: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      };

      const connection: APIConnection = {
        componentId: 'user-list',
        endpointId: 'getUsers',
        operation: 'query',
      };

      const changes = manager.generateConnectedComponent(
        'user-list',
        endpoint,
        connection,
        '/test/output'
      );

      // Should generate both hook and component
      expect(changes.length).toBeGreaterThan(1);
      
      const componentChange = changes.find(c => c.path.includes('components'));
      expect(componentChange).toBeDefined();
      expect(componentChange?.content).toContain('useGetUsers');
      expect(componentChange?.content).toContain('isLoading');
      expect(componentChange?.content).toContain('error');
      expect(componentChange?.content).toContain('data');
    });

    it('should generate loading state UI', () => {
      const endpoint: APIEndpoint = {
        id: 'getUsers',
        method: 'GET',
        path: '/api/users',
        responseSchema: {},
      };

      const connection: APIConnection = {
        componentId: 'user-list',
        endpointId: 'getUsers',
        operation: 'query',
      };

      const changes = manager.generateConnectedComponent(
        'user-list',
        endpoint,
        connection,
        '/test/output'
      );

      const componentChange = changes.find(c => c.path.includes('components'));
      expect(componentChange?.content).toContain('if (isLoading)');
      expect(componentChange?.content).toContain('animate-spin');
    });

    it('should generate error state UI with retry', () => {
      const endpoint: APIEndpoint = {
        id: 'getUsers',
        method: 'GET',
        path: '/api/users',
        responseSchema: {},
      };

      const connection: APIConnection = {
        componentId: 'user-list',
        endpointId: 'getUsers',
        operation: 'query',
      };

      const changes = manager.generateConnectedComponent(
        'user-list',
        endpoint,
        connection,
        '/test/output'
      );

      const componentChange = changes.find(c => c.path.includes('components'));
      expect(componentChange?.content).toContain('if (error)');
      expect(componentChange?.content).toContain('refetch');
      expect(componentChange?.content).toContain('Retry');
    });

    it('should generate component with mutation hook', () => {
      const endpoint: APIEndpoint = {
        id: 'createUser',
        method: 'POST',
        path: '/api/users',
        requestSchema: {
          name: { type: 'string' },
        },
        responseSchema: {
          id: { type: 'string' },
        },
      };

      const connection: APIConnection = {
        componentId: 'user-form',
        endpointId: 'createUser',
        operation: 'mutation',
      };

      const changes = manager.generateConnectedComponent(
        'user-form',
        endpoint,
        connection,
        '/test/output'
      );

      const componentChange = changes.find(c => c.path.includes('components'));
      expect(componentChange?.content).toContain('mutation.mutate');
      expect(componentChange?.content).toContain('mutation.isPending');
      expect(componentChange?.content).toContain('mutation.isError');
      expect(componentChange?.content).toContain('mutation.isSuccess');
    });

    it('should generate form with submit handler for mutations', () => {
      const endpoint: APIEndpoint = {
        id: 'createUser',
        method: 'POST',
        path: '/api/users',
        requestSchema: {},
        responseSchema: {},
      };

      const connection: APIConnection = {
        componentId: 'user-form',
        endpointId: 'createUser',
        operation: 'mutation',
      };

      const changes = manager.generateConnectedComponent(
        'user-form',
        endpoint,
        connection,
        '/test/output'
      );

      const componentChange = changes.find(c => c.path.includes('components'));
      expect(componentChange?.content).toContain('handleSubmit');
      expect(componentChange?.content).toContain('onSubmit={handleSubmit}');
      expect(componentChange?.content).toContain('e.preventDefault()');
    });

    it('should include success and error feedback for mutations', () => {
      const endpoint: APIEndpoint = {
        id: 'createUser',
        method: 'POST',
        path: '/api/users',
        requestSchema: {},
        responseSchema: {},
      };

      const connection: APIConnection = {
        componentId: 'user-form',
        endpointId: 'createUser',
        operation: 'mutation',
      };

      const changes = manager.generateConnectedComponent(
        'user-form',
        endpoint,
        connection,
        '/test/output'
      );

      const componentChange = changes.find(c => c.path.includes('components'));
      expect(componentChange?.content).toContain('mutation.isError');
      expect(componentChange?.content).toContain('mutation.isSuccess');
      expect(componentChange?.content).toContain('Success!');
    });
  });

  describe('edge cases', () => {
    it('should handle endpoints without schemas', () => {
      const endpoint: APIEndpoint = {
        id: 'ping',
        method: 'GET',
        path: '/api/ping',
      };

      const connection: APIConnection = {
        componentId: 'health-check',
        endpointId: 'ping',
        operation: 'query',
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'usePing', endpoint, connection },
        '/test/output'
      );

      expect(changes).toHaveLength(1);
      expect(changes[0].content).toContain('Promise<any>');
    });

    it('should handle complex nested paths', () => {
      const endpoint: APIEndpoint = {
        id: 'getUserPosts',
        method: 'GET',
        path: '/api/users/:userId/posts/:postId',
        responseSchema: {},
      };

      const connection: APIConnection = {
        componentId: 'post-detail',
        endpointId: 'getUserPosts',
        operation: 'query',
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'useGetUserPosts', endpoint, connection },
        '/test/output'
      );

      expect(changes[0].content).toContain('userId: string | number');
      expect(changes[0].content).toContain('postId: string | number');
      expect(changes[0].content).toContain("queryKey: ['users', userId, postId]");
    });

    it('should handle DELETE method', () => {
      const endpoint: APIEndpoint = {
        id: 'deleteUser',
        method: 'DELETE',
        path: '/api/users/:id',
      };

      const connection: APIConnection = {
        componentId: 'user-actions',
        endpointId: 'deleteUser',
        operation: 'mutation',
      };

      const changes = manager.generateReactQueryHook(
        { hookName: 'useDeleteUser', endpoint, connection },
        '/test/output'
      );

      expect(changes[0].content).toContain("method: 'DELETE'");
      expect(changes[0].content).toContain('useMutation');
    });
  });
});
