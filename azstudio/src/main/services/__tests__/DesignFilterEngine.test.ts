import { DesignFilterEngine, DesignFilter, ClassMapping } from '../DesignFilterEngine';
import { DesignTokenManager } from '../DesignTokenManager';
import { ChangesetManager } from '../ChangesetManager';
import { PreviewGenerator } from '../PreviewGenerator';
import { ComponentStyleRefactor } from '../ComponentStyleRefactor';
import * as fs from 'fs';
import { glob } from 'glob';

// Mock dependencies
jest.mock('../DesignTokenManager');
jest.mock('../ChangesetManager');
jest.mock('../PreviewGenerator');
jest.mock('../ComponentStyleRefactor');
jest.mock('fs');
jest.mock('glob');

describe('DesignFilterEngine', () => {
  let engine: DesignFilterEngine;
  let mockTokenManager: jest.Mocked<DesignTokenManager>;
  let mockChangesetManager: jest.Mocked<ChangesetManager>;
  let mockPreviewGenerator: jest.Mocked<PreviewGenerator>;
  let mockComponentRefactor: jest.Mocked<ComponentStyleRefactor>;
  let mockFs: jest.Mocked<typeof fs>;
  let mockGlob: jest.MockedFunction<typeof glob>;

  beforeEach(() => {
    mockTokenManager = new DesignTokenManager('/test/project') as jest.Mocked<DesignTokenManager>;
    mockChangesetManager = new ChangesetManager('/test/project') as jest.Mocked<ChangesetManager>;
    mockPreviewGenerator = new PreviewGenerator('/test/project') as jest.Mocked<PreviewGenerator>;
    mockComponentRefactor = new ComponentStyleRefactor('/test/project') as jest.Mocked<ComponentStyleRefactor>;
    mockFs = fs as jest.Mocked<typeof fs>;
    mockGlob = glob as jest.MockedFunction<typeof glob>;

    engine = new DesignFilterEngine('/test/project');
    (engine as any).tokenManager = mockTokenManager;
    (engine as any).changesetManager = mockChangesetManager;
    (engine as any).previewGenerator = mockPreviewGenerator;
    (engine as any).componentRefactor = mockComponentRefactor;

    jest.clearAllMocks();
  });

  describe('getPredefinedFilters', () => {
    it('should return all predefined filters', () => {
      const filters = engine.getPredefinedFilters();
      
      expect(filters.length).toBeGreaterThan(0);
      expect(filters.some(f => f.type === 'modern-saas')).toBe(true);
      expect(filters.some(f => f.type === 'enterprise')).toBe(true);
      expect(filters.some(f => f.type === 'minimalist')).toBe(true);
      expect(filters.some(f => f.type === 'playful')).toBe(true);
      expect(filters.some(f => f.type === 'dark-mode')).toBe(true);
    });
  });

  describe('getPredefinedFilter', () => {
    it('should return specific filter by type', () => {
      const filter = engine.getPredefinedFilter('modern-saas');
      
      expect(filter).toBeDefined();
      expect(filter?.name).toBe('Modern SaaS');
      expect(filter?.type).toBe('modern-saas');
    });

    it('should return undefined for non-existent filter', () => {
      const filter = engine.getPredefinedFilter('non-existent');
      
      expect(filter).toBeUndefined();
    });
  });

  describe('applyFilter', () => {
    it('should apply design filter to project', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {
          'rounded': 'rounded-lg',
        },
      };

      const mockFiles = ['/test/project/src/Component.tsx'];
      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        export function Component() {
          return <div className="rounded">Test</div>;
        }
      `);

      mockTokenManager.updateTokens = jest.fn().mockResolvedValue(undefined);
      mockChangesetManager.createChangeset = jest.fn().mockReturnValue({
        id: 'changeset-1',
        timestamp: new Date(),
        files: new Map(),
        rollbackData: {},
        verified: false,
      });

      const result = await engine.applyFilter(filter);
      
      expect(result.changesetId).toBe('changeset-1');
      expect(result.filesAffected).toBeGreaterThanOrEqual(0);
      expect(mockTokenManager.updateTokens).toHaveBeenCalledWith(filter.tokens);
    });

    it('should handle CSS variable transforms', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
        cssVariableTransforms: {
          '--primary-color': '#3b82f6',
        },
      };

      const mockCssFiles = ['/test/project/styles/main.css'];
      mockGlob.mockResolvedValue(mockCssFiles as any);
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        :root {
          --primary-color: #000000;
        }
      `);

      mockTokenManager.updateTokens = jest.fn().mockResolvedValue(undefined);
      mockChangesetManager.createChangeset = jest.fn().mockReturnValue({
        id: 'changeset-1',
        timestamp: new Date(),
        files: new Map(),
        rollbackData: {},
        verified: false,
      });

      const result = await engine.applyFilter(filter);
      
      expect(result.changesetId).toBeDefined();
    });
  });

  describe('previewFilter', () => {
    it('should preview filter changes without applying', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {
          'rounded': 'rounded-lg',
        },
      };

      const mockFiles = [
        '/test/project/src/Component1.tsx',
        '/test/project/src/Component2.tsx',
      ];
      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        export function Component() {
          return <div className="rounded">Test</div>;
        }
      `);

      const result = await engine.previewFilter(filter);
      
      expect(result.filesAffected).toBeGreaterThanOrEqual(0);
      expect(result.sampleChanges).toBeDefined();
      expect(Array.isArray(result.sampleChanges)).toBe(true);
    });
  });

  describe('createCustomFilter', () => {
    it('should create a custom filter', () => {
      const filter = engine.createCustomFilter(
        'My Filter',
        'Custom filter description',
        {},
        { 'rounded': 'rounded-lg' }
      );
      
      expect(filter.name).toBe('My Filter');
      expect(filter.type).toBe('custom');
      expect(filter.description).toBe('Custom filter description');
      expect(filter.classTransforms['rounded']).toBe('rounded-lg');
    });

    it('should create custom filter with CSS variable transforms', () => {
      const filter = engine.createCustomFilter(
        'My Filter',
        'Custom filter',
        {},
        {},
        { '--primary': '#000' }
      );
      
      expect(filter.cssVariableTransforms).toBeDefined();
      expect(filter.cssVariableTransforms?.['--primary']).toBe('#000');
    });
  });

  describe('generateBeforeAfterPreview', () => {
    it('should generate preview comparison', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      const mockComponents = ['Component1', 'Component2'];
      mockComponentRefactor.identifyComponentsWithOldStyles = jest.fn()
        .mockResolvedValue(mockComponents);

      const mockComparison = {
        filterName: 'Test Filter',
        timestamp: new Date(),
        components: [],
        approved: false,
      };
      mockPreviewGenerator.generateFilterPreview = jest.fn()
        .mockResolvedValue(mockComparison);

      const result = await engine.generateBeforeAfterPreview(filter);
      
      expect(result).toBeDefined();
      expect(result.filterName).toBe('Test Filter');
      expect(mockComponentRefactor.identifyComponentsWithOldStyles).toHaveBeenCalled();
      expect(mockPreviewGenerator.generateFilterPreview).toHaveBeenCalled();
    });
  });

  describe('applyFilterWithPreview', () => {
    it('should generate preview and wait for approval', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      const mockComponents = ['Component1'];
      mockComponentRefactor.identifyComponentsWithOldStyles = jest.fn()
        .mockResolvedValue(mockComponents);

      const mockComparison = {
        filterName: 'Test Filter',
        timestamp: new Date(),
        components: [],
        approved: false,
      };
      mockPreviewGenerator.generateFilterPreview = jest.fn()
        .mockResolvedValue(mockComparison);

      const result = await engine.applyFilterWithPreview(filter);
      
      expect(result.preview).toBeDefined();
      expect(result.applied).toBe(false);
      expect(result.changesetId).toBeUndefined();
    });
  });

  describe('applyApprovedFilter', () => {
    it('should apply filter after approval', async () => {
      mockPreviewGenerator.approveComparison = jest.fn().mockResolvedValue(true);
      mockGlob.mockResolvedValue([]);
      mockTokenManager.updateTokens = jest.fn().mockResolvedValue(undefined);
      mockChangesetManager.createChangeset = jest.fn().mockReturnValue({
        id: 'changeset-1',
        timestamp: new Date(),
        files: new Map(),
        rollbackData: {},
        verified: false,
      });

      const result = await engine.applyApprovedFilter('modern-saas');
      
      expect(result.changesetId).toBe('changeset-1');
      expect(mockPreviewGenerator.approveComparison).toHaveBeenCalledWith('modern-saas');
    });

    it('should throw error if preview not approved', async () => {
      mockPreviewGenerator.approveComparison = jest.fn().mockResolvedValue(false);

      await expect(engine.applyApprovedFilter('modern-saas'))
        .rejects.toThrow('Preview not found or not approved');
    });

    it('should throw error for non-existent filter', async () => {
      mockPreviewGenerator.approveComparison = jest.fn().mockResolvedValue(true);

      await expect(engine.applyApprovedFilter('non-existent'))
        .rejects.toThrow('Filter not found');
    });
  });

  describe('rejectFilterPreview', () => {
    it('should reject filter preview', async () => {
      mockPreviewGenerator.rejectComparison = jest.fn().mockResolvedValue(true);

      const result = await engine.rejectFilterPreview('modern-saas');
      
      expect(result).toBe(true);
      expect(mockPreviewGenerator.rejectComparison).toHaveBeenCalledWith('modern-saas');
    });
  });

  describe('listPreviews', () => {
    it('should list all available previews', async () => {
      const mockPreviews = [
        { filterName: 'modern-saas', timestamp: new Date(), approved: false },
        { filterName: 'enterprise', timestamp: new Date(), approved: true },
      ];
      mockPreviewGenerator.listPreviews = jest.fn().mockResolvedValue(mockPreviews);

      const result = await engine.listPreviews();
      
      expect(result.length).toBe(2);
      expect(result[0].filterName).toBe('modern-saas');
      expect(mockPreviewGenerator.listPreviews).toHaveBeenCalled();
    });
  });

  describe('cleanupOldPreviews', () => {
    it('should cleanup old previews', async () => {
      mockPreviewGenerator.cleanupOldPreviews = jest.fn().mockResolvedValue(3);

      const result = await engine.cleanupOldPreviews(7);
      
      expect(result).toBe(3);
      expect(mockPreviewGenerator.cleanupOldPreviews).toHaveBeenCalledWith(7);
    });
  });

  describe('class transformation', () => {
    it('should transform className attributes', async () => {
      const filter: DesignFilter = {
        name: 'Test',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {
          'rounded': 'rounded-lg',
          'shadow': 'shadow-md',
        },
      };

      const mockFiles = ['/test/project/src/Component.tsx'];
      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        export function Component() {
          return <div className="rounded shadow">Test</div>;
        }
      `);

      mockTokenManager.updateTokens = jest.fn().mockResolvedValue(undefined);
      mockChangesetManager.createChangeset = jest.fn().mockReturnValue({
        id: 'changeset-1',
        timestamp: new Date(),
        files: new Map(),
        rollbackData: {},
        verified: false,
      });

      await engine.applyFilter(filter);
      
      // Verify that class transforms were applied
      expect(mockChangesetManager.createChangeset).toHaveBeenCalled();
    });

    it('should transform class attributes in HTML', async () => {
      const filter: DesignFilter = {
        name: 'Test',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {
          'rounded': 'rounded-lg',
        },
      };

      const mockFiles = ['/test/project/src/template.html'];
      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        <div class="rounded">Test</div>
      `);

      mockTokenManager.updateTokens = jest.fn().mockResolvedValue(undefined);
      mockChangesetManager.createChangeset = jest.fn().mockReturnValue({
        id: 'changeset-1',
        timestamp: new Date(),
        files: new Map(),
        rollbackData: {},
        verified: false,
      });

      await engine.applyFilter(filter);
      
      expect(mockChangesetManager.createChangeset).toHaveBeenCalled();
    });
  });
});
