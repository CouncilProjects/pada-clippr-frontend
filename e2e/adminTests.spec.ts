import test, { expect } from "@playwright/test";

const name = "someToBeVerified";
const pass = "12345678";

test('Setup account',async ({page})=>{
    await page.goto(`http://localhost:5173/auth/`);
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('button', { name: 'Dont have an account ?' }).click();
    await page.locator('label').filter({ hasText: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(`${name}`);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('textbox', { name: 'Confirm' }).click();
    await page.getByRole('textbox', { name: 'Confirm' }).fill('12345678');
    await page.getByRole('textbox', { name: 'E-mail' }).click();
    await page.getByRole('textbox', { name: 'E-mail' }).fill('qq@qq.cm');
    await page.getByRole('textbox', { name: 'First name-Last name' }).click();
    await page.getByRole('textbox', { name: 'First name-Last name' }).fill('qq-qq');
    await page.getByRole('button', { name: 'Signup' }).click();
    await page.getByTestId('logout-button').click();
});


test("Admin verifies",async ({page})=>{

    await page.goto(`http://localhost:5173/auth/`);

await page.getByRole('textbox', { name: 'Username' }).click();
await page.getByRole('textbox', { name: 'Username' }).fill('admin');
await page.getByRole('textbox', { name: 'Password' }).click();
await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByTestId('logout-button')).toBeVisible()

    await page.goto(`http://localhost:5173/account/${name}`);
    await expect(page.getByRole('heading', { name: `Welcome to ${name}\'s` })).toBeVisible();


    await page.getByTestId('side_menu_button').click();
    await page.getByRole('link', { name: 'Verification' }).click();
    await page.getByRole('textbox', { name: 'Search Submit' }).click();
    await page.getByRole('textbox', { name: 'Search Submit' }).fill(`${name}`);
    await page.getByRole('main').getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('cell', { name: `${name}` }).click();
    await page.getByRole('button', { name: 'Verify' }).click();
    await expect(page.getByText('No results...')).toBeVisible();

    await page.goto(`http://localhost:5173/account/${name}`);
    
    await expect(page.getByRole('heading', { name: `Welcome to ${name}\'s` })).toBeVisible();


    await page.getByTestId('logout-button').click();


});

test("Delete remnant",async ({page})=>{
    await page.goto(`http://localhost:5173/auth/`);
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('someToBeVerified');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByTestId('logout-button')).toBeVisible();

    await page.getByTestId('side_menu_button').click();
    await page.getByRole('link', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
});

test("Admin makes admin", async ({ page }) => {

    await page.goto(`http://localhost:5173/auth/`);

    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByTestId('logout-button')).toBeVisible()

    await page.getByTestId('side_menu_button').click();
    await page.getByRole('link', { name: 'Create Admin' }).click();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('newAdmin');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('textbox', { name: 'Confirm' }).click();
    await page.getByRole('textbox', { name: 'Confirm' }).fill('12345678');
    await page.getByRole('textbox', { name: 'E-mail' }).click();
    await page.getByRole('textbox', { name: 'E-mail' }).fill('qq@qq.com');
    await page.getByRole('textbox', { name: 'First name-Last name' }).click();
    await page.getByRole('textbox', { name: 'First name-Last name' }).fill('aaa-aaa');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('New admin account has been')).toBeVisible();
    
    await page.getByTestId('logout-button').click();
});

test("Admin deletion", async ({ page }) => {

    await page.goto(`http://localhost:5173/auth/`);
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('newAdmin');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByTestId('logout-button')).toBeVisible();

    await page.getByTestId('side_menu_button').click();
    await page.getByRole('link', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
});