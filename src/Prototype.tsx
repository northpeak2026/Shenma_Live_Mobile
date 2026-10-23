import userAgreementText from "./content/user-agreement.txt?raw";
import privacyPolicyText from "./content/privacy-policy.txt?raw";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftIcon, CopyIcon, Share1Icon, BackpackIcon, ChatBubbleIcon, ChevronRightIcon, ClockIcon, GearIcon, HomeIcon, InfoCircledIcon, LightningBoltIcon, MagnifyingGlassIcon, PaperPlaneIcon, PersonIcon, PlayIcon, SpeakerLoudIcon } from "@radix-ui/react-icons";
import { Carousel, KeyboardInput, MobileScroll, useKeyboard } from "./mobile";
import { BottomTabIcon, type TabIconName } from "./tabIcons";
import { LiveRoomPage } from "./live";
import { HomeDownloadBanner, HomePageV2, LiveCard, type Stream } from "./HomePageV2";
import { EventDetailPage, makeEventDetail, type EventDetailPayload } from "./eventDetail";
import "./prototype.css";
import { queryAssetEntries, type AssetKind, type AssetEntry, wheelApi, wheelMock, pendingWheelKey, WheelError, wheelStopAngle, grantWheelDemoRewards, type WheelAssets, type WheelConfig, type DrawMethod, type DrawResult, type WheelRecord } from "./luckyWheel";

type TabKey = "home" | "matches" | "data" | "tips" | "profile";
type Route = "message-detail" | "user-profile" | "tips-ranking" | "tips-expert" | "tips-detail" | "tips" | "experience-history" | "coin-history" | "diamond-history" | "lucky-wheel" | "news-detail" | "home" | "data" | "search" | "download" | "preview" | "live" | "sports" | "sports-search" | "sports-filter" | "sports-filter-results" | "sports-detail" | "sports-team" | "chat" | "chat-detail" | "profile" | "about" | "user-agreement" | "privacy-policy" | "settings" | "login" | "forgot-password" | "reset-password" | "noble-gift" | "following" | "recharge" | "tasks" | "check-in" | "activities" | "invite" | "invite-records" | "messages" | "reward-history" | "watch-history";
type LoginMode = "code" | "password";
const pagesProjectBase = "/Shenma_Live_Mobile";
const appInfo = { name: "神马直播", version: "1.0.0" };
function assetUrl(file: string) { return `${import.meta.env.BASE_URL}assets/${file}`; }
const categories = ["推荐", "足球", "篮球", "英雄联盟", "直播回放"];
const banners = [
  { image: "football-hero.png", title: "决胜瞬间", sub: "一射门，只为这一刻" },
  { image: "live-gold.png", title: "冠军之夜", sub: "见证荣耀诞生的一刻" },
  { image: "live-cool.png", title: "足球盛典", sub: "激情开赛，热血对决" },
];
const matches = [
  { id: "football-live-1", league: "英超", state: "直播中", home: "曼彻斯特城", away: "利物浦", score: "3 : 2", tone: "purple" },
  { id: "football-upcoming-5", league: "西甲", state: "22:15", home: "马德里竞技", away: "皇家马德里", score: "VS", tone: "blue" },
];
const covers = ["live-cool.png", "live-gold.png", "football-hero.png"];
const streamTitles = ["每一次冲刺，都是定义全场", "冠军之夜", "足球盛典", "决胜时刻", "绿茵之上，热爱不止", "今夜见证传奇", "曼城 vs 阿森纳｜英超焦点战", "球场风云", "极限反击", "夺冠倒计时", "梦幻开局", "90分钟的热血"];
const anchors = ["地瓜", "阿七Viki", "维克多", "楚楚", "Allen", "小鹿", "老K", "依依", "大熊", "小雨", "Leon", "娜娜"];
const hosts = anchors.map((nickname, index) => ({ id: `host-${index + 1}`, nickname, followers: ["12.8万", "9.6万", "8.2万", "6.7万", "5.3万", "4.9万", "4.5万", "3.8万", "3.4万", "3.1万", "2.7万", "2.3万"][index], status: index % 3 === 0 || index === 1 ? "live" as const : "offline" as const, recommended: index < 8 }));
const streams: Stream[] = streamTitles.map((title, index) => ({ id: index + 1, title, anchor: hosts[index].nickname, hostId: hosts[index].id, tag: ["金牌主播", "实力主播", "人气主播"][index % 3], heat: ["26.37w", "26.37w", "12.64w", "8.92w", "18.42w", "22.10w"][index % 6], image: covers[index % covers.length], recommended: index < 4 }));
const previewDays = [{ id: "today", label: "今天", count: 12 }, { id: "tomorrow", label: "明天", count: 8 }, { id: "sep25", label: "9月25日", count: 6 }, { id: "sep26", label: "9月26日", count: 4 }];
const previewEvents = [
  { id: 9, day: "today", time: "10:00", league: "NBA", status: "已结束", home: "湖人", away: "勇士", color: "blue", anchors: [{ name: "地瓜", time: "10:00" }, { name: "Allen", time: "10:00" }] },
  { id: 10, day: "today", time: "15:30", league: "英超", status: "已结束", home: "利物浦", away: "切尔西", color: "purple", anchors: [{ name: "阿七Viki", time: "15:30" }, { name: "楚楚", time: "15:30" }] },
  { id: 1, eventId:"football-live-1", day: "today", time: "19:50", league: "英超", status: "直播中", home: "曼彻斯特城", away: "阿森纳", color: "purple", anchors: [{ name: "地瓜", time: "19:50" }, { name: "维克多", time: "19:55" }, { name: "阿七Viki", time: "19:50" }, { name: "小雨", time: "20:00" }, { name: "Leon", time: "20:00" }] },
  { id: 2, day: "today", time: "22:20", league: "西甲", status: "即将开始", home: "皇家马德里", away: "巴塞罗那", color: "blue", anchors: [{ name: "楚楚", time: "22:20" }, { name: "Allen", time: "22:20" }] },
  { id: 3, day: "today", time: "23:00", league: "意甲", status: "即将开始", home: "AC米兰", away: "国际米兰", color: "lavender", anchors: [{ name: "小鹿", time: "23:00" }] },
  { id: 4, day: "tomorrow", time: "01:30", league: "欧冠", status: "即将开始", home: "拜仁慕尼黑", away: "巴黎圣日耳曼", color: "purple", anchors: [{ name: "老K", time: "01:30" }, { name: "依依", time: "01:30" }] },
  { id: 5, day: "tomorrow", time: "03:00", league: "英超", status: "即将开始", home: "利物浦", away: "托特纳姆热刺", color: "purple", anchors: [{ name: "大熊", time: "03:00" }] },
  { id: 6, day: "tomorrow", time: "20:00", league: "英超", status: "即将开始", home: "切尔西", away: "曼联", color: "purple", anchors: [{ name: "小雨", time: "20:00" }, { name: "Leon", time: "20:00" }, { name: "娜娜", time: "20:05" }, { name: "地瓜", time: "20:00" }] },
  { id: 7, day: "sep25", time: "20:30", league: "西甲", status: "即将开始", home: "皇家贝蒂斯", away: "瓦伦西亚", color: "blue", anchors: [{ name: "阿七Viki", time: "20:20" }, { name: "楚楚", time: "20:30" }] },
  { id: 8, day: "sep26", time: "21:00", league: "英超", status: "即将开始", home: "阿斯顿维拉", away: "纽卡斯尔", color: "purple", anchors: [{ name: "维克多", time: "20:55" }] },
];
const userData = {
  isLoggedIn: true,
  user: { nickname: "Harry", id: "SM20260925", avatar: "", followingCount: 36, vipLevel: 3, experience: 2500 },
  assets: { diamonds: 12580, coins: 26800 },
  following: [
    { nickname: "地瓜", followers: "12.8万", status: "live" },
    { nickname: "阿七Viki", followers: "9.6万", status: "live" },
    { nickname: "维克多", followers: "8.2万", status: "offline" },
    { nickname: "楚楚", followers: "6.7万", status: "live" },
    { nickname: "Allen", followers: "5.3万", status: "offline" },
    { nickname: "小鹿", followers: "4.9万", status: "offline" },
  ],
};
type DownloadPlatform = "ios" | "ios-webclip" | "android";
const downloadScreens = [
  { title: "首页", file: "home.png", description: "热门赛事与精彩直播一站发现" },
  { title: "直播间", file: "live.png", description: "高清赛事直播 边看边聊" },
  { title: "赛事", file: "sports.png", description: "足球篮球赛程比分实时掌握" },
  { title: "有料", file: "tips.png", description: "专家观点与赛事分析，赛前决策有参考" },
];
const downloadTutorials: Record<DownloadPlatform, Array<{ title: string; description: string; visual: string; image?: string; imageWidth?: number; imageHeight?: number }>> = {
  ios: [
    { title: "打开首页，点击「分享」", description: "在手机浏览器中打开神马直播网页，点击地址栏右侧的分享图标。", visual: "chrome-share", image: "ios-chrome-step-1.png", imageWidth: 570, imageHeight: 1260 },
    { title: "点击分享面板中的「更多」", description: "在弹出的分享面板中，点击下方操作栏右侧的「更多」（三个圆点），展开完整菜单。", visual: "chrome-more", image: "ios-chrome-step-2.png", imageWidth: 570, imageHeight: 1258 },
    { title: "选择「添加到主屏幕」", description: "在展开的菜单中找到「添加到主屏幕」并点击；如未看到，可向下滚动菜单。", visual: "chrome-menu", image: "ios-chrome-step-3.png", imageWidth: 572, imageHeight: 1250 },
    { title: "确认名称，点击「添加」", description: "确认名称为「神马直播」及首页链接，然后点击右上角的「添加」。", visual: "chrome-add", image: "ios-chrome-step-4.png", imageWidth: 576, imageHeight: 1244 },
    { title: "从手机桌面打开神马直播", description: "返回手机主屏幕，点击新增的「神马直播」图标即可快捷访问。", visual: "home-shortcut", image: "ios-chrome-step-5.png", imageWidth: 572, imageHeight: 1248 },
  ],
  "ios-webclip": [
    { title: "步骤 1", description: "点击下载按钮，安装描述文件。", visual: "webclip", image: "ios-webclip-step-1.png", imageWidth: 446, imageHeight: 980 },
    { title: "步骤 2", description: "进入手机的系统设置，找到「通用」→「VPN与设备管理」，点击刚才下载的描述文件。", visual: "webclip", image: "ios-webclip-step-2.png", imageWidth: 436, imageHeight: 984 },
    { title: "步骤 3", description: "点击右上角的「安装」按钮。", visual: "webclip", image: "ios-webclip-step-3.png", imageWidth: 448, imageHeight: 976 },
    { title: "步骤 4", description: "输入手机的解锁密码。", visual: "webclip", image: "ios-webclip-step-4.png", imageWidth: 446, imageHeight: 978 },
    { title: "步骤 5", description: "点击「下一步」，完成安装后，即可在手机桌面看到 App。", visual: "webclip", image: "ios-webclip-step-5.png", imageWidth: 444, imageHeight: 970 },
  ],
  android: [
    { title: "点击立即下载", description: "点击下载页里的「立即下载」按钮。", visual: "android-install", image: "android-install-step-1.png", imageWidth: 750, imageHeight: 1654 },
    { title: "确认下载", description: "点击弹窗里的「仍然下载」（这一步是手机系统误报导致）。", visual: "android-install", image: "android-install-step-2.png", imageWidth: 740, imageHeight: 1654 },
    { title: "继续安装", description: "点击「继续安装」（我们不会收集你的个人信息）。", visual: "android-install", image: "android-install-step-3.png", imageWidth: 750, imageHeight: 1646 },
    { title: "完成安装", description: "点击「继续安装」后，即可体验 App。", visual: "android-install", image: "android-install-step-4.png", imageWidth: 742, imageHeight: 1658 },
  ],
};
type Sport = "football" | "basketball";
type EventStatus = "live" | "upcoming" | "finished";
type Streamer = { id: string; nickname: string };
type SportsEvent = { id: string; sport: Sport; league: string; date: string; startTime: string; status: EventStatus; stage?: string; home: { name: string; score?: number }; away: { name: string; score?: number }; halftimeScore?: { home: number; away: number }; corners?: { home: number; away: number }; quarterScores?: Array<{ quarter: number; home: number; away: number }>; isFeatured: boolean; favorite: boolean; hasAnimation: boolean; streamers: Streamer[]; detail: EventDetailPayload; detailOnly?: boolean };
const streamerCatalog: Streamer[] = [{ id: "anchor-rain", nickname: "地瓜" }, { id: "anchor-viki", nickname: "阿七Viki" }, { id: "anchor-victor", nickname: "维克多" }, { id: "anchor-chuchu", nickname: "楚楚" }, { id: "anchor-allen", nickname: "Allen" }];
const footballTeams = ["曼城", "阿森纳", "利物浦", "热刺", "皇家马德里", "巴塞罗那", "AC米兰", "国际米兰", "拜仁慕尼黑", "巴黎圣日耳曼", "切尔西", "曼联"];
const basketballTeams = ["湖人", "勇士", "凯尔特人", "掘金", "太阳", "独行侠", "雄鹿", "尼克斯", "快船", "热火", "骑士", "森林狼"];
const footballLeagueNames = ["英超", "欧冠", "西甲", "意甲", "德甲", "法甲", "荷甲", "葡超", "苏超", "挪超", "比甲", "土超"];
const basketballLeagueNames = ["NBA", "CBA", "欧篮联", "WNBA", "NBL", "韩篮", "日篮", "德篮", "法篮"];
const localDateKey = (date: Date) => { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0"); return `${year}-${month}-${day}`; };
const shiftLocalDate = (offset: number) => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() + offset); return localDateKey(date); };
const todayDateKey = shiftLocalDate(0);
const scheduleDateOptions = Array.from({ length: 7 }, (_, index) => shiftLocalDate(index));
const resultDateOptions = Array.from({ length: 7 }, (_, index) => shiftLocalDate(index - 6));
const timeOptions = ["01:00", "03:00", "19:00", "20:30", "22:00", "23:30"];
function makeSportsEvents(sport: Sport, status: EventStatus, count: number): SportsEvent[] { const teams = sport === "football" ? footballTeams : basketballTeams; const leagues = sport === "football" ? footballLeagueNames : basketballLeagueNames; const dates = status === "upcoming" ? scheduleDateOptions : status === "finished" ? resultDateOptions : [todayDateKey]; return Array.from({ length: count }, (_, index) => { const streamersForEvent = index % 6 === 0 ? streamerCatalog : index % 4 === 0 ? streamerCatalog.slice(0, 2) : index % 3 === 0 ? streamerCatalog.slice(0, 1) : []; const liveStage = sport === "football" ? ["上半场 10'", "上半场 38'", "中场", "下半场 63'"][index % 4] : ["第1节 08:32", "第2节 04:16", "半场", "第3节 06:20"][index % 4]; const isBasketball = sport === "basketball"; const quarterCount = status === "finished" ? 4 : status === "live" ? [1, 2, 2, 3][index % 4] : 0; const quarterScores = isBasketball && quarterCount ? Array.from({ length: quarterCount }, (_, quarter) => ({ quarter: quarter + 1, home: 20 + ((index + quarter * 3) % 12), away: 19 + ((index * 2 + quarter * 2) % 12) })) : undefined; const totalHome = quarterScores?.reduce((total, row) => total + row.home, 0); const totalAway = quarterScores?.reduce((total, row) => total + row.away, 0); const lowerHalf = status === "live" && liveStage.startsWith("下半场"); return { id: `${sport}-${status}-${index + 1}`, sport, league: leagues[index % leagues.length], date: dates[index % dates.length], startTime: timeOptions[index % timeOptions.length], status, stage: status === "live" ? liveStage : undefined, home: { name: teams[(index * 2) % teams.length], score: status === "upcoming" ? undefined : isBasketball ? totalHome : (index % 4) + 1 }, away: { name: teams[(index * 2 + 1) % teams.length], score: status === "upcoming" ? undefined : isBasketball ? totalAway : index % 3 }, halftimeScore: sport === "football" && (status === "finished" || lowerHalf) ? { home: 1, away: 0 } : undefined, corners: sport === "football" && status !== "upcoming" ? { home: 3 + (index % 3), away: 2 + (index % 3) } : undefined, quarterScores, isFeatured: index < 12, favorite: index % 7 === 0, hasAnimation: streamersForEvent.length === 0, streamers: streamersForEvent, detail: makeEventDetail(sport, status, index) }; }); }
const sportsEvents: SportsEvent[] = ["football", "basketball"].flatMap((sport) => ([...makeSportsEvents(sport as Sport, "live", 12), ...makeSportsEvents(sport as Sport, "upcoming", 70), ...makeSportsEvents(sport as Sport, "finished", 70)]));
const secondaryTitles: Record<Exclude<Route, "news-detail" | "home" | "data" | "search" | "preview" | "live" | "profile" | "about" | "user-agreement" | "privacy-policy" | "chat" | "chat-detail" | "sports" | "sports-search" | "sports-filter" | "sports-filter-results" | "sports-detail" | "sports-team">, string> = {
  "user-profile": "用户主页", "tips-ranking": "专家排行榜", "tips-expert": "专家主页", "tips-detail": "有料详情", tips: "有料", "experience-history": "经验值记录", "coin-history": "账变记录", "diamond-history": "账变记录", "lucky-wheel": "幸运转盘", download: "下载 App", settings: "设置", login: "登录", "forgot-password": "忘记密码", "reset-password": "设置新密码", "noble-gift": "贵族盲盒礼包", following: "我的关注", recharge: "钻石充值", tasks: "任务中心", "check-in": "每日签到", activities: "活动中心", invite: "好友邀请", "invite-records": "邀请记录", messages: "站内信", "message-detail": "站内信详情", "reward-history": "领取记录", "watch-history": "观看历史",
};
const commonFeatures: Array<{ id: "tasks" | "activities" | "invite" | "invite-records" | "messages"; label: string }> = [{ id: "tasks", label: "任务中心" }, { id: "activities", label: "活动中心" }, { id: "invite", label: "好友邀请" }, { id: "messages", label: "消息中心" }];
const moreFeatures: Array<{ id: "reward-history" | "watch-history"; label: string }> = [{ id: "reward-history", label: "领取记录" }, { id: "watch-history", label: "观看历史" }];
const conversations = [
  { id: "service-rain", nickname: "小雨客服", online: true, lastMessage: "您好，新人首存福利已经为您准备好了～", lastMessageTime: "10:32", messages: [{ id: 1, sender: "service", content: "您好～新人专属首存福利已经为您准备好了 🎁", time: "10:20" }, { id: 2, sender: "service", content: "首次充值 300，可任选：\n首存奖励 +100\n或\n108 包赔福利", time: "10:21" }, { id: 3, sender: "user", content: "两个只能选一个吗？", time: "10:25" }, { id: 4, sender: "service", content: "是的哦，首存奖励和包赔福利二选一即可。\n\n充值完成后就可以参与啦～", time: "10:26" }] },
  { id: "assistant-xinxin", nickname: "欣欣助理", online: true, lastMessage: "首存300可领取100奖励，也可以选择108包赔福利。", lastMessageTime: "09:46", messages: [{ id: 1, sender: "service", content: "早上好～首存 300 可领取 100 奖励，也可以选择 108 包赔福利。", time: "09:42" }, { id: 2, sender: "user", content: "我先了解一下活动规则。", time: "09:45" }, { id: 3, sender: "service", content: "好的，随时为您说明～", time: "09:46" }] },
  { id: "service-angel", nickname: "安琪客服", online: true, lastMessage: "今天的活动奖励记得领取哦～", lastMessageTime: "昨天", messages: [{ id: 1, sender: "service", content: "今天的活动奖励记得领取哦～", time: "昨天 18:30" }, { id: 2, sender: "user", content: "在哪里参加？", time: "昨天 18:34" }, { id: 3, sender: "service", content: "可以前往活动中心查看当前可参与的活动。", time: "昨天 18:35" }] },
  { id: "assistant-deer", nickname: "小鹿助手", online: false, lastMessage: "首存500可选择150奖励或180包赔。", lastMessageTime: "昨天", messages: [{ id: 1, sender: "service", content: "今天还有更高档位的新人福利～\n\n首次充值 500，可任选：\n首存奖励 +150\n或\n180 包赔福利", time: "昨天 16:10" }, { id: 2, sender: "user", content: "包赔是输了才给吗？", time: "昨天 16:13" }, { id: 3, sender: "service", content: "是的，满足活动规则后，如果符合包赔条件，会按照对应活动规则发放奖励。", time: "昨天 16:15" }] },
  { id: "service-coco", nickname: "可可客服", online: true, lastMessage: "您的新人专属活动将在今晚结束。", lastMessageTime: "星期一", messages: [{ id: 1, sender: "service", content: "您的新人专属活动将在今晚结束，记得及时参加哦～", time: "星期一 11:20" }] },
  { id: "assistant-nana", nickname: "娜娜助理", online: true, lastMessage: null, lastMessageTime: null, messages: [] },
  { id: "service-xiaoya", nickname: "小雅客服", online: true, lastMessage: "赛事直播预约成功后会提前提醒您。", lastMessageTime: "星期日", messages: [{ id: 1, sender: "service", content: "赛事直播预约成功后会提前提醒您。", time: "星期日 20:08" }] },
  { id: "assistant-sisi", nickname: "思思助手", online: false, lastMessage: null, lastMessageTime: null, messages: [] },
  { id: "service-mengmeng", nickname: "萌萌客服", online: true, lastMessage: "您的钻石已到账，请注意查收。", lastMessageTime: "星期六", messages: [{ id: 1, sender: "service", content: "您的钻石已到账，请注意查收。", time: "星期六 13:10" }] },
] as const;
type ChatListConversation = (typeof conversations)[number] & { unreadCount: number };
function readChatConversations(): ChatListConversation[] {
  let counts: Record<string, unknown> = {};
  try { counts = JSON.parse(localStorage.getItem("shenma-chat-unread-v1") ?? "{}"); if (!counts || typeof counts !== "object") counts = {}; } catch { /* Use the conversation seed when storage is unavailable. */ }
  return conversations.map((conversation) => ({ ...conversation, unreadCount: Number.isSafeInteger(counts[conversation.id]) && Number(counts[conversation.id]) >= 0 ? Number(counts[conversation.id]) : conversation.messages.filter((message) => message.sender === "service").length }));
}
function unreadLabel(count: number) { return count > 99 ? "99+" : String(count); }
const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
function crest(name: string) { return <img className="club-crest" src={assetUrl("club-crest.png")} alt={`${name} logo`} />; }
function Avatar({ name, index = 0 }: { name: string; index?: number }) { return <span className={`avatar avatar-${index % 6}`} aria-label={`${name} avatar`}>{name.slice(0, 1)}</span>; }
function ServiceAvatar({ name, index, size = "normal" }: { name: string; index: number; size?: "normal" | "small" | "header" | "preview" }) { const hostIndex=hosts.findIndex(host=>host.nickname===name); return <span className={`service-avatar service-avatar-${(hostIndex>=0?hostIndex:index) % 9} service-avatar-${size}`} role="img" aria-label={`${name} 真人头像`} />; }
function EmptyPage({ title }: { title: string }) { return <div className="empty-page"><div className="empty-icon"><PlayIcon /></div><strong>{title}</strong><span>内容正在筹备中</span></div>; }
function appPathname() { const recovered = new URLSearchParams(window.location.search).get("p"); if (recovered?.startsWith("/")) return recovered.split(/[?#]/)[0]; const pathname = window.location.pathname; return pathname.startsWith(pagesProjectBase) ? pathname.slice(pagesProjectBase.length) || "/" : pathname; }
function appUrl(path: string) { return window.location.pathname.startsWith(pagesProjectBase) ? `${pagesProjectBase}${path}` : path; }
function routeFromLocation(): Route {
  if (window.location.hash === "#preview") return "preview";
  const path = appPathname().replace(/^\//, "");
  if (path === "search") return "search";
  if (path === "about") return "about";
  if (path === "about/user-agreement") return "user-agreement";
  if (path === "about/privacy-policy") return "privacy-policy";
  if (path === "data" || path === "news") return "data";
  if (path.startsWith("news/")) return "news-detail";
  if (path === "sports") return "sports";
  if (path === "sports/search") return "sports-search";
  if (path === "sports/filter") return "sports-filter";
  if (path === "sports/filter/results") return "sports-filter-results";
  if (path.startsWith("sports/team/")) return "sports-team";
  if (path.startsWith("sports/event/")) return "sports-detail";
  if (path.startsWith("live/")) return "live";
  if (path.startsWith("users/") || path.startsWith("host/") || path.startsWith("hosts/")) return "user-profile";
  if (path === "tips") return "tips";
  if (path === "tips/ranking") return "tips-ranking";
  if (path.startsWith("tips/expert/")) return "tips-expert";
  if (path.startsWith("tips/plan/")) return "tips-detail";
  if (path.startsWith("messages/")) return "message-detail";
  if (path === "chat") return "chat";
  if (path.startsWith("chat/")) return "chat-detail";
  const candidate = path as Route;
  return ["profile", ...Object.keys(secondaryTitles)].includes(candidate) ? candidate : "home";
}

export default function Prototype() {
  const [userFollowing,toggleUserFollow] = useUserFollowing();
  useEffect(()=>{ const open=(event:Event)=>{const detail=(event as CustomEvent).detail; keyboard.hide();history.pushState({route:'user-profile'},'',appUrl(`/users/${resolveUserId(detail.id)}?tab=${detail.tab||'live'}`));setRoute('user-profile');};window.addEventListener('open-user',open);return()=>window.removeEventListener('open-user',open);},[]);

  const [route, setRoute] = useState<Route>(() => routeFromLocation()); const [tab, setTab] = useState<TabKey>(() => { const initial = routeFromLocation(); return initial === "data" ? "data" : initial === "profile" ? "profile" : initial === "tips" ? "tips" : initial === "chat" || initial === "chat-detail" ? "profile" : initial === "sports" || initial === "sports-search" || initial === "sports-filter" || initial === "sports-filter-results" || initial === "sports-detail" || initial === "sports-team" ? "matches" : "home"; }); const [category, setCategory] = useState("推荐"); const [activeBanner, setActiveBanner] = useState(0); const [bannerRestart, setBannerRestart] = useState(0); const [day, setDay] = useState("today"); const [reminded, setReminded] = useState<number[]>(()=>tipRead("shenma-profile-reminders",[])); useEffect(()=>{localStorage.setItem("shenma-profile-reminders",JSON.stringify(reminded));},[reminded]); const [expanded, setExpanded] = useState<number[]>([]); const [sportsContext, setSportsContext] = useState<SportsFilterContext>(() => readSportsContextFromLocation()); const [sportsFavorites, setSportsFavorites] = useState<string[]>(() => sportsEvents.filter((event) => event.favorite).map((event) => event.id)); const [selectedLeagueIds, setSelectedLeagueIds] = useState<string[]>(() => new URLSearchParams(window.location.search).get("leagues")?.split(",").filter(Boolean) ?? []); const homeScroll = useRef(0); const sportsScroll = useRef(0);
  const [newsSection, setNewsSection] = useState<"headlines" | "data">(() => appPathname() === "/data" ? "data" : "headlines");
  const [newsLeague, setNewsLeague] = useState("全部");
  const [dataSport, setDataSport] = useState<Sport>("football");
  const [dataLeague, setDataLeague] = useState("英超");
  const [dataCompetition, setDataCompetition] = useState<"NBA" | "CBA">("NBA");
  const [chatConversations, setChatConversations] = useState(readChatConversations);
  useEffect(() => { try { localStorage.setItem("shenma-chat-unread-v1", JSON.stringify(Object.fromEntries(chatConversations.map((item) => [item.id, item.unreadCount])))); } catch { /* Keep the current session usable without storage. */ } }, [chatConversations]);
  useEffect(() => { if (route !== "chat-detail") return; const id = appPathname().split("/")[2]; setChatConversations((current) => current.some((item) => item.id === id && item.unreadCount > 0) ? current.map((item) => item.id === id ? { ...item, unreadCount: 0 } : item) : current); }, [route]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => { try { return localStorage.getItem("shenma-login-state") !== "signed-out"; } catch { return true; } });
  const updateLoginState = (loggedIn: boolean) => { setIsLoggedIn(loggedIn); try { localStorage.setItem("shenma-login-state", loggedIn ? "signed-in" : "signed-out"); } catch { /* Preserve the current session when browser storage is unavailable. */ } };
  const [checkIn, setCheckIn] = useState<CheckInState>(readCheckInState);
  useEffect(() => { try { localStorage.setItem(checkInStorageKey, JSON.stringify(checkIn)); } catch { /* Keep the current session usable when storage is unavailable. */ } }, [checkIn]);
  const [taskCenter, setTaskCenter] = useState<TaskCenterState>(initialTaskCenter);
  const [loginMode, setLoginMode] = useState<LoginMode>("code");
  const keyboard = useKeyboard();
  const versionCheck = useAppVersionCheck((path) => { keyboard.hide(); history.pushState({ route: "download" }, "", appUrl(path)); setRoute("download"); });
  useEffect(() => { const handleBack = () => { const next = routeFromLocation(); setRoute(next); setTab(next === "data" ? "data" : next === "profile" ? "profile" : next === "tips" ? "tips" : next === "chat" || next === "chat-detail" ? "profile" : next === "sports" || next === "sports-search" || next === "sports-filter" || next === "sports-filter-results" || next === "sports-detail" || next === "sports-team" ? "matches" : "home"); if (next === "sports-filter-results") { setSportsContext(readSportsContextFromLocation()); setSelectedLeagueIds(new URLSearchParams(window.location.search).get("leagues")?.split(",").filter(Boolean) ?? []); } if (next === "home" || next === "sports" || next === "data") requestAnimationFrame(() => { const node = document.querySelector<HTMLElement>(".mobile-scroll"); if (node) node.scrollTop = next === "data" ? history.state?.scrollTop ?? 0 : next === "home" ? homeScroll.current : sportsScroll.current; }); }; window.addEventListener("popstate", handleBack); return () => window.removeEventListener("popstate", handleBack); }, []);
  useEffect(() => { if (route !== "home" || tab !== "home") return; const timer = window.setTimeout(() => { setActiveBanner((value) => (value + 1) % banners.length); setBannerRestart((value) => value + 1); }, 5000); return () => window.clearTimeout(timer); }, [activeBanner, bannerRestart, route, tab]);
  const selectBanner = (index: number) => { setActiveBanner(index); setBannerRestart((value) => value + 1); };
  const openPreview = () => { homeScroll.current = document.querySelector<HTMLElement>(".mobile-scroll")?.scrollTop ?? 0; history.pushState({ route: "preview" }, "", "#preview"); setRoute("preview"); };
  const openLiveSearch = () => { homeScroll.current = document.querySelector<HTMLElement>(".mobile-scroll")?.scrollTop ?? 0; history.pushState({ route: "search" }, "", appUrl("/search")); setRoute("search"); setTab("home"); };
  const openLiveRoom = (liveRoomId: string) => { homeScroll.current = document.querySelector<HTMLElement>(".mobile-scroll")?.scrollTop ?? 0; history.pushState({ route: "live", liveRoomId }, "", appUrl(`/live/${liveRoomId}`)); setRoute("live"); setTab("home"); };
  const navigate = (next: Route) => { keyboard.hide(); history.pushState({ route: next, chatFromProfile: next === "chat" && route === "profile" }, "", appUrl(next === "home" ? "/" : next === "data" ? "/news" : `/${next}`)); setRoute(next); };
  const openDownload = () => { window.open(appUrl("/download"), "_blank", "noopener,noreferrer"); };
  const openAboutDocument = (next: "user-agreement" | "privacy-policy") => { history.pushState({ route: next }, "", appUrl(`/about/${next}`)); setRoute(next); };
  const openConversation = (id: string) => { history.pushState({ route: "chat-detail", id, fromChatList: route === "chat" }, "", appUrl(`/chat/${id}`)); setRoute("chat-detail"); setTab("profile"); };
  const openSportsSubpage = () => { history.pushState({ route: "sports-search" }, "", appUrl("/sports/search")); setRoute("sports-search"); setTab("matches"); };
  const openSportsFilter = () => { setSelectedLeagueIds([]); history.pushState({ route: "sports-filter" }, "", appUrl("/sports/filter")); setRoute("sports-filter"); setTab("matches"); };
  const openSportsFilterResults = () => { const query = new URLSearchParams({ leagues: selectedLeagueIds.join(","), category: sportsContext.category, status: sportsContext.statusTab }).toString(); history.pushState({ route: "sports-filter-results", selectedLeagueIds, sportsContext }, "", appUrl(`/sports/filter/results?${query}`)); setRoute("sports-filter-results"); setTab("matches"); };
  const toggleSportsFavorite = (id: string) => setSportsFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const openSportsDetail = (id: string) => { sportsScroll.current = document.querySelector<HTMLElement>(".mobile-scroll")?.scrollTop ?? 0; history.pushState({ route: "sports-detail", id }, "", appUrl(`/sports/event/${id}`)); setRoute("sports-detail"); setTab("matches"); };
  const openTeamDetail = (name: string, sport: Sport) => { sportsScroll.current = document.querySelector<HTMLElement>(".mobile-scroll")?.scrollTop ?? 0; history.pushState({ route: "sports-team", name, sport }, "", appUrl(`/sports/team/${encodeURIComponent(name)}?sport=${sport}`)); setRoute("sports-team"); setTab("matches"); };
  const openHomeSportsDetail = (id: string) => { homeScroll.current = document.querySelector<HTMLElement>(".mobile-scroll")?.scrollTop ?? 0; history.pushState({ route: "sports-detail", id, source: "home" }, "", appUrl(`/sports/event/${id}`)); setRoute("sports-detail"); setTab("home"); };
  const openLogin = (mode: LoginMode = "code") => { keyboard.hide(); setLoginMode(mode); navigate("login"); };
  const completeLogin = () => { keyboard.hide(); updateLoginState(true); const tipsReturn = sessionStorage.getItem("tips-login-return"); if (tipsReturn) { sessionStorage.removeItem("tips-login-return"); history.replaceState({ route: "tips" }, "", tipsReturn); setRoute(routeFromLocation()); setTab("tips"); return; } history.replaceState({ route: "profile" }, "", appUrl("/profile")); setRoute("profile"); setTab("profile"); };
  const openForgotPassword = () => { keyboard.hide(); setLoginMode("password"); navigate("forgot-password"); };
  const returnToPasswordLogin = () => { keyboard.hide(); setLoginMode("password"); history.replaceState({ route: "login" }, "", appUrl("/login")); setRoute("login"); };
  const openResetPassword = () => { keyboard.hide(); navigate("reset-password"); };
  const chooseTab = (key: TabKey) => { if (key === tab && ["home", "sports", "data", "tips", "profile"].includes(route)) return; if (key === "data") { setNewsSection("headlines"); navigate("data"); setTab("data"); return; } if (key === "profile") { navigate("profile"); setTab("profile"); return; } if (key === "tips") { navigate("tips"); setTab("tips"); return; } if (key === "matches") { navigate("sports"); setTab("matches"); return; } if (route !== "home") navigate("home"); setTab(key); };
  const secondary = route !== "data" && route !== "home" && route !== "search" && route !== "preview" && route !== "live" && route !== "profile" && route !== "about" && route !== "user-agreement" && route !== "privacy-policy" && route !== "chat" && route !== "chat-detail" && route !== "sports" && route !== "sports-search" && route !== "sports-filter" && route !== "sports-filter-results" && route !== "sports-detail" && route !== "sports-team";
  const conversationId = appPathname().split("/")[2];
  const conversation = chatConversations.find((item) => item.id === conversationId) ?? chatConversations[0];
  const eventId = decodeURIComponent(appPathname().split("/")[3] ?? "");
  const detailEvent = sportsEvents.find((item) => item.id === eventId);
  const liveRoomId = appPathname().split("/")[2] || "live-1";
  const teamName = decodeURIComponent(appPathname().split("/")[3] || "球队"); const teamSport = new URLSearchParams(window.location.search).get("sport") === "basketball" ? "basketball" : "football";
  const accountScreen = (() => {
    if (route === "experience-history" || route === "coin-history" || route === "diamond-history") return <AssetHistoryPage key={route} initialAsset={route === "experience-history" ? "experience" : route === "coin-history" ? "coins" : "diamonds"} onBack={() => { keyboard.hide(); if (history.state?.route) history.back(); else navigate("profile"); }} />;
    if (route === "user-profile" || route === "tips-expert") return <UserProfilePage key={appPathname()} reminded={reminded} setReminded={setReminded} isLoggedIn={isLoggedIn} onLogin={()=>{sessionStorage.setItem("tips-login-return",location.pathname+location.search);openLogin();}} onBack={()=>history.state?.route?history.back():navigate("home")} onOpenLive={openLiveRoom} onNavigate={(path)=>{keyboard.hide();history.pushState({route:"tips"},"",appUrl(path));setRoute(routeFromLocation());}} />;
    if (route.startsWith("tips")) return <><TipsPage key={route + appPathname()} route={route} isLoggedIn={isLoggedIn} onLogin={() => { sessionStorage.setItem("tips-login-return", window.location.pathname); openLogin(); }} onNavigate={(path) => { keyboard.hide(); history.pushState({ route: "tips" }, "", appUrl(path)); setRoute(routeFromLocation()); setTab("tips"); }} onBack={() => { keyboard.hide(); if (history.state?.route) history.back(); else navigate("tips"); }} />{route === "tips" && <BottomTabs active="tips" onSelect={chooseTab} />}</>;
    if (route === "chat") return <div className="task-shell chat-secondary-shell screen-content"><header className="task-toolbar"><AuthHeader title="聊天" onBack={() => { keyboard.hide(); if (history.state?.chatFromProfile) history.back(); else { history.replaceState({ route: "profile" }, "", appUrl("/profile")); setRoute("profile"); setTab("profile"); } }} /></header><MobileScroll className="task-scroll"><ChatListPage conversations={chatConversations} onOpenConversation={openConversation} /></MobileScroll></div>;
    if (route === "chat-detail") return <ChatDetailPage key={conversation.id} conversation={conversation} conversationIndex={chatConversations.findIndex((item) => item.id === conversation.id)} onBack={() => { keyboard.hide(); if (history.state?.fromChatList) history.back(); else { history.replaceState({ route: "chat" }, "", appUrl("/chat")); setRoute("chat"); setTab("profile"); } }} />;
    if (route === "lucky-wheel") return <LuckyWheelPage onTasks={() => navigate("tasks")} onBack={() => { keyboard.hide(); if (history.state?.route) history.back(); else navigate("home"); }} />;
    if (route === "invite" || route === "invite-records") return <InviteFlow recordsPage={route === "invite-records"} onRecords={() => { keyboard.hide(); navigate("invite-records"); }} onBack={() => { keyboard.hide(); if (history.state?.route) history.back(); else navigate(route === "invite-records" ? "invite" : "profile"); }} />;
    if (route === "check-in") return <CheckInPage state={checkIn} onSign={() => { const date = platformDate(); if (checkIn.lastSignedDate !== date) { const next = signCheckIn(checkIn, date); const grant = next.grants[0]; if (next !== checkIn) grantWheelDemoRewards(`check-in-${date}`, grant.rewards, "每日签到"); setCheckIn(next); } }} onBack={() => { keyboard.hide(); if (history.state?.route) history.back(); else navigate("profile"); }} />;
    if (route === "watch-history") return <WatchHistoryPage onOpenLive={openLiveRoom} onBack={() => { keyboard.hide(); if (history.state?.route) history.back(); else navigate("profile"); }} />;
    if (route === "reward-history") return <RewardHistoryPage records={[...taskCenter.records, ...checkIn.grants.map((grant) => ({ id: `check-in-${grant.date}`, taskName: "每日签到", rewards: grant.rewards, claimedAt: grant.claimedAt ?? `${grant.date}T00:00:00+08:00` }))]} onBack={() => { keyboard.hide(); if (history.state?.route) history.back(); else navigate("profile"); }} />;
    if (route === "tasks") return <TaskCenterPage state={taskCenter} onClaim={(id) => { const task = taskCenter.tasks.find((item) => item.id === id); if (task?.status === "ready") { grantWheelDemoRewards(`task-${id}`, task.rewards); setTaskCenter((current) => claimTaskReward(current, id)); } }} onCompleteTask={() => { keyboard.hide(); openLiveRoom("live-1"); }} onBack={() => { keyboard.hide(); if (history.state?.route) history.back(); else navigate("profile"); }} />;
    if (route === "messages" || route === "message-detail") return <StationMessagesPage key={route + appPathname()} messageId={route === "message-detail" ? appPathname().split("/")[2] : undefined} onOpen={(id) => { keyboard.hide(); history.replaceState({ ...history.state, messageScroll: document.querySelector<HTMLElement>(".station-message-scroll")?.scrollTop ?? 0 }, ""); history.pushState({ route: "message-detail", fromMessages: true }, "", appUrl(`/messages/${id}`)); setRoute("message-detail"); }} onBack={() => { keyboard.hide(); if (route === "message-detail") { if (history.state?.fromMessages) history.back(); else navigate("messages"); } else navigate("profile"); }} />;
    if (route === "download") return <DownloadLandingPage />;
    if (route === "profile") return <><MobileScroll className="app-screen"><ProfilePageV3 onCheckUpdate={() => { keyboard.hide(); void versionCheck.check(); }} checkingUpdate={versionCheck.checking} unreadCount={chatConversations.reduce((sum, item) => sum + item.unreadCount, 0)} isLoggedIn={isLoggedIn} onNavigate={(next) => { keyboard.hide(); navigate(next); }} onLogin={() => openLogin()} onLogout={() => updateLoginState(false)} /></MobileScroll><BottomTabs active="profile" onSelect={chooseTab} />{versionCheck.feedback}</>;
    if (route === "login") return <MobileScroll className="app-screen"><LoginPage mode={loginMode} onModeChange={setLoginMode} onBack={() => { keyboard.hide(); history.back(); }} onLogin={completeLogin} onForgotPassword={openForgotPassword} onOpenDocument={openAboutDocument} /></MobileScroll>;
    if (route === "forgot-password") return <MobileScroll className="app-screen"><ForgotPasswordPage onBack={() => { keyboard.hide(); history.back(); }} onBackToLogin={returnToPasswordLogin} onNext={openResetPassword} /></MobileScroll>;
    if (route === "reset-password") return <MobileScroll className="app-screen"><ResetPasswordPage onBack={() => { keyboard.hide(); history.back(); }} onComplete={returnToPasswordLogin} /></MobileScroll>;
    return null;
  })();
  if (route === "news-detail") {
    const article = newsArticles.find((item) => item.id === appPathname().split("/")[2]);
    return <NewsDetailPage article={article} onBack={() => { keyboard.hide(); if (history.state?.route === "news-detail") history.back(); else { setNewsSection("headlines"); navigate("data"); } }} />;
  }
  if (route === "data") return <><section className="news-shell screen-content"><header className="news-toolbar"><nav className="news-primary-tabs" aria-label="资讯分类">{([{ id: "headlines", label: "头条" }, { id: "data", label: "数据" }] as const).map((item) => <button key={item.id} aria-pressed={newsSection === item.id} className={newsSection === item.id ? "active" : ""} onClick={() => setNewsSection(item.id)}>{item.label}</button>)}</nav>{newsSection === "headlines" && <Carousel className="news-leagues" contentClassName="news-league-track" ariaLabel="新闻联赛分类">{newsLeagues.map((item) => <button key={item} aria-pressed={newsLeague === item} className={newsLeague === item ? "active" : ""} onClick={() => { setNewsLeague(item); document.querySelector<HTMLElement>(".news-scroll")?.scrollTo(0, 0); }}>{item}</button>)}</Carousel>}</header><MobileScroll key={newsSection} className="news-scroll">{newsSection === "headlines" ? <NewsList league={newsLeague} onOpen={(id) => { keyboard.hide(); history.replaceState({ ...history.state, scrollTop: document.querySelector<HTMLElement>(".news-scroll")?.scrollTop ?? 0 }, ""); history.pushState({ route: "news-detail" }, "", appUrl(`/news/${id}`)); setRoute("news-detail"); }} /> : <DataPage sport={dataSport} setSport={setDataSport} league={dataLeague} setLeague={setDataLeague} competition={dataCompetition} setCompetition={setDataCompetition} />}</MobileScroll></section><BottomTabs active="data" onSelect={chooseTab} /></>;
  if (accountScreen) return accountScreen;
  return <>{route === "preview" ? <PreviewPage day={day} setDay={setDay} reminded={reminded} setReminded={setReminded} expanded={expanded} setExpanded={setExpanded} onBack={() => history.back()} /> : route === "live" ? <LiveRoomPage renderEventTips={(eventId,onLeave)=><TipEventPlans eventId={eventId} onNavigate={path=>{onLeave();keyboard.hide();history.pushState({route:"tips"},"",appUrl(path));setRoute(routeFromLocation());}}/>} hostIdentity={userForHostId(`host-${Number(liveRoomId.replace('live-',''))||1}`)} hostFollowed={userFollowing.includes(userForHostId(`host-${Number(liveRoomId.replace('live-',''))||1}`).id)} onHostFollow={()=>{if(!isLoggedIn){openLogin();return;}toggleUserFollow(userForHostId(`host-${Number(liveRoomId.replace('live-',''))||1}`).id);}} onOpenHost={()=>requestUserProfile(userForHostId(`host-${Number(liveRoomId.replace('live-',''))||1}`).id,'live')} onNavigate={(next) => { keyboard.hide(); navigate(next); }} key={liveRoomId} getEventById={(id) => sportsEvents.find((event) => event.id === id)} liveRoomId={liveRoomId} renderPrivateMessages={() => <LivePrivateMessages conversations={chatConversations} />} onBack={() => history.back()} /> : route === "search" ? <MobileScroll className="app-screen"><LiveSearchPage onCancel={() => history.back()} onOpenLive={openLiveRoom} /></MobileScroll> : route === "about" ? <MobileScroll className="app-screen"><AboutPage onBack={() => history.back()} onOpenDocument={openAboutDocument} /></MobileScroll> : route === "user-agreement" || route === "privacy-policy" ? <LegalDocumentPage title={route === "user-agreement" ? "用户协议" : "隐私政策"} onBack={() => { keyboard.hide(); if (history.state?.route) history.back(); else navigate("about"); }} /> : route === "sports-detail" ? <MobileScroll className="app-screen"><EventDetailPage event={detailEvent} onBack={() => history.back()} tipsContent={<TipEventPlans eventId={eventId} onNavigate={(path) => { history.pushState({ route: "tips" }, "", appUrl(path)); setRoute(routeFromLocation()); }} />} initialTips={new URLSearchParams(window.location.search).get("tab") === "tips"} /></MobileScroll> : route === "sports-team" ? <MobileScroll className="app-screen"><TeamDetailPage name={teamName} sport={teamSport} favorites={sportsFavorites} onToggleFavorite={toggleSportsFavorite} onOpenEvent={openSportsDetail} onBack={() => history.back()} /></MobileScroll> : route === "sports-search" ? <MobileScroll className="app-screen"><SportsSearchPage favorites={sportsFavorites} onToggleFavorite={toggleSportsFavorite} onOpenEvent={openSportsDetail} onCancel={() => history.back()} /></MobileScroll> : route === "sports-filter" ? <MobileScroll className="app-screen"><SportsFilterPage context={sportsContext} favorites={sportsFavorites} selectedLeagueIds={selectedLeagueIds} setSelectedLeagueIds={setSelectedLeagueIds} onBack={() => history.back()} onConfirm={openSportsFilterResults} /></MobileScroll> : route === "sports-filter-results" ? <MobileScroll className="app-screen"><SportsFilterResultsPage context={sportsContext} selectedLeagueIds={selectedLeagueIds} favorites={sportsFavorites} onToggleFavorite={toggleSportsFavorite} onBack={() => history.back()} onOpenEvent={openSportsDetail} /></MobileScroll> : route === "sports" ? <MobileScroll className="app-screen"><SportsPage onSearch={openSportsSubpage} onFilter={openSportsFilter} onOpenEvent={openSportsDetail} context={sportsContext} setContext={setSportsContext} favorites={sportsFavorites} onToggleFavorite={toggleSportsFavorite} /></MobileScroll> : route === "profile" ? <MobileScroll className="app-screen"><ProfilePageV2 onNavigate={navigate} /></MobileScroll> : secondary ? <MobileScroll className="app-screen">{route === "following" ? <FollowingPage onBack={() => history.back()} /> : <PlaceholderPage title={secondaryTitles[route]} onBack={() => history.back()} />}</MobileScroll> : <MobileScroll className="app-screen">{tab === "home" ? <HomePageV2 categories={categories} banners={banners} matches={[...matches, ...sportsEvents.filter((event) => event.streamers.length > 0 && event.status !== "finished" && !matches.some((match) => match.id === event.id)).slice(0, 6).map((event) => ({ id: event.id, league: event.league, state: event.status === "live" ? "直播中" : event.startTime, home: event.home.name, away: event.away.name, score: event.status === "live" ? `${event.home.score} : ${event.away.score}` : "VS", tone: event.sport === "football" ? "purple" : "blue" }))].map((match) => { const event = sportsEvents.find((item) => item.id === match.id); return { ...match, state: event?.status === "live" ? "直播中" : event?.startTime ?? match.state, streamers: event?.streamers ?? [] }; })} streams={streams} category={category} activeBanner={activeBanner} bannerRestart={bannerRestart} assetUrl={assetUrl} crest={crest} avatar={(name, index) => <ServiceAvatar name={name} index={index} />} setCategory={setCategory} selectBanner={selectBanner} openPreview={openPreview} onDownload={openDownload} onSearch={openLiveSearch} onGame={() => navigate("lucky-wheel")} onOpenLive={openLiveRoom} onOpenEvent={openHomeSportsDetail} /> : <EmptyPage title={{ matches: "赛事", tips: "有料", profile: "我的", data: "资讯", home: "直播" }[tab]} />}</MobileScroll>}{route === "home" && <HomeDownloadBanner assetUrl={assetUrl} onDownload={openDownload} />}{(route === "home" || route === "profile" || route === "tips" || route === "sports") && <BottomTabs active={route === "profile" ? "profile" : route === "tips" ? "tips" : route === "sports" ? "matches" : tab} onSelect={chooseTab} />}</>;
}
function historyRange(days: number) { const end = platformDate(); const date = new Date(`${end}T12:00:00+08:00`); date.setDate(date.getDate() - days + 1); return { start: platformDate(date), end }; }
function AutoLoadMore({ enabled, loading, count, onLoad }: { enabled: boolean; loading: boolean; count: number; onLoad: () => void }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const callback = useRef(onLoad);
  callback.current = onLoad;
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !enabled || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); callback.current(); }
    }, { root: node.closest(".mobile-scroll"), rootMargin: "0px 0px 80px 0px", threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, loading, count]);
  return <div ref={sentinel} className="auto-load-sentinel" aria-live="polite" aria-busy={loading}>{loading ? "正在加载记录…" : null}</div>;
}

type HistoryDateRange = { start: string; end: string };
function calendarDate(year: number, month: number, day: number) { return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; }
function orderedDateRange(a: string, b: string): HistoryDateRange { return a <= b ? { start: a, end: b } : { start: b, end: a }; }
function HistoryDateRangeFilter({ range, quick, onQuick, onRange }: { range: HistoryDateRange; quick: number | null; onQuick: (days: number) => void; onRange: (range: HistoryDateRange) => void }) {
  const [custom, setCustom] = useState(quick === null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [month, setMonth] = useState(() => (range.start || platformDate()).slice(0, 7));
  const today = platformDate();
  const year = Number(month.slice(0, 4)); const monthIndex = Number(month.slice(5, 7)) - 1;
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const shown = pending ? { start: pending, end: pending } : range;
  const calendarKeyboard = useKeyboard();
  const openCalendar = () => { calendarKeyboard.hide(); setPending(null); setMonth((range.start || today).slice(0, 7)); setOpen(true); };
  const closeCalendar = (value: boolean) => { setOpen(value); if (!value) setPending(null); };
  const choose = (date: string) => { if (date > today) return; if (!pending) { setPending(date); return; } onRange(orderedDateRange(pending, date)); setPending(null); setOpen(false); };
  const moveMonth = (direction: number) => { const date = new Date(year, monthIndex + direction, 1, 12); const value = calendarDate(date.getFullYear(), date.getMonth(), 1).slice(0, 7); if (value >= "1900-01" && value <= today.slice(0, 7)) setMonth(value); };
  return <section className="history-filter"><div className="history-quick" aria-label="日期快捷筛选">{[7,30,90].map((days) => <button className={quick === days && !custom ? "active" : ""} onClick={() => { setCustom(false); closeCalendar(false); onQuick(days); }} key={days}>近{days}天</button>)}<button className={custom ? "active" : ""} onClick={() => { setCustom(true); }}>自定义日期</button></div>{custom ? <button className="history-range-trigger" aria-label="选择日期范围" aria-expanded={open} onClick={openCalendar}><ClockIcon /><span>{range.start}</span><span aria-hidden="true">→</span><span>{range.end}</span><ChevronRightIcon /></button> : null}
    <Dialog.Root open={open} onOpenChange={closeCalendar}><Dialog.Portal container={document.querySelector<HTMLElement>(".mobile-h5-container")}><Dialog.Overlay className="calendar-overlay" /><Dialog.Content className="calendar-sheet"><div className="calendar-sheet-heading"><Dialog.Title>选择日期范围</Dialog.Title><Dialog.Close aria-label="关闭日期日历">×</Dialog.Close></div><Dialog.Description className="calendar-sheet-description">{pending ? "请选择结束日期，可选择同一天" : "请选择开始日期，再选择结束日期"}</Dialog.Description>
      <div className="history-calendar"><div className="calendar-range-preview"><span className={pending ? "selecting" : ""}>{pending || range.start}</span><span>→</span><span>{pending ? "选择结束日期" : range.end}</span></div><div className="calendar-month-controls"><button aria-label="上个月" disabled={month === "1900-01"} onClick={() => moveMonth(-1)}>‹</button><div><select aria-label="选择年份" value={year} onChange={(event) => { const nextYear = Number(event.target.value); const nextMonth = nextYear === Number(today.slice(0,4)) ? Math.min(monthIndex, Number(today.slice(5,7)) - 1) : monthIndex; setMonth(calendarDate(nextYear, nextMonth, 1).slice(0,7)); }}>{Array.from({length: Number(today.slice(0,4)) - 1899}, (_, i) => 1900 + i).reverse().map((value) => <option key={value} value={value}>{value}年</option>)}</select><select aria-label="选择月份" value={monthIndex} onChange={(event) => setMonth(calendarDate(year, Number(event.target.value), 1).slice(0,7))}>{Array.from({length:12}, (_, i) => <option value={i} key={i} disabled={calendarDate(year,i,1) > today}>{i+1}月</option>)}</select></div><button aria-label="下个月" disabled={month >= today.slice(0,7)} onClick={() => moveMonth(1)}>›</button></div><div className="calendar-weekdays" aria-hidden="true">{["一","二","三","四","五","六","日"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-days" role="group" aria-label={`${year}年${monthIndex+1}月`}>{Array.from({length:leading},(_,i) => <span key={`blank-${i}`} />)}{Array.from({length:days},(_,i) => { const date = calendarDate(year, monthIndex, i+1); const start = date === shown.start; const end = date === shown.end; const between = date > shown.start && date < shown.end; return <button key={date} aria-label={date} aria-pressed={start || end || between} disabled={date > today} className={`${start ? "range-start" : ""} ${end ? "range-end" : ""} ${between ? "in-range" : ""} ${date === today ? "is-today" : ""}`} onClick={() => choose(date)}><span>{i+1}</span></button>; })}</div><p className="calendar-hint">{pending ? "再次点击日期即可完成选择，支持反向选择" : "连续点击两次日期选择范围，选完自动生效"}</p></div>
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </section>;
}

function AssetHistoryPage({ initialAsset, onBack }: { initialAsset: AssetKind; onBack: () => void }) {
  const [asset, setAsset] = useState(initialAsset);
  const experienceOnly = initialAsset === "experience";
  const [range, setRange] = useState(() => historyRange(30));
  const [quick, setQuick] = useState<number | null>(30);
  const [items, setItems] = useState<AssetEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [assets, setAssets] = useState<WheelAssets | null>(null);
  const generation = useRef(0);
  const loading = useRef(false);
  const load = async (offset: number, version: number) => {
    if (loading.current) return; loading.current = true; setBusy(true); setLoadError("");
    try { const result = await queryAssetEntries(asset, range.start, range.end, offset, 12); if (generation.current !== version) return; setItems((current) => offset ? [...current, ...result.items] : result.items); setHasMore(result.hasMore); }
    catch { if (generation.current === version) setLoadError("记录加载失败，请重试"); }
    finally { if (generation.current === version) { loading.current = false; setBusy(false); } }
  };
  useEffect(() => { const version = ++generation.current; loading.current = false; setItems([]); setHasMore(false); void load(0, version); return () => { generation.current++; }; }, [asset, range.start, range.end]);
  useEffect(() => { let active = true; const refresh = () => void wheelApi.assets().then((value) => { if (active) setAssets(value); }).catch(() => {}); refresh(); window.addEventListener("wheel-assets", refresh); return () => { active = false; window.removeEventListener("wheel-assets", refresh); }; }, []);
  const groups = items.reduce<Record<string, AssetEntry[]>>((result, item) => { const date = platformDate(new Date(item.createdAt)); (result[date] ??= []).push(item); return result; }, {});
  const label = asset === "coins" ? "金币" : asset === "diamonds" ? "钻石" : "累计经验值";
  const balance = asset === "experience" ? wheelExperience(assets) : asset === "coins" ? assets?.coins ?? userData.assets.coins : assets?.diamonds ?? userData.assets.diamonds;
  return <div className="task-shell account-history-shell screen-content"><header className="task-toolbar"><AuthHeader title={experienceOnly ? "经验值记录" : "账变记录"} onBack={onBack} />{!experienceOnly && <nav className="task-tabs" role="tablist" aria-label="资产类型">{(["diamonds", "coins"] as const).map((kind) => <button role="tab" aria-selected={asset === kind} className={asset === kind ? "active" : ""} onClick={() => setAsset(kind)} key={kind}>{kind === "coins" ? "金币" : "钻石"}</button>)}</nav>}</header><MobileScroll className="task-scroll"><main className="task-content account-history-content">{experienceOnly && <section className="account-summary"><span className="profile-vip-badge">VIP {wheelLevel(assets)}</span><p>当前{label}</p><strong>{balance.toLocaleString("zh-CN")}</strong></section>}
  <HistoryDateRangeFilter range={range} quick={quick} onQuick={(days) => { setQuick(days); setRange(historyRange(days)); }} onRange={(value) => { setRange(value); setQuick(null); }} />
  {Object.entries(groups).map(([date, records]) => <section className="account-date-group" key={date}><h2>{date.replace(/^(\d+)-(\d+)-(\d+)$/, "$1年$2月$3日")}</h2><div>{records.map((entry) => <article className="account-entry" key={entry.id}><span className={`account-direction ${entry.amount >= 0 ? "income" : "expense"}`} aria-hidden="true">{entry.amount >= 0 ? "↙" : "↗"}</span><div className="account-entry-description"><h3>{entry.source}</h3><time dateTime={entry.createdAt}>{taskClaimTime(entry.createdAt).slice(11)}</time></div><div className="account-entry-amount"><strong className={entry.amount >= 0 ? "income" : "expense"}>{entry.amount >= 0 ? "+" : ""}{entry.amount.toLocaleString("zh-CN")}</strong>{!experienceOnly && entry.balance !== undefined && <small>余额 {entry.balance.toLocaleString("zh-CN")}</small>}</div></article>)}</div></section>)}
  {!items.length && !busy && !loadError && <div className="task-empty"><ClockIcon /><h2>暂无{experienceOnly ? "经验值" : "账变"}记录</h2><p>当前日期范围内没有记录，试试其他日期</p></div>}{loadError && <p className="history-load-error" role="alert">{loadError}</p>}{loadError && <button className="history-load-retry" onClick={() => void load(items.length, generation.current)}>重新加载</button>}<AutoLoadMore count={items.length} enabled={hasMore && !loadError} loading={busy} onLoad={() => void load(items.length, generation.current)} />{items.length > 0 && !hasMore && !busy && <p className="history-end">已展示全部记录</p>}
  </main></MobileScroll></div>;
}

function RewardHistoryPage({ records, onBack }: { records: TaskRewardRecord[]; onBack: () => void }) {
  return <div className="task-shell screen-content"><header className="task-toolbar"><AuthHeader title="领取记录" onBack={onBack} /></header><MobileScroll className="task-scroll"><main className="task-content"><TaskRewardHistory records={records} /></main></MobileScroll></div>;
}
const watchHistory = streams.slice(0, 6).map((stream, index) => ({ stream, isLive: hosts.find((host) => host.id === stream.hostId)?.status === "live", watchedAt: index < 3 ? "今天" : "昨天" }));
function WatchHistoryPage({ onOpenLive, onBack }: { onOpenLive: (id: string) => void; onBack: () => void }) {
  return <div className="task-shell screen-content"><header className="task-toolbar"><AuthHeader title="观看历史" onBack={onBack} /></header><MobileScroll className="task-scroll"><main className="task-content watch-history-content">{["今天", "昨天"].map((day) => <section key={day}><h2>{day}</h2><div className="stream-grid">{watchHistory.filter((entry) => entry.watchedAt === day).map(({ stream, isLive }, index) => <div className="watch-history-card" key={stream.id}><LiveCard stream={stream} index={index} assetUrl={assetUrl} avatar={(name, avatarIndex) => <Avatar name={name} index={avatarIndex} />} onOpenLive={onOpenLive} /><span className={`watch-history-status ${isLive ? "is-live" : ""}`}>{isLive ? "直播中" : "未开播"}</span></div>)}</div></section>)}</main></MobileScroll></div>;
}

type CheckInDay = { day: number; rewards: TaskReward[] };
type CheckInState = { streak: number; cycleSigned: number; lastSignedDate: string | null; grants: Array<{ date: string; claimedAt?: string; day: number; rewards: TaskReward[] }> };
const checkInStorageKey = "shenma-check-in-v1";
const checkInDays: CheckInDay[] = [
  { day: 1, rewards: [{ type: "coin", name: "金币", quantity: 100, symbol: "●" }] },
  { day: 2, rewards: [{ type: "diamond", name: "钻石", quantity: 10, symbol: "◆" }] },
  { day: 3, rewards: [{ type: "coin", name: "金币", quantity: 100, symbol: "●" }, { type: "diamond", name: "钻石", quantity: 20, symbol: "◆" }, { type: "draw", name: "免费抽奖次数", quantity: 1, symbol: "✧" }] },
  { day: 4, rewards: [{ type: "gift", name: "加油棒", quantity: 1, symbol: "✦" }] },
  { day: 5, rewards: [{ type: "draw", name: "免费转盘抽奖次数", quantity: 2, symbol: "✧" }] },
  { day: 6, rewards: [{ type: "diamond", name: "钻石", quantity: 30, symbol: "◆" }] },
  { day: 7, rewards: [{ type: "mount", name: "星光坐骑（1天）", quantity: 1, symbol: "♞" }, { type: "diamond", name: "钻石", quantity: 50, symbol: "◆" }] },
];
function platformDate(now = new Date()) { return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(now); }
function initialCheckInState(): CheckInState { return { streak: 2, cycleSigned: 2, lastSignedDate: null, grants: [] }; }
function readCheckInState(): CheckInState {
  try { const saved = JSON.parse(localStorage.getItem(checkInStorageKey) ?? "null"); if (saved && Number.isInteger(saved.streak) && saved.streak >= 0 && Number.isInteger(saved.cycleSigned) && saved.cycleSigned >= 0 && saved.cycleSigned <= checkInDays.length && (saved.lastSignedDate === null || /^\d{4}-\d{2}-\d{2}$/.test(saved.lastSignedDate)) && Array.isArray(saved.grants)) return saved; } catch { /* Fall back to the initial prototype state. */ }
  return initialCheckInState();
}
function activeCheckInCycle(state: CheckInState, date: string) { return state.cycleSigned === checkInDays.length && state.lastSignedDate !== date ? 0 : state.cycleSigned; }
function signCheckIn(state: CheckInState, date: string): CheckInState {
  if (state.lastSignedDate === date) return state;
  const signed = activeCheckInCycle(state, date);
  const day = checkInDays[signed];
  if (!day) return state;
  return { streak: state.streak + 1, cycleSigned: signed + 1, lastSignedDate: date, grants: [{ date, claimedAt: new Date().toISOString(), day: day.day, rewards: day.rewards.map((reward) => ({ ...reward })) }, ...state.grants] };
}
function CheckInPage({ state, onSign, onBack }: { state: CheckInState; onSign: () => void; onBack: () => void }) {
  const [today, setToday] = useState(platformDate);
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => { const update = () => setToday(platformDate()); const timer = window.setInterval(update, 1000); window.addEventListener("focus", update); return () => { window.clearInterval(timer); window.removeEventListener("focus", update); }; }, []);
  const signed = activeCheckInCycle(state, today);
  const signedToday = state.lastSignedDate === today;
  const rewardToday = checkInDays[signedToday ? Math.max(0, signed - 1) : signed]?.rewards ?? [];
  const sign = () => { const date = platformDate(); if (state.lastSignedDate === date) return; setToday(date); onSign(); setShowSuccess(true); };
  return <div className="task-shell checkin-shell screen-content"><header className="task-toolbar checkin-fixed-header"><AuthHeader title="每日签到" onBack={onBack} /><section className={`checkin-current-status ${signedToday ? "done" : "available"}`} aria-label="今日签到状态"><div><strong>{signedToday ? "✓ 今日已签到" : "今日尚未签到"}</strong><p>{signedToday ? "今日奖励已领取，明天再来" : "签到即可领取今日全部奖励"}</p></div>{signedToday ? <span className="checkin-status-confirmed">已签到</span> : <button className="auth-primary" onClick={sign}>立即签到</button>}</section></header><MobileScroll className="task-scroll"><main className="task-content checkin-content">
    <section className="checkin-overview"><span>每天相见，每天有礼</span><h2>连续签到 <strong>{state.streak}</strong> 天</h2><p>{signedToday ? "今日已签到，明天继续收获好礼" : "今日好礼已准备，记得来签到"}</p><div className="checkin-overview-icon" aria-hidden="true"><ClockIcon /><b>✓</b></div></section>
    <div className="checkin-section-heading"><h2>7 日签到奖励</h2><span>本轮已签到 {signed}/7 天</span></div>
    <div className="checkin-grid">{checkInDays.map((day, index) => { const status = index < signed ? "signed" : !signedToday && index === signed ? "today" : "future"; return <article className={`checkin-day ${status} ${day.day === 7 ? "cycle-last" : ""}`} key={day.day}><div className="checkin-day-heading"><h3>第{day.day}天</h3><span>{status === "signed" ? "✓ 已签到" : status === "today" ? "今日可签到" : "未到签到时间"}</span></div><TaskRewardBadges rewards={day.rewards} /><div className="checkin-day-footer">{status === "today" ? <button className="auth-primary" onClick={sign}>签到</button> : <span>{status === "signed" ? "奖励已领取" : "等待解锁"}</span>}</div></article>; })}</div>
    <p className="checkin-note">每天可签到一次，领取当天全部奖励。完成 7 天后，次日开启新一轮签到。</p>
    {showSuccess && signedToday && <section className="checkin-success" role="status"><span className="checkin-success-icon" aria-hidden="true">✓</span><div><h2>签到成功</h2><p>本次获得</p><TaskRewardBadges rewards={rewardToday} /></div><button aria-label="关闭签到成功提示" onClick={() => setShowSuccess(false)}>×</button></section>}
  </main></MobileScroll></div>;
}

type TaskReward = { type: string; name: string; quantity: number; symbol: string };
type CenterTask = { id: string; kind: "danmaku" | "watch" | "subscribe"; name: string; description: string; progress: number; target: number; unit?: string; status: "unfinished" | "ready" | "claimed"; rewards: TaskReward[] };
type TaskRewardRecord = { id: string; taskName: string; rewards: TaskReward[]; claimedAt: string };
type TaskCenterState = { tasks: CenterTask[]; records: TaskRewardRecord[] };
const initialTaskCenter: TaskCenterState = {
  tasks: [
    { id: "send-danmaku", kind: "danmaku", name: "发送弹幕", description: "在任意直播间发送一条弹幕，参与精彩互动", progress: 1, target: 1, status: "ready", rewards: [{ type: "diamond", name: "钻石", quantity: 10, symbol: "◆" }, { type: "draw", name: "免费抽奖次数", quantity: 1, symbol: "✧" }] },
    { id: "watch-live", kind: "watch", name: "观看直播 30 秒", description: "观看任意直播累计 30 秒，精彩不错过", progress: 18, target: 30, unit: "秒", status: "unfinished", rewards: [{ type: "coin", name: "金币", quantity: 100, symbol: "●" }] },
    { id: "subscribe-host", kind: "subscribe", name: "订阅主播", description: "关注一位喜欢的主播，及时获取开播动态", progress: 1, target: 1, status: "claimed", rewards: [{ type: "gift", name: "加油棒", quantity: 1, symbol: "✦" }] },
  ],
  records: [
    { id: "history-check-in", taskName: "每日签到", rewards: [{ type: "experience", name: "经验值", quantity: 30, symbol: "✦" }, { type: "diamond", name: "钻石", quantity: 5, symbol: "◆" }], claimedAt: "2026-10-12T17:15:03+08:00" },
    { id: "history-subscribe", taskName: "订阅主播", rewards: [{ type: "gift", name: "加油棒", quantity: 1, symbol: "✦" }], claimedAt: "2026-10-09T10:45:00+08:00" },
    { id: "history-watch", taskName: "观看直播 30 秒", rewards: [{ type: "coin", name: "金币", quantity: 100, symbol: "●" }], claimedAt: "2026-10-08T21:20:00+08:00" },
    { id: "history-send", taskName: "发送弹幕", rewards: [{ type: "diamond", name: "钻石", quantity: 10, symbol: "◆" }], claimedAt: "2026-10-08T20:30:00+08:00" },
    { id: "history-draw", taskName: "观看直播 30 秒", rewards: [{ type: "draw", name: "免费抽奖次数", quantity: 1, symbol: "✧" }], claimedAt: "2026-10-07T19:10:00+08:00" },
    { id: "history-mount", taskName: "订阅主播", rewards: [{ type: "mount", name: "星光坐骑（1天）", quantity: 1, symbol: "♞" }, { type: "item", name: "应援徽章", quantity: 1, symbol: "✪" }], claimedAt: "2026-10-06T18:00:00+08:00" },
  ],
};
function claimTaskReward(state: TaskCenterState, id: string): TaskCenterState {
  const task = state.tasks.find((item) => item.id === id);
  if (!task || task.status !== "ready") return state;
  const claimedAt = new Date().toISOString();
  return { tasks: state.tasks.map((item) => item.id === id ? { ...item, status: "claimed" } : item), records: [{ id: `${id}-${claimedAt}`, taskName: task.name, rewards: task.rewards.map((reward) => ({ ...reward })), claimedAt }, ...state.records] };
}
function taskClaimTime(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(value));
}
function TaskRewardBadges({ rewards }: { rewards: TaskReward[] }) {
  return <div className="task-rewards">{rewards.map((reward, index) => <span className={`task-reward ${reward.type === "coin" ? "coin" : reward.type === "diamond" ? "diamond" : "item"}`} key={`${reward.type}-${index}`}><i aria-hidden="true">{reward.symbol}</i>{reward.name} × {reward.quantity}</span>)}</div>;
}
function TaskRewardHistory({ records }: { records: TaskRewardRecord[] }) {
  if (!records.length) return <div className="task-empty"><ClockIcon /><h2>暂无奖励记录</h2><p>完成任务并领取奖励后，可在这里查看</p></div>;
  return <div className="task-history-list">{[...records].sort((a, b) => Date.parse(b.claimedAt) - Date.parse(a.claimedAt)).map((record) => <article className="task-history-card" key={record.id}><div className="task-history-heading"><h2>{record.taskName}</h2><span>已领取</span></div><TaskRewardBadges rewards={record.rewards} /><time dateTime={record.claimedAt}>领取时间：{taskClaimTime(record.claimedAt)}</time></article>)}</div>;
}
function TaskCenterPage({ state, onClaim, onCompleteTask, onBack }: { state: TaskCenterState; onClaim: (id: string) => void; onCompleteTask: (kind: CenterTask["kind"]) => void; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"list" | "records">("list");
  const [toast, setToast] = useState("");
  const claimPending = useRef(new Set<string>());
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2400); return () => window.clearTimeout(timer); }, [toast]);
  const claim = (task: CenterTask) => {
    if (task.status !== "ready" || claimPending.current.has(task.id)) return;
    claimPending.current.add(task.id); onClaim(task.id); setToast("奖励领取成功");
  };
  const labels = { unfinished: "未完成", ready: "已完成待领取", claimed: "已领取" };
  return <div className="task-shell screen-content"><header className="task-toolbar"><AuthHeader title="任务中心" onBack={onBack} /><nav className="task-tabs" role="tablist" aria-label="任务中心页面"><button id="task-list-tab" role="tab" aria-selected={activeTab === "list"} aria-controls="task-list-panel" className={activeTab === "list" ? "active" : ""} onClick={() => setActiveTab("list")}>任务列表</button><button id="task-records-tab" role="tab" aria-selected={activeTab === "records"} aria-controls="task-records-panel" className={activeTab === "records" ? "active" : ""} onClick={() => setActiveTab("records")}>奖励记录</button></nav></header><MobileScroll className="task-scroll"><main className="task-content" role="tabpanel" id={activeTab === "list" ? "task-list-panel" : "task-records-panel"} aria-labelledby={activeTab === "list" ? "task-list-tab" : "task-records-tab"}>
    {activeTab === "list" ? <><div className="task-intro"><h2>做任务，收获精彩好礼</h2><p>完成任务后，记得领取你的奖励</p></div><div className="task-list">{state.tasks.map((task) => <article className={`task-card ${task.status}`} key={task.id}><div className="task-card-heading"><span className={`task-icon ${task.kind}`} aria-hidden="true">{task.kind === "danmaku" ? <ChatBubbleIcon /> : task.kind === "watch" ? <PlayIcon /> : <PersonIcon />}</span><h2>{task.name}</h2><span className="task-status">{labels[task.status]}</span></div><p className="task-description">{task.description}</p><div className="task-progress-copy"><span>完成进度</span><b>{task.progress}/{task.target}{task.unit ?? ""}</b></div><progress value={task.progress} max={task.target} aria-label={`${task.name}完成进度`} /><div className="task-card-bottom"><div><span className="task-reward-label">任务奖励</span><TaskRewardBadges rewards={task.rewards} /></div><button className={`task-action ${task.status}`} disabled={task.status === "claimed"} onClick={() => task.status === "ready" ? claim(task) : onCompleteTask(task.kind)}>{task.status === "unfinished" ? "去完成" : task.status === "ready" ? "领取奖励" : "已领取"}</button></div></article>)}</div></> : <><div className="task-intro"><h2>我的奖励记录</h2><p>每一份收获，都有迹可循</p></div><TaskRewardHistory records={state.records} /></>}
  </main></MobileScroll>{toast && <div className="invite-toast" role="status">{toast}</div>}</div>;
}

const inviteRewardPerFriend = 88;
type InviteRecord = { name: string; account: string; registeredAt: string; status: "已完成" | "审核中" | "未达成"; reward: number };
const inviteRecords: InviteRecord[] = [
  { name: "球场追风", account: "138****0621", registeredAt: "2026-10-07 09:32", status: "审核中", reward: 0 },
  { name: "看球的小林", account: "186****3918", registeredAt: "2026-10-06 20:18", status: "已完成", reward: inviteRewardPerFriend },
  { name: "三分入网", account: "159****7206", registeredAt: "2026-10-05 18:46", status: "已完成", reward: inviteRewardPerFriend },
  { name: "周末看球", account: "137****8412", registeredAt: "2026-10-04 21:05", status: "未达成", reward: 0 },
  { name: "北看台", account: "188****1623", registeredAt: "2026-10-03 12:26", status: "已完成", reward: inviteRewardPerFriend },
  { name: "小小前锋", account: "136****5908", registeredAt: "2026-10-02 19:40", status: "已完成", reward: inviteRewardPerFriend },
  { name: "一起看决赛", account: "151****2286", registeredAt: "2026-10-01 15:12", status: "已完成", reward: inviteRewardPerFriend },
];
const inviteLink = `https://shenma.live/download?invite=${userData.user.id}`;
function InviteFlow({ recordsPage, onRecords, onBack }: { recordsPage: boolean; onRecords: () => void; onBack: () => void }) {
  const [toast, setToast] = useState("");
  const [sharing, setSharing] = useState(false);
  const shareLock = useRef(false);
  const [filter, setFilter] = useState("全部");
  const toastTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(inviteLink); setToast("邀请链接已复制"); }
    catch { setToast("复制失败，请长按邀请链接复制"); }
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2400);
  };
  const shareInvite = async () => {
    if (shareLock.current) return;
    const notify = (message: string) => { setToast(message); window.clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToast(""), 3000); };
    if (!navigator.share) { notify("当前浏览器暂不支持系统分享，请点击链接右侧复制"); return; }
    shareLock.current = true; setSharing(true);
    try { await navigator.share({ title: "精彩比赛，一起看！邀你加入神马直播", text: "和我一起见证赛场高光，畅聊每个精彩瞬间！点击专属链接下载并注册神马直播。", url: inviteLink }); }
    catch (error) { if (!(error instanceof Error && error.name === "AbortError")) notify("暂时无法分享，请稍后重试或复制邀请链接"); }
    finally { shareLock.current = false; setSharing(false); }
  };
  const completed = inviteRecords.filter((record) => record.status === "已完成").length;
  const earned = inviteRecords.reduce((total, record) => total + record.reward, 0);
  const shown = inviteRecords.filter((record) => filter === "全部" || record.status === filter);
  return <div className="invite-shell screen-content">
    <header className="invite-toolbar"><AuthHeader title={recordsPage ? "邀请记录" : "好友邀请"} onBack={onBack} /></header>
    <MobileScroll className="invite-scroll"><main className="invite-content">
    {recordsPage ? <>
      <section className="invite-record-summary"><span>累计成功邀请</span><strong>{completed}<small> 人</small></strong><p>已获得 <b>{earned}</b> 钻石</p></section>
      <nav className="invite-filters" aria-label="邀请状态筛选">{["全部", "已完成", "审核中", "未达成"].map((status) => <button key={status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>{status}</button>)}</nav>
      <InviteRecordList records={shown} />
      <p className="invite-footnote">每成功邀请一位好友奖励 88 钻石，以平台审核结果为准</p>
    </> : <>
      <section className="invite-hero"><img src={assetUrl("football-hero.png")} alt="足球运动员主题宣传海报" /><div className="invite-hero-copy"><span>与好友一起，见证精彩</span><h1>邀请好友<br /><em>赢钻石好礼</em></h1><p>好友通过你的邀请完成注册</p><div className="invite-hero-reward"><span>每成功邀请一位</span><strong>◆ {inviteRewardPerFriend}<small> 钻石</small></strong></div><small className="invite-hero-reward-note">邀请的越多，奖励越多</small></div><span className="invite-hero-diamond" aria-hidden="true">◆</span></section>
      <section className="invite-card"><div className="invite-section-heading"><h2>我的邀请</h2><button onClick={onRecords}>邀请记录<ChevronRightIcon /></button></div><div className="invite-stats"><div><strong>{completed}<small> 人</small></strong><span>累计成功邀请人数</span></div><div><strong>{earned}<small> 钻石</small></strong><span>已获得钻石数量</span></div></div></section>
      <section className="invite-card invite-share"><h2>邀请好友</h2><p>分享一份精彩，收获一份好礼</p><div className="invite-share-methods"><div className="invite-qr"><img src={assetUrl("invite-qr.svg")} alt="当前用户专属邀请二维码" /></div><div className="invite-share-link"><div className="invite-link-label">我的专属邀请链接</div><div className="invite-link" aria-label="专属邀请链接"><span>{inviteLink}</span><button className="invite-link-copy" aria-label="复制邀请链接" title="复制邀请链接" onClick={copyLink}><CopyIcon /></button></div><p className="invite-qr-hint">好友扫码或通过链接<br />下载并注册神马直播</p></div></div></section>
      <section className="invite-rules"><h2>活动规则</h2><ol><li>被邀请人需通过你的专属邀请链接或二维码下载并完成注册。</li><li>同一用户重复注册不重复计算，仅计入有效邀请。</li><li>每成功邀请一位好友完成有效注册，即可获得 88 钻石；奖励通过平台审核后发放，同一好友仅奖励一次。</li><li>异常账号、作弊注册等情况不计入有效邀请。</li><li>最终有效邀请人数及奖励以平台审核结果为准。</li></ol></section>
    </>}
    </main></MobileScroll>{!recordsPage && <footer className="invite-action-bar"><button className="auth-primary" disabled={sharing} onClick={shareInvite}><Share1Icon />{sharing ? "正在分享…" : "分享邀请链接"}</button></footer>}{toast && <div className="invite-toast" role="status">{toast}</div>}
  </div>;
}
function InviteRecordList({ records }: { records: InviteRecord[] }) {
  if (!records.length) return <div className="invite-empty"><PersonIcon /><h2>暂无邀请记录</h2><p>邀请好友加入，一起见证赛场精彩</p></div>;
  return <section className="invite-record-list">{records.map((record, index) => <article className="invite-record" key={record.account}><Avatar name={record.name} index={index % 6} /><div className="invite-record-person"><b>{record.name}</b><span>{record.account}</span><time>注册时间：{record.registeredAt}</time></div><div className="invite-record-result"><span className={`invite-status status-${record.status}`}>{record.status}</span><b>{record.reward ? `+${record.reward} 钻石` : "—"}</b>{record.status === "未达成" && <small>未通过有效邀请审核</small>}</div></article>)}</section>;
}

function DownloadTutorialVisual({ visual }: { visual: string }) {
  const label: Record<string, string> = { safari: "Safari", "ios-download": "立即下载", "ios-confirm": "安装确认", open: "神马直播", apk: "立即下载", permission: "允许安装", install: "正在安装" };
  return <div className={`download-step-art download-step-art-${visual}`} aria-hidden="true"><div className="download-step-phone"><div className="download-step-notch" /><div className="download-step-screen"><span className="download-step-orb">{visual === "open" ? <img src={assetUrl("reference-icons/app-logo.png?v=20261023")} alt="" /> : visual === "safari" ? "⌁" : visual === "permission" || visual === "ios-confirm" ? "✓" : "↓"}</span><b>{label[visual]}</b><i /><i /><em>{visual === "open" ? "开启精彩直播" : "继续"}</em></div></div><span className="download-step-spark spark-one" /><span className="download-step-spark spark-two" /></div>;
}

function DownloadLandingPage() {
  const [devicePlatform] = useState<DownloadPlatform>(() => /Android/i.test(navigator.userAgent) ? "android" : "ios");
  const [platform, setPlatform] = useState<DownloadPlatform>(devicePlatform);
  const download = () => {
    if (devicePlatform === "android") return;
    setPlatform("ios");
    document.getElementById("download-tutorial-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return <div className="download-shell">
    <MobileScroll className="download-scroll"><main className="download-page screen-content" style={{ "--download-sports-image": `url("${assetUrl("team-header-sport-texture.png")}")` } as CSSProperties}>
      <section className="download-hero" aria-labelledby="download-hero-title">
        <div className="download-brand"><img src={assetUrl("reference-icons/app-logo.png?v=20261023")} alt="神马直播 Logo" /><div><strong>神马直播</strong><span>SPORTS · LIVE · TOGETHER</span></div></div>
        <div className="download-hero-copy"><span>每一刻，都在现场</span><h1 id="download-hero-title">看直播 <em>上神马</em></h1><p>网红女神直播&nbsp;&nbsp; 行业专家赛前预测<br />体育视听盛宴&nbsp;&nbsp; 万千佳人相伴</p></div>
        <div className="download-actions"><button className="download-primary-button" onClick={download}><b>{devicePlatform === "ios" ? "安装教程" : "立即下载"}</b></button></div>
        <div className="download-hero-bottom"><span>赛事直播</span><i /><span>实时互动</span><i /><span>精彩不断</span></div>
      </section>
      <section className="download-features" aria-labelledby="download-features-title"><div className="download-section-heading"><h2 id="download-features-title">精彩功能</h2></div><Carousel className="download-screen-carousel" contentClassName="download-screen-track" ariaLabel="精彩功能页面截图">{downloadScreens.map((screen, index) => <article className="download-screen-card" key={screen.title}><div className="download-feature-shot"><img src={assetUrl(`download/${screen.file}`)} alt={`神马直播${screen.title}页面截图`} draggable="false" /></div><div className="download-screen-caption"><span>0{index + 1} / 04</span><strong>{screen.title}</strong><p>{screen.description}</p></div></article>)}</Carousel></section>
      <section className="download-tutorial" aria-labelledby="download-tutorial-title"><div className="download-section-heading"><h2 id="download-tutorial-title">安装教程</h2></div><div className="download-tutorial-panel"><div className="download-tutorial-tabs" role="tablist" aria-label="选择手机系统"><button role="tab" aria-selected={platform === "ios"} className={platform === "ios" ? "active" : ""} onClick={() => setPlatform("ios")}>苹果桌面快捷方式</button><button role="tab" aria-selected={platform === "ios-webclip"} className={platform === "ios-webclip" ? "active" : ""} onClick={() => setPlatform("ios-webclip")}>苹果快捷版</button><button role="tab" aria-selected={platform === "android"} className={platform === "android" ? "active" : ""} onClick={() => setPlatform("android")}>安卓</button></div><div className="download-step-list" role="tabpanel">{downloadTutorials[platform].map((step) => <article className="download-step" key={`${platform}-${step.title}`}><div className="download-step-copy"><h3>{step.title}</h3><p>{step.description}</p></div>{step.image ? <a className="download-tutorial-photo" href={assetUrl(`download/${step.image}`)} target="_blank" rel="noopener noreferrer" aria-label={`${step.title}，查看操作截图大图`}><img src={assetUrl(`download/${step.image}`)} alt={`${platform === "android" ? "Android" : platform === "ios-webclip" ? "iOS Web Clip" : "iPhone Chrome"} 实际操作截图：${step.title}`} width={step.imageWidth} height={step.imageHeight} loading="lazy" draggable={false} /></a> : <DownloadTutorialVisual visual={step.visual} />}</article>)}</div>{platform === "android" && <p className="download-tutorial-note">不同 Android 品牌的系统提示可能不同，本教程展示通用 APK 安装流程。</p>}</div></section>
      <footer className="download-footer"><img src={assetUrl("reference-icons/app-logo.png?v=20261023")} alt="" /><strong>神马直播</strong><span>热爱不停，精彩不止</span></footer>
    </main></MobileScroll>
  </div>;
}

function HomePage({ category, setCategory, activeBanner, bannerRestart, selectBanner, openPreview }: { category: string; setCategory: (value: string) => void; activeBanner: number; bannerRestart: number; selectBanner: (index: number) => void; openPreview: () => void }) { return <main className="home screen-content"><header className="home-header"><button className="brand" aria-label="神马直播首页"><img className="brand-logo" src={assetUrl("reference-icons/app-logo.png?v=20261023")} alt="" /><b>神马直播</b></button><button className="search" onClick={() => console.info("search click")}><MagnifyingGlassIcon /><span>搜索主播 / 直播</span></button><button className="game-entry" aria-label="自研游戏入口" onClick={() => console.info("game click")}><img className="game-entry-icon" src={assetUrl("reference-icons/game-entry-icon.png?v=d1f9c214")} alt="" /></button></header><nav className="category-row" aria-label="直播分类">{categories.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</nav><section className="hero" aria-label="推荐 Banner">{banners.map((banner, index) => <div className={`hero-slide ${index === activeBanner ? "active" : ""}`} key={banner.title}><img src={assetUrl(banner.image)} alt="足球直播活动" /><div className="hero-copy"><strong>{banner.title}</strong><span>{banner.sub}</span></div></div>)}<div className="banner-progress" aria-label="Banner 进度">{banners.map((banner, index) => <button key={banner.title} onClick={() => selectBanner(index)} className={index === activeBanner ? "progress active" : "progress"}><i key={index === activeBanner ? bannerRestart : "idle"} /></button>)}</div></section><section className="section hot-events"><h2>热门赛事</h2><Carousel className="hot-events-list" contentClassName="hot-events-track" ariaLabel="热门赛事">{matches.map((match) => <article className="match-card" key={match.home}><div className="match-meta"><span className={`league ${match.tone}`}>{match.league}</span><b className={match.state === "直播中" ? "live-text" : ""}>{match.state === "直播中" && <span className="mini-live" />}{match.state}</b></div><div className="clubs"><div>{crest(match.home)}<span>{match.home}</span></div><strong>{match.score}</strong><div>{crest(match.away)}<span>{match.away}</span></div></div></article>)}<button className="preview-card" onClick={openPreview}><span className="calendar-icon"><ClockIcon /></span><strong>直播预告</strong><small>今日 12 场 <ChevronRightIcon /></small></button></Carousel></section><section className="section live-section"><h2>正在直播</h2><div className="stream-grid">{streams.map((stream, index) => <article className="stream-card" key={stream.id}><div className="cover"><img src={assetUrl(stream.image)} alt="" /><span className={`anchor-tag tag-${index % 3}`}>{stream.tag}</span><span className="heat"><span className="heat-flame" aria-hidden="true">🔥</span>{stream.heat}</span></div><strong className="stream-title">{stream.title}</strong><div className="streamer"><span className="anchor"><Avatar name={stream.anchor} index={index} />{stream.anchor}</span></div></article>)}</div></section></main>; }
function PreviewPage({ day, setDay, reminded, setReminded, expanded, setExpanded, onBack }: { day: string; setDay: (day: string) => void; reminded: number[]; setReminded: (ids: number[]) => void; expanded: number[]; setExpanded: (ids: number[]) => void; onBack: () => void }) { const events = previewEvents.filter((event) => event.day === day).sort((a, b) => a.time.localeCompare(b.time)); return <MobileScroll className="app-screen"><main className="preview-page screen-content"><header className="preview-header"><button className="back-button" aria-label="返回首页" onClick={onBack}><ArrowLeftIcon /></button><div><h1>直播预告</h1><p>精彩赛事 · 不容错过</p></div></header><div className="preview-illustration"><ClockIcon /></div><Carousel className="day-carousel" contentClassName="day-track" ariaLabel="日期选择">{previewDays.map((item) => <button key={item.id} className={item.id === day ? "day-chip active" : "day-chip"} onClick={() => setDay(item.id)}><b>{item.label}</b><span>{previewEvents.filter((event) => event.day === item.id).length}</span></button>)}</Carousel><section className="event-list">{events.length ? events.map((event) => <PreviewEvent key={event.id} event={event} reminded={reminded.includes(event.id)} onReminder={() => setReminded(reminded.includes(event.id) ? reminded.filter((id) => id !== event.id) : [...reminded, event.id])} expanded={expanded.includes(event.id)} onExpand={() => setExpanded(expanded.includes(event.id) ? expanded.filter((id) => id !== event.id) : [...expanded, event.id])} />) : <div className="no-events">当天暂无直播预告</div>}</section></main></MobileScroll>; }
function PreviewEvent({ event, reminded, onReminder, expanded, onExpand, onEnterLive, compact=false }: { compact?:boolean;onEnterLive?:()=>void;event: typeof previewEvents[number]; reminded: boolean; onReminder: () => void; expanded: boolean; onExpand: () => void }) { const shown = expanded ? event.anchors : event.anchors.slice(0, 3); const more = event.anchors.length - 3; const isLive = event.status === "直播中"; const isFinished = event.status === "已结束"; const boundEvent="eventId" in event?sportsEvents.find(item=>item.id===event.eventId):undefined; const scoreLabel=isLive&&boundEvent?matchScoreLabel(boundEvent):"VS"; if(compact) return <article className="user-schedule-card"><header><span>{event.league}</span><time>{event.anchors[0]?.time||event.time}</time>{isLive?<button className="user-live-status" onClick={onEnterLive}>直播中 <ChevronRightIcon/></button>:<button className={reminded?'user-reminder active':'user-reminder'} onClick={onReminder}><ClockIcon/>{reminded?'已预约':'预约'}</button>}</header><div className="user-schedule-teams"><span><TeamBadge name={event.home}/><b>{event.home}</b></span><strong>{scoreLabel}</strong><span><TeamBadge name={event.away}/><b>{event.away}</b></span></div></article>; return <article className={`${more > 0 ? "event-card has-more-anchors" : "event-card"}${isFinished ? " event-finished" : ""}`}><div className="event-info"><div className="event-top"><strong>{event.time}</strong><span className={`league ${event.color}`}>{event.league}</span></div><span className="event-day">{event.day === "today" ? "今天" : event.day === "tomorrow" ? "明天" : "赛事日"}</span>{isLive && <span className="event-status event-status-live">直播中</span>}<div className="event-clubs"><div>{crest(event.home)}<span>{event.home}</span></div><b>{scoreLabel}</b><div>{crest(event.away)}<span>{event.away}</span></div></div></div><div className="anchor-panel">{(isLive || isFinished) && <div className="anchor-panel-head"><b>{event.anchors.length} 位主播{isFinished ? "已播" : "直播中"}</b></div>}<div className="anchor-list">{shown.map((anchor, index) => <button className="anchor-row" key={`${anchor.name}-${index}`} disabled={isFinished} onClick={isFinished ? undefined : () => onEnterLive?onEnterLive():requestUserProfile(hosts.find(h=>h.nickname===anchor.name)?.id||'host-1','live')}><ServiceAvatar name={anchor.name} index={index + event.id} size="preview" /><span><b>{anchor.name}</b></span>{!isFinished && <ChevronRightIcon />}</button>)}</div>{more > 0 && <button className="more-anchors" onClick={onExpand}>{expanded ? "收起主播" : <><b>+{more}</b> 查看更多主播</>}</button>}</div></article>; }
function ProfilePageV2({ onNavigate }: { onNavigate: (route: Route) => void }) {
  const groups: Array<Array<{ id: Route; label: string; tone: string }>> = [
    [{ id: "tasks", label: "任务中心", tone: "more-0" }, { id: "reward-history", label: "领取记录", tone: "more-1" }],
    [{ id: "invite", label: "好友邀请", tone: "more-0" }],
    [{ id: "watch-history", label: "观看历史", tone: "more-2" }],
    [{ id: "about", label: "关于我们", tone: "more-0" }],
  ];
  return <main className="profile-page screen-content"><header className="profile-top"><div className="profile-actions"><button className="profile-action" aria-label="消息中心" onClick={() => onNavigate("messages")}><ChatBubbleIcon /><i className="profile-badge" aria-hidden="true" /></button></div></header><section className="profile-user-card"><div className="profile-user">{userData.isLoggedIn ? <Avatar name={userData.user.nickname} index={1} /> : <span className="profile-logo">马</span>}<button className="profile-name" onClick={() => !userData.isLoggedIn && onNavigate("login")}>{userData.isLoggedIn ? userData.user.nickname : "登录 / 注册"}{!userData.isLoggedIn && <ChevronRightIcon />}</button></div><button className="following-total" onClick={() => onNavigate("following")}><strong>{formatNumber(userData.user.followingCount)}</strong><span>关注</span><ChevronRightIcon /></button></section><section className="asset-card"><div className="asset-item"><div><span className="asset-diamond">◆</span><small>钻石</small></div><b>{formatNumber(userData.assets.diamonds)}</b><button onClick={() => onNavigate("recharge")}>充值</button></div><div className="asset-divider" /><div className="asset-item"><div><span className="asset-coin">●</span><small>金币</small></div><b>{formatNumber(userData.assets.coins)}</b><button onClick={() => onNavigate("tasks")}>赚金币</button></div></section><section className="profile-feature-groups">{groups.map((group, groupIndex) => <div className="feature-group" key={groupIndex}>{group.map((feature) => <button className="feature-row" key={feature.id} onClick={() => onNavigate(feature.id)}><span className={`more-icon ${feature.tone}`}>{feature.id === "about" ? <InfoCircledIcon /> : <ClockIcon />}</span><b>{feature.label}</b><ChevronRightIcon /></button>)}</div>)}</section></main>;
}

type VipThreshold = { level: number; experience: number };
const vipThresholds: VipThreshold[] = [{ level: 1, experience: 0 }, { level: 2, experience: 500 }, { level: 3, experience: 1500 }, { level: 4, experience: 5000 }, { level: 5, experience: 10000 }, { level: 6, experience: 20000 }];
function vipProgress(level: number, experience: number, thresholds: VipThreshold[]) {
  const sorted = [...thresholds].sort((a, b) => a.level - b.level);
  const current = sorted.find((item) => item.level === level) ?? sorted[0];
  const next = sorted.find((item) => item.level > current.level);
  const progress = next ? Math.max(0, Math.min(1, (experience - current.experience) / (next.experience - current.experience))) : 1;
  return { current, next, progress };
}
function wheelExperience(assets: WheelAssets | null) {
  return assets?.totalExperience ?? userData.user.experience + (assets?.experience ?? 0);
}
function wheelLevel(assets: WheelAssets | null) {
  const experience = wheelExperience(assets);
  return assets?.level ?? [...vipThresholds].reverse().find((item) => experience >= item.experience)?.level ?? vipThresholds[0].level;
}
function ProfileVip({ level, experience, thresholds, onHistory }: { level: number; experience: number; thresholds: VipThreshold[]; onHistory: () => void }) {
  const { current, next, progress } = vipProgress(level, experience, thresholds);
  const number = (value: number) => value.toLocaleString("zh-CN");
  return <div className="profile-vip"><div className="profile-vip-heading"><span className="profile-vip-badge"><span aria-hidden="true">♛</span> VIP {current.level}</span>{!next && <span>已达最高等级</span>}</div><button className="profile-vip-experience" onClick={onHistory} aria-label="经验值记录"><span>经验值 <ChevronRightIcon /></span><b>{number(experience)}{next ? ` / ${number(next.experience)}` : ""}</b></button><progress value={progress} max={1} aria-label={next ? `当前等级升级进度 ${Math.round(progress * 100)}%` : "已达最高等级"} /></div>;
}

type AppVersionResult = { currentVersion: string; latestVersion: string; changes: string[]; forceUpdate: boolean; updatePath: string };
const appVersionScenarios: AppVersionResult[] = [
  { currentVersion: appInfo.version, latestVersion: appInfo.version, changes: [], forceUpdate: false, updatePath: "/download" },
  { currentVersion: appInfo.version, latestVersion: "1.2.0", changes: ["优化直播播放体验，观看更加流畅。", "新增更多精彩赛事和直播内容。", "修复部分已知问题，提升使用稳定性。"], forceUpdate: false, updatePath: "/download" },
  { currentVersion: appInfo.version, latestVersion: "1.3.0", changes: ["升级直播播放服务，改善画面流畅度。", "优化聊天与消息接收体验。", "修复重要兼容性问题，请更新后继续使用。"], forceUpdate: true, updatePath: "/download" },
];
async function checkAppVersion(index: number): Promise<AppVersionResult> { return structuredClone(appVersionScenarios[index % appVersionScenarios.length]); }
function VersionUpdateDialog({ version, onCancel, onUpdate }: { version: AppVersionResult | null; onCancel: () => void; onUpdate: () => void }) {
  return <Dialog.Root open={version !== null} onOpenChange={(open) => { if (!open && !version?.forceUpdate) onCancel(); }}><Dialog.Portal container={document.querySelector<HTMLElement>(".mobile-h5-container")}><Dialog.Overlay className="calendar-overlay" /><Dialog.Content className="version-update-dialog" aria-label="版本更新" onEscapeKeyDown={(event) => { if (version?.forceUpdate) event.preventDefault(); }} onPointerDownOutside={(event) => { if (version?.forceUpdate) event.preventDefault(); }} onInteractOutside={(event) => { if (version?.forceUpdate) event.preventDefault(); }}><span className="version-update-icon" aria-hidden="true">↑</span><Dialog.Title>发现新版本</Dialog.Title><Dialog.Description>最新版本：V{version?.latestVersion}</Dialog.Description><div className="version-update-notes"><h3>更新内容</h3><ol>{version?.changes.map((change, index) => <li key={index}>{change}</li>)}</ol>{version?.forceUpdate && <p>请更新至最新版本后继续使用</p>}</div><div className="version-update-actions">{!version?.forceUpdate && <button className="version-update-cancel" onClick={onCancel}>取消</button>}<button className="auth-primary" onClick={onUpdate}>立即更新</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
function useAppVersionCheck(onUpdate: (path: string) => void) {
  const [checking, setChecking] = useState(false);
  const [version, setVersion] = useState<AppVersionResult | null>(null);
  const [toast, setToast] = useState("");
  const sequence = useRef(0);
  const locked = useRef(false);
  const forced = useRef(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; const guardBack = (event: PopStateEvent) => { if (!forced.current) return; event.stopImmediatePropagation(); history.pushState({ route: "profile", forceUpdateGuard: true }, "", appUrl("/profile")); }; window.addEventListener("popstate", guardBack, true); return () => { mounted.current = false; window.clearTimeout(toastTimer.current); window.removeEventListener("popstate", guardBack, true); }; }, []);
  const check = async () => {
    if (locked.current || version) return; locked.current = true; setChecking(true);
    try { const result = await checkAppVersion(sequence.current); if (!mounted.current) return; sequence.current++;
      if (result.latestVersion === result.currentVersion) { setToast("当前已是最新版本"); window.clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToast(""), 2400); }
      else { setToast(""); forced.current = result.forceUpdate; if (result.forceUpdate) history.pushState({ ...history.state, forceUpdateGuard: true }, "", window.location.href); setVersion(result); }
    } catch { if (mounted.current) { setToast("检查失败，请稍后重试"); window.clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToast(""), 2400); } }
    finally { locked.current = false; if (mounted.current) setChecking(false); }
  };
  const update = () => { if (!version) return; const path = version.updatePath; forced.current = false; setVersion(null); history.replaceState({ ...history.state, forceUpdateGuard: false }, ""); onUpdate(path); };
  return { checking, check, feedback: <><VersionUpdateDialog version={version} onCancel={() => { if (!forced.current) setVersion(null); }} onUpdate={update} />{toast && <div className="invite-toast version-check-toast" role="status">{toast}</div>}</> };
}

function ProfilePageV3({ onCheckUpdate, checkingUpdate, unreadCount, isLoggedIn, onNavigate, onLogin, onLogout }: { onCheckUpdate: () => void; checkingUpdate: boolean; unreadCount: number; isLoggedIn: boolean; onNavigate: (route: Route) => void; onLogin: () => void; onLogout: () => void }) {
  const [wheelAssets, setWheelAssets] = useState<WheelAssets | null>(null);
  useEffect(() => { let active = true; const refresh = () => { void wheelApi.assets().then((assets) => { if (active) setWheelAssets(assets); }).catch(() => {}); }; refresh(); window.addEventListener('wheel-assets', refresh); return () => { active = false; window.removeEventListener('wheel-assets', refresh); }; }, []);
  const groups: Array<Array<{ id: Route | "check-update"; label: string; tone: string }>> = [
    [{ id: "diamond-history", label: "账变记录", tone: "more-1" }],
    [{ id: "tasks", label: "任务中心", tone: "more-0" }, { id: "check-in", label: "每日签到", tone: "more-2" }, { id: "reward-history", label: "领取记录", tone: "more-1" }],
    [{ id: "invite", label: "好友邀请", tone: "more-0" }],
    [{ id: "messages", label: "站内信", tone: "more-1" }],
    [{ id: "watch-history", label: "观看历史", tone: "more-2" }],
    [{ id: "check-update", label: "检查更新", tone: "more-1" }],
    [{ id: "about", label: "关于我们", tone: "more-0" }],
  ];
  return <main className="profile-page screen-content">
    <header className="profile-top"><div className="profile-actions"><button className="profile-action" aria-label={unreadCount > 0 ? `聊天，${unreadLabel(unreadCount)}条未读消息` : "聊天"} onClick={() => onNavigate("chat")}><ChatBubbleIcon />{unreadCount > 0 && <span className="profile-chat-unread">{unreadLabel(unreadCount)}</span>}</button></div></header>
    <section className={`profile-user-card ${isLoggedIn ? "" : "logged-out"}`}>
      <div className="profile-user">
        {isLoggedIn ? <Avatar name={userData.user.nickname} index={1} /> : <button className="profile-avatar-placeholder" aria-label="登录" onClick={onLogin}><PersonIcon /></button>}
        {isLoggedIn ? <div className="profile-identity"><strong>{userData.user.nickname}</strong><small>ID：{userData.user.id}</small></div> : <button className="profile-login-entry" onClick={onLogin}><span className="profile-name">登录<ChevronRightIcon /></span><small>登录后获取更多精彩内容哦~</small></button>}
      </div>
      {isLoggedIn && <ProfileVip level={wheelLevel(wheelAssets)} experience={wheelExperience(wheelAssets)} thresholds={vipThresholds} onHistory={() => onNavigate("experience-history")} />}
      <button className="following-total" onClick={() => isLoggedIn ? onNavigate("following") : onLogin()}><strong>{isLoggedIn ? formatNumber(userData.user.followingCount) : "0"}</strong><span>关注</span><ChevronRightIcon /></button>
    </section>
    <section className="asset-card"><div className="asset-item"><div><span className="asset-diamond">◆</span><small>钻石</small></div><b>{isLoggedIn ? formatNumber(wheelAssets?.diamonds ?? userData.assets.diamonds) : "0"}</b><button onClick={() => onNavigate("recharge")}>充值</button></div><div className="asset-divider" /><div className="asset-item"><div><span className="asset-coin">●</span><small>金币</small></div><b>{isLoggedIn ? formatNumber(wheelAssets?.coins ?? userData.assets.coins) : "0"}</b><button onClick={() => onNavigate("tasks")}>赚金币</button></div></section>
    <InviteAdvertisement onClick={() => onNavigate("invite")} />
    <section className="profile-feature-groups">{groups.map((group, groupIndex) => <div className="feature-group" key={groupIndex}>{group.map((feature) => <button className="feature-row" key={feature.id} disabled={feature.id === "check-update" && checkingUpdate} onClick={() => feature.id === "check-update" ? onCheckUpdate() : onNavigate(feature.id)}><span className={`more-icon ${feature.tone}`}>{feature.id === "about" ? <InfoCircledIcon /> : <ClockIcon />}</span><b>{feature.id === "check-update" && checkingUpdate ? "检查中…" : feature.label}</b><ChevronRightIcon /></button>)}</div>)}</section>
    {isLoggedIn && <button className="profile-logout" onClick={onLogout}>退出登录</button>}
  </main>;
}

function useVerificationCountdown() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);
  return { seconds, start: () => setSeconds(60) };
}

function AuthHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return <header className="sub-header auth-header"><button className="back-button" aria-label="返回" onClick={onBack}><ArrowLeftIcon /></button><h1>{title}</h1></header>;
}

function PhoneField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const keyboard = useKeyboard();
  return <label className="auth-field"><span className="auth-prefix">+86</span><KeyboardInput value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 11))} onBlur={() => keyboard.hide()} inputMode="numeric" autoComplete="tel" placeholder="请输入手机号" aria-label="手机号" /></label>;
}

function LoginPage({ mode, onModeChange, onBack, onLogin, onForgotPassword, onOpenDocument }: { mode: LoginMode; onModeChange: (mode: LoginMode) => void; onBack: () => void; onLogin: () => void; onForgotPassword: () => void; onOpenDocument: (route: "user-agreement" | "privacy-policy") => void }) {
  const keyboard = useKeyboard();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const countdown = useVerificationCountdown();
  const credential = mode === "code" ? code : password;
  const canSubmit = Boolean(phone.trim() && credential.trim() && agreed);
  return <main className="auth-page screen-content">
    <AuthHeader title="登录" onBack={onBack} />
    <nav className="auth-tabs" aria-label="登录方式"><button className={mode === "code" ? "active" : ""} onClick={() => onModeChange("code")}>验证码登录</button><button className={mode === "password" ? "active" : ""} onClick={() => onModeChange("password")}>密码登录</button></nav>
    <section className="auth-card">
      <PhoneField value={phone} onChange={setPhone} />
      <label className="auth-field"><KeyboardInput value={credential} onChange={(event) => mode === "code" ? setCode(event.target.value.replace(/\D/g, "").slice(0, 6)) : setPassword(event.target.value)} onBlur={() => keyboard.hide()} type={mode === "password" ? "password" : "text"} inputMode={mode === "code" ? "numeric" : "text"} autoComplete={mode === "code" ? "one-time-code" : "current-password"} placeholder={mode === "code" ? "请输入验证码" : "请输入密码"} aria-label={mode === "code" ? "验证码" : "密码"} />{mode === "code" && <button type="button" className="auth-inline-action" disabled={!phone.trim() || countdown.seconds > 0} onClick={countdown.start}>{countdown.seconds > 0 ? `重新获取 ${countdown.seconds}s` : "获取验证码"}</button>}</label>
      {mode === "password" && <button className="forgot-link" onClick={onForgotPassword}>忘记密码</button>}
      <p className="auth-note">未注册的手机号将自动创建神马直播平台账号</p>
      <label className="auth-agreement"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span>我已阅读并接受 <button type="button" onClick={() => onOpenDocument("user-agreement")}>直播协议</button> 和 <button type="button" onClick={() => onOpenDocument("privacy-policy")}>隐私政策</button></span></label>
      <button className="auth-primary" disabled={!canSubmit} onClick={onLogin}>登录</button>
    </section>
  </main>;
}

function ForgotPasswordPage({ onBack, onBackToLogin, onNext }: { onBack: () => void; onBackToLogin: () => void; onNext: () => void }) {
  const keyboard = useKeyboard();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const countdown = useVerificationCountdown();
  const canContinue = Boolean(phone.trim() && code.trim());
  return <main className="auth-page screen-content"><AuthHeader title="忘记密码" onBack={onBack} /><section className="auth-step-copy"><span>1 / 2</span><h2>验证手机号</h2><p>通过短信验证码确认账号归属</p></section><section className="auth-card"><PhoneField value={phone} onChange={setPhone} /><label className="auth-field"><KeyboardInput value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} onBlur={() => keyboard.hide()} inputMode="numeric" autoComplete="one-time-code" placeholder="请输入验证码" aria-label="验证码" /><button type="button" className="auth-inline-action" disabled={!phone.trim() || countdown.seconds > 0} onClick={countdown.start}>{countdown.seconds > 0 ? `重新获取 ${countdown.seconds}s` : "获取验证码"}</button></label><button className="auth-primary" disabled={!canContinue} onClick={onNext}>下一步</button><button className="auth-secondary" onClick={onBackToLogin}>返回登录</button></section></main>;
}

function ResetPasswordPage({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const keyboard = useKeyboard();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(onComplete, 1200);
    return () => window.clearTimeout(timer);
  }, [onComplete, success]);
  const submit = () => {
    if (password !== confirmation) { setError("两次输入的密码不一致，请重新输入"); return; }
    keyboard.hide(); setError(""); setSuccess(true);
  };
  return <main className="auth-page screen-content"><AuthHeader title="设置新密码" onBack={onBack} /><section className="auth-step-copy"><span>2 / 2</span><h2>设置新密码</h2><p>请设置并再次确认新的登录密码</p></section><section className="auth-card"><label className="auth-field"><KeyboardInput value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} onBlur={() => keyboard.hide()} type="password" autoComplete="new-password" placeholder="请输入新密码" aria-label="新密码" /></label><label className={`auth-field ${error ? "error" : ""}`}><KeyboardInput value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError(""); }} onBlur={() => keyboard.hide()} type="password" autoComplete="new-password" placeholder="请再次输入新密码" aria-label="确认新密码" /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-primary" disabled={!password.trim() || !confirmation.trim() || success} onClick={submit}>下一步</button></section>{success && <div className="auth-toast" role="status">密码修改完成</div>}</main>;
}

function ProfilePage({ onNavigate }: { onNavigate: (route: Route) => void }) {
  const featureIcons = [LightningBoltIcon, PlayIcon, PersonIcon, SpeakerLoudIcon];
  return <main className="profile-page screen-content"><header className="profile-top"><button className="profile-settings" aria-label="设置" onClick={() => onNavigate("settings")}><GearIcon /></button></header><section className="profile-user-card"><div className="profile-user">{userData.isLoggedIn ? <Avatar name={userData.user.nickname} index={1} /> : <span className="profile-logo">马</span>}<button className="profile-name" onClick={() => !userData.isLoggedIn && onNavigate("login")}>{userData.isLoggedIn ? userData.user.nickname : "登录 / 注册"}{!userData.isLoggedIn && <ChevronRightIcon />}</button>{userData.isLoggedIn && <button className="noble-entry" onClick={() => onNavigate("noble-gift")}><span>礼</span><b>贵族盲盒</b><ChevronRightIcon /></button>}</div><button className="following-total" onClick={() => onNavigate("following")}><strong>{formatNumber(userData.user.followingCount)}</strong><span>关注</span><ChevronRightIcon /></button></section><section className="asset-card"><div className="asset-item"><div><span className="asset-diamond">◆</span><small>钻石</small></div><b>{formatNumber(userData.assets.diamonds)}</b><button onClick={() => onNavigate("recharge")}>充值</button></div><div className="asset-divider" /><div className="asset-item"><div><span className="asset-coin">●</span><small>金币</small></div><b>{formatNumber(userData.assets.coins)}</b><button onClick={() => onNavigate("tasks")}>赚金币</button></div></section><section className="profile-section"><h2>常用功能</h2><div className="common-grid">{commonFeatures.map((feature, index) => { const Icon = featureIcons[index]; return <button key={feature.id} onClick={() => onNavigate(feature.id)}><span className={`common-icon icon-${index}`}><Icon /></span><b>{feature.label}</b></button>; })}</div></section><section className="profile-section"><h2>更多功能</h2><div className="more-list">{moreFeatures.map((feature, index) => <button key={feature.id} onClick={() => onNavigate(feature.id)}><span className={`more-icon more-${index}`}><ClockIcon /></span><b>{feature.label}</b><ChevronRightIcon /></button>)}</div></section></main>;
}
function AboutPage({ onBack, onOpenDocument }: { onBack: () => void; onOpenDocument: (route: "user-agreement" | "privacy-policy") => void }) { return <main className="about-page screen-content"><header className="sub-header"><button className="back-button" aria-label="返回我的" onClick={onBack}><ArrowLeftIcon /></button><h1>关于我们</h1></header><section className="about-app-info"><img src={assetUrl("reference-icons/app-logo.png?v=20261023")} alt={`${appInfo.name} Logo`} /><strong>{appInfo.name}</strong><span>版本 {appInfo.version}</span></section><section className="about-links"><button onClick={() => onOpenDocument("user-agreement")}><b>用户协议</b><ChevronRightIcon /></button><button onClick={() => onOpenDocument("privacy-policy")}><b>隐私政策</b><ChevronRightIcon /></button></section></main>; }
function LegalDocumentPage({ title, onBack }: { title: string; onBack: () => void }) {
  const text = title === "用户协议" ? userAgreementText : privacyPolicyText;
  return <section className="task-shell screen-content"><header className="task-toolbar"><AuthHeader title={title} onBack={onBack} /></header><MobileScroll key={title} className="task-scroll"><main className="task-content legal-document-content"><article className="legal-copy"><h2>神马直播{title}</h2>{text.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => /^(?:[一二三四五六七八九十百]+、|第[一二三四五六七八九十]+部分|特别声明$)/.test(line) ? <h3 key={index}>{line}</h3> : <p key={index} className={/^(?:【特别提示】|请务必|未满18周岁)/.test(line) ? "legal-emphasis" : undefined}>{line}</p>)}</article></main></MobileScroll></section>;
}
function PlaceholderPage({ title, onBack }: { title: string; onBack: () => void }) { return <main className="subpage screen-content"><header className="sub-header"><button className="back-button" aria-label="返回" onClick={onBack}><ArrowLeftIcon /></button><h1>{title}</h1></header><div className="sub-empty"><PlayIcon /><span>内容正在筹备中</span></div></main>; }
function FollowingPage({ onBack }: { onBack: () => void }) { return <main className="subpage following-page screen-content"><header className="sub-header"><button className="back-button" aria-label="返回" onClick={onBack}><ArrowLeftIcon /></button><h1>我的关注</h1></header><section className="following-list">{userData.following.map((anchor, index) => <button key={anchor.nickname} className="following-row" onClick={() => requestUserProfile(hosts.find(h=>h.nickname===anchor.nickname)?.id||'host-1','live')}><ServiceAvatar name={anchor.nickname} index={index} /><span><b>{anchor.nickname}</b><small>{anchor.followers} 粉丝</small></span><em className={anchor.status === "live" ? "follow-live" : "follow-offline"}>{anchor.status === "live" ? "直播中" : "未开播"}</em><ChevronRightIcon /></button>)}</section></main>; }
type SportCategory = "主播" | "推荐" | "足球" | "篮球";
type EventStatusTab = "即时" | "赛程" | "赛果" | "排行" | "收藏";
const sportCategories: SportCategory[] = ["主播", "推荐", "足球", "篮球"];
// Keep dormant categories and rankings implemented; only their entry points are disabled.
const sportsNavigation = { hiddenCategories: ["主播", "推荐"] as SportCategory[], showRankings: false };
const visibleSportCategories = sportCategories.filter((item) => !sportsNavigation.hiddenCategories.includes(item));
const statusTabs: EventStatusTab[] = ["即时", "赛程", "赛果", "排行", "收藏"];
const statusForTab: Record<Exclude<EventStatusTab, "收藏" | "排行">, EventStatus> = { 即时: "live", 赛程: "upcoming", 赛果: "finished" };
type SportsFilterContext = { category: SportCategory; statusTab: EventStatusTab };
type LeagueDefinition = { id: string; name: string; initial: string };
const leagueDefinitions: Record<string, LeagueDefinition> = { 英超: { id: "epl", name: "英超", initial: "Y" }, 欧冠: { id: "ucl", name: "欧冠", initial: "O" }, 西甲: { id: "laliga", name: "西甲", initial: "X" }, 意甲: { id: "serie-a", name: "意甲", initial: "Y" }, 德甲: { id: "bundesliga", name: "德甲", initial: "D" }, 法甲: { id: "ligue-1", name: "法甲", initial: "F" }, 荷甲: { id: "eredivisie", name: "荷甲", initial: "H" }, 葡超: { id: "primeira-liga", name: "葡超", initial: "P" }, 苏超: { id: "scottish-premiership", name: "苏超", initial: "S" }, 挪超: { id: "eliteserien", name: "挪超", initial: "N" }, 比甲: { id: "belgian-pro-league", name: "比甲", initial: "B" }, 土超: { id: "super-lig", name: "土超", initial: "T" }, NBA: { id: "nba", name: "NBA", initial: "N" }, CBA: { id: "cba", name: "CBA", initial: "C" }, 欧篮联: { id: "euroleague", name: "欧篮联", initial: "O" }, WNBA: { id: "wnba", name: "WNBA", initial: "W" }, NBL: { id: "nbl", name: "NBL", initial: "N" }, 韩篮: { id: "kbl", name: "韩篮", initial: "K" }, 日篮: { id: "b-league", name: "日篮", initial: "J" }, 德篮: { id: "bbl", name: "德篮", initial: "D" }, 法篮: { id: "lnb", name: "法篮", initial: "F" } };
type FootballStanding = { name: string; wins: number; draws: number; losses: number; points: number };
type BasketballStanding = { name: string; wins: number; losses: number; streak: string };
const footballRankingTeams: Record<string, string[]> = { 英超: ["曼城", "阿森纳", "利物浦", "布伦特福德", "切尔西", "埃弗顿", "利兹联", "赫尔城", "纽卡斯尔联", "阿斯顿维拉", "富勒姆", "曼联", "诺丁汉森林", "水晶宫", "西汉姆联", "伯恩茅斯", "布莱顿", "狼队", "伯恩利", "桑德兰"], 西甲: ["皇家马德里", "巴塞罗那", "马德里竞技", "毕尔巴鄂竞技", "比利亚雷亚尔", "皇家贝蒂斯", "皇家社会", "塞维利亚", "瓦伦西亚", "赫罗纳", "马略卡", "赫塔菲", "奥萨苏纳", "塞尔塔", "巴列卡诺", "阿拉维斯", "拉斯帕尔马斯", "莱加内斯", "巴拉多利德", "西班牙人"], 德甲: ["拜仁慕尼黑", "勒沃库森", "多特蒙德", "RB莱比锡", "法兰克福", "弗赖堡", "美因茨", "斯图加特", "门兴格拉德巴赫", "沃尔夫斯堡", "云达不莱梅", "奥格斯堡", "柏林联合", "霍芬海姆", "圣保利", "海登海姆", "波鸿", "荷尔斯泰因基尔", "汉堡", "科隆"], 意甲: ["国际米兰", "AC米兰", "那不勒斯", "尤文图斯", "亚特兰大", "拉齐奥", "罗马", "佛罗伦萨", "博洛尼亚", "都灵", "乌迪内斯", "热那亚", "蒙扎", "维罗纳", "莱切", "卡利亚里", "恩波利", "帕尔马", "科莫", "威尼斯"], 法甲: ["巴黎圣日耳曼", "马赛", "摩纳哥", "里尔", "里昂", "尼斯", "斯特拉斯堡", "朗斯", "布雷斯特", "雷恩", "欧塞尔", "南特", "兰斯", "图卢兹", "蒙彼利埃", "勒阿弗尔", "圣埃蒂安", "昂热", "洛里昂", "梅斯"] };
const makeFootballStandings = (teams: string[]): FootballStanding[] => teams.map((name, index) => { const wins = Math.max(2, 17 - index); const draws = 2 + index % 4; const losses = 1 + Math.floor(index / 3); return { name, wins, draws, losses, points: wins * 3 + draws }; });
const footballStandings = Object.fromEntries(Object.entries(footballRankingTeams).map(([league, teams]) => [league, makeFootballStandings(teams)])) as Record<string, FootballStanding[]>;
const nbaEast: BasketballStanding[] = [["凯尔特人", 62, 20, "4连胜"], ["尼克斯", 54, 28, "2连胜"], ["骑士", 51, 31, "1连胜"], ["魔术", 47, 35, "2连败"], ["步行者", 47, 35, "3连胜"], ["热火", 46, 36, "1连败"], ["76人", 45, 37, "2连胜"], ["老鹰", 43, 39, "1连败"], ["公牛", 40, 42, "2连败"], ["篮网", 32, 50, "3连败"], ["猛龙", 29, 53, "1连胜"], ["黄蜂", 23, 59, "4连败"], ["奇才", 19, 63, "6连败"], ["活塞", 17, 65, "2连败"], ["雄鹿", 16, 66, "1连败"]].map(([name, wins, losses, streak]) => ({ name: String(name), wins: Number(wins), losses: Number(losses), streak: String(streak) }));
const nbaWest: BasketballStanding[] = [["雷霆", 64, 18, "2连胜"], ["掘金", 57, 25, "3连胜"], ["森林狼", 56, 26, "1连败"], ["快船", 52, 30, "4连胜"], ["独行侠", 50, 32, "2连败"], ["太阳", 48, 34, "1连胜"], ["湖人", 47, 35, "2连胜"], ["国王", 45, 37, "1连败"], ["勇士", 44, 38, "3连胜"], ["火箭", 42, 40, "2连败"], ["鹈鹕", 39, 43, "1连胜"], ["灰熊", 32, 50, "4连败"], ["爵士", 28, 54, "1连败"], ["开拓者", 24, 58, "3连败"], ["马刺", 20, 62, "5连败"]].map(([name, wins, losses, streak]) => ({ name: String(name), wins: Number(wins), losses: Number(losses), streak: String(streak) }));
const cbaStandings: BasketballStanding[] = [["浙江广厦", 32, 6, "6连胜"], ["山西汾酒", 30, 8, "3连胜"], ["浙江稠州", 29, 9, "2连胜"], ["辽宁本钢", 28, 10, "1连败"], ["新疆伊力特", 27, 11, "2连胜"], ["北京北汽", 26, 12, "3连胜"], ["山东高速", 24, 14, "1连胜"], ["广东东阳光", 23, 15, "2连败"], ["上海久事", 22, 16, "1连胜"], ["青岛国信", 20, 18, "1连败"], ["深圳马可波罗", 18, 20, "2连败"], ["北京控股", 17, 21, "3连败"], ["天津先行者", 15, 23, "1连胜"], ["九台农商", 14, 24, "2连败"], ["福建晋江", 12, 26, "4连败"], ["四川金强", 10, 28, "1连胜"], ["宁波町渥", 9, 29, "3连败"], ["南京同曦", 8, 30, "5连败"], ["江苏肯帝亚", 7, 31, "2连败"], ["广州龙狮", 6, 32, "6连败"]].map(([name, wins, losses, streak]) => ({ name: String(name), wins: Number(wins), losses: Number(losses), streak: String(streak) }));
const teamLogoCodes: Record<string, string> = { 曼城: "soccer/500/382", 阿森纳: "soccer/500/359", 利物浦: "soccer/500/364", 切尔西: "soccer/500/363", 曼联: "soccer/500/360", 热刺: "soccer/500/367", 皇家马德里: "soccer/500/86", 巴塞罗那: "soccer/500/83", 马德里竞技: "soccer/500/1068", 拜仁慕尼黑: "soccer/500/132", 多特蒙德: "soccer/500/124", 巴黎圣日耳曼: "soccer/500/160", 马赛: "soccer/500/176", 凯尔特人: "nba/500/2", 尼克斯: "nba/500/18", 骑士: "nba/500/5", 魔术: "nba/500/19", 步行者: "nba/500/11", 热火: "nba/500/14", "76人": "nba/500/20", 老鹰: "nba/500/1", 公牛: "nba/500/4", 篮网: "nba/500/17", 猛龙: "nba/500/28", 黄蜂: "nba/500/30", 奇才: "nba/500/27", 活塞: "nba/500/8", 雄鹿: "nba/500/15", 雷霆: "nba/500/25", 掘金: "nba/500/7", 森林狼: "nba/500/16", 快船: "nba/500/12", 独行侠: "nba/500/6", 太阳: "nba/500/21", 湖人: "nba/500/13", 国王: "nba/500/23", 勇士: "nba/500/9", 火箭: "nba/500/10", 鹈鹕: "nba/500/3", 灰熊: "nba/500/29", 爵士: "nba/500/26", 开拓者: "nba/500/22", 马刺: "nba/500/24" };
function TeamBadge({ name }: { name: string }) { const code = teamLogoCodes[name]; return <img className="ranking-team-logo" src={code ? `https://a.espncdn.com/i/teamlogos/${code}.png` : assetUrl("club-crest.png")} alt={`${name} logo`} />; }
function readSportsContextFromLocation(): SportsFilterContext { const query = new URLSearchParams(window.location.search); const category = query.get("category") as SportCategory; const statusTab = query.get("status") as EventStatusTab; return { category: visibleSportCategories.includes(category) ? category : visibleSportCategories[0], statusTab: statusTabs.includes(statusTab) && (statusTab !== "排行" || sportsNavigation.showRankings) ? statusTab : "即时" }; }
function eventsForContext(context: SportsFilterContext, favorites: string[]) { const favoriteIds = new Set(favorites); return sportsEvents.filter((event) => { if (event.detailOnly) return false; if (context.category === "主播") return event.streamers.length > 0; if (context.category === "足球" && event.sport !== "football") return false; if (context.category === "篮球" && event.sport !== "basketball") return false; if (context.statusTab === "收藏") return favoriteIds.has(event.id); if (context.statusTab === "排行") return false; return event.status === statusForTab[context.statusTab] && (context.category !== "推荐" || event.isFeatured); }).sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)); }
function leaguesForContext(context: SportsFilterContext, favorites: string[]) { const counts = new Map<string, number>(); eventsForContext(context, favorites).forEach((event) => counts.set(event.league, (counts.get(event.league) ?? 0) + 1)); return Array.from(counts.entries()).map(([name, eventCount]) => ({ ...(leagueDefinitions[name] ?? { id: `league-${name}`, name, initial: "#" }), eventCount })).sort((left, right) => left.initial.localeCompare(right.initial) || left.name.localeCompare(right.name)); }
const weekLabels = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
function parseLocalDate(date: string) { return new Date(`${date}T00:00:00`); }
function dateGroupTitle(date: string) { const value = parseLocalDate(date); const difference = Math.round((value.getTime() - parseLocalDate(todayDateKey).getTime()) / 86400000); const prefix = difference === 0 ? "今天 " : difference === 1 ? "明天 " : ""; return `${prefix}${value.getMonth() + 1}月${value.getDate()}日 ${weekLabels[value.getDay()]}`; }
function DateSelector({ mode, selectedDate, onDateChange }: { mode: "schedule" | "result"; selectedDate: string; onDateChange: (date: string) => void }) { const dates = mode === "schedule" ? scheduleDateOptions : resultDateOptions; return <nav className="sports-date-selector" aria-label={mode === "schedule" ? "赛程日期" : "赛果日期"}>{dates.map((date) => { const value = parseLocalDate(date); const isToday = date === todayDateKey; return <button key={date} className={date === selectedDate ? "active" : ""} onClick={() => onDateChange(date)}>{isToday ? <b>今天</b> : <><b>{String(value.getMonth() + 1).padStart(2, "0")}-{String(value.getDate()).padStart(2, "0")}</b><small>{weekLabels[value.getDay()]}</small></>}</button>; })}</nav>; }
function FilterFunnelIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 5.5h17l-6.7 7.4v4.8l-3.6 1.8v-6.6L3.5 5.5Z" /></svg>; }
function RankingTeamRow({ rank, name, values, sport }: { rank: number; name: string; values: ReactNode; sport: Sport }) { const openTeam = () => { history.replaceState({ ...history.state, scrollTop: document.querySelector<HTMLElement>(".mobile-scroll")?.scrollTop ?? 0 }, ""); history.pushState({ route: "sports-team", name, sport }, "", appUrl(`/sports/team/${encodeURIComponent(name)}?sport=${sport}`)); window.dispatchEvent(new PopStateEvent("popstate")); }; return <button className="ranking-row" onClick={openTeam}><b className={rank <= 3 ? "ranking-position podium" : "ranking-position"}>{rank}</b><span className="ranking-team"><TeamBadge name={name} /><strong>{name}</strong></span>{values}</button>; }
function DataPage({ sport, setSport, league, setLeague, competition, setCompetition }: { sport: Sport; setSport: (sport: Sport) => void; league: string; setLeague: (league: string) => void; competition: "NBA" | "CBA"; setCompetition: (competition: "NBA" | "CBA") => void }) {
  const selected = sport === "football" ? league : competition;
  return <main className="data-page sports-page screen-content"><Carousel className="data-unified-leagues" contentClassName="data-unified-track" ariaLabel="数据联赛分类">{[...Object.keys(footballStandings), "NBA", "CBA"].map((item) => <button key={item} aria-pressed={selected === item} className={selected === item ? "active" : ""} onClick={() => { if (item === "NBA" || item === "CBA") { setSport("basketball"); setCompetition(item); } else { setSport("football"); setLeague(item); } }}>{item}</button>)}</Carousel>{sport === "football" ? <FootballStandings selectedLeague={league} onLeagueChange={setLeague} showLeagueTabs={false} /> : <BasketballStandings selectedCompetition={competition} onCompetitionChange={setCompetition} showLeagueTabs={false} />}</main>;
}
function FootballStandings({ selectedLeague, onLeagueChange, showLeagueTabs = true }: { selectedLeague?: string; onLeagueChange?: (league: string) => void; showLeagueTabs?: boolean } = {}) { const [localLeague, setLocalLeague] = useState("英超"); const league = selectedLeague ?? localLeague; const setLeague = onLeagueChange ?? setLocalLeague; const standings = footballStandings[league]; return <section className="rankings-panel football-rankings">{showLeagueTabs && <nav className="ranking-league-tabs" aria-label="足球联赛排行">{Object.keys(footballStandings).map((item) => <button key={item} className={league === item ? "active" : ""} onClick={() => setLeague(item)}>{item}</button>)}</nav>}<div className="ranking-table football-ranking-table"><div className="ranking-table-head"><span>#</span><span>球队</span><span>胜/平/负</span><span>积分</span></div>{standings.map((item, index) => <RankingTeamRow key={item.name} rank={index + 1} name={item.name} sport="football" values={<><span className="ranking-record">{item.wins} / {item.draws} / {item.losses}</span><strong className="ranking-points">{item.points}</strong></>} />)}</div></section>; }
function BasketballStandings({ selectedCompetition, onCompetitionChange, showLeagueTabs = true }: { selectedCompetition?: "NBA" | "CBA"; onCompetitionChange?: (competition: "NBA" | "CBA") => void; showLeagueTabs?: boolean } = {}) { const [localCompetition, setLocalCompetition] = useState<"NBA" | "CBA">("NBA"); const competition = selectedCompetition ?? localCompetition; const setCompetition = onCompetitionChange ?? setLocalCompetition; const renderGroup = (title: string, rows: BasketballStanding[]) => <section className="basketball-ranking-group" key={title}><div className="ranking-table-head basketball-ranking-head"><span>#</span><span>{title}</span><span>胜/负</span><span>胜率</span><span>近况</span></div>{rows.map((item, index) => <RankingTeamRow key={item.name} rank={index + 1} name={item.name} sport="basketball" values={<><span className="ranking-record">{item.wins} / {item.losses}</span><span className="ranking-rate">{(item.wins / (item.wins + item.losses) * 100).toFixed(1)}%</span><span className={item.streak.includes("连胜") ? "ranking-streak win" : "ranking-streak"}>{item.streak}</span></>} />)}</section>; return <section className="rankings-panel basketball-rankings">{showLeagueTabs && <nav className="ranking-league-tabs two-tabs" aria-label="篮球赛事排行"><button className={competition === "NBA" ? "active" : ""} onClick={() => setCompetition("NBA")}>NBA</button><button className={competition === "CBA" ? "active" : ""} onClick={() => setCompetition("CBA")}>CBA</button></nav>}<div className="ranking-table basketball-ranking-table">{competition === "NBA" ? <>{renderGroup("东部排名", nbaEast)}{renderGroup("西部排名", nbaWest)}</> : renderGroup("球队", cbaStandings)}</div></section>; }
type TeamProfile = { league: string; rank: number; rankLabel: string; record: string; points?: number; rate?: string; streak?: string };
function teamProfile(name: string, sport: Sport): TeamProfile { if (sport === "football") { for (const [league, rows] of Object.entries(footballStandings)) { const rank = rows.findIndex((item) => item.name === name); if (rank >= 0) { const row = rows[rank]; return { league, rank: rank + 1, rankLabel: `${league}排名`, record: `${row.wins}/${row.draws}/${row.losses}`, points: row.points }; } } return { league: "英超", rank: 8, rankLabel: "英超排名", record: "8/4/5", points: 28 }; } const cbaRank = cbaStandings.findIndex((item) => item.name === name); if (cbaRank >= 0) { const row = cbaStandings[cbaRank]; return { league: "CBA", rank: cbaRank + 1, rankLabel: "CBA排名", record: `${row.wins}/${row.losses}`, rate: `${(row.wins / (row.wins + row.losses) * 100).toFixed(1)}%`, streak: row.streak }; } const eastRank = nbaEast.findIndex((item) => item.name === name); const rows = eastRank >= 0 ? nbaEast : nbaWest; const rank = eastRank >= 0 ? eastRank : Math.max(0, nbaWest.findIndex((item) => item.name === name)); const row = rows[rank] ?? rows[0]; return { league: "NBA", rank: rank + 1, rankLabel: eastRank >= 0 ? "东部排名" : "西部排名", record: `${row.wins}/${row.losses}`, rate: `${(row.wins / (row.wins + row.losses) * 100).toFixed(1)}%`, streak: row.streak }; }
function teamFixtureEvents(name: string, sport: Sport, profile: TeamProfile) { const prefix = `team-${sport}-${name}`; const existing = sportsEvents.filter((event) => event.id.startsWith(prefix)); if (existing.length) return existing; const footballOpponents = ["阿森纳", "皇家马德里", "拜仁慕尼黑", "利物浦"]; const basketballOpponents = profile.league === "CBA" ? ["辽宁本钢", "广东东阳光", "北京北汽", "浙江稠州"] : ["凯尔特人", "尼克斯", "勇士", "湖人", "掘金"]; const opponents = (sport === "football" ? footballOpponents : basketballOpponents).filter((opponent) => opponent !== name).slice(0, 4); const competitions = sport === "football" ? [profile.league, "欧洲冠军联赛", "英格兰联赛杯", profile.league] : profile.league === "CBA" ? ["CBA", "CBA常规赛", "CBA", "CBA常规赛"] : ["NBA", "美国篮球夏季联赛", "NBA", "NBA"]; const fixtures = opponents.map((opponent, index): SportsEvent => { const status: EventStatus = index === 1 || index === 3 ? "upcoming" : index === 2 ? "live" : "finished"; const homeIsTeam = index % 2 === 0; const home = homeIsTeam ? name : opponent; const away = homeIsTeam ? opponent : name; const homeScore = status === "upcoming" ? undefined : sport === "football" ? 1 + (index % 3) : 92 + index * 5; const awayScore = status === "upcoming" ? undefined : sport === "football" ? index % 2 : 88 + index * 4; return { id: `${prefix}-${index + 1}`, sport, league: competitions[index], date: `2026-${index < 2 ? "08" : "10"}-${String(5 + index * 6).padStart(2, "0")}`, startTime: ["19:00", "20:30", "02:45", "07:30"][index], status, stage: status === "live" ? sport === "football" ? "下半场 63'" : "第3节 06:20" : undefined, home: { name: home, score: homeScore }, away: { name: away, score: awayScore }, isFeatured: false, favorite: false, hasAnimation: true, streamers: [], detail: makeEventDetail(sport, status, index), detailOnly: true }; }); sportsEvents.push(...fixtures); return fixtures; }
function TeamDetailPage({ name, sport, favorites, onToggleFavorite, onOpenEvent, onBack }: { name: string; sport: Sport; favorites: string[]; onToggleFavorite: (id: string) => void; onOpenEvent: (id: string) => void; onBack: () => void }) { const profile = teamProfile(name, sport); const fixtures = teamFixtureEvents(name, sport, profile); const tabs = ["全部", ...Array.from(new Set(fixtures.map((event) => event.league)))]; const [selectedTab, setSelectedTab] = useState("全部"); const shown = selectedTab === "全部" ? fixtures : fixtures.filter((event) => event.league === selectedTab); const favoriteIds = new Set(favorites); const footballStats = [{ value: String(profile.rank), label: profile.rankLabel }, { value: profile.record, label: "联赛战绩" }, { value: String(profile.points), label: "积分" }]; const basketballStats = [{ value: String(profile.rank), label: profile.rankLabel }, { value: profile.record, label: "常规赛战绩" }, { value: profile.rate ?? "0.0%", label: "胜率" }, { value: profile.streak ?? "-", label: "近况" }]; return <main className="team-detail-page screen-content"><section className="team-detail-hero"><button className="back-button team-detail-back" aria-label="返回排行" onClick={onBack}><ArrowLeftIcon /></button><TeamBadge name={name} /><b>{name}</b><span>{sport === "football" ? `${profile.league} · 足球俱乐部` : `${profile.league} · 篮球俱乐部`}</span><div className={sport === "football" ? "team-stat-grid football" : "team-stat-grid basketball"}>{(sport === "football" ? footballStats : basketballStats).map((stat) => <div key={stat.label}><strong>{stat.value}</strong><small>{stat.label}</small></div>)}</div></section><section className="team-fixtures"><h1>赛程赛果</h1><nav className="team-fixture-tabs" aria-label="赛事筛选">{tabs.map((tab) => <button key={tab} className={selectedTab === tab ? "active" : ""} onClick={() => setSelectedTab(tab)}>{tab}</button>)}</nav><div className="team-fixture-table"><div className="team-fixture-head"><span>日期/赛事</span><span>球队</span><span>比分</span><span>收藏</span></div>{shown.map((event) => { const isUpcoming = event.status === "upcoming"; return <article className="team-fixture-row" key={event.id} role="button" tabIndex={0} onClick={() => onOpenEvent(event.id)} onKeyDown={(keyboardEvent) => { if (keyboardEvent.key === "Enter") onOpenEvent(event.id); }}><span className="team-fixture-meta"><time>{event.date.slice(5)} {event.startTime}</time><small>{event.league}</small></span><span className="team-fixture-clubs"><span><TeamBadge name={event.home.name} /><b>{event.home.name}</b></span><span><TeamBadge name={event.away.name} /><b>{event.away.name}</b></span></span><span className={isUpcoming ? "team-fixture-score upcoming" : "team-fixture-score"}>{isUpcoming ? "VS" : <><b>{event.home.score}</b><b>{event.away.score}</b></>}</span><button className={favoriteIds.has(event.id) ? "event-favorite active" : "event-favorite"} aria-label={favoriteIds.has(event.id) ? "取消收藏" : "收藏赛事"} onClick={(clickEvent) => { clickEvent.stopPropagation(); onToggleFavorite(event.id); }}>★</button></article>; })}</div></section></main>; }
function SportsPage({ onSearch, onFilter, onOpenEvent, context, setContext, favorites, onToggleFavorite }: { onSearch: () => void; onFilter: () => void; onOpenEvent: (id: string) => void; context: SportsFilterContext; setContext: (context: SportsFilterContext) => void; favorites: string[]; onToggleFavorite: (id: string) => void }) {
  const [expandedStreamers, setExpandedStreamers] = useState<string[]>([]); const [selectedScheduleDates, setSelectedScheduleDates] = useState<Record<Sport, string>>({ football: todayDateKey, basketball: todayDateKey }); const [selectedResultDates, setSelectedResultDates] = useState<Record<Sport, string>>({ football: todayDateKey, basketball: todayDateKey }); const favoriteIds = new Set(favorites); const activeSport = context.category === "足球" ? "football" : context.category === "篮球" ? "basketball" : null; const rankAvailable = activeSport !== null; const visibleStatusTabs = context.category === "主播" ? [] : rankAvailable && sportsNavigation.showRankings ? statusTabs : statusTabs.filter((item) => item !== "排行"); const dateMode = activeSport && (context.statusTab === "赛程" || context.statusTab === "赛果") ? context.statusTab === "赛程" ? "schedule" : "result" : null; const selectedDate = activeSport && dateMode === "schedule" ? selectedScheduleDates[activeSport] : activeSport && dateMode === "result" ? selectedResultDates[activeSport] : todayDateKey; const visibleEvents = eventsForContext(context, favorites).filter((event) => !dateMode || event.date === selectedDate); const grouped = visibleEvents.reduce<Record<string, SportsEvent[]>>((all, event) => { (all[event.date] ??= []).push(event); return all; }, {}); const selectCategory = (category: SportCategory) => setContext({ category, statusTab: category === "足球" || category === "篮球" || context.statusTab !== "排行" ? context.statusTab : "即时" });
  return <main className="sports-page screen-content"><header className="sports-header"><button aria-label="赛事搜索" onClick={onSearch}><MagnifyingGlassIcon /></button><nav aria-label="赛事分类">{visibleSportCategories.map((item) => <button key={item} className={context.category === item ? "active" : ""} onClick={() => selectCategory(item)}>{item}</button>)}</nav><button className="sports-filter-trigger" aria-label="赛事筛选" onClick={onFilter}><FilterFunnelIcon /></button></header>{visibleStatusTabs.length > 0 && <nav className="sports-status-tabs" aria-label="赛事状态">{visibleStatusTabs.map((item) => <button key={item} className={context.statusTab === item ? "active" : ""} onClick={() => setContext({ ...context, statusTab: item })}>{item}</button>)}</nav>}{context.statusTab === "排行" && activeSport ? activeSport === "football" ? <FootballStandings /> : <BasketballStandings /> : <>{dateMode && activeSport && <DateSelector mode={dateMode} selectedDate={selectedDate} onDateChange={(date) => dateMode === "schedule" ? setSelectedScheduleDates((current) => ({ ...current, [activeSport]: date })) : setSelectedResultDates((current) => ({ ...current, [activeSport]: date }))} />}<section className="sports-event-list">{Object.keys(grouped).length ? Object.entries(grouped).map(([date, events]) => <DateGroup key={date} title={dateGroupTitle(date)}>{events.map((event) => <EventCard key={event.id} event={event} showSportType={context.category === "推荐" || context.category === "主播"} favorite={favoriteIds.has(event.id)} expanded={expandedStreamers.includes(event.id)} onToggleFavorite={() => onToggleFavorite(event.id)} onToggleStreamers={() => setExpandedStreamers((current) => current.includes(event.id) ? current.filter((item) => item !== event.id) : [...current, event.id])} onOpen={() => onOpenEvent(event.id)} />)}</DateGroup>) : <div className="sports-empty"><PlayIcon /><b>{context.statusTab === "收藏" ? "暂无收藏赛事" : context.category === "主播" ? "暂无主播预约赛事" : "暂无赛事"}</b><span>稍后再来看看吧</span></div>}</section></>}</main>;
}
function SportsSearchPage({ favorites, onToggleFavorite, onOpenEvent, onCancel }: { favorites: string[]; onToggleFavorite: (id: string) => void; onOpenEvent: (id: string) => void; onCancel: () => void }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedStreamers, setExpandedStreamers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250); return () => window.clearTimeout(timer); }, [query]);
  const clearSearch = () => { setQuery(""); setDebouncedQuery(""); inputRef.current?.focus(); };
  const keyword = debouncedQuery.toLocaleLowerCase();
  const results = keyword ? sportsEvents.filter((event) => [event.league, event.home.name, event.away.name].some((value) => value.toLocaleLowerCase().includes(keyword))).sort((left, right) => `${left.date}${left.startTime}`.localeCompare(`${right.date}${right.startTime}`)) : [];
  const grouped = results.reduce<Record<string, SportsEvent[]>>((all, event) => { (all[event.date] ??= []).push(event); return all; }, {});
  const favoriteIds = new Set(favorites);
  return <main className="sports-search-page screen-content"><header className="sports-search-header"><label className="sports-search-input"><MagnifyingGlassIcon /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="请输入联赛、球队名称" aria-label="搜索联赛或球队" autoFocus />{query && <button type="button" className="search-clear" aria-label="清空搜索" onClick={clearSearch}>×</button>}</label><button className="search-cancel" onClick={onCancel}>取消</button></header><section className="sports-search-results">{results.length ? Object.entries(grouped).map(([date, events]) => <DateGroup key={date} title={dateGroupTitle(date)}>{events.map((event) => <EventCard key={event.id} event={event} showSportType favorite={favoriteIds.has(event.id)} expanded={expandedStreamers.includes(event.id)} onToggleFavorite={() => onToggleFavorite(event.id)} onToggleStreamers={() => setExpandedStreamers((current) => current.includes(event.id) ? current.filter((item) => item !== event.id) : [...current, event.id])} onOpen={() => onOpenEvent(event.id)} />)}</DateGroup>) : <div className="sports-search-empty"><span className="sports-search-empty-icon"><MagnifyingGlassIcon /></span><b>暂无数据</b></div>}</section></main>;
}
function LiveSearchPage({ onCancel, onOpenLive }: { onCancel: () => void; onOpenLive: (liveRoomId: string) => void }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250); return () => window.clearTimeout(timer); }, [query]);
  const clearSearch = () => { setQuery(""); setDebouncedQuery(""); inputRef.current?.focus(); };
  const keyword = debouncedQuery.toLocaleLowerCase();
  const liveResults = keyword ? streams.filter((room) => room.title.toLocaleLowerCase().includes(keyword) || room.anchor.toLocaleLowerCase().includes(keyword)) : streams.filter((room) => room.recommended).slice(0, 4);
  const hostResults = keyword ? hosts.filter((host) => host.nickname.toLocaleLowerCase().includes(keyword)) : hosts.filter((host) => host.recommended);
  const isDefault = !query.trim();
  const hasResults = liveResults.length || hostResults.length;
  return <main className="live-search-page screen-content"><header className="live-search-header"><label className="live-search-input"><MagnifyingGlassIcon /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索直播/主播" aria-label="搜索直播或主播" autoFocus />{query && <button type="button" className="live-search-clear" aria-label="清空直播搜索" onClick={clearSearch}>×</button>}</label><button className="live-search-cancel" onClick={onCancel}>取消</button></header>{!isDefault && !hasResults ? <div className="live-search-empty"><span><MagnifyingGlassIcon /></span><b>暂无相关直播或主播</b></div> : <div className="live-search-content">{liveResults.length ? <section className="live-search-section"><h2>{isDefault ? "推荐直播" : "直播"}</h2><div className="stream-grid">{liveResults.map((room) => <LiveCard key={room.id} stream={room} index={room.id - 1} assetUrl={assetUrl} avatar={(name, index) => <ServiceAvatar name={name} index={index} />} onOpenLive={onOpenLive} />)}</div></section> : null}{hostResults.length ? <section className="live-search-section host-search-section"><h2>{isDefault ? "推荐主播" : "主播"}</h2><div className="following-list">{hostResults.map((host, index) => <button key={host.id} className="following-row" onClick={() => requestUserProfile(host.id,'live')}><ServiceAvatar name={host.nickname} index={index} /><span><b>{host.nickname}</b><small>{host.followers} 粉丝</small></span><em className={host.status === "live" ? "follow-live" : "follow-offline"}>{host.status === "live" ? "直播中" : "未开播"}</em><ChevronRightIcon /></button>)}</div></section> : null}</div>}</main>;
}
function useMobilePagePortalHost() { const [portalHost, setPortalHost] = useState<HTMLElement | null>(null); useEffect(() => { setPortalHost(document.querySelector<HTMLElement>(".mobile-page")); }, []); return portalHost; }
function FilterActions({ leagues, selectedLeagueIds, selectedEventCount, setSelectedLeagueIds, onConfirm }: { leagues: Array<LeagueDefinition & { eventCount: number }>; selectedLeagueIds: string[]; selectedEventCount: number; setSelectedLeagueIds: (ids: string[]) => void; onConfirm: () => void }) { const selected = new Set(selectedLeagueIds); const portalHost = useMobilePagePortalHost(); const actions = <footer className="filter-actions"><button onClick={() => setSelectedLeagueIds(leagues.map((league) => league.id))}>全选</button><button onClick={() => setSelectedLeagueIds(leagues.filter((league) => !selected.has(league.id)).map((league) => league.id))}>反选</button><span>已选 <b>{selectedEventCount}</b> 场</span><button className="filter-confirm" disabled={!selectedLeagueIds.length} onClick={onConfirm}>确定</button></footer>; return portalHost ? createPortal(actions, portalHost) : null; }
function LeagueAlphabet({ initials, onJump }: { initials: string[]; onJump: (initial: string) => void }) { const portalHost = useMobilePagePortalHost(); const index = <nav className="league-alphabet" aria-label="联赛首字母索引">{initials.map((initial) => <button key={initial} className="available" onClick={() => onJump(initial)}>{initial}</button>)}</nav>; return portalHost ? createPortal(index, portalHost) : null; }
function SportsFilterPage({ context, favorites, selectedLeagueIds, setSelectedLeagueIds, onBack, onConfirm }: { context: SportsFilterContext; favorites: string[]; selectedLeagueIds: string[]; setSelectedLeagueIds: (ids: string[]) => void; onBack: () => void; onConfirm: () => void }) { const groupsRef = useRef<Record<string, HTMLElement | null>>({}); const leagues = leaguesForContext(context, favorites); const selected = new Set(selectedLeagueIds); const selectedEventCount = leagues.filter((league) => selected.has(league.id)).reduce((total, league) => total + league.eventCount, 0); const grouped = leagues.reduce<Record<string, typeof leagues>>((all, league) => { (all[league.initial] ??= []).push(league); return all; }, {}); const initials = Object.keys(grouped).sort((left, right) => left.localeCompare(right)); const toggle = (id: string) => setSelectedLeagueIds(selected.has(id) ? selectedLeagueIds.filter((item) => item !== id) : [...selectedLeagueIds, id]); const jumpTo = (initial: string) => groupsRef.current[initial]?.scrollIntoView({ behavior: "smooth", block: "start" }); return <><main className="filter-page screen-content"><header className="filter-header"><button className="back-button" aria-label="返回赛事列表" onClick={onBack}><ArrowLeftIcon /></button><h1>筛选</h1></header>{leagues.length ? <section className="league-groups">{Object.entries(grouped).map(([initial, items]) => <section className="league-group" key={initial} ref={(node) => { groupsRef.current[initial] = node; }}><h2>{initial}</h2><div className="league-grid">{items.map((league) => <button key={league.id} className={selected.has(league.id) ? "league-option selected" : "league-option"} onClick={() => toggle(league.id)}><b>{league.name}</b><span>{league.eventCount}</span></button>)}</div></section>)}</section> : <div className="filter-empty"><FilterFunnelIcon /><b>暂无可筛选联赛</b></div>}</main>{leagues.length ? <LeagueAlphabet initials={initials} onJump={jumpTo} /> : null}<FilterActions leagues={leagues} selectedLeagueIds={selectedLeagueIds} selectedEventCount={selectedEventCount} setSelectedLeagueIds={setSelectedLeagueIds} onConfirm={onConfirm} /></>; }
function SportsFilterResultsPage({ context, selectedLeagueIds, favorites, onToggleFavorite, onBack, onOpenEvent }: { context: SportsFilterContext; selectedLeagueIds: string[]; favorites: string[]; onToggleFavorite: (id: string) => void; onBack: () => void; onOpenEvent: (id: string) => void }) { const [expandedStreamers, setExpandedStreamers] = useState<string[]>([]); const selected = new Set(selectedLeagueIds); const events = eventsForContext(context, favorites).filter((event) => selected.has((leagueDefinitions[event.league] ?? { id: `league-${event.league}` }).id)); const grouped = events.reduce<Record<string, SportsEvent[]>>((all, event) => { (all[event.date] ??= []).push(event); return all; }, {}); const favoriteIds = new Set(favorites); return <main className="filter-results-page screen-content"><header className="filter-header"><button className="back-button" aria-label="返回筛选" onClick={onBack}><ArrowLeftIcon /></button><div><h1>筛选赛事</h1><p>已选择 {selectedLeagueIds.length} 个联赛 · 共 {events.length} 场赛事</p></div></header><section className="filter-results-list">{events.length ? Object.entries(grouped).map(([date, items]) => <DateGroup key={date} title={dateGroupTitle(date)}>{items.map((event) => <EventCard key={event.id} event={event} showSportType={context.category === "推荐" || context.category === "主播"} favorite={favoriteIds.has(event.id)} expanded={expandedStreamers.includes(event.id)} onToggleFavorite={() => onToggleFavorite(event.id)} onToggleStreamers={() => setExpandedStreamers((current) => current.includes(event.id) ? current.filter((item) => item !== event.id) : [...current, event.id])} onOpen={() => onOpenEvent(event.id)} />)}</DateGroup>) : <div className="sports-empty"><PlayIcon /><b>暂无符合条件的赛事</b><span>请调整筛选条件后重试</span></div>}</section></main>; }
function DateGroup({ title, children }: { title: string; children: ReactNode }) { return <section className="date-group"><h2>{title}</h2>{children}</section>; }
function eventStatusLabel(event: SportsEvent) { return event.status === "upcoming" ? "未" : event.status === "finished" ? "完" : event.stage ?? "进行中"; }
function EventCard({ event, showSportType, favorite, expanded, onToggleFavorite, onToggleStreamers, onOpen }: { event: SportsEvent; showSportType: boolean; favorite: boolean; expanded: boolean; onToggleFavorite: () => void; onToggleStreamers: () => void; onOpen: () => void }) { const isFootball = event.sport === "football"; const score = event.status === "upcoming" ? "VS" : `${event.home.score} : ${event.away.score}`; return <article className={isFootball ? "sports-event-card" : "sports-event-card basketball-event-card"} role="button" tabIndex={0} onClick={onOpen} onKeyDown={(keyboardEvent) => { if (keyboardEvent.key === "Enter") onOpen(); }}><div className="sports-event-top">{showSportType && <span className={`sport-tag ${event.sport}`}>{event.sport === "football" ? "足球" : "篮球"}</span>}<span className="event-meta"><span className="event-league">{event.league}</span><time className="event-start-time">{event.startTime}</time></span><span className={event.status === "live" ? "event-stage live" : "event-stage"}>{eventStatusLabel(event)}</span><button className={favorite ? "event-favorite active" : "event-favorite"} aria-label={favorite ? "取消收藏" : "收藏赛事"} onClick={(clickEvent) => { clickEvent.stopPropagation(); onToggleFavorite(); }}>★</button></div>{isFootball ? <><div className="sports-teams"><div>{crest(event.home.name)}<b>{event.home.name}</b></div><strong>{score}</strong><div>{crest(event.away.name)}<b>{event.away.name}</b></div></div><FootballExtraStats event={event} /></> : <BasketballEventScoreLayout event={event} />}{event.status !== "finished" && <div className="event-view-source"><StreamerStack event={event} expanded={expanded} onToggle={onToggleStreamers} /></div>}</article>; }
function StreamerStack({ event, expanded, onToggle }: { event: SportsEvent; expanded: boolean; onToggle: () => void }) { if (!event.streamers.length) return <span className="animation-source" title="动画直播"><PlayIcon /></span>; const shown = event.streamers.slice(0, 3); const remaining = event.streamers.length - shown.length; return <div className="event-streamers" onClick={(clickEvent) => clickEvent.stopPropagation()}>{shown.map((streamer, index) => <button key={streamer.id} className="streamer-face" aria-label={streamer.nickname} onClick={() => console.info("streamer click", streamer.nickname)}><Avatar name={streamer.nickname} index={index} /></button>)}{remaining > 0 && <button className="streamer-more" onClick={onToggle}>+{remaining}</button>}{expanded && <div className="expanded-streamers">{event.streamers.map((streamer, index) => <button key={streamer.id} onClick={() => console.info("streamer click", streamer.nickname)}><Avatar name={streamer.nickname} index={index} /><span>{streamer.nickname}</span></button>)}</div>}</div>; }
function FootballExtraStats({ event }: { event: SportsEvent }) { const halftimeScore = event.status === "upcoming" ? undefined : event.halftimeScore; if (!halftimeScore && !event.corners) return <div className="event-extra-placeholder" />; return <div className="football-extra">{halftimeScore && <span>半场 <b>{halftimeScore.home} : {halftimeScore.away}</b></span>}{event.corners && <span>角球 <b>{event.corners.home} : {event.corners.away}</b></span>}</div>; }
function BasketballEventScoreLayout({ event }: { event: SportsEvent }) { const isUpcoming = event.status === "upcoming"; const scores = new Map((event.quarterScores ?? []).map((quarter) => [quarter.quarter, quarter])); const periods = [1, 2, 3, 4, ...(event.quarterScores ?? []).map((quarter) => quarter.quarter).filter((quarter) => quarter > 4).sort((left, right) => left - right)]; const periodLabel = (period: number) => period <= 4 ? `Q${period}` : period === 5 ? "OT" : `OT${period - 4}`; const activePeriod = event.status === "live" ? Math.max(0, ...(event.quarterScores ?? []).map((quarter) => quarter.quarter)) : 0; const gridStyle = { gridTemplateColumns: `minmax(96px, 1fr) repeat(${periods.length}, minmax(21px, 24px)) minmax(32px, 34px)` }; const teamRow = (side: "home" | "away") => isUpcoming ? <div className="basketball-score-row basketball-upcoming-team"><span className="basketball-card-team">{crest(event[side].name)}<b>{event[side].name}</b></span></div> : <div className="basketball-score-row" style={gridStyle}><span className="basketball-card-team">{crest(event[side].name)}<b>{event[side].name}</b></span>{periods.map((period) => <b className={period === activePeriod ? "current-period" : ""} key={period}>{scores.get(period)?.[side] ?? "-"}</b>)}<strong>{typeof event[side].score === "number" ? event[side].score : "-"}</strong></div>; return <div className={isUpcoming ? "basketball-scoreboard basketball-scoreboard-upcoming" : "basketball-scoreboard"}>{!isUpcoming && <div className="basketball-score-head" style={gridStyle}><span />{periods.map((period) => <b className={period === activePeriod ? "current-period" : ""} key={period}>{periodLabel(period)}</b>)}<strong>总</strong></div>}{teamRow("home")}{teamRow("away")}</div>; }
function LivePrivateMessages({ conversations }: { conversations: ChatListConversation[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const keyboard = useKeyboard();
  const selected = conversations.find((item) => item.id === selectedId);
  return selected ? <ChatDetailPage key={selected.id} conversation={selected} conversationIndex={conversations.findIndex((item) => item.id === selected.id)} onBack={() => { keyboard.hide(); setSelectedId(null); }} /> : <MobileScroll className="live-private-list"><ChatListPage conversations={conversations} onOpenConversation={(id) => { keyboard.hide(); setSelectedId(id); }} /></MobileScroll>;
}
function ChatListPage({ conversations, onOpenConversation }: { conversations: ChatListConversation[]; onOpenConversation: (id: string) => void }) { return <main className="chat-list-page screen-content"><section className="conversation-list" aria-label="聊天会话列表">{conversations.map((conversation, index) => <button className="conversation-row" key={conversation.id} onClick={() => onOpenConversation(conversation.id)}><ServiceAvatar name={conversation.nickname} index={index} /><span className="conversation-copy"><span className="conversation-name"><b>{conversation.nickname}</b><span className="conversation-status"><i className={conversation.online ? "online" : "offline"} />{conversation.online ? "在线" : "离线"}</span></span>{conversation.lastMessage && <small>{conversation.lastMessage}</small>}</span><span className="conversation-meta">{conversation.lastMessageTime && <time>{conversation.lastMessageTime}</time>}{conversation.unreadCount > 0 && <span className="conversation-unread">{unreadLabel(conversation.unreadCount)}</span>}<ChevronRightIcon /></span></button>)}</section></main>; }
type ChatConversation = typeof conversations[number];
type SentMessage = { id: number; sender: "service" | "user"; content: string; time: string };
function ChatDetailPage({ conversation, conversationIndex, onBack }: { conversation: ChatConversation; conversationIndex: number; onBack: () => void }) {
  const [messages, setMessages] = useState<SentMessage[]>(() => conversation.messages.map((message) => ({ ...message })));
  const [draft, setDraft] = useState("");
  const messageScroll = useRef<HTMLDivElement>(null);
  useEffect(() => { requestAnimationFrame(() => { const node = messageScroll.current; if (node) node.scrollTop = node.scrollHeight; }); }, [messages.length]);
  const sendMessage = () => { const content = draft.trim(); if (!content) return; const now = new Date(); const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`; setMessages((current) => [...current, { id: Date.now(), sender: "user", content, time }]); setDraft(""); };
  return <main className="chat-detail-page screen-content"><header className="chat-detail-header"><button className="back-button" aria-label="返回聊天列表" onClick={onBack}><ArrowLeftIcon /></button><ServiceAvatar name={conversation.nickname} index={conversationIndex} size="header" /><div><h1>{conversation.nickname}</h1><span className="conversation-status"><i className={conversation.online ? "online" : "offline"} />{conversation.online ? "在线" : "离线"}</span></div></header><section className="chat-messages" ref={messageScroll} aria-label={`${conversation.nickname} 的聊天记录`}>{messages.length ? <><time className="message-time">今天 {messages[0]?.time.replace("今天 ", "").replace("昨天 ", "")}</time>{messages.map((message, index) => <article key={message.id} className={`chat-message ${message.sender}`}><>{message.sender === "service" && <ServiceAvatar name={conversation.nickname} index={conversationIndex} size="small" />}</><div className="message-stack"><p>{message.content}</p>{index > 0 && messages[index - 1].time !== message.time && <time>{message.time}</time>}</div></article>)}</> : <div className="chat-empty"><ServiceAvatar name={conversation.nickname} index={conversationIndex} /><p>暂无聊天记录</p><span>可以发送消息开始咨询</span></div>}</section><form className="chat-input-bar" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="输入消息" aria-label="输入消息" /><button type="submit" aria-label="发送消息" className={draft.trim() ? "ready" : ""}><PaperPlaneIcon /><span>发送</span></button></form></main>;
}
function InviteAdvertisement({ onClick }: { onClick: () => void }) { return <button className="profile-ad" aria-label="邀请好友，每成功邀请一位获得88钻石" onClick={onClick}><picture><source media="(prefers-reduced-motion: reduce)" srcSet={assetUrl("profile-invite-ad.png")} /><img src={assetUrl("profile-invite-ad.gif")} alt="" draggable={false} /></picture><span className="profile-ad-copy"><strong>邀请好友，赢钻石好礼</strong><small>每成功邀请一位，获得 88 钻石</small></span><span className="profile-ad-label">广告</span></button>; }
function BottomTabs({ active, onSelect }: { active: TabKey; onSelect: (key: TabKey) => void }) {
  const [adDismissed, setAdDismissed] = useState(false);
  const keyboard = useKeyboard();
  const openInvite = () => { keyboard.hide(); history.pushState({ route: "invite" }, "", appUrl("/invite")); window.dispatchEvent(new PopStateEvent("popstate")); };
  const tabs: Array<{ id: TabKey; label: string; icon: TabIconName | "tips" }> = [{ id: "home", label: "直播", icon: "home" }, { id: "matches", label: "赛事", icon: "events" }, { id: "data", label: "资讯", icon: "data" }, { id: "tips", label: "有料", icon: "tips" }, { id: "profile", label: "我的", icon: "profile" }];
  return <>{active === "matches" && !adDismissed && <aside className="sports-bottom-ad" aria-label="赛事广告"><InviteAdvertisement onClick={openInvite} /><button className="sports-ad-close" aria-label="关闭赛事广告" onClick={() => setAdDismissed(true)}>×</button></aside>}<nav className="bottom-tabs" aria-label="主导航">{tabs.map((item) => <button className={active === item.id ? "active" : ""} key={item.id} onClick={() => onSelect(item.id)}>{item.icon === "tips" ? <LightningBoltIcon className="tab-icon" /> : <BottomTabIcon className="tab-icon" name={item.icon} />}<span>{item.label}</span></button>)}</nav></>;
}


type NewsArticle = { thumbnail: string; id: string; league: string; title: string; summary: string; author: string; publishedAt: string; views: number; body: Array<{ type: "paragraph"; text: string } | { type: "image"; file: string; caption: string }> };
const newsLeagues = ["全部", "英超", "西甲", "德甲", "意甲", "法甲", "NBA", "CBA"];
const newsSeeds = [
  ["英超", "争冠焦点前瞻：曼城与阿森纳的中场较量", "控球节奏与高位压迫将成为焦点。两队在备战中加强了中场衔接与边路保护，如何在攻守转换中找到空间，是本场比赛的重要看点。", "绿茵观察"],
  ["西甲", "国家德比备战观察：边路进攻成为关键", "皇家马德里与巴塞罗那围绕边路配合展开针对性训练。年轻球员的跑动与后防线的协作，将为这场焦点对决带来更多看点。", "西甲视角"],
  ["德甲", "拜仁训练观察：提升转换速度，丰富进攻选择", "拜仁慕尼黑在训练中尝试不同的前场组合，通过短传与纵向跑动提高进攻效率，替补阵容的表现同样值得关注。", "足球编辑部"],
  ["意甲", "米兰双雄战术观察：防线组织与定位球博弈", "AC米兰与国际米兰的对抗向来充满战术细节。紧凑的防线、第二落点争夺和定位球设计，可能影响比赛的节奏。", "绿茵观察"],
  ["法甲", "巴黎青年球员观察：用跑动为进攻注入活力", "巴黎圣日耳曼的年轻球员在训练中展现积极的无球跑动。球队围绕中前场连接进行演练，探索更流畅的进攻配合。", "法甲视角"],
  ["NBA", "新赛季观察：湖人与勇士如何调整轮换", "两支球队围绕轮换深度、外线投射与篮板保护展开备战。年轻球员能否承担更多任务，将成为新赛季值得关注的话题。", "篮球编辑部"],
  ["CBA", "联赛备战观察：广东与辽宁打磨阵容默契", "广东与辽宁在备战中加强攻防配合，重点演练快速推进和阵地防守。新老球员的衔接，也将影响球队的整体表现。", "篮坛观察"],
  ["英超", "利物浦备战笔记：高位逼抢背后的协作细节", "前场压迫需要全队同步移动。利物浦围绕逼抢后的快速出球进行演练，力求在保持进攻强度的同时控制身后空间。", "足球编辑部"],
];
const newsArticles: NewsArticle[] = newsSeeds.map(([league, title, summary, author], index) => ({ thumbnail: league === "NBA" || league === "CBA" ? "live-cool.png" : "football-hero.png", id: `article-${index + 1}`, league, title, summary, author, publishedAt: `2026-10-${index < 4 ? "10" : "09"} ${String(12 - index).padStart(2, "0")}:30`, views: 2680 + index * 427, body: [{ type: "paragraph", text: summary }, { type: "image", file: league === "NBA" || league === "CBA" ? "live-cool.png" : "football-hero.png", caption: "赛事主题配图" }, { type: "paragraph", text: league === "NBA" || league === "CBA" ? "从训练安排来看，教练组重点关注球的转移与防守沟通。球员在挡拆后能否迅速识别防守变化，以及替补登场后能否延续比赛强度，都是观察阵容磨合的重要角度。" : "从战术安排来看，中场衔接与边路保护需要保持平衡。球队通过分组训练模拟不同的压迫方式，让球员在有限空间中练习快速决策，并加强攻守转换时的协作。" }, { type: "paragraph", text: "比赛的魅力也在于临场变化。阵容选择、体能分配与关键回合的执行，都值得球迷持续关注。更多赛事资讯与球队数据，可在平台资讯和数据分类中查看。" }] }));
function NewsMeta({ article }: { article: NewsArticle }) { return <div className="news-meta"><span>{article.author}</span><time dateTime={article.publishedAt.replace(" ", "T")}>{article.publishedAt}</time><span>{formatNumber(article.views)}次查看</span></div>; }
function NewsList({ league, onOpen }: { league: string; onOpen: (id: string) => void }) { return <main className="news-list">{newsArticles.filter((item) => league === "全部" || item.league === league).map((article) => <button className="news-card" key={article.id} onClick={() => onOpen(article.id)}><span className="news-league-label">{article.league}</span><h2>{article.title}</h2><div className="news-card-preview"><p>{article.summary}</p><img className="news-thumbnail" src={assetUrl(article.thumbnail)} alt="" loading="lazy" decoding="async" draggable={false} width={104} height={78} /></div><NewsMeta article={article} /></button>)}</main>; }
function NewsDetailPage({ article, onBack }: { article?: NewsArticle; onBack: () => void }) { return <section className="news-detail-shell screen-content"><header className="news-detail-toolbar"><button aria-label="返回新闻列表" onClick={onBack}><ArrowLeftIcon /></button><span>资讯详情</span></header><MobileScroll className="news-detail-scroll"><article className="news-detail">{article ? <><span className="news-league-label">{article.league}</span><h1>{article.title}</h1><NewsMeta article={article} /><div className="news-body">{article.body.map((block, index) => block.type === "paragraph" ? <p key={index}>{block.text}</p> : <figure key={index}><img src={assetUrl(block.file)} alt={block.caption} draggable={false} /><figcaption>{block.caption}</figcaption></figure>)}</div><p className="news-demo-note">本文为模拟新闻，仅用于功能体验。</p></> : <div className="news-missing"><h1>暂无该资讯</h1><button onClick={onBack}>返回新闻列表</button></div>}</article></MobileScroll></section>; }

function LuckyWheelPage({ onBack, onTasks }: { onBack: () => void; onTasks: () => void }) {
  const [config, setConfig] = useState<WheelConfig | null>(null);
  const [assets, setAssets] = useState<WheelAssets | null>(null);
  const [method, setMethod] = useState<DrawMethod>('free');
  const [phase, setPhase] = useState<'idle' | 'requesting' | 'spinning' | 'uncertain'>(() => localStorage.getItem(pendingWheelKey) ? 'uncertain' : 'idle');
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<DrawResult | null>(null);
  const [scope, setScope] = useState<'mine' | 'others'>('mine');
  const [records, setRecords] = useState<WheelRecord[]>([]);
  const [recordState, setRecordState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [hasMore, setHasMore] = useState(false);
  const [revision, setRevision] = useState(0);
  const locked = useRef(false);
  const alive = useRef(true);
  const completion = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordGeneration = useRef(0);
  const information = useRef<HTMLElement>(null);
  const beforeDraw = useRef<WheelAssets | null>(null);
  const [experienceBefore, setExperienceBefore] = useState<number | null>(null);
  const busy = phase !== 'idle';
  useEffect(() => { alive.current = true; return () => { alive.current = false; if (completion.current) clearTimeout(completion.current); }; }, []);
  const load = async () => {
    setLoadError('');
    try { const [nextConfig, nextAssets] = await Promise.all([wheelApi.config(), wheelApi.assets()]); if (alive.current) { setConfig(nextConfig); setAssets(nextAssets); } }
    catch { if (alive.current) setLoadError('无法加载转盘，请重试'); }
  };
  useEffect(() => { void load(); }, []);
  const loadRecords = async (offset = 0) => {
    const generation = ++recordGeneration.current;
    setRecordState('loading');
    try { const page = await wheelApi.records(scope, offset); if (alive.current && generation === recordGeneration.current) { setRecords((items) => offset ? [...items, ...page.items] : page.items); setHasMore(page.hasMore); setRecordState('ready'); } }
    catch { if (alive.current && generation === recordGeneration.current) setRecordState('error'); }
  };
  useEffect(() => { setRecords([]); void loadRecords(); }, [scope, revision]);
  const finish = (next: DrawResult) => {
    if (!alive.current) return;
    const before = beforeDraw.current ? wheelExperience(beforeDraw.current) : wheelExperience(next.assets) - (next.prize.kind === 'experience' ? next.prize.quantity : 0);
    setExperienceBefore(next.prize.kind === 'experience' ? before : null);
    setAssets(next.assets); setResult(next); setPhase('idle'); locked.current = false;
    if (next.prize.kind === 'experience' || next.prize.kind === 'gift') requestAnimationFrame(() => {
      if (alive.current) information.current?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
    localStorage.removeItem(pendingWheelKey); setRevision((value) => value + 1);
    setMessage(next.prize.kind === 'none' ? '谢谢惠顾，本次未中奖，抽奖消耗已生效' : `恭喜获得 ${next.prize.name} ×${next.prize.quantity}${wheelMock ? '（演示奖励）' : ''}`);
  };
  const animate = (next: DrawResult) => {
    if (!alive.current || !config) return;
    const index = config.prizes.findIndex((prize) => prize.id === next.prize.id);
    if (index < 0) { setMessage('奖项配置已变化，请查询结果'); setPhase('uncertain'); locked.current = false; return; }
    setPhase('spinning'); setMessage('转盘转动中…'); setResult(null);
    setAngle((current) => wheelStopAngle(current, index, config.prizes.length));
    completion.current = setTimeout(() => finish(next), matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 3300);
  };
  const draw = async () => {
    if (locked.current || busy || !config || !assets) return;
    if (assets[method] < config.costs[method]) { setMessage('次数或余额不足，请切换其他抽奖方式'); return; }
    const id = crypto.randomUUID();
    try { localStorage.setItem(pendingWheelKey, id); } catch { setMessage('无法保存抽奖凭证，请开启浏览器存储后重试'); return; }
    beforeDraw.current = structuredClone(assets); setExperienceBefore(null);
    locked.current = true; setPhase('requesting'); setResult(null); setMessage('正在提交抽奖…');
    try { animate(await wheelApi.draw(method, id)); }
    catch (error) {
      if (!alive.current) return;
      locked.current = false;
      if (error instanceof WheelError && error.definitive) { localStorage.removeItem(pendingWheelKey); setPhase('idle'); setMessage(error.message); void load(); }
      else { setPhase('uncertain'); setMessage('请求失败或超时，结果待确认。请查询本次结果，不会重复扣费。'); }
    }
  };
  const query = async () => {
    if (locked.current) return;
    const id = localStorage.getItem(pendingWheelKey); if (!id) { setPhase('idle'); return; }
    locked.current = true; setMessage('正在查询本次结果…');
    try {
      const reply = await wheelApi.query(id);
      if (!alive.current) return;
      if (reply.status === 'completed') { if (config?.prizes.some((p) => p.id === reply.result.prize.id)) animate(reply.result); else finish(reply.result); }
      else if (reply.status === 'rejected' || (wheelMock && reply.status === 'not-found')) { localStorage.removeItem(pendingWheelKey); setPhase('idle'); locked.current = false; setMessage(reply.message ?? '本次未扣费，可以重新抽奖'); void load(); }
      else { locked.current = false; setMessage('结果仍待确认，请稍后查询；确认前不能再次抽奖'); }
    } catch { locked.current = false; if (alive.current) setMessage('结果查询失败，请稍后再次查询'); }
  };
  const methodNames = { free: '免费次数', coins: '金币', diamonds: '钻石' };
  return <div className="task-shell screen-content wheel-shell"><header className="task-toolbar"><AuthHeader title="幸运转盘" onBack={onBack} /></header><MobileScroll className="task-scroll"><main className="task-content wheel-content">
    {loadError ? <div className="wheel-state" role="alert">{loadError}<button onClick={() => void load()}>重新加载</button></div> : !config || !assets ? <p className="wheel-state" role="status">正在加载转盘和资产…</p> : <>
    <section className="wheel-hero"><h2>转出你的幸运好礼</h2><p>八重惊喜，精彩每一转</p>
    <div className="wheel-choice-panel"><div className="wheel-methods" role="group" aria-label="抽奖消耗方式">{(['free', 'coins', 'diamonds'] as DrawMethod[]).map((key) => <button key={key} aria-pressed={method === key} disabled={busy} className={method === key ? 'active' : ''} onClick={() => { setMethod(key); if (!result) setMessage(''); }}><b>{methodNames[key]}</b><small>{config.costs[key]}{key === 'free' ? '次' : methodNames[key]} / 抽</small></button>)}</div><p className="wheel-cost" id="wheel-cost">每次消耗 <b>{config.costs[method]} {method === 'free' ? '次免费次数' : methodNames[method]}</b><span>剩余 {assets[method].toLocaleString()}{method === 'free' ? ' 次' : ''}</span></p></div>
    <div className="wheel-stage"><span className="wheel-pointer" aria-hidden="true" /><div className="wheel-disc" data-angle={angle} style={{ transform: `rotate(${angle}deg)`, background: `conic-gradient(from ${-180 / config.prizes.length}deg, ${config.prizes.map((_, index) => `${index % 2 ? '#edf4ff' : '#fff'} ${index * 360 / config.prizes.length}deg ${(index + 1) * 360 / config.prizes.length}deg`).join(',')})` }}>{config.prizes.map((prize, index) => <div className={`wheel-prize wheel-kind-${prize.kind}`} key={prize.id} style={{ transform: `rotate(${index * 360 / config.prizes.length}deg) translateY(calc(var(--wheel-size) * -.335)) rotate(${-index * 360 / config.prizes.length}deg)` }}><i aria-hidden="true">{prize.icon.startsWith('/') || prize.icon.startsWith('http') ? <img src={prize.icon} alt="" /> : prize.icon}</i><b>{prize.name}</b>{prize.quantity > 0 && <small>×{prize.quantity}</small>}</div>)}</div><button className="wheel-center wheel-start" disabled={busy} aria-label={`开始抽奖 · 消耗 ${config.costs[method]} ${method === 'free' ? '次免费次数' : methodNames[method]}`} aria-describedby="wheel-cost" onClick={() => void draw()}><b>{phase === 'spinning' ? '转动中' : phase === 'requesting' ? '提交中' : phase === 'uncertain' ? '待确认' : '开始'}</b><small>{busy ? '请稍候' : '抽奖'}</small></button></div></section>
    {!busy && assets[method] < config.costs[method] && <p className="wheel-insufficient" role="status">{methodNames[method]}不足，请切换其他方式或完成任务</p>}
    <section ref={information} className="wheel-card wheel-information" aria-label="我的信息"><div className="wheel-heading"><h2>我的信息</h2><button disabled={busy} onClick={onTasks}>获取转盘次数 <ChevronRightIcon /></button></div><div className="wheel-assets">{(['free', 'diamonds', 'coins'] as DrawMethod[]).map((key) => <div key={key}><span>{methodNames[key]}</span><strong data-asset={key}>{assets[key].toLocaleString()}</strong></div>)}</div>
    <WheelUserInformation assets={assets} config={config} result={result} experienceBefore={experienceBefore} />
</section>
    </>}
    {(message || phase === 'uncertain') && <section className={`wheel-result ${result ? 'complete' : ''}`} role="status" aria-live="polite">{result && <i aria-hidden="true">{result.prize.icon.startsWith('/') || result.prize.icon.startsWith('http') ? '✦' : result.prize.icon}</i>}<p>{message || '发现未确认的抽奖，请查询结果后继续'}</p>{phase === 'uncertain' && <button className="auth-secondary" onClick={() => void query()}>查询本次结果</button>}</section>}
    <section className="wheel-card"><nav className="task-tabs" aria-label="奖品记录">{(['mine', 'others'] as const).map((key) => <button key={key} aria-pressed={scope === key} className={scope === key ? 'active' : ''} onClick={() => setScope(key)}>{key === 'mine' ? '我的奖品记录' : '全站奖品记录'}</button>)}</nav><div className="wheel-records">{records.map((record) => <article key={record.id}><span className="wheel-record-icon" aria-hidden="true">{record.prize.icon.startsWith('/') || record.prize.icon.startsWith('http') ? '✦' : record.prize.icon}</span><div>{scope === 'others' && <small>{record.nickname ?? '匿名球迷'}</small>}<b>{record.prize.name}{record.prize.quantity ? ` ×${record.prize.quantity}` : ''}</b><time dateTime={record.createdAt}>{taskClaimTime(record.createdAt)}</time></div></article>)}</div>{recordState === 'error' && <div className="wheel-state" role="alert">记录加载失败<button onClick={() => void loadRecords(records.length)}>重试</button></div>}{recordState === 'ready' && !records.length && <p className="wheel-state">暂无获奖记录，幸运好礼等你来转</p>}<AutoLoadMore count={records.length} enabled={recordState === 'ready' && hasMore} loading={recordState === 'loading'} onLoad={() => void loadRecords(records.length)} /></section>
  </main></MobileScroll></div>;
}


function WheelExperienceCounter({ value, from }: { value: number; from: number | null }) {
  const [display, setDisplay] = useState(from ?? value);
  useEffect(() => {
    if (from === null || from === value || matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplay(value); return; }
    let frame = 0;
    let start: number | null = null;
    setDisplay(from);
    const tick = (now: number) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / 700);
      setDisplay(Math.round(from + (value - from) * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, from]);
  return <span data-experience={value}>{display.toLocaleString('zh-CN')}</span>;
}

function WheelUserInformation({ assets, config, result, experienceBefore }: { assets: WheelAssets; config: WheelConfig; result: DrawResult | null; experienceBefore: number | null }) {
  const experience = wheelExperience(assets);
  const level = wheelLevel(assets);
  const { next, progress } = vipProgress(level, experience, vipThresholds);
  const previousLevel = [...vipThresholds].reverse().find((item) => (experienceBefore ?? experience) >= item.experience)?.level ?? 1;
  const experienceAward = result?.prize.kind === 'experience';
  const giftAward = result?.prize.kind === 'gift' ? result.prize : null;
  const inventory = Object.entries(assets.gifts).filter(([, quantity]) => quantity > 0);
  const giftArrived = !!giftAward?.giftId && assets.gifts[giftAward.giftId] > 0;
  const icon = (value: string) => value.startsWith('/') || value.startsWith('http') ? <img src={value} alt="" /> : value;
  return <>
    <div key={`experience-${experienceAward ? result.requestId : 'idle'}`} className={`wheel-level ${experienceAward ? 'wheel-reward-highlight' : ''}`}>
      <div className="wheel-level-heading"><span className="profile-vip-badge" data-user-level={level}><span aria-hidden="true">♛</span> VIP {level}</span><span>{next ? `距 VIP ${next.level} 还需 ${Math.max(0, next.experience - experience).toLocaleString('zh-CN')} 经验` : '已达最高等级'}</span></div>
      <div className="wheel-experience"><span>累计经验</span><b><WheelExperienceCounter value={experience} from={experienceAward ? experienceBefore : null} />{next && <small> / {next.experience.toLocaleString('zh-CN')}</small>}</b></div>
      <progress value={progress} max={1} aria-label={`等级经验进度 ${Math.round(progress * 100)}%`} />
      {experienceAward && <div className="wheel-experience-gain" role="status"><b>经验 +{result.prize.quantity}</b><span>{experienceBefore?.toLocaleString('zh-CN')} → {experience.toLocaleString('zh-CN')}</span>{level > previousLevel && <strong>恭喜升级！VIP {previousLevel} → VIP {level}</strong>}</div>}
    </div>
    <section className={`wheel-backpack ${giftArrived ? 'has-new-gift' : ''}`} aria-label="我的背包"><div className="wheel-heading"><h3><BackpackIcon aria-hidden="true" /> 我的背包</h3><span className="wheel-bag-total">{inventory.reduce((sum, [, quantity]) => sum + quantity, 0)} 件礼物</span></div>
      {giftAward && <div key={result!.requestId} className="wheel-bag-receipt" role="status"><i aria-hidden="true">{icon(giftAward.icon)}</i><div><b>{giftAward.name} ×{giftAward.quantity}</b><span>{giftArrived ? '✓ 已放入我的背包' : '礼物到账待同步'}</span></div></div>}
      {!inventory.length ? <div className="wheel-bag-empty"><BackpackIcon aria-hidden="true" /><p>背包还没有礼物，转动转盘收集惊喜</p></div> : <div className="wheel-bag-grid">{inventory.map(([giftId, quantity]) => {
        const gift = config.prizes.find((prize) => prize.kind === 'gift' && prize.giftId === giftId) ?? (giftAward?.giftId === giftId ? giftAward : null);
        const isNew = giftArrived && giftId === giftAward?.giftId;
        return <article key={`${giftId}-${isNew ? result!.requestId : 'stored'}`} className={isNew ? 'wheel-gift-new' : ''} data-gift-id={giftId}>{isNew && <em>新获得 +{giftAward!.quantity}</em>}<i aria-hidden="true">{icon(gift?.icon ?? '✦')}</i><b>{gift?.name ?? '神秘礼物'}</b><small>拥有 <strong>{quantity}</strong> 件</small></article>;
      })}</div>}
    </section>
  </>;
}

// Shared expert, event and plan records for every entry point.
type TipRank = 'win' | 'streak';
const tipRankLabels = { win: '胜率榜', streak: '连红榜' };
const tipExperts = Array.from({ length: 36 }, (_, i) => ({ id: `expert-${i+1}`, userId:`user-${i+1}`, name: ['地瓜','阿七Viki','维克多','楚楚','Allen','小鹿','球场观察员','小唐研球','战术大师','阿诚说球','锋线视角','篮下老王'][i%12] + (i >= 12 ? ['','·精选'][Math.floor(i/12)-1] : ''), win: +(89.6-i*.9).toFixed(1), return: +(196.5-((i*7)%36)*2.3).toFixed(1), streak: 12-i%10, published: i === 35 ? 4 : 8+i%9, recent: 10-i%4, results: ['赢','赢','赢','输','赢','走水','赢半','输半','赢','赢'].slice(i%3) }));
const tipAnchor = Date.now();
const tipEvents = sportsEvents.filter(e => Number(e.id.split('-').at(-1)) <= 7);
const tipPlans = tipEvents.flatMap((event, ei) => Array.from({ length: 3 }, (_, j) => {
  const i=ei*3+j; const market = j === 0 ? event.sport === 'football' ? '胜平负' : '胜负' : j === 1 ? '让球' : '大小球';
  const options = market === '胜平负' ? [{label:'主胜',value:'',odds:'1.85'},{label:'平局',value:'',odds:'3.20'},{label:'客胜',value:'',odds:'4.10'}] : market === '胜负' ? [{label:'主胜',value:'',odds:'1.76'},{label:'客胜',value:'',odds:'2.12'}] : market === '让球' ? [{label:'主队',value:event.sport === 'football' ? '-1.5' : '-5.5',odds:'1.92'},{label:'客队',value:event.sport === 'football' ? '+1.5' : '+5.5',odds:'1.88'}] : [{label:'大',value:event.sport === 'football' ? '2.5' : '218.5',odds:'1.90'},{label:'小',value:event.sport === 'football' ? '2.5' : '218.5',odds:'1.95'}];
  return { settlement: (event.status==='finished' && i%7!==0 ? (['赢','赢半','走水','输','输半'] as const)[i%5] : null), id:`plan-${i+1}`, eventId:event.id, expertId:tipExperts[i%tipExperts.length].id, market, options, recommendation:i%options.length, currency: (['diamonds','coins','free'] as const)[(ei+j)%3], price:j === 0 ? 88 : j === 1 ? 280 : 58, title:`${event.league}重点观察：${event.home.name}对阵${event.away.name}，${['攻防节奏与临场走势解析','阵容变化带来哪些机会','从近期表现寻找比赛突破口'][j]}`, published:Math.min(tipAnchor-(i%7 === 0 ? 5*86400000 : i*2700000+600000),new Date(`${event.date}T${event.startTime}:00+08:00`).getTime()-7200000), deadline:new Date(`${event.date}T${event.startTime}:00+08:00`).getTime() };
}));
type TipPlan = typeof tipPlans[number];
function tipRead<T,>(key:string, fallback:T):T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
function tipUnlocked(p:TipPlan) { return p.currency === 'free' || tipRead<string[]>('shenma-tips-purchases',['plan-6']).includes(p.id); }
function tipReadable(plan:TipPlan) { return !!tipSettlement(plan) || tipUnlocked(plan); }
function tipTime(time:number, now=Date.now()) { const diff=Math.max(0,now-time); return diff<3600000 ? `${Math.max(1,Math.floor(diff/60000))}分钟前` : diff<86400000 ? `${Math.floor(diff/3600000)}小时前` : diff<=3*86400000 ? `${Math.floor(diff/86400000)}天前` : new Date(time).toLocaleDateString('sv-SE',{timeZone:'Asia/Kuala_Lumpur'}); }
function tipExpertStats(expert:typeof tipExperts[number], days=7) { if(days===7)return expert;const index=tipExperts.indexOf(expert);return {...expert,win:+(66.4+((index*7)%27)+index%3*.2).toFixed(1),streak:3+(index*3)%14,published:24+index%21}; }
function tipMetric(e:typeof tipExperts[number], rank:TipRank, days=7) { const stats=tipExpertStats(e,days);return rank==='win'?`${stats.win}%`:`${stats.streak}连红`; }
function tipRanking(rank:TipRank,days=7) { return tipExperts.filter(e=>{const stats=tipExpertStats(e,days);return stats.published>(days===30?10:5)&&(rank==='win'?stats.win>55:stats.streak>2);}).sort((a,b)=>tipExpertStats(b,days)[rank]-tipExpertStats(a,days)[rank]).slice(0,30); }

function tipSettlement(plan:TipPlan) { return sportsEvents.find(e=>e.id===plan.eventId)?.status==='finished'?plan.settlement:null; }
function resultClass(result:string) { return ({'赢':'win','赢半':'half-win','走水':'push','输':'lose','输半':'half-lose'} as Record<string,string>)[result]||''; }
function TipSettlement({plan}:{plan:TipPlan}) { const result=tipSettlement(plan);return result?<span className={`tip-settlement result-${resultClass(result)}`}>{result}</span>:null; }
function TipResults({expert}:{expert:typeof tipExperts[number]}) { return <div className="tip-results">{expert.results.map((r,i)=><span key={i} className={`result-${resultClass(r)}`}>{r}</span>)}</div>; }
function matchScoreLabel(event:SportsEvent) { return event.status==='upcoming'?'VS':`${event.home.score ?? '—'} : ${event.away.score ?? '—'}`; }
function TipMatch({event,hideLiveStatus=false}:{event:SportsEvent;hideLiveStatus?:boolean}) { return <div className="tip-match"><small>{event.league} · {event.date.slice(5)} {event.startTime}{!(hideLiveStatus&&event.status==='live')&&<em>{event.status==='live'?'进行中':event.status==='finished'?'已结束':'未开赛'}</em>}</small><div><TeamBadge name={event.home.name}/><b>{event.home.name}</b><span className={event.status==='live'?'tip-live-score':''}>{matchScoreLabel(event)}</span><b>{event.away.name}</b><TeamBadge name={event.away.name}/></div></div>; }
function TipCard({plan,onNavigate}:{plan:TipPlan;onNavigate:(path:string)=>void}) { const e=tipExperts.find(e=>e.id===plan.expertId)!; const event=sportsEvents.find(e=>e.id===plan.eventId)!;return <article className="tip-card"><button className="tip-expert" onClick={()=>onNavigate(`/users/${e.userId}?tab=tips`)}><ServiceAvatar name={e.name} index={tipExperts.indexOf(e)}/><span><b>{e.name}</b><small><strong>{e.win}%</strong> 胜率 · 近10中{e.recent}</small></span><em>{e.streak}连红</em></button><button className="tip-card-body" onClick={()=>onNavigate(`/tips/plan/${plan.id}`)}><h3>{plan.title}</h3><TipMatch event={event}/><div className="tip-market-summary"><span>{plan.market}</span><TipSettlement plan={plan}/></div><footer><time>{tipTime(plan.published)}</time>{!tipSettlement(plan)&&<b className={tipReadable(plan)?'unlocked':''}>{plan.currency==='free'?'免费':tipUnlocked(plan)?'已解锁':`${plan.price} ${plan.currency==='coins'?'金币':'钻石'}`}</b>}</footer></button></article>; }
function TipEventPlans({eventId,onNavigate}:{eventId:string;onNavigate:(path:string)=>void}) { const plans=tipPlans.filter(p=>p.eventId===eventId); return <div className="tip-list">{plans.length?plans.map(p=><TipCard key={p.id} plan={p} onNavigate={onNavigate}/>):<div className="tip-empty">本场暂无有料方案</div>}</div>; }
function TipCountdown({deadline,now}:{deadline:number;now:number}) {
  const seconds=Math.max(0,Math.floor((deadline-now)/1000));
  if(now>=deadline)return <div className="tip-deadline-expired">方案已截止</div>;
  const parts=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(value=>String(value).padStart(2,'0'));
  return <div className="tip-countdown"><span>距离方案截止</span><div className="tip-digital-clock" role="timer" aria-label={`距离方案截止 ${parts.join(':')}`}>{parts.map((part,index)=><span className="tip-clock-part" key={index}>{index>0&&<i aria-hidden="true">:</i>}<b>{part}</b></span>)}</div></div>;
}
function TipsPage({route,isLoggedIn,onLogin,onNavigate,onBack}:{route:Route;isLoggedIn:boolean;onLogin:()=>void;onNavigate:(path:string)=>void;onBack:()=>void}) {
  const [rank,setRank]=useState<TipRank>(()=>(new URLSearchParams(location.search).get('rank') as TipRank) in tipRankLabels ? new URLSearchParams(location.search).get('rank') as TipRank : 'win');
  const [visibleCount,setVisibleCount]=useState(12);
  const [rankDays,setRankDays]=useState(()=>new URLSearchParams(location.search).get('days')==='30'?30:7);
  const [rulesOpen,setRulesOpen]=useState(false);
  const [filterOpen,setFilterOpen]=useState(false);
  const filterKeyboard=useKeyboard();
  const [sport,setSport]=useState('全部'); const [market,setMarket]=useState('全部'); const [currency,setCurrency]=useState('全部');
  const [now,setNow]=useState(Date.now()); const [following,toggleFollowing]=useUserFollowing(); const [revision,setRevision]=useState(0); const [message,setMessage]=useState(''); const [balance,setBalance]=useState<WheelAssets|null>(null); const paying=useRef(false);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000); const refresh=()=>{void wheelApi.assets().then(setBalance).catch(()=>setMessage('余额加载失败，请重试'));setRevision(v=>v+1);}; refresh(); window.addEventListener('wheel-assets',refresh);return()=>{clearInterval(timer);window.removeEventListener('wheel-assets',refresh);};},[]);
  useEffect(()=>{if(!message)return;const id=setTimeout(()=>setMessage(''),3500);return()=>clearTimeout(id);},[message]);
  useEffect(()=>setVisibleCount(12),[sport,market,currency]);
  const plan=tipPlans.find(p=>p.id===appPathname().split('/')[3]); const expert=tipExperts.find(e=>e.id===(route==='tips-detail'?plan?.expertId:appPathname().split('/')[3])); const unlocked=!!plan&&tipReadable(plan); const expired=!!plan&&now>=plan.deadline;
  const follow=()=>{if(!isLoggedIn){onLogin();return;}if(expert)toggleFollowing(expert.userId);};
  const pay=()=>{if(!plan||paying.current||tipReadable(plan))return;if(!isLoggedIn){onLogin();return;}if(Date.now()>=plan.deadline){setNow(Date.now());setMessage('方案已截止');return;}if(!wheelMock){setMessage('支付暂不可用');return;}paying.current=true;try { const store=tipRead<any>('shenma-wheel-demo-v1',null)??{assets:{free:3,coins:26800,diamonds:12580,experience:0,gifts:{}},results:{},records:[],grants:[]};const key=plan.currency as 'coins'|'diamonds';if(store.assets[key]<plan.price){setMessage(`${key==='coins'?'金币':'钻石'}余额不足`);return;}store.assets[key]-=plan.price;store.grants??=[];const purchaseKey=`tip-purchase-${plan.id}`;if(!store.grants.includes(purchaseKey)){store.grants.push(purchaseKey);store.journal??=[];store.journal.unshift({id:purchaseKey,asset:key,type:'tips-purchase',source:'购买有料',createdAt:new Date().toISOString(),amount:-plan.price,balance:store.assets[key]});localStorage.setItem('shenma-wheel-demo-v1',JSON.stringify(store));}localStorage.setItem('shenma-tips-purchases',JSON.stringify([...new Set([...tipRead<string[]>('shenma-tips-purchases',['plan-6']),plan.id])]));window.dispatchEvent(new Event('wheel-assets'));setRevision(v=>v+1);setMessage('支付成功，方案已解锁'); }catch{setMessage('支付未完成，请重试');}finally{paying.current=false;}};
  const updateRank=(nextRank:TipRank,days=rankDays)=>{setRank(nextRank);setRankDays(days);if(route==='tips-ranking'){const url=new URL(location.href);url.searchParams.set('rank',nextRank);url.searchParams.set('days',String(days));history.replaceState({...history.state},'',url.pathname+url.search);}};
  const rankTabs=<nav className="tip-rank-tabs">{(Object.keys(tipRankLabels) as TipRank[]).map(r=><button key={r} className={rank===r?'active':''} onClick={()=>updateRank(r)}>{tipRankLabels[r]}</button>)}</nav>;
  const expertPanel=expert&&<section className="tip-panel tip-profile"><button className="tip-expert" onClick={()=>route==='tips-detail'&&onNavigate(`/users/${expert.userId}?tab=tips`)}><ServiceAvatar name={expert.name} index={tipExperts.indexOf(expert)}/><span><b>{expert.name}</b><small>近10中{expert.recent} · {expert.streak}连红</small></span><strong>{expert.win}%<small>近7天胜率</small></strong></button><button className={'tip-follow '+(following.includes(expert.userId)?'followed':'')} onClick={follow}>{following.includes(expert.userId)?'已关注':'＋ 关注'}</button><TipResults expert={expert}/></section>;
  const filterControls=<div className="tip-filters">{[{label:'体育',value:sport,items:[['全部','全部'],['football','足球'],['basketball','篮球']],change:(v:string)=>{setSport(v);setMarket('全部');}},{label:'盘口',value:market,items:['全部',...(sport==='basketball'?['胜负']:sport==='football'?['胜平负']:['胜平负','胜负']),'让球','大小球'].map(v=>[v,v]),change:setMarket},{label:'付费',value:currency,items:[['全部','全部'],['diamonds','钻石'],['coins','金币'],['free','免费']],change:setCurrency}].map(f=><div key={f.label}><small>{f.label}</small>{f.items.map(([v,label])=><button key={v} className={f.value===v?'active':''} onClick={()=>f.change(v)}>{label}</button>)}</div>)}</div>;
  const filtered=tipPlans.filter(p=>{const event=sportsEvents.find(e=>e.id===p.eventId)!;return (event.status!=='finished'&&p.deadline>now)&&(sport==='全部'||event.sport===sport)&&(market==='全部'||p.market===market)&&(currency==='全部'||p.currency===currency);});
  return <div className={`task-shell tips-shell screen-content tip-shell ${route==='tips'?'tip-home':route==='tips-detail'?'tip-detail':''}`} data-revision={revision}><header className="tips-header">{route!=='tips'&&<button className="tip-back" aria-label="返回" onClick={onBack}><ArrowLeftIcon/></button>}<h1>{route==='tips'?'有料':route==='tips-ranking'?'专家排行榜':route==='tips-expert'?'专家主页':'有料详情'}</h1></header><MobileScroll className="task-scroll"><div className="tip-content">
  {route==='tips'&&<><section className="tip-panel"><div className="tip-heading"><h2>专家排行榜</h2><small>近7天数据榜单</small></div>{rankTabs}<div className="tip-top-grid">{tipRanking(rank).slice(0,9).map((e,i)=><button key={e.id} onClick={()=>onNavigate(`/users/${e.userId}?tab=tips`)}><i className={i<3?'podium':''}>{i+1}</i><ServiceAvatar name={e.name} index={tipExperts.indexOf(e)}/><b>{e.name}</b><strong>{tipMetric(e,rank)}</strong></button>)}<button className="tip-more" onClick={()=>onNavigate(`/tips/ranking?rank=${rank}`)}><span>→</span><b>更多专家</b><small>查看完整榜单</small></button></div></section><section><div className="tip-heading"><h2>焦点赛事</h2></div><Carousel className="tip-focus" contentClassName="tip-focus-track" ariaLabel="焦点赛事">{tipEvents.filter(e=>e.isFeatured&&e.status!=='finished').map(e=><button key={e.id} onClick={()=>onNavigate(`/sports/event/${e.id}?tab=tips`)}><TipMatch event={e}/><span>{tipPlans.filter(p=>p.eventId===e.id).length}个方案 <ChevronRightIcon/></span></button>)}</Carousel></section><section><div className="tip-heading"><h2>有料精选</h2><div className="tip-filter-heading"><small>{filtered.length}个方案</small><button aria-label="筛选有料" aria-expanded={filterOpen} className={'tip-filter-trigger '+([sport,market,currency].some(v=>v!=='全部')?'active':'')} onClick={()=>{filterKeyboard.hide();setFilterOpen(true);}}><FilterFunnelIcon/>筛选{[sport,market,currency].filter(v=>v!=='全部').length>0&&<b>{[sport,market,currency].filter(v=>v!=='全部').length}</b>}</button></div></div><div className="tip-list">{filtered.slice(0,visibleCount).map(p=><TipCard key={p.id} plan={p} onNavigate={onNavigate}/>)}<AutoLoadMore enabled={visibleCount<filtered.length} loading={false} count={visibleCount} onLoad={()=>setVisibleCount(v=>v+12)}/>{!filtered.length&&<div className="tip-empty">暂无符合条件的方案，请调整筛选</div>}</div></section></>}
  {route==='tips-ranking'&&<>{rankTabs}<div className="tip-ranking-controls"><div className="tip-ranking-period" aria-label="统计日期">{[7,30].map(days=><button key={days} aria-pressed={rankDays===days} className={rankDays===days?'active':''} onClick={()=>updateRank(rank,days)}>近{days}天</button>)}</div><button className="tip-rules-trigger" onClick={()=>{filterKeyboard.hide();setRulesOpen(true);}}><InfoCircledIcon/>上榜规则</button></div><section className="tip-panel tip-ranking">{tipRanking(rank,rankDays).map((e,i)=><article className="tip-rank-entry" key={e.id}><button className="tip-rank-person" aria-label={`查看${e.name}主页`} onClick={()=>onNavigate(`/users/${e.userId}?tab=tips`)}><i className={i<3?'podium':''}>{i+1}</i><ServiceAvatar name={e.name} index={tipExperts.indexOf(e)}/><span className="tip-rank-copy"><b>{e.name}</b><small>近{rankDays}天发布{tipExpertStats(e,rankDays).published}个方案</small></span><strong>{tipMetric(e,rank,rankDays)}</strong></button><button className={'tip-ranking-follow '+(following.includes(e.userId)?'followed':'')} aria-label={`${following.includes(e.userId)?'取消关注':'关注'}${e.name}`} onClick={()=>{if(!isLoggedIn){onLogin();return;}toggleFollowing(e.userId);}}>{following.includes(e.userId)?'已关注':'＋关注'}</button></article>)}</section></>}

  {route==='tips-detail'&&(plan&&expert?<><h2 className="tip-title">{plan.title}</h2><TipSettlement plan={plan}/><div className="tip-meta">{tipTime(plan.published,now)}发布 <span>{tipSettlement(plan)?'已结算 · 公开方案':plan.currency==='free'?'免费方案':unlocked?'已解锁':expired?'方案已截止':'精选方案'}</span></div>{expertPanel}<button className="tip-panel tip-event-link" onClick={()=>onNavigate(`/sports/event/${plan.eventId}?tab=tips`)}><TipMatch event={sportsEvents.find(e=>e.id===plan.eventId)!} hideLiveStatus/></button><section className="tip-panel tip-odds-panel"><div className="tip-heading"><h2>{plan.market}</h2>{!unlocked&&<small>解锁后查看专家推荐</small>}</div><div className="tip-options">{plan.options.map((o,i)=><div key={o.label} className={unlocked&&i===plan.recommendation?`selected ${tipSettlement(plan)?'settled result-'+resultClass(tipSettlement(plan)!):''}`:''}><b>{o.label} {o.value}</b><strong>{o.odds}</strong>{unlocked&&i===plan.recommendation&&<small className="tip-recommend-badge">专家推荐{tipSettlement(plan)&&` · ${tipSettlement(plan)}`}</small>}</div>)}</div></section><section className="tip-panel"><h2>赛事分析</h2><div className="tip-analysis"><div className={unlocked?'':'tip-blurred'} aria-hidden={!unlocked}>{unlocked?<><p>本场{sportsEvents.find(e=>e.id===plan.eventId)!.league}对决值得关注。主队近期在主场保持较高的比赛强度，通过积极的前场压迫争取主动，开局阶段的节奏控制将直接影响比赛走势。</p><p>从双方近期表现来看，客队在连续作战后需要重新分配体能。防守端的轮转与转换速度是本场观察重点，面对主队的提速，客队需要减少无谓失误，稳定阵地进攻。</p><p>结合当前盘口与双方阵容结构，本场更看好{plan.options[plan.recommendation].label} {plan.options[plan.recommendation].value}。发布时记录的赔率为{plan.options[plan.recommendation].odds}，核心判断来自双方攻防效率的差异及近期状态变化。</p></>:Array.from({length:3},(_,i)=><p key={i}>{'结合近期比赛表现与阵容变化，关注双方攻防节奏和关键位置的发挥。'.repeat(4)}</p>)}</div>{!unlocked&&<div className="tip-lock"><span>◆</span><h3>支付后解锁完整方案</h3><p>解锁专家推荐及详细赛事分析</p><TipCountdown deadline={plan.deadline} now={now}/></div>}</div></section></>:<div className="tip-empty">方案不存在或已下线</div>)}
  </div></MobileScroll><Dialog.Root open={rulesOpen} onOpenChange={setRulesOpen}><Dialog.Portal container={document.querySelector<HTMLElement>('.mobile-h5-container')}><Dialog.Overlay className="calendar-overlay"/><Dialog.Content className="tip-rules-dialog"><div className="tip-rules-dialog-heading"><Dialog.Title>上榜规则</Dialog.Title><Dialog.Close aria-label="关闭上榜规则">×</Dialog.Close></div><Dialog.Description className="tip-rules-description">{tipRankLabels[rank]} · 近{rankDays}天</Dialog.Description><p>统计近{rankDays}天发布方案超过{rankDays===30?10:5}个，且{rank==='win'?'命中率大于55%':'连红数大于2'}的专家，按照{rank==='win'?'命中率':'连红数'}从高到低排序，取前30名。</p><Dialog.Close className="tip-rules-confirm">我知道了</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root><Dialog.Root open={filterOpen} onOpenChange={setFilterOpen}><Dialog.Portal container={document.querySelector<HTMLElement>('.mobile-h5-container')}><Dialog.Overlay className="calendar-overlay"/><Dialog.Content className="calendar-sheet tip-filter-sheet"><div className="calendar-sheet-heading"><Dialog.Title>筛选有料</Dialog.Title><Dialog.Close aria-label="关闭筛选面板">×</Dialog.Close></div><Dialog.Description className="calendar-sheet-description">按体育、玩法和付费方式筛选方案</Dialog.Description>{filterControls}<div className="tip-filter-actions"><button onClick={()=>{setSport('全部');setMarket('全部');setCurrency('全部');}}>重置</button><Dialog.Close>完成筛选</Dialog.Close></div></Dialog.Content></Dialog.Portal></Dialog.Root>{route==='tips-detail'&&plan&&!unlocked&&<div className="tip-payment"><div><strong>{plan.price} <small>{plan.currency==='coins'?'金币':'钻石'}</small></strong><span>当前余额：{balance?formatNumber(balance[plan.currency as 'coins'|'diamonds']):'加载中'} {plan.currency==='coins'?'金币':'钻石'}</span></div><button disabled={expired||!balance} onClick={pay}>{expired?'方案已截止':'立即支付'}</button></div>}{message&&<div className="tip-toast" role="status">{message}</div>}</div>;
}

function resolveUserId(id:string) { if(id.startsWith('expert-'))return tipExperts.find(e=>e.id===id)?.userId||id;if(id.startsWith('host-')){const n=Number(id.slice(5));return n<=6?`user-${n}`:`user-host-${n}`;}return id; }
function userForHostId(id:string) { const host=hosts.find(h=>h.id===id)||hosts[0];const index=hosts.indexOf(host);return {id:resolveUserId(host.id),name:host.nickname,avatar:<ServiceAvatar name={host.nickname} index={index}/>}; }
function requestUserProfile(id:string,tab='live') { window.dispatchEvent(new CustomEvent('open-user',{detail:{id,tab}})); }
function useUserFollowing():[string[],(id:string)=>void] {
  const read=()=>{const saved=tipRead<string[]|null>('shenma-user-following',null);return saved??tipRead<string[]>('shenma-tip-following',[]).map(resolveUserId);};
  const [ids,setIds]=useState(read);
  useEffect(()=>{const refresh=()=>setIds(read());window.addEventListener('user-following',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('user-following',refresh);window.removeEventListener('storage',refresh);};},[]);
  return [ids,(id)=>{const canonical=resolveUserId(id);const current=read();const next=current.includes(canonical)?current.filter(v=>v!==canonical):[...current,canonical];localStorage.setItem('shenma-user-following',JSON.stringify(next));setIds(next);window.dispatchEvent(new Event('user-following'));}];
}
function UserProfilePage({isLoggedIn,onLogin,onBack,onNavigate,onOpenLive,reminded,setReminded}:{reminded:number[];setReminded:(ids:number[])=>void;isLoggedIn:boolean;onLogin:()=>void;onBack:()=>void;onNavigate:(path:string)=>void;onOpenLive:(id:string)=>void}) {
  const raw=appPathname().split('/').at(-1)||'';const id=resolveUserId(raw);
  const expert=tipExperts.find(e=>e.userId===id);const host=hosts.find(h=>resolveUserId(h.id)===id);
  const name=host?.nickname||expert?.name||'球迷小林';const avatarIndex=host?hosts.indexOf(host):expert?tipExperts.indexOf(expert):0;
  const [following,toggleFollow]=useUserFollowing();
  const requested=new URLSearchParams(location.search).get('tab');
  const [tab,setTab]=useState(()=>host&&expert?(requested==='tips'?'tips':'live'):expert?'tips':host?'live':'');
  const [liveSection,setLiveSection]=useState(()=>new URLSearchParams(location.search).get('section')==='replays'?'replays':'schedule');
  const selectLiveSection=(value:string)=>{setLiveSection(value);const url=new URL(location.href);url.searchParams.set('section',value);history.replaceState({...history.state},'',url.pathname+url.search);};
  const selectTab=(value:string)=>{setTab(value);const url=new URL(location.href);url.searchParams.set('tab',value);history.replaceState({...history.state},'',url.pathname+url.search);};
  const previews=host?previewEvents.filter(e=>e.status!=='已结束'&&e.anchors.some(a=>a.name===host.nickname)).map(e=>{const date=new Date(`${platformDate()}T12:00:00+08:00`);date.setDate(date.getDate()+({today:0,tomorrow:1,sep25:2,sep26:3}[e.day]??0));return {...e,date:platformDate(date),anchors:e.anchors.filter(a=>a.name===host.nickname)};}).sort((a,b)=>`${a.date}${a.anchors[0]?.time||a.time}`.localeCompare(`${b.date}${b.anchors[0]?.time||b.time}`)):[];
  const liveStreams=host?streams.filter(s=>s.hostId===host.id):[];
  const replays=host?Array.from({length:6},(_,i)=>{const stream=liveStreams[0];const date=new Date(`${platformDate()}T12:00:00+08:00`);date.setDate(date.getDate()-1-Math.floor(i/2));return {id:`${host.id}-replay-${i+1}`,stream:{...stream,title:replayDetails(`${host.id}-replay-${i+1}`,host.nickname).title},date:platformDate(date),startedAt:i%2===0?'20:00':'15:30',duration:replayDetails(`${host.id}-replay-${i+1}`,host.nickname).durationLabel};}):[];
  const profilePlans=expert?tipPlans.filter(p=>p.expertId===expert.id):[];
  return <div className="task-shell screen-content tip-shell"><header className="tips-header"><button className="tip-back" aria-label="返回" onClick={onBack}><ArrowLeftIcon/></button><h1>用户主页</h1></header><MobileScroll className="task-scroll"><div className="tip-content"><section className="tip-panel user-profile-hero"><div className="user-profile-identity"><ServiceAvatar name={name} index={avatarIndex}/><div><h2>{name}</h2><span className="user-role">VIP {host?6:3} {host&&'· 主播'} {expert&&'· 有料专家'}</span></div><button className={'tip-follow '+(following.includes(id)?'followed':'')} onClick={()=>isLoggedIn?toggleFollow(id):onLogin()}>{following.includes(id)?'已关注':'＋ 关注'}</button></div><div className="user-profile-counts"><span><b>{host?.followers||'2.6万'}</b>粉丝</span><span><b>{36+avatarIndex*3}</b>关注</span></div></section>{host&&expert&&<nav className="tip-rank-tabs" aria-label="用户内容分类">{host&&<button className={tab==='live'?'active':''} onClick={()=>selectTab('live')}>直播</button>}{expert&&<button className={tab==='tips'?'active':''} onClick={()=>selectTab('tips')}>有料</button>}</nav>}
    {tab==='tips'&&expert&&<><section className="tip-panel"><div className="user-expert-stats"><span><b>{expert.win}%</b>近7天胜率</span><span><b>近10中{expert.recent}</b>近期命中</span><span><b>{expert.streak}连红</b>当前连红</span></div><TipResults expert={expert}/></section><div className="tip-heading"><h2>发布的方案</h2><small>{profilePlans.length}个方案</small></div><div className="tip-list">{profilePlans.map(p=><TipCard key={p.id} plan={p} onNavigate={onNavigate}/>)}{!profilePlans.length&&<div className="tip-empty">暂无发布的方案</div>}</div></>}
    {tab==='live'&&host&&<><nav className="user-live-subtabs" aria-label="直播内容分类">{[{id:'schedule',label:'直播预告'},{id:'replays',label:'直播回放'}].map(item=><button key={item.id} className={liveSection===item.id?'active':''} aria-pressed={liveSection===item.id} onClick={()=>selectLiveSection(item.id)}>{item.label}</button>)}</nav>{liveSection==='schedule'?<div className="user-schedule-list">{[...new Set(previews.map(event=>event.date))].map(date=><section className="date-group" key={date}><h2>{date}</h2><div className="event-list user-preview-list">{previews.filter(event=>event.date===date).map(event=><PreviewEvent key={event.id} event={event} compact onEnterLive={()=>onOpenLive(`live-${Number(host.id.slice(5))}`)} reminded={reminded.includes(event.id)} onReminder={()=>{const next=reminded.includes(event.id)?reminded.filter(id=>id!==event.id):[...reminded,event.id];setReminded(next);}} expanded={false} onExpand={()=>{}}/>)}</div></section>)}{!previews.length&&<div className="tip-empty">暂无直播预告</div>}</div>:<div className="user-replay-list">{[...new Set(replays.map(r=>r.date))].map(date=><section className="date-group" key={date}><h2>{date}</h2><div className="stream-grid">{replays.filter(r=>r.date===date).map(record=><LiveCard key={record.id} stream={record.stream} replay={{startedAt:record.startedAt,duration:record.duration}} index={avatarIndex} assetUrl={assetUrl} avatar={()=><ServiceAvatar name={name} index={avatarIndex}/>} onOpenLive={()=>onOpenLive(`live-${Number(host.id.slice(5))}?mode=replay&record=${record.id}`)}/>)}</div></section>)}</div>}</>}

    {!host&&!expert&&<section className="tip-panel tip-empty">这位球迷还没有发布动态</section>}
  </div></MobileScroll></div>;
}
import { replayDetails } from "./replayData";


type StationMessage = { id: string; title: string; body: string; sentAt: string };
const stationMessages: StationMessage[] = [
  { id: "live-experience", title: "直播体验升级通知", sentAt: "2026-10-23T10:30:00+08:00", body: "亲爱的用户，感谢您一直以来对神马直播的支持！我们对直播播放和互动体验进行了优化，让您在观看精彩赛事时享受更加流畅的画面与更及时的互动。\n\n本次优化包括直播加载速度、播放稳定性及聊天消息展示。您可以前往直播首页，选择喜欢的直播间体验。\n\n如遇到播放问题，请尝试刷新页面或切换网络，并通过个人中心的聊天入口联系我们。祝您观看愉快！" },
  { id: "check-in-reminder", title: "每日签到，收获专属好礼", sentAt: "2026-10-20T09:00:00+08:00", body: "每日签到奖励已为您准备好。进入个人中心的每日签到页面，即可查看当日可领取的奖励及本轮七日签到安排。\n\n同一天可能包含多种奖励，签到成功后将一次性发放当天全部奖励。已领取的奖励可在领取记录中查看。" },
  { id: "account-safety", title: "账号安全温馨提醒", sentAt: "2026-10-08T16:20:00+08:00", body: "为了保障您的账号与资产安全，请妥善保管登录信息，勿向他人透露验证码或密码。平台工作人员不会向您索要登录密码。\n\n若发现异常登录或资产变动，请及时修改密码，并通过个人中心的聊天入口联系平台处理。" },
  { id: "september-service", title: "平台服务优化公告", sentAt: "2026-09-25T14:15:00+08:00", body: "我们持续优化赛事信息展示与直播预约体验。您可以在直播预告中查看即将开始的赛事，并预约关注的主播。\n\n感谢您的理解与支持，神马直播将继续为您带来精彩内容。" },
  { id: "welcome-message", title: "欢迎来到神马直播", sentAt: "2026-08-18T12:00:00+08:00", body: "欢迎加入神马直播！这里有精彩的体育赛事、丰富的直播内容和实时互动。\n\n关注喜欢的主播，查看赛事赛程，参与每日任务，开启您的精彩观赛之旅。\n\n您可以通过个人中心管理账号、查询奖励与资产记录。如需帮助，可使用右上角的聊天入口联系我们。" },
];
function StationMessagesPage({ messageId, onOpen, onBack }: { messageId?: string; onOpen: (id: string) => void; onBack: () => void }) {
  const [readIds, setReadIds] = useState<string[]>(() => { try { const saved = JSON.parse(localStorage.getItem("shenma-station-read-v1") ?? "null"); return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : ["account-safety", "september-service", "welcome-message"]; } catch { return ["account-safety", "september-service", "welcome-message"]; } });
  const message = stationMessages.find((item) => item.id === messageId);
  useEffect(() => { if (!message) return; setReadIds((current) => { if (current.includes(message.id)) return current; const next = [...current, message.id]; try { localStorage.setItem("shenma-station-read-v1", JSON.stringify(next)); } catch { /* Reading remains available when storage is disabled. */ } return next; }); }, [message]);
  const sorted = [...stationMessages].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const months = [...new Set(sorted.map((item) => item.sentAt.slice(0, 7)))];
  useEffect(() => { if (!messageId) requestAnimationFrame(() => { const node = document.querySelector<HTMLElement>(".station-message-scroll"); if (node) node.scrollTop = history.state?.messageScroll ?? 0; }); }, [messageId]);
  const time = (value: string) => value.slice(0, 19).replace("T", " ");
  return <section className="task-shell screen-content"><header className="task-toolbar"><AuthHeader title={messageId ? "站内信详情" : "站内信"} onBack={onBack} /></header><MobileScroll className="task-scroll station-message-scroll"><main className="task-content station-message-content">{messageId ? message ? <article className="station-message-detail"><h1>{message.title}</h1><time dateTime={message.sentAt}>{time(message.sentAt)}</time><div>{message.body.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article> : <div className="chat-empty"><p>该消息不存在或已删除</p></div> : months.map((month) => <section className="station-message-month" key={month}><h2>{month.slice(0, 4)}年{Number(month.slice(5))}月</h2><div className="station-message-list">{sorted.filter((item) => item.sentAt.startsWith(month)).map((item) => <button className={`station-message-row ${readIds.includes(item.id) ? "is-read" : "is-unread"}`} key={item.id} onClick={() => onOpen(item.id)}><h3>{!readIds.includes(item.id) && <i className="station-unread-dot" aria-hidden="true" />}{item.title}</h3><p>{item.body.replace(/\n/g, " ")}</p><div className="station-message-meta"><time dateTime={item.sentAt}>{time(item.sentAt).slice(0, 16)}</time><span>{readIds.includes(item.id) ? "已读" : "未读"}</span></div><ChevronRightIcon aria-hidden="true" /></button>)}</div></section>)}</main></MobileScroll></section>;
}
