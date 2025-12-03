import * as fs from 'fs';
import * as path from 'path';

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    neutral: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  typography: {
    fontFamily: {
      sans: string;
      serif: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeight: {
      thin: number;
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
      extrabold: number;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
      loose: string;
    };
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    none: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

export interface TailwindConfig {
  theme: {
    extend: Record<string, any>;
  };
  plugins: string[];
}

export class DesignTokenManager {
  private projectRoot: string;
  private tokens: DesignTokens | null = null;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Extract design tokens from Tailwind config
   */
  async extractFromTailwind(): Promise<DesignTokens> {
    const tailwindConfigPath = this.findTailwindConfig();
    
    if (!tailwindConfigPath) {
      return this.getDefaultTokens();
    }

    try {
      const configContent = await fs.promises.readFile(tailwindConfigPath, 'utf-8');
      const tokens = this.parseTailwindConfig(configContent);
      this.tokens = tokens;
      return tokens;
    } catch (error) {
      console.error('Failed to extract tokens from Tailwind config:', error);
      return this.getDefaultTokens();
    }
  }

  /**
   * Extract design tokens from CSS variables
   */
  async extractFromCSS(cssFilePath: string): Promise<Partial<DesignTokens>> {
    try {
      const cssContent = await fs.promises.readFile(cssFilePath, 'utf-8');
      return this.parseCSSVariables(cssContent);
    } catch (error) {
      console.error('Failed to extract tokens from CSS:', error);
      return {};
    }
  }

  /**
   * Extract design tokens from all CSS files in project
   */
  async extractFromAllCSS(): Promise<Partial<DesignTokens>> {
    const cssFiles = await this.findAllCSSFiles();
    const allTokens: Partial<DesignTokens> = {};

    for (const cssFile of cssFiles) {
      const tokens = await this.extractFromCSS(cssFile);
      // Merge tokens from all files
      Object.assign(allTokens, tokens);
    }

    return allTokens;
  }

  /**
   * Find all CSS files in the project
   */
  private async findAllCSSFiles(): Promise<string[]> {
    const cssFiles: string[] = [];
    const searchDirs = ['src', 'styles', 'app', 'pages', 'components'];

    for (const dir of searchDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        await this.scanForCSSFiles(fullPath, cssFiles);
      }
    }

    return cssFiles;
  }

  /**
   * Recursively scan directory for CSS files
   */
  private async scanForCSSFiles(dir: string, results: string[]): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
            await this.scanForCSSFiles(fullPath, results);
          }
        } else if (entry.isFile() && entry.name.endsWith('.css')) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${dir}:`, error);
    }
  }

  /**
   * Update design tokens and propagate changes
   */
  async updateTokens(tokens: Partial<DesignTokens>): Promise<void> {
    if (!this.tokens) {
      this.tokens = this.getDefaultTokens();
    }

    // Merge new tokens with existing
    this.tokens = this.mergeTokens(this.tokens, tokens);

    // Propagate changes to all relevant files
    await this.propagateTokenUpdates(this.tokens);
  }

  /**
   * Propagate token updates to all configuration files
   */
  private async propagateTokenUpdates(tokens: DesignTokens): Promise<void> {
    const updates: Promise<void>[] = [];

    // Update Tailwind config
    updates.push(this.updateTailwindConfig(tokens));

    // Update CSS variables
    updates.push(this.updateCSSVariables(tokens));

    // Update global CSS files that import tokens
    updates.push(this.updateGlobalStyles(tokens));

    // Update theme configuration files
    updates.push(this.updateThemeConfig(tokens));

    // Wait for all updates to complete
    await Promise.all(updates);

    console.log('Token updates propagated successfully');
  }

  /**
   * Update global style files
   */
  private async updateGlobalStyles(tokens: DesignTokens): Promise<void> {
    const possibleGlobalStyles = [
      'src/styles/globals.css',
      'src/app/globals.css',
      'styles/globals.css',
      'app/globals.css',
    ];

    for (const stylePath of possibleGlobalStyles) {
      const fullPath = path.join(this.projectRoot, stylePath);
      if (fs.existsSync(fullPath)) {
        try {
          let content = await fs.promises.readFile(fullPath, 'utf-8');
          
          // Check if it imports tokens
          if (content.includes('@import') && content.includes('tokens')) {
            // The tokens.css file will be updated separately
            console.log(`Global styles at ${stylePath} will use updated tokens`);
          }
        } catch (error) {
          console.warn(`Failed to update global styles at ${stylePath}:`, error);
        }
      }
    }
  }

  /**
   * Update theme configuration
   */
  private async updateThemeConfig(tokens: DesignTokens): Promise<void> {
    const themeConfigPath = path.join(this.projectRoot, 'src', 'config', 'theme.ts');
    
    // Check if theme config exists
    if (!fs.existsSync(themeConfigPath)) {
      // Create theme config
      const dir = path.dirname(themeConfigPath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }

      const themeConfig = this.generateThemeConfig(tokens);
      await fs.promises.writeFile(themeConfigPath, themeConfig, 'utf-8');
      console.log('Created theme configuration file');
    } else {
      // Update existing theme config
      const themeConfig = this.generateThemeConfig(tokens);
      await fs.promises.writeFile(themeConfigPath, themeConfig, 'utf-8');
      console.log('Updated theme configuration file');
    }
  }

  /**
   * Generate theme configuration TypeScript file
   */
  private generateThemeConfig(tokens: DesignTokens): string {
    return `// Auto-generated theme configuration
// Do not edit manually - use DesignTokenManager to update

export const theme = ${JSON.stringify(tokens, null, 2)};

export type Theme = typeof theme;
`;
  }

  /**
   * Get current tokens
   */
  getTokens(): DesignTokens {
    return this.tokens || this.getDefaultTokens();
  }

  /**
   * Generate comprehensive token documentation
   */
  async generateDocumentation(): Promise<string> {
    const tokens = this.getTokens();
    
    let doc = '# Design Tokens Documentation\n\n';
    doc += 'This document describes all design tokens used in the project.\n';
    doc += 'These tokens ensure consistency across the application.\n\n';
    doc += '---\n\n';

    // Table of Contents
    doc += '## Table of Contents\n\n';
    doc += '- [Colors](#colors)\n';
    doc += '- [Spacing](#spacing)\n';
    doc += '- [Typography](#typography)\n';
    doc += '- [Border Radius](#border-radius)\n';
    doc += '- [Shadows](#shadows)\n';
    doc += '- [Breakpoints](#breakpoints)\n';
    doc += '- [Usage Examples](#usage-examples)\n\n';
    doc += '---\n\n';

    // Colors
    doc += '## Colors\n\n';
    doc += 'Color tokens organized by semantic meaning and shade.\n\n';
    
    for (const [name, scale] of Object.entries(tokens.colors)) {
      doc += `### ${this.capitalize(name)}\n\n`;
      doc += '| Shade | Hex Value | CSS Variable | Tailwind Class |\n';
      doc += '|-------|-----------|--------------|----------------|\n';
      for (const [shade, value] of Object.entries(scale)) {
        const cssVar = `--color-${name}-${shade}`;
        const tailwindClass = `${name}-${shade}`;
        doc += `| ${shade} | \`${value}\` | \`${cssVar}\` | \`bg-${tailwindClass}\`, \`text-${tailwindClass}\` |\n`;
      }
      doc += '\n';
    }

    // Spacing
    doc += '## Spacing\n\n';
    doc += 'Spacing tokens for consistent margins, padding, and gaps.\n\n';
    doc += '| Size | Value | CSS Variable | Tailwind Classes |\n';
    doc += '|------|-------|--------------|------------------|\n';
    for (const [size, value] of Object.entries(tokens.spacing)) {
      const cssVar = `--spacing-${size}`;
      doc += `| ${size} | \`${value}\` | \`${cssVar}\` | \`p-${size}\`, \`m-${size}\`, \`gap-${size}\` |\n`;
    }
    doc += '\n';

    // Typography
    doc += '## Typography\n\n';
    
    doc += '### Font Families\n\n';
    doc += '| Name | Value | CSS Variable | Tailwind Class |\n';
    doc += '|------|-------|--------------|----------------|\n';
    for (const [name, value] of Object.entries(tokens.typography.fontFamily)) {
      const cssVar = `--font-family-${name}`;
      doc += `| ${name} | \`${value}\` | \`${cssVar}\` | \`font-${name}\` |\n`;
    }
    doc += '\n';

    doc += '### Font Sizes\n\n';
    doc += '| Size | Value | CSS Variable | Tailwind Class |\n';
    doc += '|------|-------|--------------|----------------|\n';
    for (const [size, value] of Object.entries(tokens.typography.fontSize)) {
      const cssVar = `--font-size-${size}`;
      doc += `| ${size} | \`${value}\` | \`${cssVar}\` | \`text-${size}\` |\n`;
    }
    doc += '\n';

    doc += '### Font Weights\n\n';
    doc += '| Weight | Value | CSS Variable | Tailwind Class |\n';
    doc += '|--------|-------|--------------|----------------|\n';
    for (const [weight, value] of Object.entries(tokens.typography.fontWeight)) {
      const cssVar = `--font-weight-${weight}`;
      doc += `| ${weight} | \`${value}\` | \`${cssVar}\` | \`font-${weight}\` |\n`;
    }
    doc += '\n';

    doc += '### Line Heights\n\n';
    doc += '| Height | Value | CSS Variable | Tailwind Class |\n';
    doc += '|--------|-------|--------------|----------------|\n';
    for (const [height, value] of Object.entries(tokens.typography.lineHeight)) {
      const cssVar = `--line-height-${height}`;
      doc += `| ${height} | \`${value}\` | \`${cssVar}\` | \`leading-${height}\` |\n`;
    }
    doc += '\n';

    // Border Radius
    doc += '## Border Radius\n\n';
    doc += 'Border radius tokens for consistent rounded corners.\n\n';
    doc += '| Size | Value | CSS Variable | Tailwind Class |\n';
    doc += '|------|-------|--------------|----------------|\n';
    for (const [size, value] of Object.entries(tokens.borderRadius)) {
      const cssVar = `--radius-${size}`;
      doc += `| ${size} | \`${value}\` | \`${cssVar}\` | \`rounded-${size}\` |\n`;
    }
    doc += '\n';

    // Shadows
    doc += '## Shadows\n\n';
    doc += 'Shadow tokens for consistent elevation and depth.\n\n';
    doc += '| Size | Value | CSS Variable | Tailwind Class |\n';
    doc += '|------|-------|--------------|----------------|\n';
    for (const [size, value] of Object.entries(tokens.shadows)) {
      const cssVar = `--shadow-${size}`;
      doc += `| ${size} | \`${value}\` | \`${cssVar}\` | \`shadow-${size}\` |\n`;
    }
    doc += '\n';

    // Breakpoints
    doc += '## Breakpoints\n\n';
    doc += 'Responsive breakpoints for different screen sizes.\n\n';
    doc += '| Size | Value | CSS Variable | Tailwind Prefix |\n';
    doc += '|------|-------|--------------|----------------|\n';
    for (const [size, value] of Object.entries(tokens.breakpoints)) {
      const cssVar = `--breakpoint-${size}`;
      doc += `| ${size} | \`${value}\` | \`${cssVar}\` | \`${size}:\` |\n`;
    }
    doc += '\n';

    // Usage Examples
    doc += '## Usage Examples\n\n';
    doc += '### Using Tailwind Classes\n\n';
    doc += '```jsx\n';
    doc += '// Colors\n';
    doc += '<div className="bg-primary-500 text-white">\n';
    doc += '  Primary background with white text\n';
    doc += '</div>\n\n';
    doc += '// Spacing\n';
    doc += '<div className="p-md m-lg gap-sm">\n';
    doc += '  Medium padding, large margin, small gap\n';
    doc += '</div>\n\n';
    doc += '// Typography\n';
    doc += '<h1 className="text-4xl font-bold leading-tight">\n';
    doc += '  Large, bold heading\n';
    doc += '</h1>\n\n';
    doc += '// Border Radius & Shadow\n';
    doc += '<div className="rounded-lg shadow-md">\n';
    doc += '  Card with rounded corners and medium shadow\n';
    doc += '</div>\n';
    doc += '```\n\n';

    doc += '### Using CSS Variables\n\n';
    doc += '```css\n';
    doc += '.custom-component {\n';
    doc += '  background-color: var(--color-primary-500);\n';
    doc += '  padding: var(--spacing-md);\n';
    doc += '  font-size: var(--font-size-lg);\n';
    doc += '  border-radius: var(--radius-md);\n';
    doc += '  box-shadow: var(--shadow-lg);\n';
    doc += '}\n';
    doc += '```\n\n';

    doc += '### Responsive Design\n\n';
    doc += '```jsx\n';
    doc += '<div className="text-sm md:text-base lg:text-lg">\n';
    doc += '  Responsive text size\n';
    doc += '</div>\n';
    doc += '```\n\n';

    doc += '---\n\n';
    doc += '*This documentation is auto-generated. To update tokens, use the DesignTokenManager.*\n';

    return doc;
  }

  /**
   * Save documentation to file
   */
  async saveDocumentation(outputPath?: string): Promise<string> {
    const doc = await this.generateDocumentation();
    const docPath = outputPath || path.join(this.projectRoot, 'docs', 'design-tokens.md');

    // Ensure directory exists
    const dir = path.dirname(docPath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(docPath, doc, 'utf-8');
    console.log(`Documentation saved to ${docPath}`);
    
    return docPath;
  }

  /**
   * Find Tailwind config file
   */
  private findTailwindConfig(): string | null {
    const possiblePaths = [
      'tailwind.config.js',
      'tailwind.config.ts',
      'tailwind.config.cjs',
      'tailwind.config.mjs',
    ];

    for (const configPath of possiblePaths) {
      const fullPath = path.join(this.projectRoot, configPath);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  /**
   * Parse Tailwind config content
   */
  private parseTailwindConfig(content: string): DesignTokens {
    const tokens = this.getDefaultTokens();

    try {
      // Extract theme.extend section
      const themeExtendMatch = content.match(/theme:\s*{\s*extend:\s*{([^}]+(?:{[^}]*}[^}]*)*?)}/s);
      
      if (themeExtendMatch) {
        const themeContent = themeExtendMatch[1];
        
        // Parse colors
        const colorsMatch = themeContent.match(/colors:\s*({[\s\S]*?})\s*,/);
        if (colorsMatch) {
          try {
            const colorsObj = this.parseObjectLiteral(colorsMatch[1]);
            if (colorsObj) {
              tokens.colors = { ...tokens.colors, ...colorsObj };
            }
          } catch (e) {
            console.warn('Failed to parse colors:', e);
          }
        }

        // Parse spacing
        const spacingMatch = themeContent.match(/spacing:\s*({[\s\S]*?})\s*,/);
        if (spacingMatch) {
          try {
            const spacingObj = this.parseObjectLiteral(spacingMatch[1]);
            if (spacingObj) {
              tokens.spacing = { ...tokens.spacing, ...spacingObj };
            }
          } catch (e) {
            console.warn('Failed to parse spacing:', e);
          }
        }

        // Parse fontFamily
        const fontFamilyMatch = themeContent.match(/fontFamily:\s*({[\s\S]*?})\s*,/);
        if (fontFamilyMatch) {
          try {
            const fontFamilyObj = this.parseObjectLiteral(fontFamilyMatch[1]);
            if (fontFamilyObj) {
              tokens.typography.fontFamily = { ...tokens.typography.fontFamily, ...fontFamilyObj };
            }
          } catch (e) {
            console.warn('Failed to parse fontFamily:', e);
          }
        }

        // Parse fontSize
        const fontSizeMatch = themeContent.match(/fontSize:\s*({[\s\S]*?})\s*,/);
        if (fontSizeMatch) {
          try {
            const fontSizeObj = this.parseObjectLiteral(fontSizeMatch[1]);
            if (fontSizeObj) {
              tokens.typography.fontSize = { ...tokens.typography.fontSize, ...fontSizeObj };
            }
          } catch (e) {
            console.warn('Failed to parse fontSize:', e);
          }
        }

        // Parse borderRadius
        const borderRadiusMatch = themeContent.match(/borderRadius:\s*({[\s\S]*?})\s*,/);
        if (borderRadiusMatch) {
          try {
            const borderRadiusObj = this.parseObjectLiteral(borderRadiusMatch[1]);
            if (borderRadiusObj) {
              tokens.borderRadius = { ...tokens.borderRadius, ...borderRadiusObj };
            }
          } catch (e) {
            console.warn('Failed to parse borderRadius:', e);
          }
        }

        // Parse boxShadow
        const boxShadowMatch = themeContent.match(/boxShadow:\s*({[\s\S]*?})\s*,/);
        if (boxShadowMatch) {
          try {
            const boxShadowObj = this.parseObjectLiteral(boxShadowMatch[1]);
            if (boxShadowObj) {
              tokens.shadows = { ...tokens.shadows, ...boxShadowObj };
            }
          } catch (e) {
            console.warn('Failed to parse boxShadow:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing Tailwind config:', error);
    }

    return tokens;
  }

  /**
   * Parse JavaScript object literal from string
   */
  private parseObjectLiteral(str: string): any {
    try {
      // Remove comments
      str = str.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
      
      // Convert single quotes to double quotes for JSON compatibility
      str = str.replace(/'/g, '"');
      
      // Handle trailing commas
      str = str.replace(/,(\s*[}\]])/g, '$1');
      
      // Try to parse as JSON
      return JSON.parse(str);
    } catch (e) {
      // If JSON parsing fails, try a more lenient approach
      console.warn('Failed to parse as JSON, using fallback parser');
      return null;
    }
  }

  /**
   * Parse CSS variables
   */
  private parseCSSVariables(content: string): Partial<DesignTokens> {
    const tokens: any = {
      colors: {} as any,
      spacing: {} as any,
      typography: {
        fontFamily: {} as any,
        fontSize: {} as any,
        fontWeight: {} as any,
        lineHeight: {} as any,
      },
      borderRadius: {} as any,
      shadows: {} as any,
      breakpoints: {} as any,
    };

    const cssVarRegex = /--([^:]+):\s*([^;]+);/g;
    
    let match;
    while ((match = cssVarRegex.exec(content)) !== null) {
      const varName = match[1].trim();
      const varValue = match[2].trim();

      // Map CSS variables to token structure
      if (varName.startsWith('color-')) {
        // Parse color variables: --color-primary-500
        const parts = varName.split('-');
        if (parts.length >= 3) {
          const colorName = parts[1];
          const shade = parts[2];
          
          if (!tokens.colors![colorName as keyof typeof tokens.colors]) {
            tokens.colors![colorName as keyof typeof tokens.colors] = {} as ColorScale;
          }
          (tokens.colors![colorName as keyof typeof tokens.colors] as any)[shade] = varValue;
        }
      } else if (varName.startsWith('spacing-')) {
        // Parse spacing variables: --spacing-md
        const size = varName.replace('spacing-', '');
        tokens.spacing![size as keyof typeof tokens.spacing] = varValue;
      } else if (varName.startsWith('font-size-')) {
        // Parse font size variables: --font-size-lg
        const size = varName.replace('font-size-', '');
        tokens.typography!.fontSize![size as keyof typeof tokens.typography.fontSize] = varValue;
      } else if (varName.startsWith('font-family-')) {
        // Parse font family variables: --font-family-sans
        const family = varName.replace('font-family-', '');
        tokens.typography!.fontFamily![family as keyof typeof tokens.typography.fontFamily] = varValue;
      } else if (varName.startsWith('font-weight-')) {
        // Parse font weight variables: --font-weight-bold
        const weight = varName.replace('font-weight-', '');
        tokens.typography!.fontWeight![weight as keyof typeof tokens.typography.fontWeight] = parseInt(varValue);
      } else if (varName.startsWith('line-height-')) {
        // Parse line height variables: --line-height-normal
        const height = varName.replace('line-height-', '');
        tokens.typography!.lineHeight![height as keyof typeof tokens.typography.lineHeight] = varValue;
      } else if (varName.startsWith('radius-')) {
        // Parse border radius variables: --radius-md
        const size = varName.replace('radius-', '');
        tokens.borderRadius![size as keyof typeof tokens.borderRadius] = varValue;
      } else if (varName.startsWith('shadow-')) {
        // Parse shadow variables: --shadow-lg
        const size = varName.replace('shadow-', '');
        tokens.shadows![size as keyof typeof tokens.shadows] = varValue;
      } else if (varName.startsWith('breakpoint-')) {
        // Parse breakpoint variables: --breakpoint-md
        const size = varName.replace('breakpoint-', '');
        tokens.breakpoints![size as keyof typeof tokens.breakpoints] = varValue;
      }
    }

    return tokens;
  }

  /**
   * Update Tailwind config file
   */
  private async updateTailwindConfig(tokens: DesignTokens): Promise<void> {
    const configPath = this.findTailwindConfig();
    if (!configPath) {
      // Create new config
      await this.createTailwindConfig(tokens);
      return;
    }

    const config = this.generateTailwindConfig(tokens);
    await fs.promises.writeFile(configPath, config, 'utf-8');
  }

  /**
   * Create new Tailwind config
   */
  private async createTailwindConfig(tokens: DesignTokens): Promise<void> {
    const configPath = path.join(this.projectRoot, 'tailwind.config.js');
    const config = this.generateTailwindConfig(tokens);
    await fs.promises.writeFile(configPath, config, 'utf-8');
  }

  /**
   * Generate Tailwind config content
   */
  private generateTailwindConfig(tokens: DesignTokens): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: ${JSON.stringify(tokens.colors, null, 6)},
      spacing: ${JSON.stringify(tokens.spacing, null, 6)},
      fontFamily: ${JSON.stringify(tokens.typography.fontFamily, null, 6)},
      fontSize: ${JSON.stringify(tokens.typography.fontSize, null, 6)},
      fontWeight: ${JSON.stringify(tokens.typography.fontWeight, null, 6)},
      lineHeight: ${JSON.stringify(tokens.typography.lineHeight, null, 6)},
      borderRadius: ${JSON.stringify(tokens.borderRadius, null, 6)},
      boxShadow: ${JSON.stringify(tokens.shadows, null, 6)},
      screens: ${JSON.stringify(tokens.breakpoints, null, 6)},
    },
  },
  plugins: [],
};
`;
  }

  /**
   * Update CSS variables
   */
  private async updateCSSVariables(tokens: DesignTokens): Promise<void> {
    const cssPath = path.join(this.projectRoot, 'src', 'styles', 'tokens.css');
    const cssContent = this.generateCSSVariables(tokens);

    // Ensure directory exists
    const dir = path.dirname(cssPath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(cssPath, cssContent, 'utf-8');
  }

  /**
   * Generate CSS variables content
   */
  private generateCSSVariables(tokens: DesignTokens): string {
    let css = ':root {\n';
    css += '  /* Colors */\n';

    for (const [colorName, scale] of Object.entries(tokens.colors)) {
      for (const [shade, value] of Object.entries(scale)) {
        css += `  --color-${colorName}-${shade}: ${value};\n`;
      }
    }

    css += '\n  /* Spacing */\n';
    for (const [size, value] of Object.entries(tokens.spacing)) {
      css += `  --spacing-${size}: ${value};\n`;
    }

    css += '\n  /* Typography */\n';
    for (const [size, value] of Object.entries(tokens.typography.fontSize)) {
      css += `  --font-size-${size}: ${value};\n`;
    }

    css += '\n  /* Border Radius */\n';
    for (const [size, value] of Object.entries(tokens.borderRadius)) {
      css += `  --radius-${size}: ${value};\n`;
    }

    css += '\n  /* Shadows */\n';
    for (const [size, value] of Object.entries(tokens.shadows)) {
      css += `  --shadow-${size}: ${value};\n`;
    }

    css += '}\n';
    return css;
  }

  /**
   * Merge tokens
   */
  private mergeTokens(existing: DesignTokens, updates: Partial<DesignTokens>): DesignTokens {
    return {
      colors: { ...existing.colors, ...updates.colors },
      spacing: { ...existing.spacing, ...updates.spacing },
      typography: {
        fontFamily: { ...existing.typography.fontFamily, ...updates.typography?.fontFamily },
        fontSize: { ...existing.typography.fontSize, ...updates.typography?.fontSize },
        fontWeight: { ...existing.typography.fontWeight, ...updates.typography?.fontWeight },
        lineHeight: { ...existing.typography.lineHeight, ...updates.typography?.lineHeight },
      },
      borderRadius: { ...existing.borderRadius, ...updates.borderRadius },
      shadows: { ...existing.shadows, ...updates.shadows },
      breakpoints: { ...existing.breakpoints, ...updates.breakpoints },
    };
  }

  /**
   * Get default design tokens
   */
  private getDefaultTokens(): DesignTokens {
    return {
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
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
      },
      typography: {
        fontFamily: {
          sans: 'ui-sans-serif, system-ui, sans-serif',
          serif: 'ui-serif, Georgia, serif',
          mono: 'ui-monospace, monospace',
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
        },
        fontWeight: {
          thin: 100,
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
          extrabold: 800,
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75',
          loose: '2',
        },
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'none',
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    };
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
