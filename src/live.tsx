import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftIcon, ChatBubbleIcon, Cross1Icon, EnterFullScreenIcon, ExitFullScreenIcon, PersonIcon, PaperPlaneIcon, PauseIcon, PlayIcon, Share1Icon, SpeakerLoudIcon, SpeakerQuietIcon } from "@radix-ui/react-icons";
import "./live.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { replayDetails } from "./replayData";
import { MobileScroll } from "./mobile";
import { wheelApi, type WheelAssets } from "./luckyWheel";
import { MatchTimelinePanel, type EventDetailEvent } from "./eventDetail";

type LiveTab = "chat" | "direct" | "groups" | "tips" | "situation" | "ranking";
type RoomMessage = { id: number; type?: "announcement"; senderType?: "host" | "user"; nickname?: string; vipLevel?: number; badge?: string; content: string };

const roomSeeds = [
  { id: "live-1", eventId: "football-live-1", title: "曼城 vs 阿森纳｜英超焦点战", cover: "football-hero.png", host: "地瓜", shares: 12800 },
  { id: "live-2", eventId: "basketball-finished-1", title: "冠军之夜｜赛事复盘直播", cover: "live-gold.png", host: "阿七Viki", shares: 9800 },
  { id: "live-3", eventId: "football-upcoming-1", title: "足球盛典｜赛前分析", cover: "live-cool.png", host: "维克多", shares: 7600 },
];
const chatSeed: RoomMessage[] = [
  { id: 1, senderType: "user", nickname: "球王Leo", vipLevel: 6, badge: "金牌球探", content: "今晚曼城状态不错，前场压迫很有威胁。" },
  { id: 2, senderType: "user", nickname: "Jason", vipLevel: 3, badge: "超级替补", content: "这场节奏很快，阿森纳的反击也不能忽视。" },
  { id: 3, senderType: "host", nickname: "地瓜", vipLevel: 8, badge: "战术大师", content: "大家可以重点观察下半场的边路推进。" },
  { id: 4, type: "announcement", content: "月满中秋，群雄再战！VIP群各路大神云集，实战经验赛事观点火热分享，私聊主播立即领取" },
  { id: 5, senderType: "user", nickname: "阿豪", vipLevel: 5, badge: "预测达人", content: "已经跟上主播的思路，期待下半场进球。" },
];
const groups = [
  { id: "premier", name: "英超大神交流群", last: "今晚重点聊曼城这场", time: "10:26", members: "2,381" },
  { id: "vip", name: "VIP赛事讨论群", last: "今晚欧冠安排已更新", time: "09:52", members: "856" },
  { id: "tips", name: "投注技巧交流", last: "新人可以先看看群公告", time: "昨天", members: "1,204" },
];
const rankingUsers = ["球王Leo", "阿豪", "Jason", "Coco", "绿茵小王子", "Mia", "阿森纳7号", "看球老炮", "小雨", "热血球迷"];
const rankingVipLevels = [6, 5, 3, 8, 5, 3, 3, 6, 3, 5];
const gifts = [{ icon: "🌷", name: "鲜花", price: 10 }, { icon: "🍺", name: "啤酒", price: 30 }, { icon: "⚽", name: "足球", price: 50 }, { icon: "🏆", name: "奖杯", price: 100 }, { icon: "🚀", name: "火箭", price: 500 }, { icon: "🏎️", name: "超级跑车", price: 1000 }];
const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

function avatar(name: string, className = "") { return <span className={`live-avatar ${className}`}>{name.slice(0, 1)}</span>; }

export function LiveRoomPage({ liveRoomId, streamUrl, renderPrivateMessages, getEventById, onNavigate, onBack, hostIdentity, hostFollowed, onHostFollow, onOpenHost, renderEventTips }: { streamUrl?:string;renderEventTips?:(eventId:string,onLeave:()=>void)=>ReactNode;hostIdentity:{id:string;name:string;avatar:ReactNode};hostFollowed:boolean;onHostFollow:()=>void;onOpenHost:()=>void;liveRoomId: string; renderPrivateMessages: () => ReactNode; getEventById: (id: string) => EventDetailEvent | undefined; onNavigate: (route: "tasks" | "invite") => void; onBack: () => void }) {
  const params = new URLSearchParams(location.search);
  const isReplay = params.get("mode") === "replay" || params.get("replay") === "1";
  const recordId = isReplay ? params.get("record") ?? "host-1-replay-1" : "";
  const replay = replayDetails(recordId, hostIdentity.name);
  const recordIndex = replay.index;
  const replayDuration = replay.duration;
  const [duration, setDuration] = useState(replayDuration);
  const [currentTime, setCurrentTime] = useState(0);
  const clock = (seconds: number) => { const value = Math.max(0, Math.floor(seconds)); return [Math.floor(value / 3600), Math.floor(value / 60) % 60, value % 60].map(n => String(n).padStart(2, "0")).join(":"); };
  const seek = (seconds: number) => {
    if (!isReplay) return;
    const target = Math.max(0, Math.min(duration, seconds));
    if (videoRef.current) videoRef.current.currentTime = target;
    setCurrentTime(target);
  };
  const [giftAssets, setGiftAssets] = useState<WheelAssets | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const [hasUnmuted, setHasUnmuted] = useState(false);
  const [quality, setQuality] = useState("标清");
  const syncAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    setMuted(video.muted);
    setVolume(Math.round(video.volume * 100));
    if (!video.muted && video.volume > 0) setHasUnmuted(true);
  };
  const unmute = () => {
    const video = videoRef.current;
    if (!video) { setMuted(false); setHasUnmuted(true); return; }
    if (video.volume === 0) video.volume = 0.7;
    video.muted = false;
    syncAudio();
  };
  const toggleMute = () => {
    const video = videoRef.current;
    if (!(video?.muted ?? muted)) {
      if (video) video.muted = true;
      setMuted(true);
    } else unmute();
  };
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) { setPlaying(value => !value); return; }
    if (video.paused) void video.play().catch(() => { setMediaPlaying(false); setPlaying(false); });
    else video.pause();
  };
  useEffect(() => { setMediaPlaying(false); setHasUnmuted(false); setMuted(true); const video = videoRef.current; if (video) { video.muted = true; video.defaultMuted = true; void video.play().catch(() => { setMediaPlaying(false); setPlaying(false); }); } }, [streamUrl, liveRoomId]);
  const [selectedGift, setSelectedGift] = useState<typeof gifts[number] | null>(null);
  useEffect(() => { let active = true; const refresh = () => { void wheelApi.assets().then(value => { if (active) setGiftAssets(value); }).catch(() => {}); }; refresh(); window.addEventListener("wheel-assets", refresh); return () => { active = false; window.removeEventListener("wheel-assets", refresh); }; }, []);
  const giftBalance = (asset: "diamonds" | "coins") => localStorage.getItem("shenma-login-state") === "signed-out" ? "0" : giftAssets ? formatNumber(giftAssets[asset]) : "—";
  const baseRoom = roomSeeds.find((item) => item.id === liveRoomId) ?? { ...roomSeeds[(Number(liveRoomId.replace("live-", "")) - 1) % roomSeeds.length || 0], id: liveRoomId };
  const room = isReplay ? { ...baseRoom, title: replay.title, eventId: replay.eventId } : baseRoom;
  const saved = history.state?.liveRoomState?.roomId === liveRoomId ? history.state.liveRoomState : undefined;
  const boundEvent = getEventById(room.eventId);
  const [controls, setControls] = useState(false); const [playing, setPlaying] = useState<boolean>(saved?.playing ?? true); const [muted, setMuted] = useState<boolean>(true); const [volume, setVolume] = useState<number>(saved?.volume ?? 70); const [danmaku, setDanmaku] = useState<boolean>(saved?.danmaku ?? true); const followed=hostFollowed; const [tab, setTab] = useState<LiveTab>(saved?.tab === "groups" ? "chat" : saved?.tab ?? "chat"); const [messages, setMessages] = useState<RoomMessage[]>(isReplay ? chatSeed.map((message, index) => ({ ...message, id: index + 1, content: message.type === "announcement" ? "感谢大家观看本场直播，精彩赛事下次再见。" : `${["开场啦，一起看球！", "这次配合很精彩！", "感谢大家陪伴，本场比赛一起复盘。", "", "精彩比赛，期待下次直播！"][(index + recordIndex) % 5] || message.content}` })) : saved?.messages ?? chatSeed); const [draft, setDraft] = useState<string>(saved?.draft ?? ""); const [groupId, setGroupId] = useState<string | null>(null); const [giftOpen, setGiftOpen] = useState(false); const [toast, setToast] = useState(""); const [welcome, setWelcome] = useState(isReplay ? "" : "欢迎小雨进入直播间"); const [rankType, setRankType] = useState<"weekly" | "monthly">("weekly"); const playerRef = useRef<HTMLDivElement>(null); const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!controls || isReplay) return; const timer = window.setTimeout(() => setControls(false), 3000); return () => window.clearTimeout(timer); }, [controls, isReplay]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2600); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => { if (!welcome) return; const timer = window.setTimeout(() => setWelcome(""), 3000); return () => window.clearTimeout(timer); }, [welcome]);
  useEffect(() => { if (isReplay) return; const timer = window.setInterval(() => setMessages((current) => [...current, { id: Date.now(), type: "announcement", content: "月满中秋，群雄再战！VIP群各路大神云集，实战经验赛事观点火热分享，私聊主播立即领取" }]), 30000); return () => window.clearInterval(timer); }, [isReplay]);
  useEffect(() => { requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }); }, [messages.length, tab]);
  useEffect(() => {
    if (tab !== "chat" || !chatRef.current) return;
    const buttons = Array.from(chatRef.current.querySelectorAll<HTMLElement>(".host-announcement")).map((announcement) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "host-announcement-direct";
      button.textContent = "私信主播";
      button.addEventListener("click", () => setTab("direct"));
      announcement.append(button);
      return button;
    });
    return () => buttons.forEach((button) => button.remove());
  }, [messages.length, tab]);
  useEffect(() => {
    if (tab !== "ranking") return;
    const badges = Array.from(document.querySelectorAll<HTMLElement>(".rank-row")).flatMap((row, index) => {
      const avatarNode = row.querySelector(".live-avatar");
      if (!avatarNode) return [];
      const badge = document.createElement("span");
      const level = rankingVipLevels[index];
      badge.className = `vip vip-${level}`;
      badge.textContent = `VIP${level}`;
      avatarNode.after(badge);
      return [badge];
    });
    return () => badges.forEach((badge) => badge.remove());
  }, [tab]);
  const toggleFullscreen = async () => { const node = playerRef.current; if (!node) return; try { if (document.fullscreenElement) await document.exitFullscreen(); else await node.requestFullscreen(); } catch { node.classList.toggle("simulated-fullscreen"); } };
  const sendChat = () => { const content = draft.trim(); if (!content) return; setMessages((current) => [...current, { id: Date.now(), senderType: "user", nickname: "我", vipLevel: 3, badge: "看球专家", content }]); setDraft(""); };
  const openChatEntry = (route: "tasks" | "invite") => {
    history.replaceState({ ...history.state, liveRoomState: { roomId: liveRoomId, playing, muted, volume, danmaku, followed, messages, draft, scrollTop: chatRef.current?.scrollTop ?? 0 } }, "");
    onNavigate(route);
  };
  useEffect(() => { if (saved) requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = saved.scrollTop; }); }, []);
  const leaveTips = () => { history.replaceState({...history.state,liveRoomState:{roomId:liveRoomId,playing,muted,volume,danmaku,followed,messages,draft,tab}},''); };
  const activeGroup = groups.find((group) => group.id === groupId);
  useEffect(() => {
    if (!isReplay || streamUrl || !playing) return;
    const timer = window.setInterval(() => setCurrentTime(time => { const next = Math.min(duration, time + 1); if (next >= duration) setPlaying(false); return next; }), 1000);
    return () => window.clearInterval(timer);
  }, [isReplay, streamUrl, playing, duration]);
  return <main className={`live-page ${isReplay ? "replay-mode" : ""}`} data-mode={isReplay ? "replay" : "live"} data-record-id={recordId}><section className="live-player" ref={playerRef} onClick={() => setControls((value) => !value)}>{streamUrl ? <video key={`${liveRoomId}-${streamUrl}`} ref={videoRef} src={streamUrl} poster={`${import.meta.env.BASE_URL}assets/${room.cover}`} autoPlay muted={muted} playsInline onPlaying={() => { setMediaPlaying(true); setPlaying(true); }} onPause={() => { setMediaPlaying(false); setPlaying(false); }} onWaiting={() => setMediaPlaying(false)} onSeeking={() => setMediaPlaying(false)} onError={() => { setMediaPlaying(false); setPlaying(false); }} onEmptied={() => setMediaPlaying(false)} onEnded={() => { setMediaPlaying(false); setPlaying(false); }} onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={event => { if (isReplay && Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }} onVolumeChange={syncAudio} /> : <img src={`${import.meta.env.BASE_URL}assets/${room.cover}`} alt="足球赛事直播画面" />}{(streamUrl ? mediaPlaying : playing) && muted && !hasUnmuted && <button className="live-unmute-guide" onClick={event => { event.stopPropagation(); unmute(); }}><SpeakerQuietIcon aria-hidden="true" />点击取消静音</button>}<span className={playing ? "live-signal" : "live-paused"}>{playing ? isReplay ? "回放" : "LIVE" : <PlayIcon />}</span>{controls && <div className="player-controls" onClick={(event) => event.stopPropagation()}><header><button aria-label="返回首页" onClick={onBack}><ArrowLeftIcon /></button><b>{room.title}</b><button aria-label="分享直播间" onClick={() => setToast("直播间链接复制成功，快去分享给其他人吧")}><Share1Icon /></button></header><footer><button aria-label={playing ? "暂停" : "播放"} onClick={togglePlayback}>{playing ? <PauseIcon /> : <PlayIcon />}</button><button aria-label={muted ? "取消静音" : "静音"} onClick={toggleMute}>{muted ? <SpeakerQuietIcon /> : <SpeakerLoudIcon />}</button>{isReplay && <div className="replay-inline-progress"><time>{clock(currentTime)} / {clock(duration)}</time><input aria-label="播放进度" type="range" min="0" max={duration} step="1" value={currentTime} onChange={event => seek(Number(event.target.value))} /></div>}<div className="player-quality-wrap"><DropdownMenu.Root><DropdownMenu.Trigger className="player-quality" aria-label={`清晰度：${quality}`}>{quality}<span aria-hidden="true">⌄</span></DropdownMenu.Trigger><DropdownMenu.Content className="player-quality-menu" side="top" align="center" sideOffset={8}><DropdownMenu.RadioGroup value={quality} onValueChange={setQuality}>{["标清","超清"].map(item => <DropdownMenu.RadioItem className="player-quality-option" value={item} key={item}>{item}<DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator></DropdownMenu.RadioItem>)}</DropdownMenu.RadioGroup></DropdownMenu.Content></DropdownMenu.Root></div><button className={`danmaku-toggle ${danmaku ? "on" : "off"}`} aria-label={danmaku ? "关闭弹幕" : "打开弹幕"} aria-pressed={danmaku} onClick={() => setDanmaku((value) => !value)}><span className="danmaku-label">弹幕</span></button><button aria-label="全屏" onClick={toggleFullscreen}><EnterFullScreenIcon /></button></footer></div>}</section><section className="live-content"><div className={`live-nav-row ${boundEvent?"has-tips":""}`}><nav aria-label="直播内容">{([ ["chat", "聊天"], ["direct", "私信"], ...(boundEvent ? [["tips", "有料"] as [LiveTab,string]] : []), ["situation", "赛况"], ["ranking", "排行"] ] as Array<[LiveTab, string]>).map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setGroupId(null); }}>{label}</button>)}</nav><div className="host-info"><button className="live-host-avatar" aria-label="查看主播主页" onClick={()=>{history.replaceState({...history.state,liveRoomState:{roomId:liveRoomId,playing,muted,volume,danmaku,messages,draft}},'');onOpenHost();}}>{hostIdentity.avatar}</button><span onClick={onOpenHost} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')onOpenHost();}}><b>{hostIdentity.name}</b><small>粉丝 {formatNumber(room.shares)}</small></span><button aria-label="关注主播" className={followed ? "followed" : ""} onClick={() => { onHostFollow(); setToast(followed ? "已取消关注" : "关注成功"); }}>{followed ? "✓" : "+"}</button></div></div>{tab === "chat" && <section className="live-chat"><div className="room-welcome" aria-live="polite">{welcome}</div><div className="room-chat-body"><div className="room-messages" ref={chatRef}>{messages.map((message) => message.type === "announcement" ? <article className="host-announcement" key={message.id}><b>📣 主播公告</b><p>{message.content}</p></article> : <article className="room-message" key={message.id}><span className={`vip vip-${message.vipLevel}`}>VIP{message.vipLevel}</span><span className="badge">{message.badge}</span>{message.senderType === "host" && <span className="host-tag">主播</span>}<b>{message.nickname}：</b><p>{message.content}</p></article>)}</div>{!isReplay && <aside className="live-chat-entries" aria-label="直播间快捷入口"><button className="chat-entry-reward" onClick={() => openChatEntry("tasks")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1.5" /><path d="M5 12v8h14v-8M12 8v12M12 8C6 8 5 3 8 3c3 0 4 5 4 5Zm0 0c6 0 7-5 4-5-3 0-4 5-4 5Z" /></svg><span>福利</span></button><button className="chat-entry-invite" onClick={() => openChatEntry("invite")}><PersonIcon aria-hidden="true" /><span>邀请好友</span></button></aside>}</div>{!isReplay && <form className="live-input" onSubmit={(event) => { event.preventDefault(); sendChat(); }}><button type="button" aria-label="礼物" onClick={() => { setSelectedGift(null); setGiftOpen(true); }}>礼物</button><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="说点什么..." aria-label="说点什么" /><button type="submit" className={draft.trim() ? "ready" : ""}><PaperPlaneIcon />发送</button></form>}</section>}{tab === "direct" && <section className="live-private-panel">{renderPrivateMessages()}</section>}{tab === "groups" && <section className="group-panel">{activeGroup ? <><header><button aria-label="返回群聊列表" onClick={() => setGroupId(null)}><ArrowLeftIcon /></button>{avatar(activeGroup.name)}<span><b>{activeGroup.name}</b><small>{activeGroup.members} 人</small></span></header><div className="group-thread"><p>{activeGroup.name}：今晚重点赛事已开始讨论</p><p>球王Leo：主播的分析很到位。</p><p>我：收到，感谢大家！</p></div><form className="group-input" onSubmit={(event) => event.preventDefault()}><input placeholder="输入群消息" /><button type="submit">发送</button></form></> : groups.map((group, index) => <button className="group-row" key={group.id} onClick={() => setGroupId(group.id)}>{avatar(group.name, `group-avatar group-${index}`)}<span><b>{group.name}</b><small>{group.last}</small></span><time>{group.time}</time></button>)}</section>}{tab === "tips" && boundEvent && <section className="live-tips" data-event-id={boundEvent.id}><MobileScroll className="live-tips-scroll"><div className="live-tips-content">{renderEventTips?.(boundEvent.id,leaveTips)}</div></MobileScroll></section>}{tab === "situation" && <section className="live-situation" data-event-id={room.eventId} data-sport={boundEvent?.sport}><MobileScroll className="live-situation-scroll"><MatchTimelinePanel event={boundEvent} /></MobileScroll></section>}{tab === "ranking" && <section className="ranking-panel"><nav><button className={rankType === "weekly" ? "active" : ""} onClick={() => setRankType("weekly")}>周榜</button><button className={rankType === "monthly" ? "active" : ""} onClick={() => setRankType("monthly")}>月榜</button></nav>{rankingUsers.map((name, index) => <article className={`rank-row rank-${index + 1}`} key={name}><b>{index + 1}</b>{avatar(name)}<span className="rank-user-name">{name}</span><em>{formatNumber((rankType === "weekly" ? 128600 : 236800) - index * (rankType === "weekly" ? 9300 : 17100))} 贡献值</em></article>)}</section>}</section>{giftOpen && <div className="gift-layer" onClick={() => setGiftOpen(false)}><section className="gift-sheet" onClick={(event) => event.stopPropagation()}><header><b>赠送礼物</b><button aria-label="关闭礼物面板" onClick={() => setGiftOpen(false)}><Cross1Icon /></button></header><div>{gifts.map((gift) => <button key={gift.name} aria-pressed={selectedGift?.name === gift.name} className={selectedGift?.name === gift.name ? "selected" : ""} onClick={() => setSelectedGift(gift)}><i>{gift.icon}</i><b>{gift.name}</b><small>{gift.price}金币</small></button>)}</div><footer className="gift-footer"><section className="gift-balances" aria-label="我的资产"><span><i className="gift-diamond" aria-hidden="true">◆</i>钻石 <strong>{giftBalance("diamonds")}</strong></span><span><i className="gift-coin" aria-hidden="true">●</i>金币 <strong>{giftBalance("coins")}</strong></span></section><button className="gift-send" disabled={!selectedGift} onClick={() => { if (!selectedGift) return; setGiftOpen(false); setToast(`已送出 ${selectedGift.name}`); setSelectedGift(null); }}>赠送</button></footer></section></div>}{toast && <div className="live-toast" role="status">{toast}</div>}</main>;
}
