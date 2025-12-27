import { test, expect } from '@playwright/test'

test.describe('Innovation Theater', () => {
  test('next and reset changes slides', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/features/innovation-theater`)

    const slideText = page.locator('p', { hasText: 'Slide' }).first()
    await expect(slideText).toBeVisible()

    await page.click('button:has-text("Next")')
    await expect(page.locator('p', { hasText: 'Slide 2' })).toBeVisible()

    await page.click('button:has-text("Reset Slides")')
    await expect(page.locator('p', { hasText: 'Slide 1' })).toBeVisible()
  })
})
