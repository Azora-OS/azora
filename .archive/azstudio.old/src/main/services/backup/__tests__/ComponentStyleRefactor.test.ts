import { ComponentStyleRefactor } from '../ComponentStyleRefactor';
import { ClassMapping } from '../DesignFilterEngine';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and glob
jest.mock('fs');
jest.mock('glob');

describe('ComponentStyleRefactor', () => {
  let refactor: ComponentStyleRefactor;
  const mockProjectRoot = '/mock/project';

  beforeEach(() => {
    refactor = new ComponentStyleRefactor(mockProjectRoot);
    jest.clearAllMocks();
  });

  describe('identifyComponentsWithOldStyles', () => {
    it('should identify components with old Tailwind classes', async () => {
      const classMapping: ClassMapping = {
        'bg-blue-500': 'bg-primary-500',
        'text-gray-900': 'text-neutral-900',
      };

      const mockComponent = `
        import React from 'react';
        
        export const Button = () => {
          return <button className="bg-blue-500 text-gray-900">Click me</button>;
        };
      `;

      // Mock glob to return test files
      const { glob } = require('glob');
      glob.mockResolvedValue(['/mock/project/Button.tsx']);

      // Mock fs.promises.readFile
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockComponent);

      const components = await refactor.identifyComponentsWithOldStyles(classMapping);

      expect(components.length).toBeGreaterThan(0);
      expect(components[0].classNames).toContain('bg-blue-500');
      expect(components[0].classNames).toContain('text-gray-900');
    });
  });

  describe('applyTailwindTransformations', () => {
    it('should transform className attributes', async () => {
      const classMapping: ClassMapping = {
        'bg-blue-500': 'bg-primary-500',
        'text-gray-900': 'text-neutral-900',
      };

      const mockComponent = {
        filePath: '/mock/project/Button.tsx',
        componentName: 'Button',
        hasInlineStyles: false,
        hasCSSModule: false,
        hasCustomOverrides: false,
        classNames: ['bg-blue-500', 'text-gray-900'],
        inlineStyles: [],
        cssModuleClasses: [],
      };

      const mockContent = `
        import React from 'react';
        
        export const Button = () => {
          return <button className="bg-blue-500 text-gray-900">Click me</button>;
        };
      `;

      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const changes = await refactor.applyTailwindTransformations([mockComponent], classMapping);

      expect(changes.length).toBe(1);
      expect(changes[0].content).toContain('bg-primary-500');
      expect(changes[0].content).toContain('text-neutral-900');
      expect(changes[0].content).not.toContain('bg-blue-500');
    });

    it('should convert inline styles to Tailwind classes', async () => {
      const classMapping: ClassMapping = {};

      const mockComponent = {
        filePath: '/mock/project/Card.tsx',
        componentName: 'Card',
        hasInlineStyles: true,
        hasCSSModule: false,
        hasCustomOverrides: false,
        classNames: [],
        inlineStyles: [
          { line: 5, property: 'display', value: 'flex', context: 'style={{display: "flex"}}' },
        ],
        cssModuleClasses: [],
      };

      const mockContent = `
        import React from 'react';
        
        export const Card = () => {
          return <div style={{display: 'flex'}}>Content</div>;
        };
      `;

      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const changes = await refactor.applyTailwindTransformations([mockComponent], classMapping);

      expect(changes.length).toBe(1);
      expect(changes[0].content).toContain('className="flex"');
    });

    it('should preserve custom overrides', async () => {
      const classMapping: ClassMapping = {
        'bg-blue-500': 'bg-primary-500',
      };

      const mockComponent = {
        filePath: '/mock/project/Custom.tsx',
        componentName: 'Custom',
        hasInlineStyles: false,
        hasCSSModule: false,
        hasCustomOverrides: true,
        classNames: ['bg-blue-500'],
        inlineStyles: [],
        cssModuleClasses: [],
      };

      const mockContent = `
        import React from 'react';
        
        export const Custom = () => {
          return (
            <div>
              {/* custom */}
              <button className="bg-blue-500">Original</button>
            </div>
          );
        };
      `;

      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const changes = await refactor.applyTailwindTransformations([mockComponent], classMapping);

      expect(changes.length).toBe(1);
      // Custom override line should be preserved
      expect(changes[0].content).toContain('/* custom */');
    });
  });

  describe('refactorComponents', () => {
    it('should return refactor statistics', async () => {
      const classMapping: ClassMapping = {
        'bg-blue-500': 'bg-primary-500',
      };

      const { glob } = require('glob');
      glob.mockResolvedValue(['/mock/project/Button.tsx']);

      const mockContent = `
        import React from 'react';
        export const Button = () => <button className="bg-blue-500">Click</button>;
      `;

      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const result = await refactor.refactorComponents(classMapping);

      expect(result.filesProcessed).toBeGreaterThanOrEqual(0);
      expect(result.changes).toBeDefined();
      expect(Array.isArray(result.changes)).toBe(true);
    });
  });
});
