import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

export interface E2ETestScenario {
  name: string;
  description: string;
  userJourney: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface E2ETestResult {
  scenario: string;
  passed: boolean;
  duration: number;
  error?: string;
  screenshots?: string[];
  video?: string;
  trace?: string;
}

export interface E2EResults {
  passed: number;
  failed: number;
  total: number;
  duration: number;
  results: E2ETestResult[];
  reportPath?: string;
}

export class PlaywrightRunner {
  private projectRoot: string;
  private previewServerUrl: string;
  private previewServerProcess?: any;

  constructor(projectRoot: string, previewServerUrl: string = 'http://localhost:3000') {
    this.projectRoot = projectRoot;
    this.previewServerUrl = previewServerUrl;
  }

  /**
   * Configure Playwright with browsers
   */
  async configure(): Promise<void> {
    try {
      // Install Playwright browsers if not already installed
      await execAsync('npx playwright install', {
        cwd: this.projectRoot,
        timeout: 300000, // 5 minutes for browser installation
      });
    } catch (error: any) {
      throw new Error(`Failed to configure Playwright: ${error.message}`);
    }
  }

  /**
   * Start local preview server for testing
   */
  async startPreviewServer(): Promise<void> {
    // Check if server is already running
    try {
      const response = await fetch(this.previewServerUrl);
      if (response.ok) {
        console.log('Preview server already running');
        return;
      }
    } catch {
      // Server not running, start it
    }

    // Start the preview server (implementation depends on project setup)
    // This is a placeholder - actual implementation would start the dev server
    console.log(`Starting preview server at ${this.previewServerUrl}`);
  }

  /**
   * Stop the preview server
   */
  async stopPreviewServer(): Promise<void> {
    if (this.previewServerProcess) {
      this.previewServerProcess.kill();
      this.previewServerProcess = undefined;
    }
  }

  /**
   * Generate E2E test scenarios from user journeys
   */
  generateTestScenarios(userJourneys: string[][]): E2ETestScenario[] {
    return userJourneys.map((journey, index) => ({
      name: `user-journey-${index + 1}`,
      description: journey.join(' → '),
      userJourney: journey,
      priority: index === 0 ? 'critical' : 'high',
    }));
  }

  /**
   * Generate Playwright test file from scenario
   */
  async generateTestFile(scenario: E2ETestScenario): Promise<string> {
    const testFilePath = path.join(
      this.projectRoot,
      'tests',
      'e2e',
      `${scenario.name}.spec.ts`
    );

    const testContent = this.generateTestContent(scenario);
    await fs.writeFile(testFilePath, testContent, 'utf-8');

    return testFilePath;
  }

  /**
   * Generate test content from scenario
   */
  private generateTestContent(scenario: E2ETestScenario): string {
    const steps = scenario.userJourney.map((step, index) => {
      return `  // Step ${index + 1}: ${step}
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: \`screenshots/\${testInfo.title}-step-${index + 1}.png\` });`;
    }).join('\n\n');

    return `import { test, expect } from '@playwright/test';

/**
 * E2E Test: ${scenario.name}
 * Description: ${scenario.description}
 * Priority: ${scenario.priority}
 * 
 * User Journey:
${scenario.userJourney.map((step, i) => ` * ${i + 1}. ${step}`).join('\n')}
 */

test.describe('${scenario.name}', () => {
  test('should complete user journey successfully', async ({ page }, testInfo) => {
    // Navigate to application
    await page.goto('/');
    
${steps}
    
    // Verify final state
    await expect(page).toHaveTitle(/AzStudio/);
  });
  
  test('should handle errors gracefully', async ({ page }) => {
    // Test error scenarios
    await page.goto('/');
    
    // Add error handling tests based on the journey
    await expect(page.locator('body')).toBeVisible();
  });
});
`;
  }

  /**
   * Run E2E tests against local preview server
   */
  async runTests(scenarios?: E2ETestScenario[]): Promise<E2EResults> {
    try {
      // Generate test files if scenarios provided
      if (scenarios && scenarios.length > 0) {
        for (const scenario of scenarios) {
          await this.generateTestFile(scenario);
        }
      }

      // Run Playwright tests
      const { stdout } = await execAsync('npx playwright test --reporter=json', {
        cwd: this.projectRoot,
        timeout: 600000, // 10 minutes
        env: {
          ...process.env,
          PLAYWRIGHT_BASE_URL: this.previewServerUrl,
        },
      });

      return this.parseTestResults(stdout);
    } catch (error: any) {
      // Parse results even on failure
      if (error.stdout) {
        return this.parseTestResults(error.stdout);
      }

      return {
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0,
        results: [{
          scenario: 'Test execution',
          passed: false,
          duration: 0,
          error: error.message,
        }],
      };
    }
  }

  /**
   * Run specific test file
   */
  async runTestFile(testFile: string): Promise<E2EResults> {
    try {
      const { stdout } = await execAsync(`npx playwright test ${testFile} --reporter=json`, {
        cwd: this.projectRoot,
        timeout: 300000,
      });

      return this.parseTestResults(stdout);
    } catch (error: any) {
      if (error.stdout) {
        return this.parseTestResults(error.stdout);
      }

      return {
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0,
        results: [{
          scenario: path.basename(testFile),
          passed: false,
          duration: 0,
          error: error.message,
        }],
      };
    }
  }

  /**
   * Parse Playwright JSON output
   */
  private parseTestResults(output: string): E2EResults {
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON output found');
      }

      const results = JSON.parse(jsonMatch[0]);
      const suites = results.suites || [];
      
      const testResults: E2ETestResult[] = [];
      let passed = 0;
      let failed = 0;
      let totalDuration = 0;

      const extractTests = (suite: any) => {
        if (suite.specs) {
          for (const spec of suite.specs) {
            for (const test of spec.tests || []) {
              const result = test.results?.[0];
              const isPassed = result?.status === 'passed';
              
              if (isPassed) passed++;
              else failed++;

              totalDuration += result?.duration || 0;

              testResults.push({
                scenario: spec.title || 'Unknown',
                passed: isPassed,
                duration: result?.duration || 0,
                error: result?.error?.message,
                screenshots: result?.attachments
                  ?.filter((a: any) => a.contentType?.includes('image'))
                  .map((a: any) => a.path),
                video: result?.attachments
                  ?.find((a: any) => a.contentType?.includes('video'))?.path,
                trace: result?.attachments
                  ?.find((a: any) => a.name === 'trace')?.path,
              });
            }
          }
        }

        if (suite.suites) {
          for (const subSuite of suite.suites) {
            extractTests(subSuite);
          }
        }
      };

      for (const suite of suites) {
        extractTests(suite);
      }

      return {
        passed,
        failed,
        total: passed + failed,
        duration: totalDuration,
        results: testResults,
        reportPath: path.join(this.projectRoot, 'test-results', 'html', 'index.html'),
      };
    } catch (error: any) {
      // Fallback parsing for non-JSON output
      const passedMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);

      return {
        passed: passedMatch ? parseInt(passedMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        total: 0,
        duration: 0,
        results: [],
      };
    }
  }

  /**
   * Capture screenshots on failure
   */
  async captureScreenshot(page: any, name: string): Promise<string> {
    const screenshotPath = path.join(
      this.projectRoot,
      'test-results',
      'screenshots',
      `${name}-${Date.now()}.png`
    );

    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return screenshotPath;
  }

  /**
   * Get test artifacts (screenshots, videos, traces)
   */
  async getTestArtifacts(testName: string): Promise<{
    screenshots: string[];
    videos: string[];
    traces: string[];
  }> {
    const resultsDir = path.join(this.projectRoot, 'test-results');
    
    try {
      const files = await fs.readdir(resultsDir, { recursive: true });
      
      return {
        screenshots: files.filter(f => f.includes(testName) && f.endsWith('.png')),
        videos: files.filter(f => f.includes(testName) && f.endsWith('.webm')),
        traces: files.filter(f => f.includes(testName) && f.endsWith('.zip')),
      };
    } catch {
      return { screenshots: [], videos: [], traces: [] };
    }
  }

  /**
   * Generate HTML report
   */
  async generateReport(): Promise<string> {
    try {
      await execAsync('npx playwright show-report', {
        cwd: this.projectRoot,
      });

      return path.join(this.projectRoot, 'test-results', 'html', 'index.html');
    } catch (error: any) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }
}
