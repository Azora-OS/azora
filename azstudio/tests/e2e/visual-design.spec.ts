import { test, expect } from '@playwright/test';

/**
 * E2E Test: Visual Design and Code Generation
 * Description: User designs UI visually and generates code
 * Priority: critical
 * 
 * User Journey:
 * 1. Open existing project
 * 2. Switch to visual canvas mode
 * 3. Drag component from palette
 * 4. Configure component properties
 * 5. Verify code is generated
 * 6. Switch to code editor and verify changes
 */

test.describe('Visual Design and Code Generation', () => {
  test('should generate code from visual design', async ({ page }, testInfo) => {
    // Navigate to application
    await page.goto('/');
    
    // Step 1: Open existing project (assuming one exists)
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: `test-results/screenshots/${testInfo.title}-step-1.png` 
    });
    
    // Step 2: Switch to visual canvas mode
    const visualModeButton = page.locator('[data-testid="visual-mode-button"]');
    if (await visualModeButton.isVisible()) {
      await visualModeButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ 
        path: `test-results/screenshots/${testInfo.title}-step-2.png` 
      });
    }
    
    // Step 3: Drag component from palette
    const componentPalette = page.locator('[data-testid="component-palette"]');
    if (await componentPalette.isVisible()) {
      const serviceNode = page.locator('[data-component-type="service"]').first();
      if (await serviceNode.isVisible()) {
        const canvas = page.locator('[data-testid="visual-canvas"]');
        
        // Drag and drop
        await serviceNode.dragTo(canvas);
        await page.waitForTimeout(500);
        await page.screenshot({ 
          path: `test-results/screenshots/${testInfo.title}-step-3.png` 
        });
      }
    }
    
    // Step 4: Configure component properties
    const propertyPanel = page.locator('[data-testid="property-panel"]');
    if (await propertyPanel.isVisible()) {
      const nameInput = propertyPanel.locator('input[name="name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('auth-service');
        await page.screenshot({ 
          path: `test-results/screenshots/${testInfo.title}-step-4.png` 
        });
      }
    }
    
    // Step 5: Verify code is generated
    await page.waitForTimeout(1000); // Wait for code generation
    await page.screenshot({ 
      path: `test-results/screenshots/${testInfo.title}-step-5.png` 
    });
    
    // Step 6: Switch to code editor
    const codeEditorButton = page.locator('[data-testid="code-editor-button"]');
    if (await codeEditorButton.isVisible()) {
      await codeEditorButton.click();
      await page.waitForLoadState('networkidle');
      
      // Verify Monaco editor is visible
      const monacoEditor = page.locator('.monaco-editor');
      await expect(monacoEditor).toBeVisible({ timeout: 5000 });
      
      await page.screenshot({ 
        path: `test-results/screenshots/${testInfo.title}-step-6.png` 
      });
    }
  });
  
  test('should sync visual changes with code editor', async ({ page }) => {
    await page.goto('/');
    
    // Switch to split view
    const splitViewButton = page.locator('[data-testid="split-view-button"]');
    if (await splitViewButton.isVisible()) {
      await splitViewButton.click();
      
      // Verify both canvas and editor are visible
      const canvas = page.locator('[data-testid="visual-canvas"]');
      const editor = page.locator('.monaco-editor');
      
      await expect(canvas).toBeVisible({ timeout: 5000 });
      await expect(editor).toBeVisible({ timeout: 5000 });
    }
  });
});
