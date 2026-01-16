import { test, expect,Response } from '@playwright/test';

test('Sign up with existing name', async ({ page }) => {
  await page.goto('http://localhost:5173/auth');
  await page.getByRole('button', { name: 'Dont have an account ?' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('test4');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('textbox', { name: 'Confirm' }).click();
  await page.getByRole('textbox', { name: 'Confirm' }).fill('12345678');
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('sometest@gmail.com');
  await page.getByRole('textbox', { name: 'First name' }).click();
  await page.getByRole('textbox', { name: 'First name' }).fill('play');
  await page.getByRole('textbox', { name: 'Last name' }).click();
  await page.getByRole('textbox', { name: 'Last name' }).fill('wright');
  

  const responsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/user/register')
  );

  await page.getByRole('button', { name: 'Signup' }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(400);
  await page.getByText('A user with that username').click();
});

test('Good sign up', async ({ page }) => {
  await page.goto('http://localhost:5173/auth');
  await page.getByRole('button', { name: 'Dont have an account ?' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('playwrightTest');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('textbox', { name: 'Confirm' }).click();
  await page.getByRole('textbox', { name: 'Confirm' }).fill('12345678');
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('123456@gmail.com');
  await page.getByRole('textbox', { name: 'First name' }).click();
  await page.getByRole('textbox', { name: 'First name' }).fill('play');
  await page.getByRole('textbox', { name: 'Last name' }).click();
  await page.getByRole('textbox', { name: 'Last name' }).fill('wright');

  const signupPromice = page.waitForResponse(response=>response.url().includes("/api/user/register"));
  await page.getByRole('button', { name: 'Signup' }).click();
  const response = await signupPromice;
  expect(response.status()).toBe(200);
});

