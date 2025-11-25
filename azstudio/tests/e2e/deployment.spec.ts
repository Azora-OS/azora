import { test, expect, Page } from '@playwright/test';
import { createTestProject, cleanupTestProject } from './helpers';

/**
 * E2E tests for deployment to cloud platforms
 * Tests the complete deployment workflow from configuration to live deployment
 */
test.describe('Deployment to Cloud', () => {
  let page: Page;
  let projectPath: string;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    projectPath = await createTestProject('deployment-test');
    
    // Navigate to AzStudio
    await page.goto('http://localhost:3000');
    
    // Open test project
    await page.click('[data-testid="open-project"]');
    await page.fill('[data-testid="project-path"]', projectPath);
    await page.click('[data-testid="confirm-open"]');
    
    // Wait for project to load
    await page.waitForSelector('[data-testid="project-loaded"]');
  });

  test.afterEach(async () => {
    await cleanupTestProject(projectPath);
  });

  test.describe('Vercel Deployment', () => {
    test('should configure Vercel deployment', async () => {
      // Open deployment panel
      await page.click('[data-testid="deployment-tab"]');
      
      // Select Vercel as provider
      await page.click('[data-testid="add-deployment"]');
      await page.selectOption('[data-testid="provider-select"]', 'vercel');
      
      // Configure deployment
      await page.fill('[data-testid="project-name"]', 'test-project');
      await page.fill('[data-testid="vercel-token"]', 'test-token');
      
      // Select environment
      await page.selectOption('[data-testid="environment"]', 'production');
      
      // Save configuration
      await page.click('[data-testid="save-deployment-config"]');
      
      // Verify configuration saved
      await expect(page.locator('[data-testid="deployment-configured"]')).toBeVisible();
    });

    test('should deploy to Vercel', async () => {
      // Configure deployment first
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="add-deployment"]');
      await page.selectOption('[data-testid="provider-select"]', 'vercel');
      await page.fill('[data-testid="project-name"]', 'test-project');
      await page.fill('[data-testid="vercel-token"]', 'test-token');
      await page.click('[data-testid="save-deployment-config"]');
      
      // Trigger deployment
      await page.click('[data-testid="deploy-button"]');
      
      // Wait for deployment to start
      await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Deploying');
      
      // Wait for deployment to complete (with timeout)
      await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Deployed', {
        timeout: 120000, // 2 minutes
      });
      
      // Verify deployment URL is shown
      await expect(page.locator('[data-testid="deployment-url"]')).toBeVisible();
    });

    test('should show deployment logs', async () => {
      // Start deployment
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="deploy-button"]');
      
      // Open logs panel
      await page.click('[data-testid="view-logs"]');
      
      // Verify logs are displayed
      await expect(page.locator('[data-testid="deployment-logs"]')).toBeVisible();
      await expect(page.locator('[data-testid="deployment-logs"]')).toContainText('Building');
    });

    test('should handle deployment errors', async () => {
      // Configure with invalid token
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="add-deployment"]');
      await page.selectOption('[data-testid="provider-select"]', 'vercel');
      await page.fill('[data-testid="vercel-token"]', 'invalid-token');
      await page.click('[data-testid="save-deployment-config"]');
      
      // Try to deploy
      await page.click('[data-testid="deploy-button"]');
      
      // Verify error is shown
      await expect(page.locator('[data-testid="deployment-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="deployment-error"]')).toContainText('Authentication failed');
    });
  });

  test.describe('Railway Deployment', () => {
    test('should configure Railway deployment', async () => {
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="add-deployment"]');
      await page.selectOption('[data-testid="provider-select"]', 'railway');
      
      await page.fill('[data-testid="project-name"]', 'test-service');
      await page.fill('[data-testid="railway-token"]', 'test-token');
      
      await page.click('[data-testid="save-deployment-config"]');
      
      await expect(page.locator('[data-testid="deployment-configured"]')).toBeVisible();
    });

    test('should deploy services to Railway', async () => {
      // Configure Railway
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="add-deployment"]');
      await page.selectOption('[data-testid="provider-select"]', 'railway');
      await page.fill('[data-testid="railway-token"]', 'test-token');
      await page.click('[data-testid="save-deployment-config"]');
      
      // Select services to deploy
      await page.check('[data-testid="service-auth"]');
      await page.check('[data-testid="service-api"]');
      
      // Deploy
      await page.click('[data-testid="deploy-button"]');
      
      // Wait for deployment
      await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Deployed', {
        timeout: 120000,
      });
      
      // Verify service URLs
      await expect(page.locator('[data-testid="service-auth-url"]')).toBeVisible();
      await expect(page.locator('[data-testid="service-api-url"]')).toBeVisible();
    });
  });

  test.describe('Docker Deployment', () => {
    test('should generate Dockerfile', async () => {
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="add-deployment"]');
      await page.selectOption('[data-testid="provider-select"]', 'docker');
      
      // Generate Dockerfile
      await page.click('[data-testid="generate-dockerfile"]');
      
      // Verify Dockerfile is created
      await expect(page.locator('[data-testid="dockerfile-generated"]')).toBeVisible();
      
      // View Dockerfile
      await page.click('[data-testid="view-dockerfile"]');
      await expect(page.locator('[data-testid="code-editor"]')).toContainText('FROM node');
    });

    test('should generate docker-compose.yml', async () => {
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="add-deployment"]');
      await page.selectOption('[data-testid="provider-select"]', 'docker');
      
      // Generate docker-compose
      await page.click('[data-testid="generate-docker-compose"]');
      
      // Verify file is created
      await expect(page.locator('[data-testid="docker-compose-generated"]')).toBeVisible();
      
      // View file
      await page.click('[data-testid="view-docker-compose"]');
      await expect(page.locator('[data-testid="code-editor"]')).toContainText('version:');
      await expect(page.locator('[data-testid="code-editor"]')).toContainText('services:');
    });

    test('should build Docker image', async () => {
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="add-deployment"]');
      await page.selectOption('[data-testid="provider-select"]', 'docker');
      
      // Build image
      await page.click('[data-testid="build-image"]');
      
      // Wait for build to complete
      await expect(page.locator('[data-testid="build-status"]')).toContainText('Built', {
        timeout: 180000, // 3 minutes
      });
      
      // Verify image name
      await expect(page.locator('[data-testid="image-name"]')).toBeVisible();
    });
  });

  test.describe('Environment Variables', () => {
    test('should configure environment variables', async () => {
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="environment-variables"]');
      
      // Add environment variable
      await page.click('[data-testid="add-env-var"]');
      await page.fill('[data-testid="env-key"]', 'DATABASE_URL');
      await page.fill('[data-testid="env-value"]', 'postgresql://localhost:5432/db');
      await page.click('[data-testid="save-env-var"]');
      
      // Verify variable is saved
      await expect(page.locator('[data-testid="env-var-DATABASE_URL"]')).toBeVisible();
    });

    test('should manage secrets securely', async () => {
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="environment-variables"]');
      
      // Add secret
      await page.click('[data-testid="add-env-var"]');
      await page.fill('[data-testid="env-key"]', 'API_KEY');
      await page.fill('[data-testid="env-value"]', 'secret-key-123');
      await page.check('[data-testid="mark-as-secret"]');
      await page.click('[data-testid="save-env-var"]');
      
      // Verify secret is masked
      await expect(page.locator('[data-testid="env-var-API_KEY"]')).toContainText('***');
    });

    test('should sync environment variables across environments', async () => {
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="environment-variables"]');
      
      // Add variable to development
      await page.selectOption('[data-testid="environment-select"]', 'development');
      await page.click('[data-testid="add-env-var"]');
      await page.fill('[data-testid="env-key"]', 'FEATURE_FLAG');
      await page.fill('[data-testid="env-value"]', 'true');
      await page.click('[data-testid="save-env-var"]');
      
      // Copy to production
      await page.click('[data-testid="copy-to-production"]');
      
      // Verify in production
      await page.selectOption('[data-testid="environment-select"]', 'production');
      await expect(page.locator('[data-testid="env-var-FEATURE_FLAG"]')).toBeVisible();
    });
  });

  test.describe('Deployment Monitoring', () => {
    test('should show deployment health status', async () => {
      // Deploy first
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="deploy-button"]');
      await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Deployed', {
        timeout: 120000,
      });
      
      // View health status
      await page.click('[data-testid="view-health"]');
      
      // Verify health indicators
      await expect(page.locator('[data-testid="health-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="uptime"]')).toBeVisible();
      await expect(page.locator('[data-testid="response-time"]')).toBeVisible();
    });

    test('should display error logs', async () => {
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="view-logs"]');
      
      // Filter by errors
      await page.selectOption('[data-testid="log-level"]', 'error');
      
      // Verify error logs are shown
      await expect(page.locator('[data-testid="error-logs"]')).toBeVisible();
    });

    test('should show performance metrics', async () => {
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="view-metrics"]');
      
      // Verify metrics are displayed
      await expect(page.locator('[data-testid="cpu-usage"]')).toBeVisible();
      await expect(page.locator('[data-testid="memory-usage"]')).toBeVisible();
      await expect(page.locator('[data-testid="request-rate"]')).toBeVisible();
    });
  });

  test.describe('Rollback', () => {
    test('should rollback to previous deployment', async () => {
      // Deploy version 1
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="deploy-button"]');
      await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Deployed', {
        timeout: 120000,
      });
      
      // Make changes and deploy version 2
      await page.click('[data-testid="code-editor-tab"]');
      await page.fill('[data-testid="code-editor"]', 'console.log("v2");');
      await page.click('[data-testid="deployment-tab"]');
      await page.click('[data-testid="deploy-button"]');
      await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Deployed', {
        timeout: 120000,
      });
      
      // Rollback to version 1
      await page.click('[data-testid="deployment-history"]');
      await page.click('[data-testid="rollback-v1"]');
      await page.click('[data-testid="confirm-rollback"]');
      
      // Verify rollback successful
      await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Rolled back');
    });
  });
});
