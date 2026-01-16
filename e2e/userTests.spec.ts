import { test, expect,Response } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('http://localhost:5173/auth');

    // Fill login form
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('playUser');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');

    // Click login
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for navigation to home page
    await page.waitForURL('http://localhost:5173/');
});

test('Create item', async ({ page }) => {
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'My Clippings' }).click();
    await page.getByRole('button', { name: '+ Create New' }).click();
    await page.getByRole('textbox', { name: 'Title *' }).click();
    const uniqe = Date.now();
    await page.getByRole('textbox', { name: 'Title *' }).fill(`test item${uniqe}`);
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('10');
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).click();
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).fill('Some test');
    await page.getByRole('button', { name: 'Create Item' }).click();
    await expect(page.getByRole('status').filter({ hasText: "Item created successfully! 🎉" })).toBeVisible;
});

test('Change avatar', async ({ page }) => {
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'Settings' }).click();
    //await page.getByRole('button', { name: 'Browse Files' }).click();
    const fileInput = page.locator('.card input[type="file"]');
    fileInput.setInputFiles('/home/amori/Pictures/Adrian_Monk.webp');

    const avatarPromice = page.waitForResponse(response => response.url().includes("/api/user/avatar/"));
    await page.getByRole('button', { name: 'Confirm' }).click();
    const response = await avatarPromice;
    expect(response.status()).toBe(201);

    
    await page.getByRole('img', { name: 'small' }).click();
});