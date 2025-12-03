import { test, expect, Page, Browser } from '@playwright/test';
import { createTestProject, cleanupTestProject } from './helpers';

/**
 * E2E tests for real-time collaboration features
 * Tests multi-user scenarios with operational transformation
 */
test.describe('Collaboration Scenarios', () => {
  let browser1: Browser;
  let browser2: Browser;
  let page1: Page;
  let page2: Page;
  let projectPath: string;

  test.beforeEach(async ({ browser }) => {
    projectPath = await createTestProject('collaboration-test');
    
    // Create two browser contexts for two users
    browser1 = browser;
    browser2 = browser;
    
    const context1 = await browser1.newContext();
    const context2 = await browser2.newContext();
    
    page1 = await context1.newPage();
    page2 = await context2.newPage();
    
    // User 1 opens project
    await page1.goto('http://localhost:3000');
    await page1.click('[data-testid="open-project"]');
    await page1.fill('[data-testid="project-path"]', projectPath);
    await page1.click('[data-testid="confirm-open"]');
    await page1.waitForSelector('[data-testid="project-loaded"]');
    
    // User 2 joins the same project
    await page2.goto('http://localhost:3000');
    await page2.click('[data-testid="open-project"]');
    await page2.fill('[data-testid="project-path"]', projectPath);
    await page2.click('[data-testid="confirm-open"]');
    await page2.waitForSelector('[data-testid="project-loaded"]');
    
    // Enable collaboration
    await page1.click('[data-testid="collaboration-tab"]');
    await page1.click('[data-testid="start-collaboration"]');
    
    // User 2 should see collaboration active
    await expect(page2.locator('[data-testid="collaboration-active"]')).toBeVisible();
  });

  test.afterEach(async () => {
    await page1.close();
    await page2.close();
    await cleanupTestProject(projectPath);
  });

  test.describe('User Presence', () => {
    test('should show active users', async () => {
      // User 1 should see User 2 in active users list
      await expect(page1.locator('[data-testid="active-users"]')).toContainText('User 2');
      
      // User 2 should see User 1
      await expect(page2.locator('[data-testid="active-users"]')).toContainText('User 1');
    });

    test('should show user avatars', async () => {
      await expect(page1.locator('[data-testid="user-avatar-2"]')).toBeVisible();
      await expect(page2.locator('[data-testid="user-avatar-1"]')).toBeVisible();
    });

    test('should update when user leaves', async () => {
      // User 2 leaves
      await page2.close();
      
      // User 1 should see User 2 removed
      await expect(page1.locator('[data-testid="user-avatar-2"]')).not.toBeVisible();
    });
  });

  test.describe('Remote Cursors', () => {
    test('should show remote cursor position', async () => {
      // User 1 opens a file
      await page1.click('[data-testid="file-explorer"]');
      await page1.click('[data-testid="file-index.ts"]');
      
      // User 2 opens the same file
      await page2.click('[data-testid="file-explorer"]');
      await page2.click('[data-testid="file-index.ts"]');
      
      // User 2 moves cursor
      await page2.click('[data-testid="code-editor"]', { position: { x: 100, y: 50 } });
      
      // User 1 should see User 2's cursor
      await expect(page1.locator('[data-testid="remote-cursor-2"]')).toBeVisible();
    });

    test('should show cursor with user name', async () => {
      await page1.click('[data-testid="file-index.ts"]');
      await page2.click('[data-testid="file-index.ts"]');
      
      await page2.click('[data-testid="code-editor"]');
      
      // Hover over remote cursor
      await page1.hover('[data-testid="remote-cursor-2"]');
      
      // Should show user name tooltip
      await expect(page1.locator('[data-testid="cursor-tooltip"]')).toContainText('User 2');
    });

    test('should show selection highlights', async () => {
      await page1.click('[data-testid="file-index.ts"]');
      await page2.click('[data-testid="file-index.ts"]');
      
      // User 2 selects text
      await page2.click('[data-testid="code-editor"]');
      await page2.keyboard.down('Shift');
      await page2.keyboard.press('ArrowRight');
      await page2.keyboard.press('ArrowRight');
      await page2.keyboard.press('ArrowRight');
      await page2.keyboard.up('Shift');
      
      // User 1 should see selection highlight
      await expect(page1.locator('[data-testid="remote-selection-2"]')).toBeVisible();
    });
  });

  test.describe('Concurrent Editing', () => {
    test('should handle simultaneous edits in different files', async () => {
      // User 1 edits file1.ts
      await page1.click('[data-testid="file-file1.ts"]');
      await page1.fill('[data-testid="code-editor"]', 'const a = 1;');
      
      // User 2 edits file2.ts
      await page2.click('[data-testid="file-file2.ts"]');
      await page2.fill('[data-testid="code-editor"]', 'const b = 2;');
      
      // Both changes should be saved
      await page1.click('[data-testid="save"]');
      await page2.click('[data-testid="save"]');
      
      // Verify both files are updated
      await page1.click('[data-testid="file-file2.ts"]');
      await expect(page1.locator('[data-testid="code-editor"]')).toContainText('const b = 2;');
      
      await page2.click('[data-testid="file-file1.ts"]');
      await expect(page2.locator('[data-testid="code-editor"]')).toContainText('const a = 1;');
    });

    test('should merge concurrent edits in same file', async () => {
      // Both users open same file
      await page1.click('[data-testid="file-index.ts"]');
      await page2.click('[data-testid="file-index.ts"]');
      
      // User 1 adds line at top
      await page1.click('[data-testid="code-editor"]', { position: { x: 0, y: 0 } });
      await page1.keyboard.type('// User 1 comment\n');
      
      // User 2 adds line at bottom
      await page2.click('[data-testid="code-editor"]', { position: { x: 0, y: 100 } });
      await page2.keyboard.type('\n// User 2 comment');
      
      // Both changes should be merged
      await page1.waitForTimeout(1000); // Wait for sync
      
      // User 1 should see both changes
      await expect(page1.locator('[data-testid="code-editor"]')).toContainText('// User 1 comment');
      await expect(page1.locator('[data-testid="code-editor"]')).toContainText('// User 2 comment');
      
      // User 2 should see both changes
      await expect(page2.locator('[data-testid="code-editor"]')).toContainText('// User 1 comment');
      await expect(page2.locator('[data-testid="code-editor"]')).toContainText('// User 2 comment');
    });

    test('should handle conflict resolution', async () => {
      await page1.click('[data-testid="file-index.ts"]');
      await page2.click('[data-testid="file-index.ts"]');
      
      // Both users edit the same line
      await page1.click('[data-testid="code-editor"]', { position: { x: 0, y: 10 } });
      await page1.keyboard.type('const x = 1;');
      
      await page2.click('[data-testid="code-editor"]', { position: { x: 0, y: 10 } });
      await page2.keyboard.type('const x = 2;');
      
      // System should detect conflict
      await expect(page1.locator('[data-testid="conflict-detected"]')).toBeVisible();
      
      // User can resolve conflict
      await page1.click('[data-testid="resolve-conflict"]');
      await page1.click('[data-testid="keep-my-changes"]');
      
      // Conflict should be resolved
      await expect(page1.locator('[data-testid="conflict-resolved"]')).toBeVisible();
    });
  });

  test.describe('Comments and Annotations', () => {
    test('should add inline comment', async () => {
      await page1.click('[data-testid="file-index.ts"]');
      
      // Select code
      await page1.click('[data-testid="code-editor"]', { position: { x: 50, y: 20 } });
      
      // Add comment
      await page1.click('[data-testid="add-comment"]');
      await page1.fill('[data-testid="comment-text"]', 'This needs refactoring');
      await page1.click('[data-testid="post-comment"]');
      
      // User 2 should see the comment
      await page2.click('[data-testid="file-index.ts"]');
      await expect(page2.locator('[data-testid="comment-indicator"]')).toBeVisible();
      
      // Click to view comment
      await page2.click('[data-testid="comment-indicator"]');
      await expect(page2.locator('[data-testid="comment-thread"]')).toContainText('This needs refactoring');
    });

    test('should reply to comment', async () => {
      // User 1 adds comment
      await page1.click('[data-testid="file-index.ts"]');
      await page1.click('[data-testid="add-comment"]');
      await page1.fill('[data-testid="comment-text"]', 'Original comment');
      await page1.click('[data-testid="post-comment"]');
      
      // User 2 replies
      await page2.click('[data-testid="file-index.ts"]');
      await page2.click('[data-testid="comment-indicator"]');
      await page2.fill('[data-testid="reply-text"]', 'I agree');
      await page2.click('[data-testid="post-reply"]');
      
      // User 1 should see reply
      await page1.click('[data-testid="comment-indicator"]');
      await expect(page1.locator('[data-testid="comment-thread"]')).toContainText('I agree');
    });

    test('should mention user with @', async () => {
      await page1.click('[data-testid="file-index.ts"]');
      await page1.click('[data-testid="add-comment"]');
      await page1.fill('[data-testid="comment-text"]', '@User2 please review this');
      await page1.click('[data-testid="post-comment"]');
      
      // User 2 should receive notification
      await expect(page2.locator('[data-testid="notification"]')).toContainText('User 1 mentioned you');
    });

    test('should resolve comment thread', async () => {
      // Add comment
      await page1.click('[data-testid="file-index.ts"]');
      await page1.click('[data-testid="add-comment"]');
      await page1.fill('[data-testid="comment-text"]', 'Fix this bug');
      await page1.click('[data-testid="post-comment"]');
      
      // Resolve comment
      await page1.click('[data-testid="comment-indicator"]');
      await page1.click('[data-testid="resolve-comment"]');
      
      // Comment should be marked as resolved
      await expect(page1.locator('[data-testid="comment-resolved"]')).toBeVisible();
      
      // User 2 should see resolved status
      await page2.click('[data-testid="file-index.ts"]');
      await expect(page2.locator('[data-testid="comment-resolved"]')).toBeVisible();
    });
  });

  test.describe('Canvas Annotations', () => {
    test('should add annotation to canvas component', async () => {
      // Switch to canvas view
      await page1.click('[data-testid="canvas-tab"]');
      
      // Select component
      await page1.click('[data-testid="canvas-component-1"]');
      
      // Add annotation
      await page1.click('[data-testid="add-annotation"]');
      await page1.fill('[data-testid="annotation-text"]', 'Update this component');
      await page1.click('[data-testid="save-annotation"]');
      
      // User 2 should see annotation
      await page2.click('[data-testid="canvas-tab"]');
      await expect(page2.locator('[data-testid="annotation-indicator"]')).toBeVisible();
    });
  });

  test.describe('Version History', () => {
    test('should track changes with user attribution', async () => {
      // User 1 makes change
      await page1.click('[data-testid="file-index.ts"]');
      await page1.fill('[data-testid="code-editor"]', 'const v1 = 1;');
      await page1.click('[data-testid="save"]');
      
      // User 2 makes change
      await page2.click('[data-testid="file-index.ts"]');
      await page2.fill('[data-testid="code-editor"]', 'const v2 = 2;');
      await page2.click('[data-testid="save"]');
      
      // View history
      await page1.click('[data-testid="version-history"]');
      
      // Should show both changes with user names
      await expect(page1.locator('[data-testid="history-entry-1"]')).toContainText('User 1');
      await expect(page1.locator('[data-testid="history-entry-2"]')).toContainText('User 2');
    });

    test('should revert to previous version', async () => {
      // User 1 makes change
      await page1.click('[data-testid="file-index.ts"]');
      await page1.fill('[data-testid="code-editor"]', 'const original = 1;');
      await page1.click('[data-testid="save"]');
      
      // User 2 makes change
      await page2.click('[data-testid="file-index.ts"]');
      await page2.fill('[data-testid="code-editor"]', 'const modified = 2;');
      await page2.click('[data-testid="save"]');
      
      // User 1 reverts to original
      await page1.click('[data-testid="version-history"]');
      await page1.click('[data-testid="revert-to-v1"]');
      await page1.click('[data-testid="confirm-revert"]');
      
      // Both users should see reverted content
      await expect(page1.locator('[data-testid="code-editor"]')).toContainText('const original = 1;');
      await page2.waitForTimeout(1000); // Wait for sync
      await expect(page2.locator('[data-testid="code-editor"]')).toContainText('const original = 1;');
    });
  });

  test.describe('Collaboration Performance', () => {
    test('should sync changes within 2 seconds', async () => {
      await page1.click('[data-testid="file-index.ts"]');
      await page2.click('[data-testid="file-index.ts"]');
      
      const startTime = Date.now();
      
      // User 1 makes change
      await page1.fill('[data-testid="code-editor"]', 'const test = 1;');
      
      // Wait for User 2 to see change
      await expect(page2.locator('[data-testid="code-editor"]')).toContainText('const test = 1;');
      
      const endTime = Date.now();
      const syncTime = endTime - startTime;
      
      // Should sync within 2 seconds
      expect(syncTime).toBeLessThan(2000);
    });

    test('should handle rapid typing', async () => {
      await page1.click('[data-testid="file-index.ts"]');
      await page2.click('[data-testid="file-index.ts"]');
      
      // User 1 types rapidly
      const text = 'This is a test of rapid typing to verify operational transformation';
      await page1.click('[data-testid="code-editor"]');
      await page1.keyboard.type(text, { delay: 10 }); // Fast typing
      
      // User 2 should eventually see all text
      await expect(page2.locator('[data-testid="code-editor"]')).toContainText(text, {
        timeout: 5000,
      });
    });
  });
});
