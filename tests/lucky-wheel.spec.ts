import { test, expect, type Page } from '@playwright/test';
const prizes = ['钻石', '金币', '经验值', '超级跑车', '游艇', '火箭', '免费次数', '谢谢惠顾'].map((name, index) => ({ id: String(index), name, quantity: index === 6 ? 3 : index === 7 ? 0 : 1, icon: '✦', kind: index === 6 ? 'free' : index === 7 ? 'none' : 'gift', weight: 1 }));
async function fixture(page: Page, options: { insufficient?: boolean; fail?: boolean; award?: number; recordFail?: boolean; timeout?: boolean } = {}) {
  let assets = { free: options.insufficient ? 0 : 3, coins: 500, diamonds: 100, experience: 0, gifts: {} };
  const config = { costs: { free: 1, coins: 100, diamonds: 10 }, prizes, pageSize: 10, recordMisses: false, publicMisses: false };
  let submissions = 0;
  let result: any;
  let failRecords = options.recordFail;
  await page.route('**/api/lucky-wheel/**', async (route) => {
    const url = new URL(route.request().url()); const path = url.pathname;
    if (path.endsWith('/config')) return route.fulfill({ json: config });
    if (path.endsWith('/assets')) return route.fulfill({ json: assets });
    if (path.endsWith('/draw')) {
      submissions++; const body = route.request().postDataJSON();
      const prize = prizes[options.award ?? 7];
      assets = { ...assets, [body.method]: assets[body.method as 'free' | 'coins' | 'diamonds'] - config.costs[body.method as 'free' | 'coins' | 'diamonds'], free: assets.free - (body.method === 'free' ? 1 : 0) + (prize.kind === 'free' ? 3 : 0) };
      result = { requestId: body.requestId, prize, assets, createdAt: '2026-10-14T12:00:00Z' };
      if (options.fail) return route.abort('failed');
      if (options.timeout) await new Promise((resolve) => setTimeout(resolve, 11000));
      return route.fulfill({ json: result });
    }
    if (path.includes('/draw/')) return route.fulfill({ json: { status: 'completed', result } });
    if (path.endsWith('/records')) {
      if (failRecords) return route.abort('failed');
      return route.fulfill({ json: { items: result?.prize.kind !== 'none' && result ? [{ id: result.requestId, prize: result.prize, createdAt: result.createdAt }] : [], hasMore: false } });
    }
  });
  return { submissions: () => submissions, allowRecords: () => { failRecords = false; } };
}
test('home entry, task navigation, task reward remains accessible', async ({ page }) => {
  await fixture(page); await page.goto('/'); await page.getByRole('button', { name: '自研游戏入口' }).click();
  await expect(page.getByRole('heading', { name: '幸运转盘', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '获取转盘次数' }).click(); await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole('heading', { name: '任务中心', exact: true })).toBeVisible();
  await expect(page.getByText('免费抽奖次数 × 1')).toBeVisible();
});
for (const method of ['free', 'coins', 'diamonds'] as const) test(`${method}: one submission, exact consumption, matching stop angle`, async ({ page }) => {
  const mock = await fixture(page); await page.goto('/lucky-wheel');
  if (method !== 'free') await page.locator('.wheel-methods button').nth(method === 'coins' ? 1 : 2).click();
  await page.locator('.wheel-start').evaluate((button) => { for (let i = 0; i < 5; i++) (button as HTMLButtonElement).click(); });
  await expect(page.locator('.wheel-start')).toBeDisabled(); await expect(page.locator('.wheel-methods button').first()).toBeDisabled();
  await expect(page.getByText('谢谢惠顾，本次未中奖，抽奖消耗已生效')).toBeVisible();
  expect(mock.submissions()).toBe(1); await expect(page.locator('[data-asset=free]')).toHaveText(method === 'free' ? '2' : '3');
  await expect(page.locator('[data-asset=coins]')).toHaveText(method === 'coins' ? '400' : '500');
  await expect(page.locator('[data-asset=diamonds]')).toHaveText(method === 'diamonds' ? '90' : '100');
  expect(Number(await page.locator('.wheel-disc').getAttribute('data-angle')) % 360).toBe(45);
});
test('insufficient blocks submission and allows another method', async ({ page }) => {
  const mock = await fixture(page, { insufficient: true }); await page.goto('/lucky-wheel'); await page.locator('.wheel-start').click();
  await expect(page.getByText('次数或余额不足，请切换其他抽奖方式')).toBeVisible(); expect(mock.submissions()).toBe(0);
  await page.locator('.wheel-methods button').nth(1).click(); await expect(page.locator('.wheel-start')).toBeEnabled();
});
test('uncertain result survives reload, query restores award without resubmission', async ({ page }) => {
  const mock = await fixture(page, { fail: true, award: 6 }); await page.goto('/lucky-wheel'); await page.locator('.wheel-start').click();
  await expect(page.getByRole('button', { name: '查询本次结果' })).toBeVisible(); await expect(page.locator('.wheel-start')).toBeDisabled();
  await page.reload(); await expect(page.locator('[data-asset=free]')).toBeVisible();
  await page.getByRole('button', { name: '查询本次结果' }).click(); await expect(page.getByText('恭喜获得 免费次数 ×3', { exact: true })).toBeVisible();
  expect(mock.submissions()).toBe(1); await expect(page.locator('[data-asset=free]')).toHaveText('5'); await expect(page.locator('.wheel-records b')).toHaveText('免费次数 ×3');
});
test('record failure retries and returns empty state', async ({ page }) => {
  const mock = await fixture(page, { recordFail: true }); await page.goto('/lucky-wheel'); await expect(page.getByText('记录加载失败')).toBeVisible();
  mock.allowRecords(); await page.getByRole('button', { name: '重试', exact: true }).click(); await expect(page.getByText('暂无获奖记录，幸运好礼等你来转')).toBeVisible();
});

test('timeout queries completed transaction without a second charge', async ({ page }) => {
  const mock = await fixture(page, { timeout: true }); await page.goto('/lucky-wheel'); await page.locator('.wheel-start').click();
  await expect(page.getByRole('button', { name: '查询本次结果' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: '查询本次结果' }).click(); await expect(page.getByText('谢谢惠顾，本次未中奖，抽奖消耗已生效')).toBeVisible();
  expect(mock.submissions()).toBe(1); await expect(page.locator('[data-asset=free]')).toHaveText('2');
});
for (const size of [{ width: 390, height: 844 }, { width: 427, height: 952 }, { width: 320, height: 740 }]) test(`layout ${size.width}x${size.height}`, async ({ page }) => {
  await page.setViewportSize(size); await fixture(page); await page.goto('/lucky-wheel'); await expect(page.locator('.wheel-disc')).toBeVisible();
  const overflow = await page.locator('.wheel-content').evaluate((element) => element.scrollWidth > element.clientWidth + 1); expect(overflow).toBe(false);
  const bounds = await page.locator('.wheel-disc').boundingBox(); expect(bounds!.width).toBeLessThan(size.width); expect(bounds!.x).toBeGreaterThanOrEqual(0);
  await expect(page.locator('.wheel-start')).toBeVisible();
  await page.screenshot({ path: `artifacts/lucky-wheel/wheel-${size.width}.png` });
});
