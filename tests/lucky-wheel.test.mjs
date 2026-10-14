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
const { mockWheelApi: api, demoWheelConfig: config, wheelStopAngle, grantWheelDemoRewards } = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source, { mode: 'transform' })).toString('base64')}`);
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
