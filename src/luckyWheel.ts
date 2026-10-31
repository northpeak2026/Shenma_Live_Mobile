// Demo economics only. Production must return config and commit awards on its server.
export type DrawMethod = 'free' | 'coins' | 'diamonds';
// totalExperience and level are authoritative profile fields when returned by the API.
export type WheelAssets = { totalExperience?: number; level?: number; free: number; coins: number; diamonds: number; experience: number; gifts: Record<string, number> };
export type WheelPrize = { id: string; name: string; quantity: number; icon: string; kind: 'diamonds' | 'coins' | 'experience' | 'gift' | 'free' | 'none'; giftId?: string; weight: number };
export const demoWheelConfig = {
  costs: { free: 1, coins: 100, diamonds: 10 },
  recordMisses: false, publicMisses: false, pageSize: 10,
  prizes: [
    { id: 'diamond', name: '钻石', quantity: 66, icon: '◆', kind: 'diamonds', weight: 10 },
    { id: 'coin', name: '金币', quantity: 88, icon: '●', kind: 'coins', weight: 20 },
    { id: 'experience', name: '经验值', quantity: 100, icon: '✦', kind: 'experience', weight: 20 },
    { id: 'car', name: '超级跑车', quantity: 1, icon: '🏎️', kind: 'gift', giftId: 'super-car', weight: 3 },
    { id: 'yacht', name: '游艇', quantity: 1, icon: '🛥️', kind: 'gift', giftId: 'yacht', weight: 2 },
    { id: 'rocket', name: '火箭', quantity: 1, icon: '🚀', kind: 'gift', giftId: 'rocket', weight: 5 },
    { id: 'free', name: '免费次数', quantity: 3, icon: '✧', kind: 'free', weight: 10 },
    { id: 'none', name: '谢谢惠顾', quantity: 0, icon: '♡', kind: 'none', weight: 30 },
  ] as WheelPrize[],
};
export type WheelConfig = typeof demoWheelConfig;
export type WheelRecord = { id: string; nickname?: string; prize: WheelPrize; createdAt: string };
export type DrawResult = { requestId: string; prize: WheelPrize; assets: WheelAssets; createdAt: string };
export type QueryResult = { status: 'completed'; result: DrawResult } | { status: 'pending' | 'not-found' | 'rejected'; message?: string };
export interface WheelApi {
  config(): Promise<WheelConfig>; assets(): Promise<WheelAssets>;
  draw(method: DrawMethod, requestId: string): Promise<DrawResult>;
  query(requestId: string): Promise<QueryResult>;
  records(scope: 'mine' | 'others', offset: number): Promise<{ items: WheelRecord[]; hasMore: boolean }>;
}
export class WheelError extends Error { constructor(message: string, public definitive = false) { super(message); } }
export const wheelMock = import.meta.env.VITE_WHEEL_MODE !== 'api';
const storageKey = 'shenma-wheel-demo-v1';
export const pendingWheelKey = `shenma-wheel-pending-${wheelMock ? 'demo' : 'api'}`;
type Store = { assets: WheelAssets; results: Record<string, DrawResult>; records: WheelRecord[]; grants: string[]; journal?: AssetEntry[] };
function read(): Store {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : { assets: { free: 3, coins: 26800, diamonds: 12580, experience: 0, gifts: {} }, results: {}, records: [], grants: [] };
}
function write(store: Store) { localStorage.setItem(storageKey, JSON.stringify(store)); window.dispatchEvent(new Event('wheel-assets')); }
const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 250));
// Isolated mock authority: UI never selects an award or deducts an asset.
export const mockWheelApi: WheelApi = {
  async config() { return structuredClone(demoWheelConfig); },
  async assets() { return structuredClone(read().assets); },
  async draw(method, requestId) {
    await delay();
    const commit = () => {
      const store = read();
      if (store.results[requestId]) return store.results[requestId];
      const cost = demoWheelConfig.costs[method];
      if (!cost || store.assets[method] < cost) throw new WheelError('次数或余额不足，请切换抽奖方式', true);
      let ticket = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296 * demoWheelConfig.prizes.reduce((sum, p) => sum + p.weight, 0);
      const prize = demoWheelConfig.prizes.find((p) => (ticket -= p.weight) < 0)!;
      store.assets[method] -= cost;
      if (method !== "free") appendAssetEntry(store, `${requestId}-cost`, method, "幸运转盘消耗", -cost);
      if (prize.kind === 'gift') store.assets.gifts[prize.giftId!] = (store.assets.gifts[prize.giftId!] ?? 0) + prize.quantity;
      else if (prize.kind !== 'none') store.assets[prize.kind] += prize.quantity;
      if (prize.kind === "coins" || prize.kind === "diamonds" || prize.kind === "experience") appendAssetEntry(store, `${requestId}-reward`, prize.kind, "幸运转盘奖励", prize.quantity);
      const result = { requestId, prize: structuredClone(prize), assets: structuredClone(store.assets), createdAt: new Date().toISOString() };
      store.results[requestId] = result;
      if (prize.kind !== 'none' || demoWheelConfig.recordMisses) store.records.unshift({ id: requestId, prize: result.prize, createdAt: result.createdAt });
      write(store); return result;
    };
    return navigator.locks ? navigator.locks.request(storageKey, commit) : commit();
  },
  async query(id) { await delay(); const result = read().results[id]; return result ? { status: 'completed', result } : { status: 'not-found' }; },
  async records(scope, offset) {
    await delay();
    const all = scope === 'mine' ? read().records : demoWheelConfig.prizes.filter((p) => p.kind !== 'none' || demoWheelConfig.publicMisses).map((prize, index) => ({ id: `demo-${index}`, nickname: `球迷***${index + 1}`, prize, createdAt: new Date(Date.now() - index * 600000).toISOString() }));
    return { items: all.slice(offset, offset + demoWheelConfig.pageSize), hasMore: all.length > offset + demoWheelConfig.pageSize };
  },
};
async function request<T>(path: string, body?: unknown): Promise<T> {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${import.meta.env.VITE_WHEEL_API_BASE ?? '/api/lucky-wheel'}${path}`, { method: body ? 'POST' : 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: controller.signal });
    const payload = await response.json();
    if (!response.ok) throw new WheelError(payload.message ?? '请求失败', payload.definitive === true);
    return payload;
  } catch (error) { if (error instanceof WheelError) throw error; throw new WheelError('连接失败或超时，抽奖结果待确认'); }
  finally { clearTimeout(timer); }
}
export const wheelApi: WheelApi = wheelMock ? mockWheelApi : {
  config: () => request('/config'), assets: () => request('/assets'),
  draw: (method, requestId) => request('/draw', { method, requestId }), query: (id) => request(`/draw/${encodeURIComponent(id)}`),
  records: (scope, offset) => request(`/records?scope=${scope}&offset=${offset}`),
};
export function wheelStopAngle(current: number, index: number, count: number) {
  const target = (360 - index * 360 / count) % 360;
  return current + 360 * 5 + (target - current % 360 + 360) % 360;
}
export function grantWheelDemoRewards(id: string, rewards: { type: string; quantity: number }[], source = "完成任务") {
  if (!wheelMock) return;
  const store = read(); if (store.grants.includes(id)) return;
  for (const reward of rewards) { const key = ({ coin: 'coins', diamond: 'diamonds', draw: 'free', experience: 'experience' } as const)[reward.type as 'coin' | 'diamond' | 'draw' | 'experience']; if (key) { store.assets[key] += reward.quantity; if (key !== "free") appendAssetEntry(store, `${id}-${key}`, key, source, reward.quantity); } }
  store.grants.push(id); write(store);
}

export type AssetKind = "coins" | "diamonds" | "experience";
export type AssetEntry = { id: string; asset: AssetKind; type?: "tips-purchase"; source: string; createdAt: string; amount: number; balance?: number };
function appendAssetEntry(store: Store, id: string, asset: AssetKind, source: string, amount: number) {
  store.journal ??= []; store.journal.unshift({ id, asset, source, amount, balance: asset === "experience" ? 2500 + store.assets.experience : store.assets[asset], createdAt: new Date().toISOString() });
}
export async function updatePredictionAssets(id: string, asset: "coins" | "diamonds", amount: number) {
  if (!wheelMock) throw new Error("暂不支持竞猜");
  const commit = () => {
    const store = read();
    if (store.grants.includes(id)) return;
    if (store.assets[asset] + amount < 0) throw new Error("余额不足");
    store.assets[asset] += amount;
    appendAssetEntry(store, id, asset, amount < 0 ? "游戏竞猜" : "竞猜奖金", amount);
    store.grants.push(id); write(store);
  };
  if (navigator.locks) await navigator.locks.request(storageKey, commit); else commit();
}
const seededHistoryAnchor = Date.now() - 60000;
function seededAssetEntries(asset: AssetKind, balance: number): AssetEntry[] {
  const sources = asset === "experience" ? ["完成任务", "每日签到", "幸运转盘奖励"] : ["竞猜奖金", "游戏竞猜", "完成任务", "邀请好友", "幸运转盘奖励", "每日签到", "直播间送礼", "幸运转盘消耗", "购买有料"];
  let running = balance;
  return Array.from({ length: 112 }, (_, i) => { const date = new Date(seededHistoryAnchor - i * 12 * 60 * 60 * 1000); const source = sources[i % sources.length]; const purchase = source === "购买有料"; const expense = ["直播间送礼", "幸运转盘消耗", "购买有料", "游戏竞猜"].includes(source); const amount = asset === "experience" ? [30, 10, 20][i % 3] : purchase ? -(asset === "coins" ? 280 : 88) : expense ? -[50, 100][i % 2] : [100, 88, 66, 20][i % 4]; const entry: AssetEntry = { id: `history-${asset}-${i}`, asset, ...(purchase ? { type: "tips-purchase" as const } : {}), source, createdAt: date.toISOString(), amount, balance: running }; running -= amount; return entry; });
}
export async function queryAssetEntries(asset: AssetKind, start: string, end: string, offset = 0, limit = 12): Promise<{ items: AssetEntry[]; hasMore: boolean }> {
  if (!wheelMock) return request(`/asset-records?asset=${asset}&start=${start}&end=${end}&offset=${offset}&limit=${limit}`);
  const store = read(); const journal: AssetEntry[] = (store.journal ?? []).map(entry => entry.type === "tips-purchase" || entry.source === "有料方案解锁" || entry.id.startsWith("tip-purchase-") ? { ...entry, type: "tips-purchase", source: "购买有料" } : entry.source === "竞猜下注" ? { ...entry, source: "游戏竞猜" } : entry.source === "竞猜派奖" ? { ...entry, source: "竞猜奖金" } : entry);
  const first = journal.filter((entry) => entry.asset === asset).at(-1);
  const balance = asset === "experience" ? 2500 + store.assets.experience : store.assets[asset];
  const baseline = first?.balance !== undefined ? first.balance - first.amount : balance;
  const all = [...journal.filter((entry) => entry.asset === asset), ...seededAssetEntries(asset, baseline)].filter((entry) => { const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date(entry.createdAt)); return date >= start && date <= end; }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return { items: all.slice(offset, offset + limit), hasMore: offset + limit < all.length };
}
