import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { FileChange } from './ChangesetManager';
import { ClassMapping } from './DesignFilterEngine';

export interface ComponentStyleInfo {
  filePath: string;
  componentName: string;
  hasInlineStyles: boolean;
  hasCSSModule: boolean;
  hasCustomOverrides: boolean;
  classNames: string[];
  inlineStyles: InlineStyleInfo[];
  cssModuleClasses: string[];
}

export interface InlineStyleInfo {
  line: number;
  property: string;
  value: string;
  context: string;
}

export interface CustomOverride {
  filePath: string;
  selector: string;
  properties: Record<string, string>;
  shouldPreserve: boolean;
}

export interface RefactorResult {
  filesProcessed: number;
  componentsRefactored: number;
  classesTransformed: number;
  inlineStylesUpdated: number;
  customOverridesPreserved: number;
  changes: FileChange[];
}

export class ComponentStyleRefactor {
  private projectRoot: string;
  private customOverridePatterns: RegExp[];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    
    // Patterns that indicate custom overrides that should be preserved
    this.customOverridePatterns = [
      /\/\*\s*custom\s*\*\//i,
      /\/\*\s*override\s*\*\//i,
      /\/\*\s*preserve\s*\*\//i,
      /\/\*\s*@custom\s*\*\//i,
      /data-custom-style/i,
    ];
  }

  /**
   * Identify all components using old styles
   */
  async identifyComponentsWithOldStyles(
    classMapping: ClassMapping
  ): Promise<ComponentStyleInfo[]> {
    const componentFiles = await this.findAllComponentFiles();
    const componentsWithOldStyles: ComponentStyleInfo[] = [];

    for (const filePath of componentFiles) {
      const info = await this.analyzeComponentStyles(filePath, classMapping);
      
      // Check if component uses any old styles
      const usesOldStyles = info.classNames.some(className =>
        Object.keys(classMapping).some(oldClass => className.includes(oldClass))
      );

      if (usesOldStyles || info.hasInlineStyles || info.hasCSSModule) {
        componentsWithOldStyles.push(info);
      }
    }

    return componentsWithOldStyles;
  }

  /**
   * Analyze component styles
   */
  private async analyzeComponentStyles(
    filePath: string,
    _classMapping: ClassMapping
  ): Promise<ComponentStyleInfo> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const componentName = this.extractComponentName(filePath);

    // Extract class names
    const classNames = this.extractClassNames(content);

    // Extract inline styles
    const inlineStyles = this.extractInlineStyles(content);

    // Check for CSS module
    const hasCSSModule = this.hasCSSModuleImport(content);
    const cssModuleClasses = hasCSSModule ? this.extractCSSModuleClasses(content) : [];

    // Check for custom overrides
    const hasCustomOverrides = this.hasCustomOverrides(content);

    return {
      filePath,
      componentName,
      hasInlineStyles: inlineStyles.length > 0,
      hasCSSModule,
      hasCustomOverrides,
      classNames,
      inlineStyles,
      cssModuleClasses,
    };
  }

  /**
   * Apply Tailwind class transformations to components
   */
  async applyTailwindTransformations(
    components: ComponentStyleInfo[],
    classMapping: ClassMapping
  ): Promise<FileChange[]> {
    const changes: FileChange[] = [];

    for (const component of components) {
      const content = await fs.promises.readFile(component.filePath, 'utf-8');
      let modifiedContent = content;

      // Transform className attributes
      modifiedContent = this.transformClassNames(modifiedContent, classMapping);

      // Transform inline styles to Tailwind classes where possible
      if (component.hasInlineStyles) {
        modifiedContent = this.transformInlineStyles(modifiedContent, classMapping);
      }

      // Update CSS module references
      if (component.hasCSSModule) {
        modifiedContent = await this.updateCSSModuleReferences(
          component.filePath,
          modifiedContent,
          classMapping
        );
      }

      // Preserve custom overrides
      if (component.hasCustomOverrides) {
        modifiedContent = this.preserveCustomOverrides(content, modifiedContent);
      }

      if (modifiedContent !== content) {
        changes.push({
          path: component.filePath,
          type: 'modify',
          content: modifiedContent,
          originalContent: content,
        });
      }
    }

    return changes;
  }

  /**
   * Transform className attributes with new Tailwind classes
   */
  private transformClassNames(content: string, classMapping: ClassMapping): string {
    let result = content;

    // Match className="..." and className={...}
    const classNameRegex = /className\s*=\s*(?:"([^"]*)"|{`([^`]*)`}|{['"]([^'"]*)['"]})/g;

    result = result.replace(classNameRegex, (_match, quoted, template, jsString) => {
      const classString = quoted || template || jsString;
      const transformedClasses = this.transformClassString(classString, classMapping);
      
      if (quoted) {
        return `className="${transformedClasses}"`;
      } else if (template) {
        return `className={\`${transformedClasses}\`}`;
      } else {
        return `className={'${transformedClasses}'}`;
      }
    });

    return result;
  }

  /**
   * Transform a class string using the mapping
   */
  private transformClassString(classString: string, classMapping: ClassMapping): string {
    const classes = classString.split(/\s+/).filter(Boolean);
    const transformedClasses = classes.map(cls => {
      // Check for exact match
      if (classMapping[cls]) {
        return classMapping[cls];
      }

      // Check for partial matches (e.g., bg-blue-500 -> bg-primary-500)
      for (const [oldClass, newClass] of Object.entries(classMapping)) {
        if (cls.includes(oldClass)) {
          return cls.replace(oldClass, newClass);
        }
      }

      return cls;
    });

    return transformedClasses.join(' ');
  }

  /**
   * Transform inline styles to Tailwind classes where possible
   */
  private transformInlineStyles(content: string, classMapping: ClassMapping): string {
    let result = content;

    // Match style={{ ... }}
    const styleRegex = /style\s*=\s*{{([^}]*)}}/g;

    result = result.replace(styleRegex, (match, styleContent) => {
      const tailwindClasses = this.convertInlineStylesToTailwind(styleContent);
      
      if (tailwindClasses.length > 0) {
        // Try to merge with existing className
        const transformedClasses = this.transformClassString(
          tailwindClasses.join(' '),
          classMapping
        );
        return `className="${transformedClasses}"`;
      }

      return match; // Keep original if conversion not possible
    });

    return result;
  }

  /**
   * Convert inline styles to Tailwind classes
   */
  private convertInlineStylesToTailwind(styleContent: string): string[] {
    const classes: string[] = [];
    
    // Common style to Tailwind mappings
    const styleMappings: Record<string, (value: string) => string | null> = {
      color: (v) => {
        if (v.includes('#')) return null; // Keep custom colors
        return `text-${v}`;
      },
      backgroundColor: (v) => {
        if (v.includes('#')) return null;
        return `bg-${v}`;
      },
      padding: (v) => {
        const num = parseInt(v);
        if (isNaN(num)) return null;
        return `p-${Math.floor(num / 4)}`;
      },
      margin: (v) => {
        const num = parseInt(v);
        if (isNaN(num)) return null;
        return `m-${Math.floor(num / 4)}`;
      },
      display: (v) => v === 'flex' ? 'flex' : v === 'block' ? 'block' : null,
      flexDirection: (v) => v === 'column' ? 'flex-col' : v === 'row' ? 'flex-row' : null,
      justifyContent: (v) => {
        const map: Record<string, string> = {
          'center': 'justify-center',
          'space-between': 'justify-between',
          'flex-start': 'justify-start',
          'flex-end': 'justify-end',
        };
        return map[v] || null;
      },
      alignItems: (v) => {
        const map: Record<string, string> = {
          'center': 'items-center',
          'flex-start': 'items-start',
          'flex-end': 'items-end',
        };
        return map[v] || null;
      },
    };

    // Parse style properties
    const properties = styleContent.split(',').map(p => p.trim());
    
    for (const prop of properties) {
      const [key, value] = prop.split(':').map(s => s.trim().replace(/['"]/g, ''));
      
      if (key && value && styleMappings[key]) {
        const tailwindClass = styleMappings[key](value);
        if (tailwindClass) {
          classes.push(tailwindClass);
        }
      }
    }

    return classes;
  }

  /**
   * Update CSS module references
   */
  private async updateCSSModuleReferences(
    componentPath: string,
    content: string,
    classMapping: ClassMapping
  ): Promise<string> {
    // Find CSS module file
    const cssModulePath = this.findCSSModulePath(componentPath);
    
    if (!cssModulePath || !fs.existsSync(cssModulePath)) {
      return content;
    }

    // Read CSS module
    const cssContent = await fs.promises.readFile(cssModulePath, 'utf-8');
    
    // Update CSS module file with transformed classes
    let updatedCSSContent = cssContent;
    
    // Transform CSS properties to match new design system
    updatedCSSContent = this.transformCSSProperties(updatedCSSContent, classMapping);

    // Write updated CSS module
    if (updatedCSSContent !== cssContent) {
      await fs.promises.writeFile(cssModulePath, updatedCSSContent, 'utf-8');
    }

    return content;
  }

  /**
   * Transform CSS properties in CSS modules
   */
  private transformCSSProperties(cssContent: string, classMapping: ClassMapping): string {
    let result = cssContent;

    // Transform color values
    result = result.replace(/color:\s*([^;]+);/g, (_match, value) => {
      const transformed = this.transformCSSValue(value.trim(), classMapping);
      return `color: ${transformed};`;
    });

    // Transform background colors
    result = result.replace(/background-color:\s*([^;]+);/g, (_match, value) => {
      const transformed = this.transformCSSValue(value.trim(), classMapping);
      return `background-color: ${transformed};`;
    });

    return result;
  }

  /**
   * Transform CSS value using mapping
   */
  private transformCSSValue(value: string, classMapping: ClassMapping): string {
    // Check if value matches any old class pattern
    for (const [oldClass, newClass] of Object.entries(classMapping)) {
      if (value.includes(oldClass)) {
        return value.replace(oldClass, newClass);
      }
    }
    return value;
  }

  /**
   * Preserve custom overrides marked by developers
   */
  private preserveCustomOverrides(originalContent: string, modifiedContent: string): string {
    const lines = originalContent.split('\n');
    const modifiedLines = modifiedContent.split('\n');
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line has custom override marker
      const hasCustomMarker = this.customOverridePatterns.some(pattern => 
        pattern.test(line)
      );

      if (hasCustomMarker) {
        // Preserve original line
        result.push(line);
      } else {
        // Use modified line
        result.push(modifiedLines[i] || line);
      }
    }

    return result.join('\n');
  }

  /**
   * Find all component files in the project
   */
  private async findAllComponentFiles(): Promise<string[]> {
    const patterns = [
      path.join(this.projectRoot, '**/*.tsx'),
      path.join(this.projectRoot, '**/*.jsx'),
    ];

    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
      });
      files.push(...matches);
    }

    return files;
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(filePath: string): string {
    const basename = path.basename(filePath, path.extname(filePath));
    return basename;
  }

  /**
   * Extract class names from component content
   */
  private extractClassNames(content: string): string[] {
    const classNames: string[] = [];
    const classNameRegex = /className\s*=\s*(?:"([^"]*)"|{`([^`]*)`}|{['"]([^'"]*)['"]})/g;
    
    let match;
    while ((match = classNameRegex.exec(content)) !== null) {
      const classString = match[1] || match[2] || match[3];
      if (classString) {
        classNames.push(...classString.split(/\s+/).filter(Boolean));
      }
    }

    return [...new Set(classNames)]; // Remove duplicates
  }

  /**
   * Extract inline styles from component content
   */
  private extractInlineStyles(content: string): InlineStyleInfo[] {
    const inlineStyles: InlineStyleInfo[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const styleMatch = line.match(/style\s*=\s*{{([^}]*)}}/);
      
      if (styleMatch) {
        const styleContent = styleMatch[1];
        const properties = styleContent.split(',');
        
        properties.forEach(prop => {
          const [key, value] = prop.split(':').map(s => s.trim());
          if (key && value) {
            inlineStyles.push({
              line: index + 1,
              property: key,
              value: value.replace(/['"]/g, ''),
              context: line.trim(),
            });
          }
        });
      }
    });

    return inlineStyles;
  }

  /**
   * Check if component has CSS module import
   */
  private hasCSSModuleImport(content: string): boolean {
    return /import\s+.*\s+from\s+['"].*\.module\.(css|scss|sass)['"]/i.test(content);
  }

  /**
   * Extract CSS module class names
   */
  private extractCSSModuleClasses(content: string): string[] {
    const classes: string[] = [];
    
    // Match styles.className or styles['className']
    const styleRegex = /styles\.(\w+)|styles\[['"](\w+)['"]\]/g;
    
    let match;
    while ((match = styleRegex.exec(content)) !== null) {
      const className = match[1] || match[2];
      if (className) {
        classes.push(className);
      }
    }

    return [...new Set(classes)];
  }

  /**
   * Check if content has custom overrides
   */
  private hasCustomOverrides(content: string): boolean {
    return this.customOverridePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Find CSS module path for a component
   */
  private findCSSModulePath(componentPath: string): string | null {
    const dir = path.dirname(componentPath);
    const basename = path.basename(componentPath, path.extname(componentPath));
    
    const possiblePaths = [
      path.join(dir, `${basename}.module.css`),
      path.join(dir, `${basename}.module.scss`),
      path.join(dir, `${basename}.module.sass`),
    ];

    for (const cssPath of possiblePaths) {
      if (fs.existsSync(cssPath)) {
        return cssPath;
      }
    }

    return null;
  }

  /**
   * Extract class names from CSS content
   */
  private extractCSSClassNames(cssContent: string): string[] {
    const classes: string[] = [];
    const classRegex = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*{/g;
    
    let match;
    while ((match = classRegex.exec(cssContent)) !== null) {
      classes.push(match[1]);
    }

    return classes;
  }

  /**
   * Refactor all components with old styles
   */
  async refactorComponents(classMapping: ClassMapping): Promise<RefactorResult> {
    // Identify components with old styles
    const components = await this.identifyComponentsWithOldStyles(classMapping);

    // Apply transformations
    const changes = await this.applyTailwindTransformations(components, classMapping);

    // Calculate statistics
    const stats = this.calculateRefactorStats(components, changes);

    return {
      filesProcessed: components.length,
      componentsRefactored: changes.length,
      classesTransformed: stats.classesTransformed,
      inlineStylesUpdated: stats.inlineStylesUpdated,
      customOverridesPreserved: stats.customOverridesPreserved,
      changes,
    };
  }

  /**
   * Calculate refactoring statistics
   */
  private calculateRefactorStats(
    components: ComponentStyleInfo[],
    _changes: FileChange[]
  ): {
    classesTransformed: number;
    inlineStylesUpdated: number;
    customOverridesPreserved: number;
  } {
    let classesTransformed = 0;
    let inlineStylesUpdated = 0;
    let customOverridesPreserved = 0;

    for (const component of components) {
      classesTransformed += component.classNames.length;
      inlineStylesUpdated += component.inlineStyles.length;
      
      if (component.hasCustomOverrides) {
        customOverridesPreserved++;
      }
    }

    return {
      classesTransformed,
      inlineStylesUpdated,
      customOverridesPreserved,
    };
  }
}
