import { test, expect } from '@playwright/test';

// Configuration for different apps
// In a real CI environment, these would be set via environment variables
const SAPIENS_URL = process.env.SAPIENS_URL || 'http://localhost:3000';
const JOBSPACES_URL = process.env.JOBSPACES_URL || 'http://localhost:3001';
const PAY_URL = process.env.PAY_URL || 'http://localhost:3002';

test.describe('Agent 07 Critical Flows', () => {

    test.describe('Azora Sapiens', () => {
        test('should allow a user to enroll in a course', async ({ page }) => {
            // 1. Navigate to a course page
            await page.goto(`${SAPIENS_URL}/courses/1`);

            // 2. Check if course details are visible
            await expect(page.locator('h1')).toBeVisible();

            // 3. Click Enroll button
            const enrollButton = page.getByRole('button', { name: /Enroll Now/i });
            if (await enrollButton.isVisible()) {
                await enrollButton.click();

                // 4. Verify enrollment success (mocked alert or redirect)
                // Since we mocked it with an alert, we might need to handle the dialog
                page.on('dialog', dialog => dialog.accept());

                // 5. Verify redirect to dashboard or state change
                // In our implementation, it redirects to /dashboard
                await expect(page).toHaveURL(/.*dashboard/);
            } else {
                // If already enrolled, check for progress bar
                await expect(page.getByText('Your Progress')).toBeVisible();
            }
        });
    });

    test.describe('Azora Pay', () => {
        test('should display wallet balance and transactions', async ({ page }) => {
            await page.goto(PAY_URL);

            // 1. Check Wallet Card
            await expect(page.getByText('Total Balance')).toBeVisible();
            await expect(page.getByText('AZR')).toBeVisible();

            // 2. Check Action Buttons
            await expect(page.getByRole('button', { name: /Top Up/i })).toBeVisible();
            await expect(page.getByRole('button', { name: /Send/i })).toBeVisible();

            // 3. Check Transaction List
            await expect(page.getByText('Recent Transactions')).toBeVisible();
            // Verify at least one transaction is visible
            await expect(page.locator('.text-green-400').first()).toBeVisible();
        });
    });

    test.describe('Azora Jobspaces', () => {
        test('should allow a user to apply for a job', async ({ page }) => {
            // 1. Navigate to a job details page
            await page.goto(`${JOBSPACES_URL}/jobs/1`);

            // 2. Open Application Modal
            await page.getByRole('button', { name: /Apply Now/i }).click();
            await expect(page.getByText('Apply for')).toBeVisible();

            // 3. Fill out the form
            await page.getByPlaceholder('John Doe').fill('Test User');
            await page.getByPlaceholder('john@example.com').fill('test@example.com');
            await page.getByPlaceholder('Tell us why').fill('I am a great fit!');

            // 4. Submit
            await page.getByRole('button', { name: /Submit Application/i }).click();

            // 5. Verify Success Message
            await expect(page.getByText('Application Sent!')).toBeVisible();

            // 6. Verify Redirect to Applications
            await expect(page).toHaveURL(/.*applications/);
        });
    });

});
