import { test, expect,Response,Page } from '@playwright/test';
import * as os from 'os';
import * as path from 'path';

const username = "playUser";
const password = "12345678";

const normalTestPage = "test3"; //used in test ['Check out normal page']
const verifiedTestPage = "playVerif"; //used in test ['Check out verified page']

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

let page: Page;

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

test('Normal user side menu', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('button').first().click();

    await expect(page.getByRole('link', { name: 'My Clippings' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Interest Offers' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'My Offers' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
});

test('Create item[1] non negotiable not infinite', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'My Clippings' }).click();
    await page.getByRole('button', { name: '+ Create New' }).click();
    await page.getByRole('textbox', { name: 'Title *' }).click();
    const uniqe = Date.now();
    await page.getByRole('textbox', { name: 'Title *' }).fill(`test${'nNeg-nInf'} item${uniqe}`);
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('10');
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).click();
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).fill('Some test');

    const createResponsePromise = page.waitForResponse(resp => resp.url().includes ("/api/item/my-clippings/create/"))

    await page.getByRole('button', { name: 'Create Item' }).click();
    const createResponse = await createResponsePromise
    await expect(createResponse.status()).toBe(201);
    await expect(page.getByRole('status').filter({ hasText: "Item created successfully! 🎉" })).toBeVisible;
});

test('Create item[2] negotiable not infinite', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'My Clippings' }).click();
    await page.getByRole('button', { name: '+ Create New' }).click();
    await page.getByRole('textbox', { name: 'Title *' }).click();
    const uniqe = Date.now();
    await page.getByRole('textbox', { name: 'Title *' }).fill(`test${'yNeg-nInf'} item${uniqe}`);
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('10');
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).click();
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).fill('Some test');

    await page.getByRole('checkbox', { name: 'Price is negotiable Allow' }).check();

    const createResponsePromise = page.waitForResponse(resp => resp.url().includes("/api/item/my-clippings/create/"))

    await page.getByRole('button', { name: 'Create Item' }).click();
    const createResponse = await createResponsePromise
    await expect(createResponse.status()).toBe(201);
    await expect(page.getByRole('status').filter({ hasText: "Item created successfully! 🎉" })).toBeVisible;
});

test('Create item[3] not negotiable infinite', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'My Clippings' }).click();
    await page.getByRole('button', { name: '+ Create New' }).click();
    await page.getByRole('textbox', { name: 'Title *' }).click();
    const uniqe = Date.now();
    await page.getByRole('textbox', { name: 'Title *' }).fill(`test${'nNeg-yInf'} item${uniqe}`);
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('10');
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).click();
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).fill('Some test');


    await page.getByRole('checkbox', { name: 'Infinite Stock Item is always' }).check();

    const createResponsePromise = page.waitForResponse(resp => resp.url().includes("/api/item/my-clippings/create/"))

    await page.getByRole('button', { name: 'Create Item' }).click();
    const createResponse = await createResponsePromise
    await expect(createResponse.status()).toBe(201);
    await expect(page.getByRole('status').filter({ hasText: "Item created successfully! 🎉" })).toBeVisible;
});

test('Create item[4] negotiable infinite', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'My Clippings' }).click();
    await page.getByRole('button', { name: '+ Create New' }).click();
    await page.getByRole('textbox', { name: 'Title *' }).click();
    const uniqe = Date.now();
    await page.getByRole('textbox', { name: 'Title *' }).fill(`test${'yNeg-yInf'} item${uniqe}`);
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('10');
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).click();
    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).fill('Some test');


    await page.getByRole('checkbox', { name: 'Infinite Stock Item is always' }).check();
    await page.getByRole('checkbox', { name: 'Price is negotiable Allow' }).check();

    const createResponsePromise = page.waitForResponse(resp => resp.url().includes("/api/item/my-clippings/create/"))

    await page.getByRole('button', { name: 'Create Item' }).click();
    const createResponse = await createResponsePromise
    await expect(createResponse.status()).toBe(201);
    await expect(page.getByRole('status').filter({ hasText: "Item created successfully! 🎉" })).toBeVisible;
});

test('Edit item[1] non negotiable not infinite', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'My Clippings' }).click();
    await page.getByRole('button', { name: 'Thumbnail testnNeg-nInf' }).click();
    await page.getByRole('button', { name: 'close' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('textbox', { name: 'Title *' }).click();
    await page.getByRole('textbox', { name: 'Title *' }).fill(`test${'edited'} item`);
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('69');
    await page.getByRole('spinbutton', { name: 'Stock Quantity' }).click();
    await page.getByRole('spinbutton', { name: 'Stock Quantity' }).fill('10');
    await page.getByRole('textbox', { name: 'Description *' }).click();
    await page.getByRole('textbox', { name: 'Description *' }).fill('Some edited test');

    const editResponsePromise = page.waitForResponse(resp => resp.url().includes("/api/item/") && resp.request().method() === "PUT")
    await page.getByRole('button', { name: 'Update Listing' }).click();
    const editResponse = await editResponsePromise;
    await expect(editResponse.status()).toBe(200);
    await expect(page.getByRole('status').filter({ hasText: "Item updated successfully! 🎉" })).toBeVisible;
});


test('Delete item[1]', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'My Clippings' }).click();
    await page.getByRole('button', { name: 'Thumbnail testedited item' }).click();
    await page.getByRole('button', { name: 'close' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'Delete Listing' }).click();
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Delete Listing' }).click();

});



// NOTE for this test to work you need to have an image in Pictures named Adrian_Monk.webp
test('Set avatar', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'Settings' }).click();
    //await page.getByRole('button', { name: 'Browse Files' }).click();
    const fileInput = page.locator('.card input[type="file"]');
    fileInput.setInputFiles(path.join(os.homedir(), 'Pictures', 'Adrian_Monk.webp'));

    const avatarPromice = page.waitForResponse(response => response.url().includes("/api/user/avatar/"));
    await page.getByRole('button', { name: 'Confirm' }).click();
    const response = await avatarPromice;
    expect(response.status()).toBe(201);

    
    await page.getByRole('img', { name: 'small' }).click();
});

test('Delete avatar', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('button').first().click();
    await page.getByRole('link', { name: 'Settings' }).click();

    const avatarPromice = page.waitForResponse(response => response.url().includes("/api/user/avatar/"));
    await page.getByRole('button', { name: 'Delete' }).first().click();
    const response = await avatarPromice;
    expect(response.status()).toBe(200);


    await expect(page.getByRole('img', { name: 'small' })).toHaveCount(0);
    await expect(page.getByRole('button').nth(4)).toHaveCount(1);
});

// NOTE : remove skipping when item deletion is made

test.skip('Member Create Items English', async (/*{ page }*/) => {
    for(let i = 0; i < 5; i++) {
        await page.goto('/');
        await page.getByTestId('side_menu_button').click();
        await page.getByRole('link', { name: 'My Clippings' }).click();
        await page.getByRole('button', { name: '+ Create New' }).click();
        await page.getByRole('textbox', { name: 'Title *' }).click();
        await page.getByRole('textbox', { name: 'Title *' }).fill(`96b1dc01-e7c8${i}`);
        await page.getByRole('textbox', { name: 'Description * Tip: Be' }).click();
        await page.getByRole('textbox', { name: 'Description * Tip: Be' }).fill(`Test item ${i}`);
        await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
        await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('69');
        await page.locator('label').filter({ hasText: 'Infinite Stock Item is always' }).click();
        await page.getByRole('button', { name: 'Create Item' }).click();
        await page.waitForURL(/\/my-clippings/);
    }
});

// NOTE : for this test to work you need to have 5 items with the prefix 96b1dc01-e7c8 in the data base

test('Search title-based', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('searchbox', { name: 'Search...' }).click();
    await page.getByRole('searchbox', { name: 'Search...' }).fill('96b1dc01-e7c8');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL(/\/search\?q=.*/);

    await expect(page.getByTestId('main-listing-grid').locator(":scope > button")).toHaveCount(5);
});

// NOTE : remove skipping when item deletion is made

test.skip('Member Create Items Greek', async (/*{ page }*/) => {
    for(let i = 0; i < 2; i++) {
        await page.goto('/');
        await page.getByTestId('side_menu_button').click();
        await page.getByRole('link', { name: 'My Clippings' }).click();
        await page.getByRole('button', { name: '+ Create New' }).click();
        await page.getByRole('textbox', { name: 'Title *' }).click();
        await page.getByRole('textbox', { name: 'Title *' }).fill(`ΩΧΡΝΒΣΒΜ${i}`);
        await page.getByRole('textbox', { name: 'Description * Tip: Be' }).click();
        await page.getByRole('textbox', { name: 'Description * Tip: Be' }).fill(`Test item ${i}`);
        await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
        await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('69');
        await page.locator('label').filter({ hasText: 'Infinite Stock Item is always' }).click();
        await page.getByRole('button', { name: 'Create Item' }).click();
        await page.waitForURL(/\/my-clippings/);
    }
});

// NOTE : for this test to work you need to have 2 items with the prefix ΩΧΡΝΒΣΒΜ in the data base

test('Search title-based Greek', async (/*{ page }*/) => {
    await page.goto('/');
    await page.getByRole('searchbox', { name: 'Search...' }).click();
    await page.getByRole('searchbox', { name: 'Search...' }).fill('ΩΧΡΝΒΣΒΜ');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL(/\/search\?q=.*/);

    await expect(page.getByTestId('main-listing-grid').locator(":scope > button")).toHaveCount(2);
});

test('Check out normal page', async (/*{ page }*/) => {
    await page.goto(`/account/${normalTestPage}`);
    await expect(page.getByRole('heading', { name: `Welcome to ${normalTestPage}\'s page` })).toBeVisible();
    await expect(page.getByText('ADSPACEFORRENT')).toBeVisible();
});

test('Check out verified page', async (/*{ page }*/) => {
    await page.goto(`/account/${verifiedTestPage}`);
    await expect(page.getByRole('heading', { name: `Welcome to ${verifiedTestPage}\'s Shop` })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Shop Socials' })).toBeVisible();
});

