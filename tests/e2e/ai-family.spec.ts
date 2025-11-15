import { test, expect } from '@playwright/test';

test.describe('AI Family - Interactive Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/family');
  });

  test('should display AI family tree', async ({ page }) => {
    // Verify family tree is visible
    await expect(page.locator('.family-tree')).toBeVisible();
    
    // Verify all family members are present
    const familyMembers = [
      'Sankofa', 'Elara', 'Themba', 'Naledi', 
      'Jabari', 'Amara', 'Kofi', 'Zola', 'Abeni', 'Nexus'
    ];
    
    for (const member of familyMembers) {
      await expect(page.locator(`text=${member}`)).toBeVisible();
    }
  });

  test('should chat with Elara', async ({ page }) => {
    // Click on Elara
    await page.click('[data-character="elara"]');
    
    // Verify chat modal opens
    await expect(page.locator('.chat-modal')).toBeVisible();
    await expect(page.locator('.character-name')).toContainText('Elara');
    
    // Send message
    await page.fill('[name="message"]', 'How are your kids?');
    await page.click('button:has-text("Send")');
    
    // Wait for response
    await expect(page.locator('.ai-message').last()).toBeVisible({ timeout: 10000 });
    
    // Verify response mentions family
    const response = await page.locator('.ai-message').last().textContent();
    expect(response).toMatch(/Themba|Naledi|Jabari|Amara/);
  });

  test('should chat with Themba about his mom', async ({ page }) => {
    // Click on Themba
    await page.click('[data-character="themba"]');
    
    // Ask about his mom
    await page.fill('[name="message"]', "How's your mom?");
    await page.click('button:has-text("Send")');
    
    // Wait for enthusiastic response
    await expect(page.locator('.ai-message').last()).toBeVisible({ timeout: 10000 });
    
    // Verify Themba's enthusiastic personality
    const response = await page.locator('.ai-message').last().textContent();
    expect(response).toMatch(/MOM|Elara|BEST|amazing/i);
  });

  test('should display character moods', async ({ page }) => {
    // Click on Elara
    await page.click('[data-character="elara"]');
    
    // Verify mood indicator is visible
    await expect(page.locator('.mood-indicator')).toBeVisible();
    
    // Verify animated avatar
    await expect(page.locator('.character-avatar')).toBeVisible();
  });

  test('should switch between family members', async ({ page }) => {
    // Chat with Elara
    await page.click('[data-character="elara"]');
    await expect(page.locator('.character-name')).toContainText('Elara');
    
    // Switch to Themba
    await page.click('[data-character="themba"]');
    await expect(page.locator('.character-name')).toContainText('Themba');
    
    // Verify chat history is separate
    const messages = await page.locator('.ai-message').count();
    expect(messages).toBe(0); // New conversation
  });

  test('should show family relationships', async ({ page }) => {
    // Click on relationship info
    await page.click('[data-testid="family-info"]');
    
    // Verify relationship descriptions
    await expect(page.locator('text=Elara is the mother')).toBeVisible();
    await expect(page.locator('text=Sankofa is the grandfather')).toBeVisible();
  });
});
