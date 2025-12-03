import { PreviewGenerator, PreviewOptions } from '../PreviewGenerator';
import { DesignFilter } from '../DesignFilterEngine';
import { ComponentStyleInfo } from '../ComponentStyleRefactor';
import * as fs from 'fs';
import * as path from 'path';

describe('PreviewGenerator', () => {
  let previewGenerator: PreviewGenerator;
  let testProjectRoot: string;
  let previewDir: string;

  beforeEach(() => {
    testProjectRoot = path.join(__dirname, 'test-project');
    previewDir = path.join(testProjectRoot, '.azstudio', 'previews');
    previewGenerator = new PreviewGenerator(testProjectRoot);

    // Create test directory structure
    if (!fs.existsSync(testProjectRoot)) {
      fs.mkdirSync(testProjectRoot, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(testProjectRoot)) {
      fs.rmSync(testProjectRoot, { recursive: true, force: true });
    }
  });

  describe('generateFilterPreview', () => {
    it('should generate preview for design filter', async () => {
      const filter: DesignFilter = {
        name: 'Modern SaaS',
        type: 'modern-saas',
        description: 'Clean, modern design',
        tokens: {
          colors: {
            primary: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              200: '#bae6fd',
              300: '#7dd3fc',
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1',
              800: '#075985',
              900: '#0c4a6e',
              950: '#082f49',
            },
          } as any,
        },
        classTransforms: {
          'rounded': 'rounded-lg',
          'shadow': 'shadow-md',
        },
      };

      const components: ComponentStyleInfo[] = [
        {
          filePath: '/test/Button.tsx',
          componentName: 'Button',
          hasInlineStyles: false,
          hasCSSModule: false,
          hasCustomOverrides: false,
          classNames: ['rounded', 'shadow', 'bg-blue-500'],
          inlineStyles: [],
          cssModuleClasses: [],
        },
      ];

      const options: PreviewOptions = {
        maxComponents: 5,
        includeMetadata: true,
      };

      const comparison = await previewGenerator.generateFilterPreview(
        filter,
        components,
        options
      );

      expect(comparison).toBeDefined();
      expect(comparison.filterName).toBe('Modern SaaS');
      expect(comparison.componentsAffected).toBe(1);
      expect(comparison.previews).toHaveLength(1);
      expect(comparison.approved).toBe(false);
    });

    it('should limit number of components in preview', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      const components: ComponentStyleInfo[] = Array.from({ length: 20 }, (_, i) => ({
        filePath: `/test/Component${i}.tsx`,
        componentName: `Component${i}`,
        hasInlineStyles: false,
        hasCSSModule: false,
        hasCustomOverrides: false,
        classNames: [],
        inlineStyles: [],
        cssModuleClasses: [],
      }));

      const options: PreviewOptions = {
        maxComponents: 5,
      };

      const comparison = await previewGenerator.generateFilterPreview(
        filter,
        components,
        options
      );

      expect(comparison.componentsAffected).toBe(20);
      expect(comparison.previews.length).toBeLessThanOrEqual(5);
    });

    it('should create preview directory structure', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter, [], {});

      expect(fs.existsSync(previewDir)).toBe(true);
      
      const filterDir = path.join(previewDir, 'test-filter');
      expect(fs.existsSync(filterDir)).toBe(true);
    });

    it('should generate comparison HTML', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      const components: ComponentStyleInfo[] = [
        {
          filePath: '/test/Button.tsx',
          componentName: 'Button',
          hasInlineStyles: false,
          hasCSSModule: false,
          hasCustomOverrides: false,
          classNames: ['rounded'],
          inlineStyles: [],
          cssModuleClasses: [],
        },
      ];

      await previewGenerator.generateFilterPreview(filter, components, {});

      const filterDir = path.join(previewDir, 'test-filter');
      const htmlPath = path.join(filterDir, 'comparison.html');
      
      expect(fs.existsSync(htmlPath)).toBe(true);
      
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      expect(htmlContent).toContain('Design Filter Preview');
      expect(htmlContent).toContain('Test Filter');
      expect(htmlContent).toContain('Button');
    });

    it('should save comparison metadata', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter, [], {
        includeMetadata: true,
      });

      const filterDir = path.join(previewDir, 'test-filter');
      const metadataPath = path.join(filterDir, 'comparison-metadata.json');
      
      expect(fs.existsSync(metadataPath)).toBe(true);
      
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      expect(metadata.filterName).toBe('Test Filter');
      expect(metadata.approved).toBe(false);
    });
  });

  describe('approveComparison', () => {
    it('should approve a comparison', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter, [], {
        includeMetadata: true,
      });

      const approved = await previewGenerator.approveComparison('Test Filter');
      expect(approved).toBe(true);

      const comparison = await previewGenerator.loadComparison('Test Filter');
      expect(comparison?.approved).toBe(true);
    });

    it('should return false for non-existent comparison', async () => {
      const approved = await previewGenerator.approveComparison('Non Existent');
      expect(approved).toBe(false);
    });
  });

  describe('rejectComparison', () => {
    it('should reject a comparison', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter, [], {
        includeMetadata: true,
      });

      const rejected = await previewGenerator.rejectComparison('Test Filter');
      expect(rejected).toBe(true);

      const comparison = await previewGenerator.loadComparison('Test Filter');
      expect(comparison?.approved).toBe(false);
    });
  });

  describe('listPreviews', () => {
    it('should list all available previews', async () => {
      const filter1: DesignFilter = {
        name: 'Filter One',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      const filter2: DesignFilter = {
        name: 'Filter Two',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter1, [], {
        includeMetadata: true,
      });

      await previewGenerator.generateFilterPreview(filter2, [], {
        includeMetadata: true,
      });

      const previews = await previewGenerator.listPreviews();
      expect(previews).toHaveLength(2);
      expect(previews.map(p => p.filterName)).toContain('Filter One');
      expect(previews.map(p => p.filterName)).toContain('Filter Two');
    });

    it('should return empty array when no previews exist', async () => {
      const previews = await previewGenerator.listPreviews();
      expect(previews).toEqual([]);
    });

    it('should sort previews by timestamp descending', async () => {
      const filter1: DesignFilter = {
        name: 'Old Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter1, [], {
        includeMetadata: true,
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      const filter2: DesignFilter = {
        name: 'New Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter2, [], {
        includeMetadata: true,
      });

      const previews = await previewGenerator.listPreviews();
      expect(previews[0].filterName).toBe('New Filter');
      expect(previews[1].filterName).toBe('Old Filter');
    });
  });

  describe('cleanupOldPreviews', () => {
    it('should clean up old previews', async () => {
      const filter: DesignFilter = {
        name: 'Old Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter, [], {
        includeMetadata: true,
      });

      // Manually modify timestamp to make it old
      const filterDir = path.join(previewDir, 'old-filter');
      const metadataPath = path.join(filterDir, 'comparison-metadata.json');
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      metadata.timestamp = oldDate.toISOString();
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      const cleaned = await previewGenerator.cleanupOldPreviews(7);
      expect(cleaned).toBe(1);
      expect(fs.existsSync(filterDir)).toBe(false);
    });

    it('should not clean up recent previews', async () => {
      const filter: DesignFilter = {
        name: 'Recent Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter, [], {
        includeMetadata: true,
      });

      const cleaned = await previewGenerator.cleanupOldPreviews(7);
      expect(cleaned).toBe(0);

      const filterDir = path.join(previewDir, 'recent-filter');
      expect(fs.existsSync(filterDir)).toBe(true);
    });
  });

  describe('loadComparison', () => {
    it('should load existing comparison', async () => {
      const filter: DesignFilter = {
        name: 'Test Filter',
        type: 'custom',
        description: 'Test',
        tokens: {},
        classTransforms: {},
      };

      await previewGenerator.generateFilterPreview(filter, [], {
        includeMetadata: true,
      });

      const comparison = await previewGenerator.loadComparison('Test Filter');
      expect(comparison).toBeDefined();
      expect(comparison?.filterName).toBe('Test Filter');
    });

    it('should return null for non-existent comparison', async () => {
      const comparison = await previewGenerator.loadComparison('Non Existent');
      expect(comparison).toBeNull();
    });
  });
});
