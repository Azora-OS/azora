import { test, expect } from '@playwright/test'

test.describe('Deep Focus', () => {
  test('start button begins timer', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/features/deep-focus`)

    // target the large timer display specifically
    const timer = page.locator('div.text-6xl')
    await expect(timer).toBeVisible()
    const before = await timer.textContent()

    await page.click('button:has-text("Start 25m")')
    // wait a couple seconds to allow timer to tick
    await page.waitForTimeout(1200)

    const after = await timer.textContent()
    expect(after).not.toBe(before)
  })
})
