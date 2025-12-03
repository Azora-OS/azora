import { VisualCanvas } from '../../src/renderer/components/VisualCanvas';
import { MonacoEditor } from '../../src/renderer/components/MonacoEditor';
import { CodeExecutor } from '../../src/main/services/CodeExecutor';
import { ProjectIndexer } from '../../src/main/services/ProjectIndexer';

/**
 * Integration tests for canvas-to-code synchronization
 * Tests the bidirectional sync between visual canvas and code editor
 */
describe('Canvas-to-Code Synchronization', () => {
  let canvas: VisualCanvas;
  let editor: MonacoEditor;
  let codeExecutor: CodeExecutor;
  let indexer: ProjectIndexer;
  const testProjectPath = '/test/project';

  beforeEach(() => {
    codeExecutor = new CodeExecutor();
    indexer = new ProjectIndexer();
  });

  describe('Canvas to Code', () => {
    it('should generate code when component is added to canvas', async () => {
      // Add a service component to canvas
      const serviceComponent = {
        id: 'service-1',
        type: 'service',
        name: 'AuthService',
        position: { x: 100, y: 100 },
        properties: {
          port: 3001,
          framework: 'express',
        },
      };

      // Simulate adding component to canvas
      // In real implementation, this would trigger code generation
      const generatedCode = await codeExecutor.generateService(serviceComponent);

      expect(generatedCode).toBeDefined();
      expect(generatedCode.files).toContain('src/services/auth-service.ts');
    });

    it('should update code when component properties change', async () => {
      // Initial component
      const component = {
        id: 'service-1',
        type: 'service',
        name: 'UserService',
        properties: { port: 3000 },
      };

      // Update properties
      component.properties.port = 3001;

      // Code should be updated
      const updatedCode = await codeExecutor.updateServiceConfig(
        'src/services/user-service.ts',
        { port: 3001 }
      );

      expect(updatedCode.success).toBe(true);
      expect(updatedCode.code).toContain('3001');
    });

    it('should generate connections when components are linked', async () => {
      const uiComponent = {
        id: 'ui-1',
        type: 'ui',
        name: 'LoginPage',
      };

      const serviceComponent = {
        id: 'service-1',
        type: 'service',
        name: 'AuthService',
      };

      // Create connection
      const connection = {
        id: 'conn-1',
        source: 'ui-1',
        target: 'service-1',
        type: 'api-call',
      };

      // Should generate API client code
      const apiCode = await codeExecutor.generateAPIConnection(
        uiComponent,
        serviceComponent,
        connection
      );

      expect(apiCode).toBeDefined();
      expect(apiCode.code).toContain('fetch');
      expect(apiCode.code).toContain('AuthService');
    });
  });

  describe('Code to Canvas', () => {
    it('should update canvas when code is edited', async () => {
      // Index project to detect changes
      await indexer.indexProject(testProjectPath);

      // Simulate code change
      const codeChange = {
        file: 'src/services/user-service.ts',
        type: 'modify',
        content: `
          export class UserService {
            constructor(private port: number = 3002) {}
          }
        `,
      };

      // Update index
      await indexer.updateIndex([codeChange.file]);

      // Canvas should reflect the change
      const graph = indexer.getProjectGraph();
      const service = graph?.services.get('UserService');

      expect(service).toBeDefined();
      expect(service?.port).toBe(3002);
    });

    it('should detect new components added via code', async () => {
      await indexer.indexProject(testProjectPath);

      // Add new service file
      const newServiceCode = `
        export class PaymentService {
          constructor() {}
          
          async processPayment(amount: number) {
            return { success: true };
          }
        }
      `;

      // Update index with new file
      await indexer.updateIndex(['src/services/payment-service.ts']);

      // Canvas should show new component
      const graph = indexer.getProjectGraph();
      const service = graph?.services.get('PaymentService');

      expect(service).toBeDefined();
      expect(service?.name).toBe('PaymentService');
    });

    it('should remove components from canvas when code is deleted', async () => {
      await indexer.indexProject(testProjectPath);

      // Remove file
      await indexer.updateIndex(['src/services/old-service.ts']);

      // Canvas should not show deleted component
      const graph = indexer.getProjectGraph();
      const service = graph?.services.get('OldService');

      expect(service).toBeUndefined();
    });
  });

  describe('Bidirectional Sync', () => {
    it('should maintain consistency during rapid changes', async () => {
      await indexer.indexProject(testProjectPath);

      // Make multiple changes in quick succession
      const changes = [
        { type: 'add-component', name: 'Service1' },
        { type: 'modify-property', name: 'Service1', property: 'port', value: 3001 },
        { type: 'add-connection', source: 'UI1', target: 'Service1' },
      ];

      for (const change of changes) {
        if (change.type === 'add-component') {
          await codeExecutor.generateService({ name: change.name });
        } else if (change.type === 'modify-property') {
          await codeExecutor.updateServiceConfig(`src/services/${change.name}.ts`, {
            [change.property]: change.value,
          });
        }
      }

      // Verify final state is consistent
      await indexer.updateIndex(['src/services/Service1.ts']);
      const graph = indexer.getProjectGraph();
      const service = graph?.services.get('Service1');

      expect(service).toBeDefined();
      expect(service?.port).toBe(3001);
    });

    it('should handle conflicts gracefully', async () => {
      // Canvas change
      const canvasChange = {
        component: 'UserService',
        property: 'port',
        value: 3001,
      };

      // Simultaneous code change
      const codeChange = {
        file: 'src/services/user-service.ts',
        property: 'port',
        value: 3002,
      };

      // System should detect conflict and prompt user
      // In this test, we verify that both changes are tracked
      const result = await codeExecutor.applyTransform(
        codeChange.file,
        {
          type: 'custom',
          target: 'port',
          options: { newValue: canvasChange.value },
        }
      );

      expect(result.success).toBe(true);
      // Last write wins or user is prompted
    });
  });

  describe('Performance', () => {
    it('should sync large projects efficiently', async () => {
      const startTime = Date.now();

      // Simulate large project with 100 components
      const components = Array.from({ length: 100 }, (_, i) => ({
        id: `service-${i}`,
        type: 'service',
        name: `Service${i}`,
      }));

      for (const component of components) {
        await codeExecutor.generateService(component);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (10 seconds for 100 components)
      expect(duration).toBeLessThan(10000);
    });
  });
});
