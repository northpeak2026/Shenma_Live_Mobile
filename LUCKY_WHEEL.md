# 幸运转盘交付与接口约定

现有项目为 React 19 / TypeScript / Vite 前端原型，Worker 仅用于静态页面，没有真实用户资产、礼物库存或抽奖接口。新增 UI 位于 `src/Prototype.tsx`，样式位于 `src/prototype.css`，接口与独立 mock 位于 `src/luckyWheel.ts`。沿用首页游戏图标、`/tasks` 任务中心和个人中心的浅蓝色卡片风格，未改动受保护运行时。

## 本地体验

执行 `npm run dev -- --host 127.0.0.1 --port 4173`，首页点击搜索框右侧游戏图标，或访问 `/lucky-wheel`。默认使用演示模式，顶部不展示说明条，结果和费用文案保留演示标识。初始免费次数 3，钻石 12580，金币 26800；金币与钻石初始值沿用已有个人中心。奖励、经验及礼物库存仅保存至浏览器 `shenma-wheel-demo-v1`，不真实到账。登录后的个人中心显示同一演示余额及累计获得的经验。

“获取转盘次数”复用 `/tasks`。现有“发送弹幕”任务增加演示免费次数奖励 1，领取时将同一奖励数组写入转盘资产，按任务 ID 幂等发放；其他原有任务奖励中金币、钻石、经验和次数也使用同一入口。任务完成判定、登录及任务状态目前沿用项目原型，正式版本需接入鉴权及服务端任务发奖。

`npm run typecheck`、`npm run build`、`npm run test:wheel`。业务单测使用 Node 22.13+ 的 TypeScript 转换功能；浏览器测试默认使用本机 Google Chrome（可在独立 `playwright.wheel.config.ts` 调整路径），启动独立 API 演示测试服务器 4180，不占用预览 4173。测试接口模拟不会真实扣费。

## 集中配置及待确认项

配置入口为 `src/luckyWheel.ts` 的 `demoWheelConfig`，生产模式从服务端 `/config` 获取。费用为演示值：每抽免费次数 1、金币 100 或钻石 10。

| 奖项 | 数量 | 演示概率 |
| --- | ---: | ---: |
| 钻石 | 66 | 10% |
| 金币 | 88 | 20% |
| 经验值 | 100 | 20% |
| 超级跑车 | 1 | 3% |
| 游艇 | 1 | 2% |
| 火箭 | 1 | 5% |
| 免费次数 | 3 | 10% |
| 谢谢惠顾 | 0 | 30% |

名称、数量、图标、礼物 ID、概率权重、费用、记录页大小集中配置。`recordMisses` 控制个人未中奖记录，`publicMisses` 控制公开未中奖记录，默认均关闭。

沿用个人中心钻石、金币、经验与次数符号及直播礼物中超级跑车、火箭 Emoji；项目没有游艇图片，使用同风格 🛥️ 占位。替换 `prizes[].icon` 为 `/assets/...` 图片路径；礼物替换同时调整 `name` 和 `giftId`。当前 `super-car`、`yacht`、`rocket` 为演示库存 ID，正式礼物目录 ID、礼物入背包/有效期/发送方式尚待确认。

上线前确认：全部概率与经济费用、礼物真实 ID 和到账规则、任务次数奖励及完成判定、用户认证和资产归属、公开记录隐私规则。公开 mock 昵称为匿名脱敏演示昵称，不包含账号、手机号或真实用户信息；生产公开接口应由服务端完成脱敏和过滤。

## 正式接口

设置 `VITE_WHEEL_MODE=api`，可设置 `VITE_WHEEL_API_BASE`（默认 `/api/lucky-wheel`），重启 Vite。正式模式禁止客户端随机或扣费；缺失接口会显示加载失败，不能回退到 mock 假装到账。所有请求使用当前登录 cookie；后端必须按项目真实鉴权规则校验用户。

接口类型见 `WheelApi`、`WheelAssets`、`WheelConfig`、`DrawResult`、`WheelRecord`、`QueryResult`。

- `GET /config`：配置，按排列顺序渲染分区，每个奖项 ID 唯一且稳定。
- `GET /assets`：`{free, coins, diamonds, experience, gifts}`，experience 表示本模块演示累计奖励；真实个人中心应统一累计经验口径。
- `POST /draw`：`{method: "free" | "coins" | "diamonds", requestId: UUID}`；返回 `{requestId, prize, assets, createdAt}`，prize 是完整中奖奖项，assets 是本次提交后的权威快照。
- `GET /draw/:requestId`：`{status: "completed", result: DrawResult}`，或 `{status: "pending" | "not-found" | "rejected", message?}`。
- `GET /records?scope=mine|others&offset=0`：`{items: WheelRecord[], hasMore: boolean}`，记录带快照名称和数量、ISO 时间，倒序分页，公开项带脱敏 nickname。

扣除、判定、资产发放、礼物入库、结果及获奖记录必须在后端同一事务提交；唯一键为“用户 + requestId”，重复提交返回原结果，不得再次扣款。仅当服务器明确保证请求已终止且没有扣费时，错误响应可返回 `{message, definitive: true}`，否则客户端按结果不确定处理。`rejected` 同样必须是终态无扣费。`not-found` 在真实接口中不视为可重抽证明，避免并发处理中或读副本延迟导致重复扣费；后端需最终收敛到 completed 或 rejected。

10 秒请求超时或网络错误后保留幂等凭证，禁止再次抽奖及切换方式；用户可查询同一请求。刷新或退出页面后再进入也保留该凭证。查询只获取结果，不重新提交抽奖。动画落点使用返回奖项 ID，奖项已被移除时查询仍直接展示服务端结果。动画完成后使用结果快照更新三类资产并重新拉取记录。演示 mock 内部判定、扣除及发放统一提交到一个 localStorage 快照，在支持 Web Locks 的浏览器通过锁保证并发写入。

## 验证范围

业务测试覆盖三种独立扣费、余额不足、相同 ID 并发幂等、全部奖项的资产/礼物/免费次数发放、默认过滤未中奖记录、分页及脱敏、任务发奖幂等、每个奖项多轮旋转落点。浏览器测试覆盖首页及任务跳转、连续点击只提交一次、动画期间禁用方式、资产及中奖记录刷新、失败/真实 10 秒超时后的查询恢复、刷新恢复凭证、记录失败重试、390×844 / 427×952 / 320×740 布局。
