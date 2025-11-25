import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Accessibility Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Inject axe-core
    await injectAxe(page);
  });

  test('should have no accessibility violations on home page', async ({ page }) => {
    // Check accessibility
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('should have no critical accessibility violations', async ({ page }) => {
    // Check only for critical violations
    await checkA11y(page, undefined, {
      includedImpacts: ['critical'],
    });
  });

  test('should have accessible form elements', async ({ page }) => {
    // Navigate to a page with forms
    await page.goto('http://localhost:3000/form');
    
    // Check form accessibility
    await checkA11y(page, 'form', {
      rules: {
        'label': { enabled: true },
        'input-button-name': { enabled: true },
        'select-name': { enabled: true },
      },
    });
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check navigation accessibility
    await checkA11y(page, 'nav', {
      rules: {
        'link-name': { enabled: true },
        'landmark-one-main': { enabled: true },
      },
    });
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check color contrast
    await checkA11y(page, undefined, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
  });

  test('should have accessible images', async ({ page }) => {
    // Check image accessibility
    await checkA11y(page, undefined, {
      rules: {
        'image-alt': { enabled: true },
      },
    });
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check heading structure
    await checkA11y(page, undefined, {
      rules: {
        'heading-order': { enabled: true },
        'page-has-heading-one': { enabled: true },
      },
    });
  });

  test('should have keyboard accessible interactive elements', async ({ page }) => {
    // Check keyboard accessibility
    await checkA11y(page, undefined, {
      rules: {
        'button-name': { enabled: true },
        'tabindex': { enabled: true },
        'scrollable-region-focusable': { enabled: true },
      },
    });
  });

  test('should have ARIA attributes used correctly', async ({ page }) => {
    // Check ARIA usage
    await checkA11y(page, undefined, {
      rules: {
        'aria-required-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'aria-valid-attr': { enabled: true },
      },
    });
  });

  test('should have accessible modal dialogs', async ({ page }) => {
    // Open a modal if exists
    const modalButton = page.locator('[aria-haspopup="dialog"]').first();
    
    if (await modalButton.isVisible()) {
      await modalButton.click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Check modal accessibility
      await checkA11y(page, '[role="dialog"]', {
        rules: {
          'aria-required-attr': { enabled: true },
          'focus-order-semantics': { enabled: true },
        },
      });
    }
  });

  test('should generate accessibility report', async ({ page }) => {
    // This test demonstrates how to get detailed violation information
    await injectAxe(page);
    
    const results = await page.evaluate(() => {
      return (window as any).axe.run();
    });
    
    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility Violations Found:');
      results.violations.forEach((violation: any) => {
        console.log(`\n${violation.impact.toUpperCase()}: ${violation.help}`);
        console.log(`  Rule: ${violation.id}`);
        console.log(`  Description: ${violation.description}`);
        console.log(`  Help URL: ${violation.helpUrl}`);
        console.log(`  Affected elements: ${violation.nodes.length}`);
        
        violation.nodes.forEach((node: any, index: number) => {
          console.log(`\n  Element ${index + 1}:`);
          console.log(`    HTML: ${node.html}`);
          console.log(`    Target: ${node.target.join(', ')}`);
          console.log(`    Failure: ${node.failureSummary}`);
        });
      });
    }
    
    // Assert no violations
    expect(results.violations).toHaveLength(0);
  });
});

test.describe('Accessibility Verification with Options', () => {
  test('should block on critical violations only', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await injectAxe(page);
    
    const results = await page.evaluate(() => {
      return (window as any).axe.run();
    });
    
    const criticalViolations = results.violations.filter(
      (v: any) => v.impact === 'critical'
    );
    
    expect(criticalViolations).toHaveLength(0);
  });

  test('should exclude specific rules', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await injectAxe(page);
    
    const results = await page.evaluate(() => {
      return (window as any).axe.run({
        rules: {
          'color-contrast': { enabled: false },
        },
      });
    });
    
    const colorContrastViolations = results.violations.filter(
      (v: any) => v.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toHaveLength(0);
  });

  test('should check specific WCAG level', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await injectAxe(page);
    
    // Check WCAG 2.1 Level AA compliance
    const results = await page.evaluate(() => {
      return (window as any).axe.run({
        runOnly: {
          type: 'tag',
          values: ['wcag2aa', 'wcag21aa'],
        },
      });
    });
    
    expect(results.violations).toHaveLength(0);
  });
});

test.describe('Accessibility Fix Verification', () => {
  test('should verify fixes for common issues', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await injectAxe(page);
    
    const results = await page.evaluate(() => {
      return (window as any).axe.run();
    });
    
    // If violations exist, provide fix suggestions
    if (results.violations.length > 0) {
      console.log('\nFix Suggestions:');
      
      results.violations.forEach((violation: any) => {
        console.log(`\n${violation.id}:`);
        
        // Common fix suggestions
        const fixes: Record<string, string[]> = {
          'image-alt': [
            'Add alt attribute to images',
            'Use alt="" for decorative images',
          ],
          'color-contrast': [
            'Increase contrast ratio to at least 4.5:1',
            'Use darker text or lighter background',
          ],
          'label': [
            'Add <label> element for form inputs',
            'Use aria-label for custom controls',
          ],
          'button-name': [
            'Add text content to buttons',
            'Use aria-label for icon buttons',
          ],
        };
        
        if (fixes[violation.id]) {
          fixes[violation.id].forEach((fix: string) => {
            console.log(`  - ${fix}`);
          });
        }
      });
    }
  });
});
