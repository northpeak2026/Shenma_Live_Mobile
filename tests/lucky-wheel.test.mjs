import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
let sample = 0;
const data = new Map();
globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
globalThis.window = { dispatchEvent() {} };
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues: (array) => { array[0] = Math.floor(sample * 4294967296); return array; } } });
const source = fs.readFileSync(new URL('../src/luckyWheel.ts', import.meta.url), 'utf8').replaceAll('import.meta.env', '({})');
const { mockWheelApi: api, demoWheelConfig: config, wheelStopAngle, grantWheelDemoRewards, queryAssetEntries } = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source, { mode: 'transform' })).toString('base64')}`);
const reset = () => { data.clear(); sample = .99; };
for (const method of ['free', 'coins', 'diamonds']) test(`${method}: charge only chosen asset, misses still consume`, async () => {
  reset(); const before = await api.assets(); const result = await api.draw(method, method);
  for (const key of ['free', 'coins', 'diamonds']) assert.equal(result.assets[key], before[key] - (key === method ? config.costs[method] : 0));
  assert.equal(result.prize.id, 'none'); assert.equal((await api.records('mine', 0)).items.length, 0);
});
test('same id repeated concurrently commits once, query returns original result', async () => {
  reset(); const results = await Promise.all([api.draw('coins', 'same'), api.draw('coins', 'same')]);
  assert.deepEqual(results[0], results[1]); assert.equal((await api.assets()).coins, 26700);
  assert.equal((await api.query('same')).status, 'completed'); assert.equal((await api.query('missing')).status, 'not-found');
});
test('insufficient balance is definitive and cannot mutate store', async () => {
  reset(); await api.draw('free', '1'); await api.draw('free', '2'); await api.draw('free', '3');
  const before = await api.assets(); await assert.rejects(api.draw('free', '4'), (error) => error.definitive === true);
  assert.deepEqual(await api.assets(), before); assert.equal((await api.query('4')).status, 'not-found');
});
test('all awards update corresponding assets or gift inventory and filter records', async () => {
  let cumulative = 0;
  for (const prize of config.prizes) {
    reset(); sample = (cumulative + prize.weight / 2) / 100; cumulative += prize.weight;
    const before = await api.assets(); const result = await api.draw('free', prize.id); assert.equal(result.prize.id, prize.id);
    if (prize.kind === 'gift') assert.equal(result.assets.gifts[prize.giftId], prize.quantity);
    else if (prize.kind !== 'none') assert.equal(result.assets[prize.kind], before[prize.kind] + prize.quantity - (prize.kind === 'free' ? 1 : 0));
    const records = await api.records('mine', 0); assert.equal(records.items.length, prize.kind === 'none' ? 0 : 1);
  }
});
test('records paginate newest first and public demo users are masked', async () => {
  reset(); sample = .01;
  for (let i = 0; i < 12; i++) await api.draw('coins', `r${i}`);
  const first = await api.records('mine', 0), second = await api.records('mine', 10);
  assert.equal(first.items.length, 10); assert.equal(first.hasMore, true); assert.equal(first.items[0].id, 'r11'); assert.equal(second.items.length, 2); assert.equal(second.hasMore, false);
  assert.ok((await api.records('others', 0)).items.every((item) => item.nickname.includes('***')));
});
test('task awards are idempotent and share assets', async () => {
  reset(); const rewards = [{ type: 'draw', quantity: 1 }, { type: 'diamond', quantity: 10 }];
  grantWheelDemoRewards('task', rewards); grantWheelDemoRewards('task', rewards);
  assert.equal((await api.assets()).free, 4); assert.equal((await api.assets()).diamonds, 12590);
});
test('every returned prize center lands exactly under top pointer over successive spins', () => {
  let angle = 0;
  for (let round = 0; round < 3; round++) for (let index = 0; index < 8; index++) { const next = wheelStopAngle(angle, index, 8); assert.ok(next - angle >= 1800); assert.equal((next + index * 45) % 360, 0); angle = next; }
});

test('asset histories isolate collections, paginate without overlap, filter dates and preserve balance chain', async () => {
  reset();
  for (const asset of ['coins', 'diamonds', 'experience']) {
    const first = await queryAssetEntries(asset, '2000-01-01', '2099-12-31', 0, 12);
    const second = await queryAssetEntries(asset, '2000-01-01', '2099-12-31', 12, 12);
    assert.equal(first.items.length, 12); assert.equal(first.hasMore, true);
    assert.ok(first.items.every((entry) => entry.asset === asset));
    assert.ok(!first.items.some((entry) => second.items.some((other) => entry.id === other.id)));
    for (let i = 0; i < first.items.length - 1; i++) { assert.ok(Date.parse(first.items[i].createdAt) >= Date.parse(first.items[i + 1].createdAt)); assert.equal(first.items[i].balance - first.items[i].amount, first.items[i + 1].balance); }
    assert.equal((await queryAssetEntries(asset, '2000-01-01', '2000-01-02')).items.length, 0);
  }
});
test('reward grant and wheel debit journal update atomically and repeated grants do not duplicate records', async () => {
  reset(); const before = await api.assets();
  grantWheelDemoRewards('daily-test', [{type:'coin',quantity:100},{type:'diamond',quantity:20},{type:'experience',quantity:30}], '每日签到');
  grantWheelDemoRewards('daily-test', [{type:'coin',quantity:100}], '每日签到');
  const after = await api.assets(); assert.equal(after.coins,before.coins+100); assert.equal(after.diamonds,before.diamonds+20); assert.equal(after.experience,30);
  for (const asset of ['coins','diamonds','experience']) { const result=await queryAssetEntries(asset,'2000-01-01','2099-12-31'); const grants=result.items.filter((entry)=>entry.id.startsWith('daily-test'));assert.equal(grants.length,1);assert.equal(grants[0].source,'每日签到'); }
  await api.draw('coins','ledger-spin');
  const entries=await queryAssetEntries('coins','2000-01-01','2099-12-31');const debit=entries.items.find((entry)=>entry.id==='ledger-spin-cost'); assert.equal(debit.amount,-100);assert.equal(debit.balance,after.coins-100);
});

test('tips purchase history is a debit in each separate currency and does not mutate balances', async () => {
  reset();
  const before = await api.assets();
  for (const asset of ['coins', 'diamonds']) {
    const { items } = await queryAssetEntries(asset, '2000-01-01', '2100-01-01', 0, 200);
    const purchases = items.filter(entry => entry.type === 'tips-purchase');
    assert.ok(purchases.length > 0);
    for (const entry of purchases) {
      assert.equal(entry.source, '购买有料');
      assert.equal(entry.asset, asset);
      assert.equal(entry.amount, asset === 'coins' ? -280 : -88);
    }
  }
  const experience = await queryAssetEntries('experience', '2000-01-01', '2100-01-01', 0, 200);
  assert.ok(experience.items.every(entry => entry.type !== 'tips-purchase'));
  assert.deepEqual(await api.assets(), before);
});

test('existing tips unlock ledger entries retain amounts and balances under the purchase type', async () => {
  reset();
  const assets = await api.assets();
  const entry = { id: 'tip-purchase-plan-legacy', asset: 'diamonds', source: '有料方案解锁', amount: -88, balance: 12492, createdAt: new Date().toISOString() };
  data.set('shenma-wheel-demo-v1', JSON.stringify({ assets, results: {}, records: [], grants: [], journal: [entry] }));
  const result = await queryAssetEntries('diamonds', '2000-01-01', '2100-01-01', 0, 200);
  const purchase = result.items.find(item => item.id === entry.id);
  assert.deepEqual(purchase, { ...entry, type: 'tips-purchase', source: '购买有料' });
  assert.equal(result.items.filter(item => item.id === entry.id).length, 1);
});
