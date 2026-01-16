import { test, expect } from '@playwright/test';

test('Login OK', async ({ page }) => {
  await page.goto('http://localhost:5173/auth');
  
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('test4');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('img', { name: 'small' }).click();
  await page.getByText('test4').click();
});

test("Login bad", async({page}) => {
  await page.goto('http://localhost:5173/auth');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('fakename');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('No active account found with').click();
  await page.getByRole('status', { name: 'Bad credentials' }).click();
  await page.getByText('Bad credentials').click();
})