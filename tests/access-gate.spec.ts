import { test, expect } from '@playwright/test';

test('gate, incorrect/correct password, refresh, routes and midnight', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-28T15:59:50Z') });
  await page.goto('/');
  await expect(page.locator('#access-gate')).toBeVisible();
  await expect(page.locator('#root')).toBeEmpty();
  await page.locator('#access-password').fill('20261027');
  await page.getByRole('button', {name:'确认', exact:true}).click();
  await expect(page.getByText('密码错误，请重试')).toBeVisible();
  await page.locator('#access-password').fill('20261028');
  await page.locator('#access-password').press('Enter');
  await expect(page.locator('#access-gate')).toBeHidden();
  await expect(page.getByTestId('mobile-h5-container')).toBeVisible();
  await page.reload();
  await expect(page.locator('#access-gate')).toBeHidden();
  await page.goto('/profile');
  await expect(page.locator('#access-gate')).toBeHidden();
  await page.clock.setSystemTime(new Date('2026-10-28T16:00:01Z'));
  await page.waitForTimeout(400);
  await expect(page.locator('#access-gate')).toBeVisible();
  await expect(page.locator('#root')).toBeHidden();
  await page.locator('#access-password').fill('20261028');
  await page.locator('#access-password').press('Enter');
  await expect(page.getByText('密码错误，请重试')).toBeVisible();
  await page.locator('#access-password').fill('20261029');
  await page.locator('#access-password').press('Enter');
  await expect(page.locator('#access-gate')).toBeHidden();
});

test('fresh session and missing JavaScript fail closed on subroutes', async ({ browser }) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled, viewport:{width:390,height:844}, timezoneId:'America/Los_Angeles' });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/profile');
    await expect(page.locator('#access-gate')).toBeVisible();
    await expect(page.locator('#root')).toBeEmpty();
    await expect(page.locator('#root')).toBeHidden();
    await context.close();
  }
});

for (const [instant, password] of [
  ['2028-02-28T16:00:00Z','20280229'],
  ['2028-02-29T16:00:00Z','20280301'],
  ['2026-12-31T16:00:00Z','20270101'],
]) {
  test(`Beijing calendar ${password}`, async ({ browser }) => {
    const context = await browser.newContext({timezoneId:'America/Los_Angeles'});
    const page = await context.newPage();
    await page.clock.install({time:new Date(instant)});
    await page.goto('http://127.0.0.1:5173/');
    await page.locator('#access-password').fill(password);
    await page.locator('#access-password').press('Enter');
    await expect(page.locator('#access-gate')).toBeHidden();
    await context.close();
  });
}

test('failed gate script and session storage remain locked', async ({page}) => {
  await page.route('**/src/access-gate.ts', route => route.abort());
  await page.goto('/');
  await expect(page.locator('#access-gate')).toBeVisible();
  await expect(page.locator('#root')).toBeEmpty();
  await page.unroute('**/src/access-gate.ts');
  await page.addInitScript(() => Object.defineProperty(window, 'sessionStorage', {get(){throw new Error('blocked');}}));
  await page.reload();
  await expect(page.locator('#access-gate')).toBeVisible();
  await expect(page.locator('#root')).toBeEmpty();
});
