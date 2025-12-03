import * as fs from 'fs';
import * as path from 'path';

export interface Framework {
  name: string;
  version?: string;
  detected: boolean;
}

export interface ProjectConventions {
  frameworks: Framework[];
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'unknown';
  typescript: boolean;
  testing: string[];
  linting: string[];
  formatting: string[];
  buildTool?: string;
}

export class FrameworkDetector {
  async detectFrameworks(rootPath: string): Promise<Framework[]> {
    const frameworks: Framework[] = [];

    try {
      const packageJsonPath = path.join(rootPath, 'package.json');
      const packageJsonExists = await fs.promises.access(packageJsonPath).then(() => true).catch(() => false);

      if (packageJsonExists) {
        const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf-8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        // Detect React
        if (allDeps['react']) {
          frameworks.push({
            name: 'React',
            version: allDeps['react'],
            detected: true,
          });
        }

        // Detect Next.js
        if (allDeps['next']) {
          frameworks.push({
            name: 'Next.js',
            version: allDeps['next'],
            detected: true,
          });
        }

        // Detect Vue
        if (allDeps['vue']) {
          frameworks.push({
            name: 'Vue',
            version: allDeps['vue'],
            detected: true,
          });
        }

        // Detect Angular
        if (allDeps['@angular/core']) {
          frameworks.push({
            name: 'Angular',
            version: allDeps['@angular/core'],
            detected: true,
          });
        }

        // Detect Express
        if (allDeps['express']) {
          frameworks.push({
            name: 'Express',
            version: allDeps['express'],
            detected: true,
          });
        }

        // Detect Tailwind CSS
        if (allDeps['tailwindcss']) {
          frameworks.push({
            name: 'Tailwind CSS',
            version: allDeps['tailwindcss'],
            detected: true,
          });
        }

        // Detect Prisma
        if (allDeps['prisma'] || allDeps['@prisma/client']) {
          frameworks.push({
            name: 'Prisma',
            version: allDeps['@prisma/client'] || allDeps['prisma'],
            detected: true,
          });
        }

        // Detect TypeScript
        if (allDeps['typescript']) {
          frameworks.push({
            name: 'TypeScript',
            version: allDeps['typescript'],
            detected: true,
          });
        }

        // Detect Electron
        if (allDeps['electron']) {
          frameworks.push({
            name: 'Electron',
            version: allDeps['electron'],
            detected: true,
          });
        }
      }
    } catch (error) {
      console.error('Failed to detect frameworks:', error);
    }

    return frameworks;
  }

  async getProjectConventions(rootPath: string): Promise<ProjectConventions> {
    const conventions: ProjectConventions = {
      frameworks: [],
      packageManager: 'unknown',
      typescript: false,
      testing: [],
      linting: [],
      formatting: [],
    };

    try {
      // Detect package manager
      const hasPackageLock = await fs.promises.access(path.join(rootPath, 'package-lock.json')).then(() => true).catch(() => false);
      const hasYarnLock = await fs.promises.access(path.join(rootPath, 'yarn.lock')).then(() => true).catch(() => false);
      const hasPnpmLock = await fs.promises.access(path.join(rootPath, 'pnpm-lock.yaml')).then(() => true).catch(() => false);

      if (hasPnpmLock) {
        conventions.packageManager = 'pnpm';
      } else if (hasYarnLock) {
        conventions.packageManager = 'yarn';
      } else if (hasPackageLock) {
        conventions.packageManager = 'npm';
      }

      // Detect TypeScript
      const hasTsConfig = await fs.promises.access(path.join(rootPath, 'tsconfig.json')).then(() => true).catch(() => false);
      conventions.typescript = hasTsConfig;

      // Read package.json
      const packageJsonPath = path.join(rootPath, 'package.json');
      const packageJsonExists = await fs.promises.access(packageJsonPath).then(() => true).catch(() => false);

      if (packageJsonExists) {
        const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf-8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        // Detect frameworks
        conventions.frameworks = await this.detectFrameworks(rootPath);

        // Detect testing frameworks
        if (allDeps['jest']) conventions.testing.push('Jest');
        if (allDeps['vitest']) conventions.testing.push('Vitest');
        if (allDeps['mocha']) conventions.testing.push('Mocha');
        if (allDeps['@playwright/test']) conventions.testing.push('Playwright');
        if (allDeps['cypress']) conventions.testing.push('Cypress');

        // Detect linting tools
        if (allDeps['eslint']) conventions.linting.push('ESLint');
        if (allDeps['tslint']) conventions.linting.push('TSLint');

        // Detect formatting tools
        if (allDeps['prettier']) conventions.formatting.push('Prettier');

        // Detect build tools
        if (allDeps['webpack']) {
          conventions.buildTool = 'Webpack';
        } else if (allDeps['vite']) {
          conventions.buildTool = 'Vite';
        } else if (allDeps['rollup']) {
          conventions.buildTool = 'Rollup';
        } else if (allDeps['esbuild']) {
          conventions.buildTool = 'esbuild';
        }
      }
    } catch (error) {
      console.error('Failed to get project conventions:', error);
    }

    return conventions;
  }

  async detectProjectStructure(rootPath: string): Promise<{
    hasPages: boolean;
    hasComponents: boolean;
    hasServices: boolean;
    hasTests: boolean;
    structure: string;
  }> {
    const structure = {
      hasPages: false,
      hasComponents: false,
      hasServices: false,
      hasTests: false,
      structure: 'unknown',
    };

    try {
      const entries = await fs.promises.readdir(rootPath, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      // Check for common directories
      structure.hasPages = dirs.includes('pages') || dirs.includes('app');
      structure.hasComponents = dirs.includes('components');
      structure.hasServices = dirs.includes('services');
      structure.hasTests = dirs.includes('tests') || dirs.includes('test') || dirs.includes('__tests__');

      // Determine structure type
      if (dirs.includes('src')) {
        structure.structure = 'src-based';
      } else if (dirs.includes('app') && dirs.includes('pages')) {
        structure.structure = 'next-app-router';
      } else if (dirs.includes('pages')) {
        structure.structure = 'next-pages-router';
      } else if (dirs.includes('services') && dirs.includes('apps')) {
        structure.structure = 'monorepo';
      } else {
        structure.structure = 'flat';
      }
    } catch (error) {
      console.error('Failed to detect project structure:', error);
    }

    return structure;
  }
}
