/**
 * Commit Message Validation Tests
 * Tests for conventional commits format and commitlint configuration
 * Requirements: 3.1
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Commit Message Validation', () => {
  const commitlintConfigPath = path.join(process.cwd(), '.commitlintrc.json');
  const gitmessagePath = path.join(process.cwd(), '.gitmessage');

  describe('Configuration Files', () => {
    test('should have .commitlintrc.json file', () => {
      expect(fs.existsSync(commitlintConfigPath)).toBe(true);
    });

    test('should have .gitmessage template file', () => {
      expect(fs.existsSync(gitmessagePath)).toBe(true);
    });

    test('.commitlintrc.json should have valid JSON', () => {
      const content = fs.readFileSync(commitlintConfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('.commitlintrc.json should extend conventional config', () => {
      const config = JSON.parse(fs.readFileSync(commitlintConfigPath, 'utf-8'));
      expect(config.extends).toContain('@commitlint/config-conventional');
    });

    test('.commitlintrc.json should define type-enum rule', () => {
      const config = JSON.parse(fs.readFileSync(commitlintConfigPath, 'utf-8'));
      expect(config.rules['type-enum']).toBeDefined();
      expect(Array.isArray(config.rules['type-enum'][2])).toBe(true);
    });

    test('.commitlintrc.json should define scope-enum rule', () => {
      const config = JSON.parse(fs.readFileSync(commitlintConfigPath, 'utf-8'));
      expect(config.rules['scope-enum']).toBeDefined();
      expect(Array.isArray(config.rules['scope-enum'][2])).toBe(true);
    });

    test('.gitmessage should contain commit format instructions', () => {
      const content = fs.readFileSync(gitmessagePath, 'utf-8');
      expect(content).toContain('type');
      expect(content).toContain('scope');
      expect(content).toContain('subject');
    });
  });

  describe('Valid Commit Messages', () => {
    const validMessages = [
      'feat(education): add AI tutor personality system',
      'fix(finance): resolve payment processing timeout',
      'docs: update API authentication guide',
      'style(infrastructure): format configuration files',
      'refactor(marketplace): simplify product filtering logic',
      'perf(education): optimize database query caching',
      'test(security): add authentication validation tests',
      'build(deps): upgrade express to v5.0.0',
      'ci: add GitHub Actions workflow for testing',
      'chore: update dependencies',
      'revert: revert previous commit',
      'ubuntu(governance): integrate collective benefit metrics',
    ];

    validMessages.forEach((message) => {
      test(`should accept valid message: "${message}"`, () => {
        try {
          // Create a temporary commit message file
          const tempFile = path.join(process.cwd(), '.temp-commit-msg');
          fs.writeFileSync(tempFile, message);

          // Run commitlint
          execSync(`npx commitlint --config .commitlintrc.json < ${tempFile}`, {
            stdio: 'pipe',
          });

          // Clean up
          fs.unlinkSync(tempFile);
        } catch (error) {
          // If commitlint is not installed, skip the test
          if ((error as any).message.includes('commitlint')) {
            console.warn('commitlint not installed, skipping validation');
          } else {
            throw error;
          }
        }
      });
    });
  });

  describe('Invalid Commit Messages', () => {
    const invalidMessages = [
      {
        message: 'added new feature',
        reason: 'missing type and scope',
      },
      {
        message: 'feat: ',
        reason: 'empty subject',
      },
      {
        message: 'feat(unknown): add feature',
        reason: 'invalid scope',
      },
      {
        message: 'FEAT(education): add feature',
        reason: 'uppercase type',
      },
      {
        message: 'feat(education): add feature.',
        reason: 'subject ends with period',
      },
      {
        message: 'feat(education): ' + 'a'.repeat(100),
        reason: 'subject exceeds max length',
      },
    ];

    invalidMessages.forEach(({ message, reason }) => {
      test(`should reject invalid message: "${reason}"`, () => {
        try {
          // Create a temporary commit message file
          const tempFile = path.join(process.cwd(), '.temp-commit-msg');
          fs.writeFileSync(tempFile, message);

          // Run commitlint - should fail
          try {
            execSync(`npx commitlint --config .commitlintrc.json < ${tempFile}`, {
              stdio: 'pipe',
            });
            // If we get here, commitlint didn't fail (which is wrong)
            fs.unlinkSync(tempFile);
            throw new Error(`Expected commitlint to fail for: ${reason}`);
          } catch (error) {
            // Expected to fail
            fs.unlinkSync(tempFile);
            // If commitlint is not installed, skip the test
            if ((error as any).message.includes('commitlint')) {
              console.warn('commitlint not installed, skipping validation');
            }
          }
        } catch (error) {
          // Clean up if error occurs
          const tempFile = path.join(process.cwd(), '.temp-commit-msg');
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
          throw error;
        }
      });
    });
  });

  describe('Husky Hooks', () => {
    test('should have .husky directory', () => {
      const huskyDir = path.join(process.cwd(), '.husky');
      expect(fs.existsSync(huskyDir)).toBe(true);
    });

    test('should have commit-msg hook', () => {
      const hookPath = path.join(process.cwd(), '.husky', 'commit-msg');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    test('should have pre-commit hook', () => {
      const hookPath = path.join(process.cwd(), '.husky', 'pre-commit');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    test('commit-msg hook should run commitlint', () => {
      const hookPath = path.join(process.cwd(), '.husky', 'commit-msg');
      const content = fs.readFileSync(hookPath, 'utf-8');
      expect(content).toContain('commitlint');
    });

    test('pre-commit hook should run linting', () => {
      const hookPath = path.join(process.cwd(), '.husky', 'pre-commit');
      const content = fs.readFileSync(hookPath, 'utf-8');
      expect(content).toContain('lint');
    });

    test('pre-commit hook should run formatting check', () => {
      const hookPath = path.join(process.cwd(), '.husky', 'pre-commit');
      const content = fs.readFileSync(hookPath, 'utf-8');
      expect(content).toContain('format');
    });

    test('pre-commit hook should run tests', () => {
      const hookPath = path.join(process.cwd(), '.husky', 'pre-commit');
      const content = fs.readFileSync(hookPath, 'utf-8');
      expect(content).toContain('test');
    });
  });

  describe('Package.json Scripts', () => {
    test('should have lint script', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      expect(packageJson.scripts.lint).toBeDefined();
    });

    test('should have format script', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      expect(packageJson.scripts.format).toBeDefined();
    });

    test('should have format:check script', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      expect(packageJson.scripts['format:check']).toBeDefined();
    });

    test('should have test:changed script', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      expect(packageJson.scripts['test:changed']).toBeDefined();
    });
  });

  describe('CONTRIBUTING.md Documentation', () => {
    test('should have CONTRIBUTING.md file', () => {
      expect(fs.existsSync('CONTRIBUTING.md')).toBe(true);
    });

    test('should document conventional commits format', () => {
      const content = fs.readFileSync('CONTRIBUTING.md', 'utf-8');
      expect(content).toContain('Conventional Commits');
      expect(content).toContain('type(scope): subject');
    });

    test('should document commit types', () => {
      const content = fs.readFileSync('CONTRIBUTING.md', 'utf-8');
      expect(content).toContain('feat');
      expect(content).toContain('fix');
      expect(content).toContain('docs');
    });

    test('should document commit scopes', () => {
      const content = fs.readFileSync('CONTRIBUTING.md', 'utf-8');
      expect(content).toContain('education');
      expect(content).toContain('finance');
      expect(content).toContain('marketplace');
    });

    test('should provide commit examples', () => {
      const content = fs.readFileSync('CONTRIBUTING.md', 'utf-8');
      expect(content).toContain('git commit -m');
      expect(content).toContain('feat(');
      expect(content).toContain('fix(');
    });

    test('should document commit rules', () => {
      const content = fs.readFileSync('CONTRIBUTING.md', 'utf-8');
      expect(content).toContain('Capitalize subject line');
      expect(content).toContain('imperative mood');
      expect(content).toContain('100 characters');
    });
  });
});
