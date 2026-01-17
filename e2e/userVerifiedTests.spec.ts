import { test, expect, Response } from '@playwright/test';

const username = "playVerif";
const password = "12345678";

/* //NOTE this here will make ALL tests in the file to do independant logins. if you wish to use this then make sure that all tests have the {page} uncommented
test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('http://localhost:5173/auth/');

    // Fill login form
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(`${username}`);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(`${password}`);

    // Click login
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for navigation to home page
    await page.waitForURL('http://localhost:5173/');
});

*/

let page;

test.beforeAll(async ({browser})=>{
    const context = await browser.newContext();

    page = await context.newPage();

    await page.goto('http://localhost:5173/auth/');

    // Fill login form
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(`${username}`);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(`${password}`);

    // Click login
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for navigation to home page
    await page.waitForURL('/');

});

test.beforeEach(async ()=>{
    await page.goto("/");
})

test("Verified seller side menu",async (/*{page}*/) => {
    await page.getByTestId("side_menu_button").click();
    
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    
    await expect(page.getByRole('link', { name: 'My Clippings' })).toBeVisible();
    
    await expect(page.getByRole('link', { name: 'My analitics' })).toBeVisible();
    
    await expect(page.getByRole('link', { name: 'Reviews' })).toBeVisible();
    
    await expect(page.getByRole('link', { name: 'Shop Socials' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();

    
})


test("Add social", async (/*{page}*/) => {
    await page.getByTestId("side_menu_button").click();
    await expect(page.getByRole('link', { name: 'Shop Socials' })).toBeVisible();
    await page.getByRole('link', { name: 'Shop Socials' }).click();

    await page.locator('input[name="email"]').click();
    await page.locator('input[name="email"]').fill('testEmail@gm.com');

    await page.getByRole('button', { name: 'Apply changes' }).click();

    await page.getByTestId("side_menu_button").click();
    await page.getByRole('link', { name: 'Home' }).click();
    await page.waitForURL("/");
    await page.getByTestId("side_menu_button").click();
    await expect(page.getByRole('link', { name: 'Shop Socials' })).toBeVisible();
    await page.getByRole('link', { name: 'Shop Socials' }).click();
    await expect(page.locator('input[name="email"]'), "The social was not added, or addded incorectly").toHaveValue('testEmail@gm.com');
})

test("Update social", async (/*{page}*/) => {
    const uniqe = Date.now();


    await page.getByTestId("side_menu_button").click();
await expect(page.getByRole('link', { name: 'Shop Socials' })).toBeVisible();
    await page.getByRole('link', { name: 'Shop Socials' }).click();
    const previous = page.locator('input[name="youTube"]');
    await expect(previous, 'Needs to be filled before the test').not.toBeEmpty();
    const prevVal = await previous.inputValue();


    await page.getByRole('textbox', { name: 'https://www.youtube.com/@' }).fill(`https://www.youtube.com/@${uniqe}`);
    await page.getByRole('button', { name: 'Apply changes' }).click();
    await page.getByTestId("side_menu_button").click();
    await page.getByRole('link', { name: 'Home' }).click();
    await page.waitForURL("/");
    await page.getByTestId("side_menu_button").click();
    await page.getByRole('link', { name: 'Shop Socials' }).click();
    await expect(page.locator('input[name="youTube"]')).toHaveValue(`https://www.youtube.com/@${uniqe}`);
})

test("Remove social", async (/*{page}*/) => {
    await page.getByTestId("side_menu_button").click();
await expect(page.getByRole('link', { name: 'Shop Socials' })).toBeVisible();
    await page.getByRole('link', { name: 'Shop Socials' }).click();
    await expect(page.getByRole('textbox', { name: 'testEmail@gm.com' }), 'field should be already filled but isnt').toBeVisible();

    await page.getByRole('textbox', { name: 'testEmail@gm.com' }).fill('');
    await page.getByRole('button', { name: 'Apply changes' }).click();
    await page.getByTestId("side_menu_button").click();
    await page.getByRole('link', { name: 'Home' }).click();
    await page.waitForURL("/");
    await page.getByTestId("side_menu_button").click();
    
    await page.getByRole('link', { name: 'Shop Socials' }).click();
    await expect(page.locator('input[name="email"]'), "The social was not removed").toBeEmpty();
})


test("Social appears in page", async (/*{page}*/) => {
    await page.goto(`/account/${username}`);
    await page.getByRole('button', { name: 'Shop Socials' }).click();
    await expect(page.locator('.relative.flex').first()).toHaveText("YOUTUBE");
})