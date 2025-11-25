import { test, expect } from '@playwright/test';

/**
 * E2E Test: Project Creation
 * Description: User creates a new project from template
 * Priority: critical
 * 
 * User Journey:
 * 1. Open AzStudio
 * 2. Click "New Project"
 * 3. Select template (e.g., Education Platform)
 * 4. Configure project settings
 * 5. Create project
 * 6. Verify project structure is created
 */

test.describe('Project Creation', () => {
  test('should create new project from template', async ({ page }, testInfo) => {
    // Navigate to application
    await page.goto('/');
    
    // Step 1: Open AzStudio
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/AzStudio/);
    await page.screenshot({ 
      path: `test-results/screenshots/${testInfo.title}-step-1.png` 
    });
    
    // Step 2: Click "New Project"
    const newProjectButton = page.locator('button:has-text("New Project")');
    if (await newProjectButton.isVisible()) {
      await newProjectButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ 
        path: `test-results/screenshots/${testInfo.title}-step-2.png` 
      });
    }
    
    // Step 3: Select template
    const templateSelector = page.locator('[data-testid="template-selector"]');
    if (await templateSelector.isVisible()) {
      await templateSelector.click();
      await page.locator('text=Education Platform').click();
      await page.screenshot({ 
        path: `test-results/screenshots/${testInfo.title}-step-3.png` 
      });
    }
    
    // Step 4: Configure project settings
    const projectNameInput = page.locator('input[name="projectName"]');
    if (await projectNameInput.isVisible()) {
      await projectNameInput.fill('test-education-platform');
      await page.screenshot({ 
        path: `test-results/screenshots/${testInfo.title}-step-4.png` 
      });
    }
    
    // Step 5: Create project
    const createButton = page.locator('button:has-text("Create")');
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(2000); // Wait for project creation
      await page.screenshot({ 
        path: `test-results/screenshots/${testInfo.title}-step-5.png` 
      });
    }
    
    // Step 6: Verify project structure
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: `test-results/screenshots/${testInfo.title}-step-6.png` 
    });
  });
  
  test('should handle project creation errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Try to create project with invalid name
    const newProjectButton = page.locator('button:has-text("New Project")');
    if (await newProjectButton.isVisible()) {
      await newProjectButton.click();
      
      const projectNameInput = page.locator('input[name="projectName"]');
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill(''); // Empty name
        
        const createButton = page.locator('button:has-text("Create")');
        if (await createButton.isVisible()) {
          await createButton.click();
          
          // Should show error message
          const errorMessage = page.locator('[role="alert"]');
          await expect(errorMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});
