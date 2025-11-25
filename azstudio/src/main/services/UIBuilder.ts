import { FileChange } from './ChangesetManager';
import { APIConnectionManager, APIEndpoint, APIConnection } from './APIConnectionManager';
import * as path from 'path';

export interface UIComponent {
  id: string;
  type: 'form' | 'table' | 'card' | 'modal' | 'button' | 'input' | 'layout' | 'text' | 'image' | 'list' | 'grid' | 'nav' | 'header' | 'footer';
  props: Record<string, any>;
  children?: UIComponent[];
  position: { x: number; y: number };
  isClientComponent?: boolean;
  apiEndpoint?: string;
  apiConnection?: {
    endpointId: string;
    operation: 'query' | 'mutation';
  };
}

export interface PageLayout {
  name: string;
  components: UIComponent[];
  route: string;
  isServerComponent?: boolean;
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface ComponentGenerationOptions {
  framework: 'next' | 'react';
  useAppRouter?: boolean;
  tailwindConfig?: Record<string, any>;
}

export class UIBuilder {
  private options: ComponentGenerationOptions;
  private apiConnectionManager: APIConnectionManager;

  constructor(options: ComponentGenerationOptions = { framework: 'next', useAppRouter: true }) {
    this.options = options;
    this.apiConnectionManager = new APIConnectionManager();
  }

  /**
   * Generate a complete Next.js page with App Router support
   */
  generatePage(layout: PageLayout, outputDir: string, endpoints?: APIEndpoint[]): FileChange[] {
    const changes: FileChange[] = [];
    
    if (this.options.framework === 'next' && this.options.useAppRouter) {
      // Next.js App Router structure
      const pageDir = path.join(outputDir, 'app', this.routeToPath(layout.route));
      const pagePath = path.join(pageDir, 'page.tsx');
      
      changes.push({
        path: pagePath,
        type: 'create',
        content: this.generateNextAppRouterPage(layout),
      });

      // Generate separate client components if needed
      const clientComponents = this.extractClientComponents(layout.components);
      clientComponents.forEach(component => {
        // Check if component has API connection
        if (component.apiConnection && endpoints) {
          const endpoint = endpoints.find(e => e.id === component.apiConnection!.endpointId);
          if (endpoint) {
            const connection: APIConnection = {
              componentId: component.id,
              endpointId: endpoint.id,
              operation: component.apiConnection.operation,
            };
            changes.push(...this.apiConnectionManager.generateConnectedComponent(
              component.id,
              endpoint,
              connection,
              outputDir
            ));
          }
        } else {
          const componentPath = path.join(outputDir, 'components', `${this.toKebabCase(component.id)}.tsx`);
          changes.push({
            path: componentPath,
            type: 'create',
            content: this.generateClientComponent(component),
          });
        }
      });
    } else {
      // Traditional pages directory
      const pagePath = path.join(outputDir, 'pages', `${this.toKebabCase(layout.name)}.tsx`);
      changes.push({
        path: pagePath,
        type: 'create',
        content: this.generateReactPage(layout),
      });
    }

    return changes;
  }

  /**
   * Generate Next.js App Router page component
   */
  private generateNextAppRouterPage(layout: PageLayout): string {
    const isServerComponent = layout.isServerComponent !== false;
    const hasClientComponents = this.hasClientComponents(layout.components);
    
    const imports: string[] = [];
    const clientComponentImports: string[] = [];

    // Add metadata export for SEO
    const metadataExport = layout.metadata ? `
export const metadata = {
  title: '${layout.metadata.title || layout.name}',
  description: '${layout.metadata.description || `${layout.name} page`}',
};
` : '';

    // Collect client component imports
    if (hasClientComponents) {
      const clientComps = this.extractClientComponents(layout.components);
      clientComps.forEach(comp => {
        const compName = this.toPascalCase(comp.id);
        clientComponentImports.push(`import ${compName} from '@/components/${this.toKebabCase(comp.id)}';`);
      });
    }

    const allImports = [...imports, ...clientComponentImports].join('\n');

    return `${allImports ? allImports + '\n' : ''}${metadataExport}
export default ${isServerComponent ? '' : 'async '}function ${this.toPascalCase(layout.name)}Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      ${this.generateComponentsJSX(layout.components, 3)}
    </div>
  );
}
`;
  }

  /**
   * Generate traditional React page component
   */
  private generateReactPage(layout: PageLayout): string {
    return `import React from 'react';

export default function ${this.toPascalCase(layout.name)}() {
  return (
    <div className="min-h-screen bg-gray-50">
      ${this.generateComponentsJSX(layout.components, 3)}
    </div>
  );
}
`;
  }

  /**
   * Generate a client component file
   */
  private generateClientComponent(component: UIComponent): string {
    const componentName = this.toPascalCase(component.id);
    const hasInteractivity = this.requiresClientComponent(component);
    
    return `'use client';

import React${hasInteractivity ? ', { useState }' : ''} from 'react';

interface ${componentName}Props {
  ${Object.keys(component.props || {}).map(key => `${key}?: any;`).join('\n  ')}
}

export default function ${componentName}(props: ${componentName}Props) {
  ${hasInteractivity ? 'const [state, setState] = useState({});' : ''}

  return (
    ${this.generateComponentJSX(component, 2)}
  );
}
`;
  }

  /**
   * Generate JSX for multiple components
   */
  private generateComponentsJSX(components: UIComponent[], indent: number = 0): string {
    const indentStr = '  '.repeat(indent);
    return components.map(c => this.generateComponentJSX(c, indent)).join('\n' + indentStr);
  }

  /**
   * Generate JSX for a single component with Tailwind classes
   */
  private generateComponentJSX(component: UIComponent, indent: number = 0): string {
    const indentStr = '  '.repeat(indent);
    const childIndentStr = '  '.repeat(indent + 1);
    
    switch (component.type) {
      case 'layout':
        return `<div className="container mx-auto px-4 py-8">
${childIndentStr}${component.children ? this.generateComponentsJSX(component.children, indent + 1) : ''}
${indentStr}</div>`;

      case 'header':
        return `<header className="bg-white shadow-sm border-b border-gray-200">
${childIndentStr}<div className="container mx-auto px-4 py-4">
${childIndentStr}  ${component.children ? this.generateComponentsJSX(component.children, indent + 2) : '<h1 className="text-2xl font-bold text-gray-900">Header</h1>'}
${childIndentStr}</div>
${indentStr}</header>`;

      case 'nav':
        return `<nav className="flex items-center space-x-6">
${childIndentStr}${component.children ? this.generateComponentsJSX(component.children, indent + 1) : '<a href="#" className="text-gray-700 hover:text-gray-900">Link</a>'}
${indentStr}</nav>`;

      case 'footer':
        return `<footer className="bg-gray-900 text-white mt-auto">
${childIndentStr}<div className="container mx-auto px-4 py-8">
${childIndentStr}  ${component.children ? this.generateComponentsJSX(component.children, indent + 2) : '<p className="text-gray-400">© 2024 All rights reserved</p>'}
${childIndentStr}</div>
${indentStr}</footer>`;

      case 'card':
        return `<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
${childIndentStr}${component.children ? this.generateComponentsJSX(component.children, indent + 1) : '<p className="text-gray-600">Card content</p>'}
${indentStr}</div>`;

      case 'grid':
        const cols = component.props?.columns || 3;
        return `<div className="grid grid-cols-1 md:grid-cols-${cols} gap-6">
${childIndentStr}${component.children ? this.generateComponentsJSX(component.children, indent + 1) : ''}
${indentStr}</div>`;

      case 'list':
        return `<ul className="space-y-2">
${childIndentStr}${component.children ? this.generateComponentsJSX(component.children, indent + 1) : '<li className="text-gray-700">List item</li>'}
${indentStr}</ul>`;

      case 'form':
        return `<form className="space-y-4 max-w-md">
${childIndentStr}${component.children ? this.generateComponentsJSX(component.children, indent + 1) : ''}
${childIndentStr}<button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
${childIndentStr}  Submit
${childIndentStr}</button>
${indentStr}</form>`;

      case 'input':
        const inputType = component.props?.type || 'text';
        const placeholder = component.props?.placeholder || 'Enter value';
        const label = component.props?.label;
        return label 
          ? `<div>
${childIndentStr}  <label className="block text-sm font-medium text-gray-700 mb-1">${label}</label>
${childIndentStr}  <input type="${inputType}" placeholder="${placeholder}" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
${childIndentStr}</div>`
          : `<input type="${inputType}" placeholder="${placeholder}" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />`;

      case 'button':
        const variant = component.props?.variant || 'primary';
        const buttonClasses = this.getButtonClasses(variant);
        const buttonText = component.props?.text || 'Button';
        return `<button className="${buttonClasses}">
${childIndentStr}  ${buttonText}
${childIndentStr}</button>`;

      case 'text':
        const textType = component.props?.variant || 'p';
        const textClasses = this.getTextClasses(textType);
        const text = component.props?.content || 'Text content';
        return `<${textType} className="${textClasses}">${text}</${textType}>`;

      case 'image':
        const src = component.props?.src || '/placeholder.jpg';
        const alt = component.props?.alt || 'Image';
        return `<img src="${src}" alt="${alt}" className="w-full h-auto rounded-lg" />`;

      case 'table':
        return `<div className="overflow-x-auto">
${childIndentStr}  <table className="min-w-full divide-y divide-gray-200">
${childIndentStr}    <thead className="bg-gray-50">
${childIndentStr}      <tr>
${childIndentStr}        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
${childIndentStr}      </tr>
${childIndentStr}    </thead>
${childIndentStr}    <tbody className="bg-white divide-y divide-gray-200">
${childIndentStr}      ${component.children ? this.generateComponentsJSX(component.children, indent + 3) : '<tr><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Data</td></tr>'}
${childIndentStr}    </tbody>
${childIndentStr}  </table>
${childIndentStr}</div>`;

      case 'modal':
        return `<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
${childIndentStr}  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
${childIndentStr}    ${component.children ? this.generateComponentsJSX(component.children, indent + 2) : '<p>Modal content</p>'}
${childIndentStr}  </div>
${childIndentStr}</div>`;

      default:
        return `<div className="p-4">
${childIndentStr}  ${component.children ? this.generateComponentsJSX(component.children, indent + 1) : '<!-- Component -->'}
${childIndentStr}</div>`;
    }
  }

  /**
   * Get Tailwind classes for button variants
   */
  private getButtonClasses(variant: string): string {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
      case 'secondary':
        return `${baseClasses} bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500`;
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      case 'outline':
        return `${baseClasses} border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
    }
  }

  /**
   * Get Tailwind classes for text variants
   */
  private getTextClasses(variant: string): string {
    switch (variant) {
      case 'h1':
        return 'text-4xl font-bold text-gray-900 mb-4';
      case 'h2':
        return 'text-3xl font-bold text-gray-900 mb-3';
      case 'h3':
        return 'text-2xl font-semibold text-gray-900 mb-2';
      case 'h4':
        return 'text-xl font-semibold text-gray-900 mb-2';
      case 'p':
        return 'text-base text-gray-700 mb-2';
      case 'small':
        return 'text-sm text-gray-600';
      case 'lead':
        return 'text-lg text-gray-700 mb-4';
      default:
        return 'text-base text-gray-700';
    }
  }

  /**
   * Check if layout has any client components
   */
  private hasClientComponents(components: UIComponent[]): boolean {
    return components.some(c => this.requiresClientComponent(c) || 
      (c.children && this.hasClientComponents(c.children)));
  }

  /**
   * Extract components that need to be client components
   */
  private extractClientComponents(components: UIComponent[]): UIComponent[] {
    const clientComponents: UIComponent[] = [];
    
    components.forEach(component => {
      if (this.requiresClientComponent(component)) {
        clientComponents.push(component);
      }
      if (component.children) {
        clientComponents.push(...this.extractClientComponents(component.children));
      }
    });
    
    return clientComponents;
  }

  /**
   * Determine if a component requires client-side rendering
   */
  private requiresClientComponent(component: UIComponent): boolean {
    // Components with interactivity need 'use client'
    const interactiveTypes = ['form', 'button', 'input', 'modal'];
    return component.isClientComponent || 
           interactiveTypes.includes(component.type) ||
           !!component.apiEndpoint;
  }

  /**
   * Convert route to file path
   */
  private routeToPath(route: string): string {
    // Remove leading slash and convert to path
    return route.replace(/^\//, '').replace(/\//g, path.sep) || 'index';
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^[a-z]/, c => c.toUpperCase());
  }

  /**
   * Convert string to kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
}
