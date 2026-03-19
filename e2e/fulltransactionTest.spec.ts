import { test, expect } from '@playwright/test';

const sellerUsername = 'sellerUser';
const sellerPassword = '12345678';
const buyerUsername = 'buyerUser';
const buyerPassword = '12345678';
const itemTitle = 'TransactionTestItem';

test('Full transaction test with item creation, purchase, and review', async ({ page }) => {
    test.setTimeout(120000); // Increase timeout to 120 seconds for this complex test
    await page.goto('http://localhost:5173/auth/');

    // Seller login
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(sellerUsername);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(sellerPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/');

    // Create item using the same flow as userTests.spec.ts
    await page.getByTestId('side_menu_button').click();
    await page.getByRole('link', { name: 'My Clippings' }).click();
    await page.getByRole('button', { name: '+ Create New' }).click();

    await page.getByRole('textbox', { name: 'Title *' }).click();
    await page.getByRole('textbox', { name: 'Title *' }).fill(itemTitle);

    await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
    await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('100');

    await page.getByRole('textbox', { name: 'Description * Tip: Be' }).click();
    await page
        .getByRole('textbox', { name: 'Description * Tip: Be' })
        .fill('This is the item that the buyerUser will buy in the transaction test');

    const createResponsePromise = page.waitForResponse(
        resp => resp.url().includes('/api/item/my-clippings/create/')
    );

    await page.getByRole('button', { name: 'Create Item' }).click();

    const createResponse = await createResponsePromise;
    await expect(createResponse.status()).toBe(201);

    // Log out seller
    await page.getByTestId('logout-button').click();
    await page.waitForURL(/\/auth\/?/);

    // Buyer login
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(buyerUsername);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(buyerPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/');

    // Buyer searches for the item and opens it
    await page.getByRole('searchbox', { name: 'Search...' }).click();
    await page.getByRole('searchbox', { name: 'Search...' }).fill(itemTitle);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL(/\/search\?q=.*/);

    await expect(page.getByRole('button', { name: `Thumbnail ${itemTitle}` })).toBeVisible();
    await page.getByRole('button', { name: `Thumbnail ${itemTitle}` }).click();
    await page.getByRole('button', { name: 'close' }).click();
    await page.getByRole('button', { name: 'Show Interest' }).click();
    await page.getByRole('textbox', { name: 'Message' }).click();
    await page.getByRole('textbox', { name: 'Message' }).fill('I am interested in buying this item!');
    await page.getByPlaceholder('Quantity').click();
    await page.getByPlaceholder('Quantity').fill('1');
    await page.getByRole('button', { name: 'Send' }).click();

    // Buyer logs out
    await page.getByTestId('logout-button').click();
    await page.waitForURL(/\/auth\/?/);

    // Seller logs back in
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(sellerUsername);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(sellerPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/');

    // Open side menu
    await page.getByTestId('side_menu_button').click();
    await page.getByRole('link', { name: 'Interest Offers' }).click();

    // Accept the offer from buyerUser
    await page.getByRole('button', { name: 'Accept' }).click();
    await page.getByRole('textbox', { name: 'Write a message (optional)' }).click();
    await page.getByRole('textbox', { name: 'Write a message (optional)' }).fill('Great! Let\'s proceed with the transaction.');
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Log out seller
    await page.getByTestId('logout-button').click();
    await page.waitForURL(/\/auth\/?/);

    // Buyer login
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(buyerUsername);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(buyerPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/');

    // Buyer opens side menu and goes to My Offers
    await page.getByTestId('side_menu_button').click();
    await page.getByRole('link', { name: 'My Offers' }).click();

    await page.getByRole('button', { name: 'Review user' }).click();
    
    await page.getByRole('radio', { name: '5 stars' }).click();
    await page.getByRole('textbox', { name: 'Leave comment' }).click();
    await page.getByRole('textbox', { name: 'Leave comment' }).fill('Great seller! Lighting fast response. Smooth transaction.');
    await page.getByRole('button', { name: 'Submit Review' }).click();


    await page.getByRole('button', { name: 'Review item' }).click();
    await page.getByRole('radio', { name: '5 stars' }).click();
    await page.getByRole('textbox', { name: 'Leave comment' }).click();
    await page.getByRole('textbox', { name: 'Leave comment' }).fill('The item was exactly as described. Highly recommend!');
    await page.getByRole('button', { name: 'Submit Review' }).click();

    // Buyer logs out
    await page.getByTestId('logout-button').click();
    await page.waitForURL(/\/auth\/?/);

    //Seller logs in and checks Myclippings
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(sellerUsername);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(sellerPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/');
    await page.getByTestId('side_menu_button').click();
    await page.getByRole('link', { name: 'My Clippings' }).click();
    await expect(page.getByRole('button', { name: `Thumbnail ${itemTitle}` })).toBeVisible();
    await page.getByRole('button', { name: `Thumbnail ${itemTitle}` }).click();
    await page.getByRole('button', { name: 'close' }).click();
    
    // Clean up: delete the created item
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Delete Listing' }).click();
    page.on('dialog', async dialog => {
        await dialog.accept();
    });
    await page.getByRole('button', { name: 'Delete Listing' }).click();
});
