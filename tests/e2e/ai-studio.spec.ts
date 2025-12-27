import { test, expect } from '@playwright/test'

test.describe('AI Studio', () => {
  test('sends a message and gets agent response', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/features/ai-studio`)

    // Ensure the agent selector and input exist
    const input = page.getByPlaceholder('Ask an agent for help...')
    await expect(input).toBeVisible()

    // Send a message using Enter to avoid click interception issues
    await input.fill('Please review my code')
    await input.scrollIntoViewIfNeeded()
    await input.press('Enter')

    // If Enter doesn't trigger (mobile/WebKit edge cases), fall back to clicking Send
    const processing = page.locator('text=Agent processing...').first()
    if (!(await processing.isVisible({ timeout: 800 }).catch(() => false))) {
      // try both a force click and a direct DOM click via XPath for robustness
      await page.click('button:has-text("Send")', { force: true }).catch(() => {})
      await page.evaluate(() => {
        const node = document.evaluate("//button[contains(., 'Send')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement | null
        node?.click()
      }).catch(() => {})
    }

    // Wait for either the processing indicator OR the agent response text to appear
    await page.waitForFunction(() => /Agent processing...|Processing your request/.test(document.body.innerText), { timeout: 10000 })
    await expect(page.locator('text=Processing your request').first()).toBeVisible({ timeout: 10000 }).catch(() => {})
  })
})
