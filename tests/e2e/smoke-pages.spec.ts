import { test, expect } from '@playwright/test'

const pages = [
  '/features/maker-lab',
  '/features/design-studio',
]

for (const p of pages) {
  test(`smoke: ${p}`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}${p}`)
    await expect(page.locator('h1')).toBeVisible()
  })
}
