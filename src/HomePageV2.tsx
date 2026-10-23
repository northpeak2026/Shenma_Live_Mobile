import { ChevronRightIcon, Cross1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useState, type ReactNode } from "react";
import { Carousel } from "./mobile";

export type Stream = { id: number; title: string; anchor: string; hostId: string; tag: string; heat: string; image: string; recommended: boolean };
type Match = { id: string; league: string; state: string; home: string; away: string; score: string; tone: string; streamers: { id: string; nickname: string }[] };
type Banner = { image: string; title: string; sub: string };

type HomePageV2Props = {
  categories: string[];
  banners: Banner[];
  matches: Match[];
  streams: Stream[];
  category: string;
  activeBanner: number;
  bannerRestart: number;
  assetUrl: (file: string) => string;
  crest: (name: string) => ReactNode;
  avatar: (name: string, index: number) => ReactNode;
  setCategory: (value: string) => void;
  selectBanner: (index: number) => void;
  openPreview: () => void;
  onDownload: () => void;
  onSearch: () => void;
  onGame: () => void;
  onOpenLive: (liveRoomId: string) => void;
  onOpenEvent: (eventId: string) => void;
};

export function LiveCard({ stream, index, assetUrl, avatar, onOpenLive, replay }: { replay?:{startedAt:string;duration:string};stream: Stream; index: number; assetUrl: (file: string) => string; avatar: (name: string, index: number) => ReactNode; onOpenLive: (liveRoomId: string) => void }) {
  if(replay) return <article className="stream-card live-room-card user-replay-card" role="button" tabIndex={0} onClick={()=>onOpenLive(`live-${stream.id}`)} onKeyDown={event=>{if(event.key==='Enter'&&event.target===event.currentTarget)onOpenLive(`live-${stream.id}`);}}><div className="cover"><img src={assetUrl(stream.image)} alt={stream.title}/><span className="user-replay-duration">{replay.duration}</span></div><strong className="stream-title">{stream.title}</strong><div className="user-replay-meta"><time>{replay.startedAt}</time></div></article>;
  return <article className="stream-card live-room-card" role="button" tabIndex={0} onClick={() => onOpenLive(`live-${stream.id}`)} onKeyDown={(event) => { if (event.key === "Enter") onOpenLive(`live-${stream.id}`); }}><div className="cover"><img src={assetUrl(stream.image)} alt="" /><span className={`anchor-tag tag-${index % 3}`}>{stream.tag}</span><span className="heat"><span className="heat-flame" aria-hidden="true">🔥</span>{stream.heat}</span></div><strong className="stream-title">{stream.title}</strong><div className="streamer"><button className="anchor" onClick={(event)=>{event.stopPropagation();window.dispatchEvent(new CustomEvent('open-user',{detail:{id:stream.hostId,tab:'live'}}));}}>{avatar(stream.anchor, index)}{stream.anchor}</button></div></article>;
}

export function HomePageV2({ categories, banners, matches, streams, category, activeBanner, bannerRestart, assetUrl, crest, avatar, setCategory, selectBanner, openPreview, onSearch, onGame, onOpenLive, onOpenEvent }: HomePageV2Props) {
  return <main className="home screen-content"><header className="home-header"><div className="home-brand"><img src={assetUrl("reference-icons/app-logo.png?v=20261023")} alt="" /><b>神马直播</b></div><button className="search" onClick={onSearch}><MagnifyingGlassIcon /><span>搜索主播 / 直播</span></button><button className="game-entry" aria-label="自研游戏入口" onClick={onGame}><img className="game-entry-icon" src={assetUrl("reference-icons/game-entry-icon.png?v=d1f9c214")} alt="" /></button></header><nav className="category-row" aria-label="直播分类">{categories.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</nav><section className="hero" aria-label="推荐 Banner">{banners.map((banner, index) => <div className={`hero-slide ${index === activeBanner ? "active" : ""}`} key={banner.title}><img src={assetUrl(banner.image)} alt="足球直播活动" /><div className="hero-copy"><strong>{banner.title}</strong><span>{banner.sub}</span></div></div>)}<div className="banner-progress" aria-label="Banner 进度">{banners.map((banner, index) => <button key={banner.title} onClick={() => selectBanner(index)} className={index === activeBanner ? "progress active" : "progress"}><i key={index === activeBanner ? bannerRestart : "idle"} /></button>)}</div></section><section className="section hot-events"><div className="preview-heading"><h2>直播预告</h2><button className="preview-view-all" onClick={openPreview}>查看全部 <ChevronRightIcon /></button></div><Carousel className="hot-events-list" contentClassName="hot-events-track" ariaLabel="直播预告">{matches.map((match) => <article className="match-card" key={match.id} role="button" tabIndex={0} onClick={() => onOpenEvent(match.id)} onKeyDown={(event) => { if (event.key === "Enter") onOpenEvent(match.id); }}><div className="match-meta"><span className={`league ${match.tone}`}>{match.league}</span><b className={match.state === "直播中" ? "live-text" : ""}>{match.state}</b></div><div className="clubs"><div>{crest(match.home)}<span>{match.home}</span></div><strong>{match.score}</strong><div>{crest(match.away)}<span>{match.away}</span></div></div><div className={`preview-hosts ${match.state === "直播中" ? "is-live" : ""}`}><div className="event-streamers" aria-label={match.state === "直播中" ? "直播中主播" : "预约主播"}>{match.streamers.slice(0, 3).map((host, index) => <button className="streamer-face" key={host.id} title={host.nickname} onClick={event=>{event.stopPropagation();window.dispatchEvent(new CustomEvent("open-user",{detail:{id:host.id==="anchor-rain"?"host-1":host.id==="anchor-viki"?"host-2":host.id==="anchor-victor"?"host-3":host.id==="anchor-chuchu"?"host-4":"host-5",tab:"live"}}));}}>{avatar(host.nickname, index)}</button>)}{match.streamers.length > 3 && <span className="streamer-more">+{match.streamers.length - 3}</span>}</div></div></article>)}</Carousel></section><section className="section live-section"><h2>正在直播</h2><div className="stream-grid">{streams.map((stream, index) => <LiveCard key={stream.id} stream={stream} index={index} assetUrl={assetUrl} avatar={avatar} onOpenLive={onOpenLive} />)}</div></section></main>;
}

export function HomeDownloadBanner({ assetUrl, onDownload }: { assetUrl: (file: string) => string; onDownload: () => void }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return <aside className="home-download-banner" aria-label="下载 App"><button className="home-download-action" onClick={onDownload}><img src={assetUrl("reference-icons/app-logo.png?v=20261023")} alt="" /><span><b>神马直播</b> App内看更多精彩</span><ChevronRightIcon aria-hidden="true" /></button><button className="home-download-close" aria-label="关闭下载 App 横幅" onClick={() => setVisible(false)}><Cross1Icon /></button></aside>;
}
