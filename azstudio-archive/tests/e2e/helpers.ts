import { Page, expect } from '@playwright/test';

/**
 * Common helper functions for E2E tests
 */

export class E2EHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for AzStudio to be fully loaded
   */
  async waitForAppReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveTitle(/AzStudio/);
  }

  /**
   * Open a project by name
   */
  async openProject(projectName: string): Promise<void> {
    const openButton = this.page.locator('button:has-text("Open Project")');
    if (await openButton.isVisible()) {
      await openButton.click();
      
      const projectItem = this.page.locator(`[data-project-name="${projectName}"]`);
      if (await projectItem.isVisible()) {
        await projectItem.click();
      }
    }
  }

  /**
   * Switch between view modes
   */
  async switchViewMode(mode: 'visual' | 'code' | 'split'): Promise<void> {
    const button = this.page.locator(`[data-testid="${mode}-mode-button"]`);
    if (await button.isVisible()) {
      await button.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Open file in editor
   */
  async openFile(filePath: string): Promise<void> {
    const fileExplorer = this.page.locator('[data-testid="file-explorer"]');
    if (await fileExplorer.isVisible()) {
      const file = fileExplorer.locator(`[data-file-path="${filePath}"]`);
      if (await file.isVisible()) {
        await file.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  /**
   * Drag component from palette to canvas
   */
  async dragComponentToCanvas(componentType: string, x: number = 100, y: number = 100): Promise<void> {
    const component = this.page.locator(`[data-component-type="${componentType}"]`).first();
    const canvas = this.page.locator('[data-testid="visual-canvas"]');
    
    if (await component.isVisible() && await canvas.isVisible()) {
      const canvasBox = await canvas.boundingBox();
      if (canvasBox) {
        await component.dragTo(canvas, {
          targetPosition: { x, y }
        });
        await this.page.waitForTimeout(500);
      }
    }
  }

  /**
   * Set component property
   */
  async setComponentProperty(propertyName: string, value: string): Promise<void> {
    const propertyPanel = this.page.locator('[data-testid="property-panel"]');
    if (await propertyPanel.isVisible()) {
      const input = propertyPanel.locator(`input[name="${propertyName}"]`);
      if (await input.isVisible()) {
        await input.fill(value);
      }
    }
  }

  /**
   * Save current file
   */
  async saveFile(): Promise<void> {
    await this.page.keyboard.press('Control+S');
    await this.page.waitForTimeout(500);
  }

  /**
   * Run verification tests
   */
  async runVerification(): Promise<void> {
    const verifyButton = this.page.locator('button:has-text("Verify")');
    if (await verifyButton.isVisible()) {
      await verifyButton.click();
      
      // Wait for verification to complete
      await this.page.waitForSelector('[data-testid="verification-results"]', {
        timeout: 60000
      });
    }
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<string> {
    const timestamp = Date.now();
    const path = `test-results/screenshots/${name}-${timestamp}.png`;
    await this.page.screenshot({ path, fullPage: true });
    return path;
  }

  /**
   * Wait for AI operation to complete
   */
  async waitForAIOperation(): Promise<void> {
    // Wait for loading indicator to appear and disappear
    const loadingIndicator = this.page.locator('[data-testid="ai-loading"]');
    
    try {
      await loadingIndicator.waitFor({ state: 'visible', timeout: 2000 });
      await loadingIndicator.waitFor({ state: 'hidden', timeout: 60000 });
    } catch {
      // Loading indicator might not appear for fast operations
    }
  }

  /**
   * Check for error messages
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorAlert = this.page.locator('[role="alert"]');
    return await errorAlert.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    const errorAlert = this.page.locator('[role="alert"]');
    if (await errorAlert.isVisible()) {
      return await errorAlert.textContent() || '';
    }
    return '';
  }

  /**
   * Clear all notifications
   */
  async clearNotifications(): Promise<void> {
    const closeButtons = this.page.locator('[data-testid="notification-close"]');
    const count = await closeButtons.count();
    
    for (let i = 0; i < count; i++) {
      await closeButtons.nth(i).click();
    }
  }

  /**
   * Wait for file to be saved
   */
  async waitForFileSaved(fileName: string): Promise<void> {
    // Wait for save indicator to disappear
    const saveIndicator = this.page.locator(`[data-file="${fileName}"][data-unsaved="true"]`);
    await saveIndicator.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

/**
 * Create helper instance for a page
 */
export function createHelpers(page: Page): E2EHelpers {
  return new E2EHelpers(page);
}
