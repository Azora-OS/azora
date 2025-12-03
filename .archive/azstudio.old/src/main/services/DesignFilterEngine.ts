import { DesignTokenManager, DesignTokens, ColorScale } from './DesignTokenManager';
import { ChangesetManager, FileChange } from './ChangesetManager';
import { PreviewGenerator, PreviewComparison, PreviewOptions } from './PreviewGenerator';
import { ComponentStyleRefactor } from './ComponentStyleRefactor';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface DesignFilter {
  name: string;
  type: 'modern-saas' | 'enterprise' | 'minimalist' | 'playful' | 'dark-mode' | 'custom';
  description: string;
  tokens: Partial<DesignTokens>;
  classTransforms: ClassMapping;
  cssVariableTransforms?: CSSVariableMapping;
}

export interface ClassMapping {
  [oldClass: string]: string;
}

export interface CSSVariableMapping {
  [oldVariable: string]: string;
}

export interface DesignChangeset {
  changesetId: string;
  filesAffected: number;
  preview?: string;
}

export interface TokenTransformRule {
  source: string;
  target: string;
  transform?: (value: string) => string;
}

export class DesignFilterEngine {
  private tokenManager: DesignTokenManager;
  private changesetManager: ChangesetManager;
  private previewGenerator: PreviewGenerator;
  private componentRefactor: ComponentStyleRefactor;
  private projectRoot: string;
  private predefinedFilters: Map<string, DesignFilter>;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.tokenManager = new DesignTokenManager(projectRoot);
    this.changesetManager = new ChangesetManager(projectRoot);
    this.previewGenerator = new PreviewGenerator(projectRoot);
    this.componentRefactor = new ComponentStyleRefactor(projectRoot);
    this.predefinedFilters = new Map();
    this.initializePredefinedFilters();
  }

  /**
   * Initialize predefined design filters
   */
  private initializePredefinedFilters(): void {
    // Modern SaaS Filter
    this.predefinedFilters.set('modern-saas', {
      name: 'Modern SaaS',
      type: 'modern-saas',
      description: 'Clean, modern design with vibrant colors and smooth shadows',
      tokens: {
        colors: {
          primary: this.createColorScale('#3b82f6'), // Blue
          secondary: this.createColorScale('#8b5cf6'), // Purple
          accent: this.createColorScale('#06b6d4'), // Cyan
          neutral: this.createColorScale('#64748b'), // Slate
        } as any,
        borderRadius: {
          none: '0',
          sm: '0.25rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem',
          '2xl': '1.5rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
          none: 'none',
        },
      },
      classTransforms: {
        'rounded': 'rounded-lg',
        'shadow': 'shadow-md',
        'border': 'border border-gray-200',
      },
    });

    // Enterprise Filter
    this.predefinedFilters.set('enterprise', {
      name: 'Enterprise',
      type: 'enterprise',
      description: 'Professional, conservative design with muted colors',
      tokens: {
        colors: {
          primary: this.createColorScale('#1e40af'), // Dark Blue
          secondary: this.createColorScale('#475569'), // Slate
          accent: this.createColorScale('#0891b2'), // Cyan
          neutral: this.createColorScale('#71717a'), // Zinc
        } as any,
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.25rem',
          lg: '0.375rem',
          xl: '0.5rem',
          '2xl': '0.75rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
          lg: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
          xl: '0 8px 10px -2px rgb(0 0 0 / 0.05)',
          '2xl': '0 12px 16px -4px rgb(0 0 0 / 0.1)',
          inner: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
          none: 'none',
        },
      },
      classTransforms: {
        'rounded-lg': 'rounded-md',
        'rounded-xl': 'rounded-lg',
        'shadow-lg': 'shadow-md',
        'shadow-xl': 'shadow-lg',
      },
    });

    // Minimalist Filter
    this.predefinedFilters.set('minimalist', {
      name: 'Minimalist',
      type: 'minimalist',
      description: 'Ultra-clean design with minimal colors and subtle shadows',
      tokens: {
        colors: {
          primary: this.createColorScale('#18181b'), // Zinc-900
          secondary: this.createColorScale('#52525b'), // Zinc-600
          accent: this.createColorScale('#71717a'), // Zinc-500
          neutral: this.createColorScale('#a1a1aa'), // Zinc-400
        } as any,
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.25rem',
          lg: '0.375rem',
          xl: '0.5rem',
          '2xl': '0.75rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
          md: '0 2px 4px 0 rgb(0 0 0 / 0.03)',
          lg: '0 4px 6px -1px rgb(0 0 0 / 0.03)',
          xl: '0 8px 10px -2px rgb(0 0 0 / 0.03)',
          '2xl': '0 12px 16px -4px rgb(0 0 0 / 0.05)',
          inner: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.03)',
          none: 'none',
        },
      },
      classTransforms: {
        'shadow-md': 'shadow-sm',
        'shadow-lg': 'shadow-md',
        'shadow-xl': 'shadow-lg',
        'rounded-lg': 'rounded',
        'rounded-xl': 'rounded-md',
      },
    });

    // Playful Filter
    this.predefinedFilters.set('playful', {
      name: 'Playful',
      type: 'playful',
      description: 'Fun, vibrant design with bold colors and large radius',
      tokens: {
        colors: {
          primary: this.createColorScale('#ec4899'), // Pink
          secondary: this.createColorScale('#f59e0b'), // Amber
          accent: this.createColorScale('#8b5cf6'), // Purple
          neutral: this.createColorScale('#6b7280'), // Gray
        } as any,
        borderRadius: {
          none: '0',
          sm: '0.5rem',
          md: '0.75rem',
          lg: '1rem',
          xl: '1.5rem',
          '2xl': '2rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
          md: '0 6px 12px -2px rgb(0 0 0 / 0.1)',
          lg: '0 12px 24px -4px rgb(0 0 0 / 0.1)',
          xl: '0 24px 48px -8px rgb(0 0 0 / 0.15)',
          '2xl': '0 32px 64px -12px rgb(0 0 0 / 0.2)',
          inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
          none: 'none',
        },
      },
      classTransforms: {
        'rounded': 'rounded-lg',
        'rounded-md': 'rounded-lg',
        'rounded-lg': 'rounded-xl',
        'rounded-xl': 'rounded-2xl',
        'shadow-sm': 'shadow-md',
        'shadow-md': 'shadow-lg',
      },
    });

    // Dark Mode Filter
    this.predefinedFilters.set('dark-mode', {
      name: 'Dark Mode',
      type: 'dark-mode',
      description: 'Dark theme with high contrast and vibrant accents',
      tokens: {
        colors: {
          primary: this.createColorScale('#60a5fa'), // Blue-400
          secondary: this.createColorScale('#a78bfa'), // Violet-400
          accent: this.createColorScale('#34d399'), // Emerald-400
          neutral: this.createColorScale('#374151'), // Gray-700
        } as any,
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.5)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
          '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.75)',
          inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.5)',
          none: 'none',
        },
      },
      classTransforms: {
        'bg-white': 'bg-gray-900',
        'bg-gray-50': 'bg-gray-800',
        'bg-gray-100': 'bg-gray-700',
        'text-gray-900': 'text-gray-100',
        'text-gray-800': 'text-gray-200',
        'text-gray-700': 'text-gray-300',
        'border-gray-200': 'border-gray-700',
        'border-gray-300': 'border-gray-600',
      },
      cssVariableTransforms: {
        '--bg-primary': '#111827',
        '--bg-secondary': '#1f2937',
        '--text-primary': '#f9fafb',
        '--text-secondary': '#e5e7eb',
      },
    });
  }

  /**
   * Create a color scale from a base color
   */
  private createColorScale(baseColor: string): ColorScale {
    // This is a simplified version - in production, use a proper color manipulation library
    return {
      50: baseColor,
      100: baseColor,
      200: baseColor,
      300: baseColor,
      400: baseColor,
      500: baseColor,
      600: baseColor,
      700: baseColor,
      800: baseColor,
      900: baseColor,
      950: baseColor,
    };
  }

  /**
   * Get all predefined filters
   */
  getPredefinedFilters(): DesignFilter[] {
    return Array.from(this.predefinedFilters.values());
  }

  /**
   * Get a specific predefined filter
   */
  getPredefinedFilter(type: string): DesignFilter | undefined {
    return this.predefinedFilters.get(type);
  }

  /**
   * Apply a design filter to the entire project
   */
  async applyFilter(filter: DesignFilter): Promise<DesignChangeset> {
    console.log(`Applying design filter: ${filter.name}`);
    
    // Step 1: Update design tokens
    await this.tokenManager.updateTokens(filter.tokens);
    console.log('Design tokens updated');

    // Step 2: Find all component files
    const componentFiles = await this.findComponentFiles();
    console.log(`Found ${componentFiles.length} component files`);

    // Step 3: Apply class transformations
    const changes: FileChange[] = [];
    for (const file of componentFiles) {
      const fileChanges = await this.applyClassTransforms(file, filter.classTransforms);
      if (fileChanges) {
        changes.push(fileChanges);
      }
    }
    console.log(`Applied class transforms to ${changes.length} files`);

    // Step 4: Update CSS variables if specified
    if (filter.cssVariableTransforms) {
      const cssChanges = await this.applyCSSVariableTransforms(filter.cssVariableTransforms);
      changes.push(...cssChanges);
      console.log(`Updated CSS variables in ${cssChanges.length} files`);
    }

    // Step 5: Generate Tailwind class mappings
    await this.generateTailwindClassMappings(filter);
    console.log('Generated Tailwind class mappings');

    // Step 6: Create changeset
    const changeset = this.changesetManager.createChangeset(
      `Apply ${filter.name} design filter`,
      changes
    );

    return {
      changesetId: changeset.id,
      filesAffected: changes.length,
    };
  }

  /**
   * Apply CSS variable transformations
   */
  private async applyCSSVariableTransforms(
    transforms: CSSVariableMapping
  ): Promise<FileChange[]> {
    const cssFiles = await this.findCSSFiles();
    const changes: FileChange[] = [];

    for (const file of cssFiles) {
      try {
        const content = await fs.promises.readFile(file, 'utf-8');
        let modified = content;
        let hasChanges = false;

        for (const [oldVar, newValue] of Object.entries(transforms)) {
          const regex = new RegExp(`${oldVar}:\\s*[^;]+;`, 'g');
          if (regex.test(modified)) {
            modified = modified.replace(regex, `${oldVar}: ${newValue};`);
            hasChanges = true;
          }
        }

        if (hasChanges) {
          changes.push({
            path: file,
            type: 'modify',
            content: modified,
            originalContent: content,
          });
        }
      } catch (error) {
        console.warn(`Failed to transform CSS variables in ${file}:`, error);
      }
    }

    return changes;
  }

  /**
   * Generate Tailwind class mappings documentation
   */
  private async generateTailwindClassMappings(filter: DesignFilter): Promise<void> {
    const mappingDoc = this.generateClassMappingDocumentation(filter);
    const docPath = path.join(this.projectRoot, 'docs', 'design-filter-mappings.md');

    // Ensure directory exists
    const dir = path.dirname(docPath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(docPath, mappingDoc, 'utf-8');
  }

  /**
   * Generate class mapping documentation
   */
  private generateClassMappingDocumentation(filter: DesignFilter): string {
    let doc = `# Design Filter: ${filter.name}\n\n`;
    doc += `${filter.description}\n\n`;
    doc += '## Class Transformations\n\n';
    doc += 'The following Tailwind classes are transformed:\n\n';
    doc += '| Original Class | New Class |\n';
    doc += '|----------------|----------|\n';

    for (const [oldClass, newClass] of Object.entries(filter.classTransforms)) {
      doc += `| \`${oldClass}\` | \`${newClass}\` |\n`;
    }

    doc += '\n## Token Updates\n\n';
    
    if (filter.tokens.colors) {
      doc += '### Colors\n\n';
      for (const [name] of Object.entries(filter.tokens.colors)) {
        doc += `- **${name}**: Updated color scale\n`;
      }
      doc += '\n';
    }

    if (filter.tokens.borderRadius) {
      doc += '### Border Radius\n\n';
      for (const [size, value] of Object.entries(filter.tokens.borderRadius)) {
        doc += `- **${size}**: \`${value}\`\n`;
      }
      doc += '\n';
    }

    if (filter.tokens.shadows) {
      doc += '### Shadows\n\n';
      for (const [size, value] of Object.entries(filter.tokens.shadows)) {
        doc += `- **${size}**: \`${value}\`\n`;
      }
      doc += '\n';
    }

    if (filter.cssVariableTransforms) {
      doc += '## CSS Variable Transformations\n\n';
      doc += '| Variable | New Value |\n';
      doc += '|----------|----------|\n';
      for (const [varName, value] of Object.entries(filter.cssVariableTransforms)) {
        doc += `| \`${varName}\` | \`${value}\` |\n`;
      }
      doc += '\n';
    }

    return doc;
  }

  /**
   * Find all CSS files in the project
   */
  private async findCSSFiles(): Promise<string[]> {
    const patterns = ['src/**/*.css', 'styles/**/*.css', 'app/**/*.css'];
    const files: string[] = [];
    
    for (const pattern of patterns) {
      try {
        const matches = await glob(pattern, { cwd: this.projectRoot });
        files.push(...matches.map(f => path.join(this.projectRoot, f)));
      } catch (error) {
        console.warn(`Failed to find CSS files with pattern ${pattern}:`, error);
      }
    }

    return [...new Set(files)];
  }

  private async findComponentFiles(): Promise<string[]> {
    const patterns = ['src/**/*.tsx', 'src/**/*.jsx'];
    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: this.projectRoot });
      files.push(...matches.map(f => path.join(this.projectRoot, f)));
    }

    return [...new Set(files)];
  }

  /**
   * Apply class transformations to a file
   */
  private async applyClassTransforms(
    filePath: string,
    mapping: ClassMapping
  ): Promise<FileChange | null> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      let modified = content;
      let hasChanges = false;

      // Transform classes in className attributes
      const transformedClassName = this.transformClassNames(modified, mapping);
      if (transformedClassName !== modified) {
        modified = transformedClassName;
        hasChanges = true;
      }

      // Transform classes in class attributes (for HTML)
      const transformedClass = this.transformClassAttributes(modified, mapping);
      if (transformedClass !== modified) {
        modified = transformedClass;
        hasChanges = true;
      }

      // Transform classes in template literals
      const transformedTemplate = this.transformTemplateLiterals(modified, mapping);
      if (transformedTemplate !== modified) {
        modified = transformedTemplate;
        hasChanges = true;
      }

      if (!hasChanges) return null;

      return {
        path: filePath,
        type: 'modify',
        content: modified,
        originalContent: content,
      };
    } catch (error) {
      console.warn(`Failed to apply class transforms to ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Transform className attributes
   */
  private transformClassNames(content: string, mapping: ClassMapping): string {
    // Match className="..." or className='...' or className={`...`}
    const classNameRegex = /className=["'`{]([^"'`}]+)["'`}]/g;
    
    return content.replace(classNameRegex, (match, classes) => {
      let transformedClasses = classes;
      
      for (const [oldClass, newClass] of Object.entries(mapping)) {
        // Use word boundaries to match whole classes only
        const regex = new RegExp(`\\b${this.escapeRegex(oldClass)}\\b`, 'g');
        transformedClasses = transformedClasses.replace(regex, newClass);
      }
      
      return match.replace(classes, transformedClasses);
    });
  }

  /**
   * Transform class attributes (for HTML)
   */
  private transformClassAttributes(content: string, mapping: ClassMapping): string {
    const classRegex = /class=["']([^"']+)["']/g;
    
    return content.replace(classRegex, (match, classes) => {
      let transformedClasses = classes;
      
      for (const [oldClass, newClass] of Object.entries(mapping)) {
        const regex = new RegExp(`\\b${this.escapeRegex(oldClass)}\\b`, 'g');
        transformedClasses = transformedClasses.replace(regex, newClass);
      }
      
      return match.replace(classes, transformedClasses);
    });
  }

  /**
   * Transform classes in template literals
   */
  private transformTemplateLiterals(content: string, mapping: ClassMapping): string {
    // Match template literals that likely contain classes
    const templateRegex = /`([^`]*(?:class|className)[^`]*)`/g;
    
    return content.replace(templateRegex, (match, template) => {
      let transformedTemplate = template;
      
      for (const [oldClass, newClass] of Object.entries(mapping)) {
        const regex = new RegExp(`\\b${this.escapeRegex(oldClass)}\\b`, 'g');
        transformedTemplate = transformedTemplate.replace(regex, newClass);
      }
      
      return match.replace(template, transformedTemplate);
    });
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Create a custom design filter
   */
  createCustomFilter(
    name: string,
    description: string,
    tokens: Partial<DesignTokens>,
    classTransforms: ClassMapping,
    cssVariableTransforms?: CSSVariableMapping
  ): DesignFilter {
    return {
      name,
      type: 'custom',
      description,
      tokens,
      classTransforms,
      cssVariableTransforms,
    };
  }

  /**
   * Preview filter changes without applying them
   */
  async previewFilter(filter: DesignFilter): Promise<{
    filesAffected: number;
    sampleChanges: Array<{ file: string; before: string; after: string }>;
  }> {
    const componentFiles = await this.findComponentFiles();
    const sampleChanges: Array<{ file: string; before: string; after: string }> = [];
    let filesAffected = 0;

    // Preview changes for first 5 files
    for (const file of componentFiles.slice(0, 5)) {
      const change = await this.applyClassTransforms(file, filter.classTransforms);
      if (change && change.originalContent && change.content) {
        filesAffected++;
        sampleChanges.push({
          file: path.relative(this.projectRoot, file),
          before: change.originalContent.substring(0, 200),
          after: change.content.substring(0, 200),
        });
      }
    }

    // Count total affected files
    for (const file of componentFiles.slice(5)) {
      const change = await this.applyClassTransforms(file, filter.classTransforms);
      if (change) {
        filesAffected++;
      }
    }

    return {
      filesAffected,
      sampleChanges,
    };
  }

  /**
   * Generate before/after preview with screenshots
   */
  async generateBeforeAfterPreview(
    filter: DesignFilter,
    options?: PreviewOptions
  ): Promise<PreviewComparison> {
    console.log(`Generating before/after preview for filter: ${filter.name}`);

    // Identify components that will be affected
    const components = await this.componentRefactor.identifyComponentsWithOldStyles(
      filter.classTransforms
    );

    console.log(`Found ${components.length} components with old styles`);

    // Generate preview comparison
    const comparison = await this.previewGenerator.generateFilterPreview(
      filter,
      components,
      options
    );

    return comparison;
  }

  /**
   * Apply filter with preview approval workflow
   */
  async applyFilterWithPreview(
    filter: DesignFilter,
    options?: PreviewOptions
  ): Promise<{
    preview: PreviewComparison;
    changesetId?: string;
    applied: boolean;
  }> {
    // Generate preview first
    const preview = await this.generateBeforeAfterPreview(filter, options);

    console.log('Preview generated. Waiting for approval...');
    console.log(`Preview location: ${this.previewGenerator['previewDir']}`);

    // Return preview for user approval
    // In production, this would wait for user interaction via IPC
    return {
      preview,
      applied: false,
    };
  }

  /**
   * Apply filter after preview approval
   */
  async applyApprovedFilter(filterName: string): Promise<DesignChangeset> {
    // Check if preview was approved
    const approved = await this.previewGenerator.approveComparison(filterName);
    
    if (!approved) {
      throw new Error('Preview not found or not approved');
    }

    // Get the filter
    const filter = this.getPredefinedFilter(filterName);
    if (!filter) {
      throw new Error(`Filter not found: ${filterName}`);
    }

    // Apply the filter
    return await this.applyFilter(filter);
  }

  /**
   * Reject filter preview
   */
  async rejectFilterPreview(filterName: string): Promise<boolean> {
    return await this.previewGenerator.rejectComparison(filterName);
  }

  /**
   * List all available previews
   */
  async listPreviews(): Promise<Array<{ filterName: string; timestamp: Date; approved: boolean }>> {
    return await this.previewGenerator.listPreviews();
  }

  /**
   * Clean up old previews
   */
  async cleanupOldPreviews(daysOld: number = 7): Promise<number> {
    return await this.previewGenerator.cleanupOldPreviews(daysOld);
  }
}
