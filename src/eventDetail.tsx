import { ArrowLeftIcon, CheckCircledIcon, CircleIcon, ClockIcon, CrossCircledIcon, ExclamationTriangleIcon, InfoCircledIcon, LightningBoltIcon, PlayIcon, SewingPinIcon, UpdateIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import "./eventDetail.css";
import "./eventDetailRefine.css";

export type DetailStat = { home: number; away: number };
type FootballPlayer = { number: number; name: string; position: "门将" | "后卫" | "中场" | "前锋"; value: string; substitutedAt?: string; seed: number };
type BasketballPlayer = { number: number; name: string; points: number; rebounds: number; assists: number; made: number; attempted: number; seed: number };
type FootballTeamLineup = { formation: string; coach: { name: string; seed: number }; starters: FootballPlayer[]; substitutes: FootballPlayer[] };
export type EventDetailPayload = { statistics?: Record<string, DetailStat>; footballLineup?: { home: FootballTeamLineup; away: FootballTeamLineup }; basketballLineup?: { home: BasketballPlayer[]; away: BasketballPlayer[] } };
type QuarterScore = { quarter: number; home: number; away: number };
export type EventDetailEvent = { id: string; sport: "football" | "basketball"; league: string; date: string; startTime: string; status: "live" | "upcoming" | "finished"; stage?: string; home: { name: string; score?: number }; away: { name: string; score?: number }; halftimeScore?: { home: number; away: number } | null; quarterScores?: QuarterScore[]; detail?: EventDetailPayload };

const footballStatLabels: Array<[string, string, boolean?]> = [["redCards", "红牌"], ["yellowCards", "黄牌"], ["corners", "角球"], ["penalties", "点球"], ["shotsOnTarget", "射正"], ["shotsOffTarget", "射偏"], ["attacks", "进攻"], ["dangerousAttacks", "危险进攻"], ["possession", "控球率", true]];
const basketballStatLabels: Array<[string, string, boolean?]> = [["threePointersMade", "3分球"], ["twoPointersMade", "2分球"], ["freeThrowsMade", "罚球"], ["timeoutsRemaining", "剩余暂停"], ["fouls", "犯规"], ["freeThrowPercentage", "罚球命中率", true], ["totalTimeouts", "总暂停"]];
const avatarPositions = ["0 0", "50% 0", "100% 0", "0 50%", "50% 50%", "100% 50%", "0 100%", "50% 100%", "100% 100%"];
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

const footballNames = ["Ederson", "Walker", "Rúben Dias", "Gvardiol", "Ake", "Rodri", "Bernardo", "Foden", "Doku", "Haaland", "Savinho", "Ortega", "Stones", "Kovačić", "Grealish", "Alvarez"];
const arsenalNames = ["Raya", "White", "Saliba", "Gabriel", "Timber", "Rice", "Ødegaard", "Havertz", "Saka", "Martinelli", "Jesus", "Neto", "Kiwior", "Jorginho", "Trossard", "Nwaneri"];
const basketballNames = ["LeBron James", "Anthony Davis", "Austin Reaves", "D'Angelo Russell", "Rui Hachimura", "Gabe Vincent", "Jarred Vanderbilt", "Max Christie"];
const warriorsNames = ["Stephen Curry", "Jimmy Butler", "Draymond Green", "Jonathan Kuminga", "Brandin Podziemski", "Buddy Hield", "Moses Moody", "Trayce Jackson-Davis"];

function footballPlayers(names: string[], seed: number): FootballPlayer[] {
  const positions: FootballPlayer["position"][] = ["门将", "后卫", "后卫", "后卫", "后卫", "中场", "中场", "中场", "前锋", "前锋", "前锋", "门将", "后卫", "中场", "前锋", "前锋"];
  return names.map((name, index) => ({ number: index === 0 ? 1 : index + 2, name, position: positions[index], value: `€${["95M", "65M", "85M", "48M", "40M", "120M", "70M", "110M", "90M", "180M", "75M", "18M", "52M", "60M", "78M", "45M"][index]}`, substitutedAt: index === 12 ? "68' 替补上场" : index === 14 ? "76' 替补上场" : undefined, seed: seed + index }));
}

function basketballPlayers(names: string[], seed: number): BasketballPlayer[] {
  return names.map((name, index) => ({ number: [23, 3, 15, 1, 28, 7, 2, 20][index], name, points: Math.max(4, 28 - index * 3), rebounds: Math.max(1, 8 - (index % 5)), assists: Math.max(0, 7 - (index % 4)), made: Math.max(2, 10 - index), attempted: 18 - Math.min(index, 5), seed: seed + index }));
}

export function makeEventDetail(sport: "football" | "basketball", status: "live" | "upcoming" | "finished", seed: number): EventDetailPayload {
  if (sport === "football") return {
    statistics: status === "upcoming" ? undefined : { redCards: { home: 0, away: 1 }, yellowCards: { home: 2, away: 4 }, corners: { home: 6, away: 3 }, penalties: { home: 1, away: 0 }, shotsOnTarget: { home: 8, away: 4 }, shotsOffTarget: { home: 5, away: 7 }, attacks: { home: 118, away: 93 }, dangerousAttacks: { home: 62, away: 41 }, possession: { home: 58, away: 42 } },
    footballLineup: { home: { formation: seed % 2 ? "4-3-3" : "4-2-3-1", coach: { name: "Pep Guardiola", seed: seed + 1 }, starters: footballPlayers(footballNames, seed), substitutes: footballPlayers(footballNames.slice(11), seed + 11) }, away: { formation: seed % 2 ? "4-4-2" : "4-3-3", coach: { name: "Mikel Arteta", seed: seed + 5 }, starters: footballPlayers(arsenalNames, seed + 5), substitutes: footballPlayers(arsenalNames.slice(11), seed + 16) } },
  };
  return {
    statistics: status === "upcoming" ? undefined : { threePointersMade: { home: 12, away: 9 }, twoPointersMade: { home: 24, away: 27 }, freeThrowsMade: { home: 18, away: 15 }, timeoutsRemaining: { home: 2, away: 3 }, fouls: { home: 5, away: 7 }, freeThrowPercentage: { home: 84, away: 76 }, totalTimeouts: { home: 7, away: 7 } },
    basketballLineup: { home: basketballPlayers(basketballNames, seed), away: basketballPlayers(warriorsNames, seed + 4) },
  };
}

function TeamCrest({ name }: { name: string }) { return <img className="detail-crest" src={asset("club-crest.png")} alt={`${name} logo`} />; }
function PersonAvatar({ seed, className = "" }: { seed: number; className?: string }) { return <span className={`detail-person-avatar ${className}`} style={{ backgroundImage: `url(${asset("service-avatars-grid.png")})`, backgroundPosition: avatarPositions[seed % avatarPositions.length] }} />; }
const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
export function formatEventDateTime(date: string, startTime: string) { const value = new Date(`${date}T00:00:00`); const normalizedDate = date.replaceAll("-", "/"); return `${normalizedDate} ${startTime} ${weekdays[value.getDay()]}`; }
function scoreboardStatus(event: EventDetailEvent) { return event.status === "upcoming" ? "未" : event.status === "finished" ? "完" : event.stage ?? "进行中"; }
function scoreOf(event: EventDetailEvent) { return event.status === "upcoming" ? "VS" : `${event.home.score ?? 0} : ${event.away.score ?? 0}`; }

function ViewModeSwitcher({ mode, setMode }: { mode: "animation" | "scoreboard"; setMode: (mode: "animation" | "scoreboard") => void }) { return <div className="event-view-switcher"><button className={mode === "animation" ? "active" : ""} onClick={() => setMode("animation")}>动画</button><button className={mode === "scoreboard" ? "active" : ""} onClick={() => setMode("scoreboard")}>比分</button></div>; }
function halftimeScoreOf(event: EventDetailEvent) { return event.sport === "football" && event.status !== "upcoming" ? event.halftimeScore : undefined; }
function periodLabel(quarter: number) { return quarter <= 4 ? `Q${quarter}` : quarter === 5 ? "OT" : `OT${quarter - 4}`; }
function BasketballScoreTable({ event }: { event: EventDetailEvent }) { const actualPeriods = event.quarterScores ?? []; const finalQuarter = Math.max(4, ...actualPeriods.map((item) => item.quarter)); const periods = Array.from({ length: finalQuarter }, (_, index) => index + 1); const latestLiveQuarter = event.status === "live" ? actualPeriods.reduce((latest, item) => Math.max(latest, item.quarter), 0) : 0; const valueFor = (side: "home" | "away", quarter: number) => actualPeriods.find((item) => item.quarter === quarter)?.[side] ?? "-"; const totalFor = (side: "home" | "away") => event.status === "upcoming" ? "-" : event[side].score ?? "-"; const columns = { gridTemplateColumns: `64px repeat(${periods.length + 1}, 29px)` }; return <div className="detail-basketball-score-table" aria-label="各节比分"><div className="detail-basketball-score-row detail-basketball-score-head" style={columns}><span /><>{periods.map((quarter) => <b key={quarter} className={quarter === latestLiveQuarter ? "current-period" : ""}>{periodLabel(quarter)}</b>)}</><b className="total-column">总</b></div>{(["home", "away"] as const).map((side) => <div className="detail-basketball-score-row" style={columns} key={side}><strong>{event[side].name}</strong><>{periods.map((quarter) => { const value = valueFor(side, quarter); return <span key={quarter} className={value === "-" ? "not-started" : quarter === latestLiveQuarter ? "current-period" : ""}>{value}</span>; })}</><b className="total-column">{totalFor(side)}</b></div>)}</div>; }
function Scoreboard({ event }: { event: EventDetailEvent }) { const halftimeScore = halftimeScoreOf(event); const status = scoreboardStatus(event); return <div className={`event-scoreboard ${event.sport === "basketball" ? "detail-basketball-scoreboard" : "football-scoreboard"}`}><span className="event-league-name">{event.league}</span><span className="event-start-datetime">{formatEventDateTime(event.date, event.startTime)}</span><b className={`event-score-status ${event.status === "live" ? "live" : ""}`}>{status}</b><div className="event-score-teams"><div><TeamCrest name={event.home.name} /><strong>{event.home.name}</strong></div><div className="scoreboard-score"><em>{scoreOf(event)}</em>{halftimeScore && <small>半场 {halftimeScore.home} : {halftimeScore.away}</small>}</div><div><TeamCrest name={event.away.name} /><strong>{event.away.name}</strong></div></div>{event.sport === "basketball" && <BasketballScoreTable event={event} />}</div>; }
function EventVisualHeader({ event, onBack }: { event: EventDetailEvent; onBack: () => void }) { const [mode, setMode] = useState<"animation" | "scoreboard">("animation"); return <header className={`event-visual event-visual-${event.sport} ${mode === "scoreboard" ? "is-scoreboard" : ""}`}><img src={asset(event.sport === "football" ? "event-football-pitch.svg" : "event-basketball-court.svg")} alt={event.sport === "football" ? "足球场景" : "篮球场景"} /><div className="event-visual-shade" /><button className="event-visual-back" aria-label="返回" onClick={onBack}><ArrowLeftIcon /></button><ViewModeSwitcher mode={mode} setMode={setMode} />{mode === "scoreboard" && <Scoreboard event={event} />}</header>; }

function StatisticRow({ label, value, isPercentage }: { label: string; value: DetailStat; isPercentage?: boolean }) { const max = isPercentage ? 100 : Math.max(value.home, value.away, 1); const homeWidth = value.home / max * 50; const awayWidth = value.away / max * 50; const homeLead = value.home > value.away; const awayLead = value.away > value.home; const format = (number: number) => isPercentage ? `${number}%` : number; return <article className="statistic-row"><div className="statistic-copy"><b>{format(value.home)}</b><span>{label}</span><b>{format(value.away)}</b></div><div className="statistic-bars"><i className={homeLead ? "lead statistic-home-bar" : "statistic-home-bar"} style={{ width: `${homeWidth}%` }} /><i className={awayLead ? "lead statistic-away-bar" : "statistic-away-bar"} style={{ width: `${awayWidth}%` }} /></div></article>; }
function StatisticsPanel({ event }: { event: EventDetailEvent }) { const stats = event.detail?.statistics; if (!stats) return <EmptyDetailState text="暂无技术统计" />; const labels = event.sport === "football" ? footballStatLabels : basketballStatLabels; return <section className="statistics-panel">{labels.map(([key, label, percentage]) => { const value = stats[key]; return value ? <StatisticRow key={key} label={label} value={value} isPercentage={percentage} /> : null; })}</section>; }
function EmptyDetailState({ text }: { text: string }) { return <div className="event-detail-empty"><PlayIcon /><span>{text}</span></div>; }

function FormationRows({ players, formation, team }: { players: FootballPlayer[]; formation: string; team: "home" | "away" }) { const counts = formation.split("-").map(Number); let pointer = 1; const rows = [[players[0]], ...counts.map((count) => players.slice(pointer, pointer += count))]; return <div className={`football-formation ${team}`}>{rows.map((row, rowIndex) => <div className="football-line" key={rowIndex}>{row.map((player) => <FootballPlayerNode key={player.number} player={player} />)}</div>)}</div>; }
function FootballPlayerNode({ player }: { player: FootballPlayer }) { return <div className="football-player-node"><span className="player-number">{player.number}</span><PersonAvatar seed={player.seed} /><b title={player.name}>{player.name}</b></div>; }
function CoachCard({ name, coach, formation, side }: { name: string; coach: FootballTeamLineup["coach"]; formation: string; side: "home" | "away" }) { return <div className={`coach-card ${side}`}><span><b>{name}</b><small>阵型 {formation}</small></span><div><small>教练</small><strong>{coach.name}</strong></div><PersonAvatar seed={coach.seed} /></div>; }
function BenchList({ name, players }: { name: string; players: FootballPlayer[] }) { return <section className="bench-group"><h3>{name} 替补阵容</h3>{players.map((player) => <article className="bench-row" key={`${name}-${player.number}`}><b className="bench-number">{player.number}</b><PersonAvatar seed={player.seed} /><span><b>{player.name}</b><small>{player.position} · {player.value}</small></span>{player.substitutedAt && <em>{player.substitutedAt}</em>}</article>)}</section>; }
function FootballLineup({ event }: { event: EventDetailEvent }) { const lineup = event.detail?.footballLineup; if (!lineup) return <EmptyDetailState text="暂无阵容数据" />; return <section className="football-lineup"><div className="football-pitch" style={{ backgroundImage: `url(${asset("event-football-pitch.svg")})` }}><CoachCard name={event.away.name} coach={lineup.away.coach} formation={lineup.away.formation} side="away" /><FormationRows players={lineup.away.starters} formation={lineup.away.formation} team="away" /><FormationRows players={lineup.home.starters} formation={lineup.home.formation} team="home" /><CoachCard name={event.home.name} coach={lineup.home.coach} formation={lineup.home.formation} side="home" /></div><BenchList name={event.home.name} players={lineup.home.substitutes} /><BenchList name={event.away.name} players={lineup.away.substitutes} /></section>; }
function BasketballPlayerTable({ name, players }: { name: string; players: BasketballPlayer[] }) { const numberOrZero = (value: number | null | undefined) => typeof value === "number" && Number.isFinite(value) ? value : 0; const totals = players.reduce((sum, player) => ({ points: sum.points + numberOrZero(player.points), rebounds: sum.rebounds + numberOrZero(player.rebounds), assists: sum.assists + numberOrZero(player.assists), made: sum.made + numberOrZero(player.made), attempted: sum.attempted + numberOrZero(player.attempted) }), { points: 0, rebounds: 0, assists: 0, made: 0, attempted: 0 }); return <section className="basketball-team"><h3><TeamCrest name={name} />{name}</h3><div className="basketball-table-head"><span>球员</span><span>得分</span><span>篮板</span><span>助攻</span><span>投篮</span></div>{players.map((player) => <article className="basketball-player-row" key={`${name}-${player.number}`}><span className="basketball-player"><b>{player.number}</b><PersonAvatar seed={player.seed} /><em title={player.name}>{player.name}</em></span><span>{player.points}</span><span>{player.rebounds}</span><span>{player.assists}</span><span>{player.made}/{player.attempted}</span></article>)}<footer className="basketball-team-total" aria-label={`${name} 全队数据`}><strong>全队</strong><span>{totals.points}</span><span>{totals.rebounds}</span><span>{totals.assists}</span><span>{totals.made}/{totals.attempted}</span></footer></section>; }
function BasketballLineup({ event }: { event: EventDetailEvent }) { const lineup = event.detail?.basketballLineup; if (!lineup) return <EmptyDetailState text="暂无阵容数据" />; return <section className="basketball-lineup"><BasketballPlayerTable name={event.home.name} players={lineup.home} /><BasketballPlayerTable name={event.away.name} players={lineup.away} /></section>; }
type MatchEventType = "goal" | "penalty" | "penaltyMiss" | "ownGoal" | "corner" | "yellow" | "red" | "secondYellow" | "substitution" | "injury" | "var" | "assist" | "stage";
type MatchEvent = { id: string; minute: string; type: MatchEventType; teamType: "home" | "away" | "neutral"; teamName?: string; description: string; homeScore: number; awayScore: number; stage?: string };
const eventLegend: Array<[MatchEventType, string]> = [["goal", "进球"], ["penalty", "点球"], ["penaltyMiss", "点球不进"], ["ownGoal", "乌龙球"], ["corner", "角球"], ["assist", "助攻"], ["yellow", "黄牌"], ["red", "红牌"], ["secondYellow", "两黄一红"], ["substitution", "换人"], ["injury", "受伤"], ["var", "VAR"]];
function matchEventsFor(event: EventDetailEvent): MatchEvent[] { const home = event.home.name; const away = event.away.name; return [{ id: "end", minute: "90'+5", type: "stage", teamType: "neutral", description: "比赛结束", stage: "全场", homeScore: 2, awayScore: 1 }, { id: "var", minute: "90'+3", type: "var", teamType: "home", teamName: home, description: "VAR确认进球有效", homeScore: 2, awayScore: 1 }, { id: "red", minute: "88'", type: "secondYellow", teamType: "away", teamName: away, description: "两黄一红，被罚离场", homeScore: 1, awayScore: 1 }, { id: "injury", minute: "82'", type: "injury", teamType: "home", teamName: home, description: "球员受伤，比赛暂时中断", homeScore: 1, awayScore: 1 }, { id: "sub", minute: "75'", type: "substitution", teamType: "away", teamName: away, description: "换人：A球员下，B球员上", homeScore: 1, awayScore: 1 }, { id: "penaltyMiss", minute: "69'", type: "penaltyMiss", teamType: "home", teamName: home, description: "点球未进", homeScore: 1, awayScore: 1 }, { id: "penalty", minute: "68'", type: "penalty", teamType: "home", teamName: home, description: "获得点球", homeScore: 1, awayScore: 1 }, { id: "corner3", minute: "63'", type: "corner", teamType: "home", teamName: home, description: "第3个角球", homeScore: 1, awayScore: 1 }, { id: "goal2", minute: "58'", type: "goal", teamType: "home", teamName: home, description: "取得进球，第2个进球", homeScore: 2, awayScore: 1 }, { id: "assist", minute: "58'", type: "assist", teamType: "home", teamName: home, description: "助攻：B球员", homeScore: 2, awayScore: 1 }, { id: "half2", minute: "46'", type: "stage", teamType: "neutral", description: "下半场开始", stage: "下半场", homeScore: 1, awayScore: 1 }, { id: "half", minute: "45'+2", type: "stage", teamType: "neutral", description: "半场结束", stage: "中场", homeScore: 1, awayScore: 1 }, { id: "corner2", minute: "39'", type: "corner", teamType: "away", teamName: away, description: "第2个角球", homeScore: 1, awayScore: 1 }, { id: "yellow", minute: "31'", type: "yellow", teamType: "home", teamName: home, description: "获得黄牌，全场第2张", homeScore: 1, awayScore: 1 }, { id: "own", minute: "24'", type: "ownGoal", teamType: "home", teamName: home, description: "乌龙球", homeScore: 1, awayScore: 1 }, { id: "corner1", minute: "12'", type: "corner", teamType: "home", teamName: home, description: "第1个角球", homeScore: 0, awayScore: 1 }, { id: "goal1", minute: "5'", type: "goal", teamType: "away", teamName: away, description: "取得进球，第1个进球", homeScore: 0, awayScore: 1 }, { id: "start", minute: "0'", type: "stage", teamType: "neutral", description: "比赛开始", stage: "开始", homeScore: 0, awayScore: 0 }]; }
function MatchEventIcon({ type }: { type: MatchEventType }) { const Icon = type === "goal" ? CheckCircledIcon : type === "penalty" ? CircleIcon : type === "penaltyMiss" || type === "ownGoal" || type === "red" ? CrossCircledIcon : type === "corner" ? SewingPinIcon : type === "yellow" || type === "secondYellow" || type === "injury" ? ExclamationTriangleIcon : type === "substitution" ? UpdateIcon : type === "assist" ? LightningBoltIcon : type === "var" ? InfoCircledIcon : ClockIcon; return <span className={`match-event-icon ${type}`}><Icon /></span>; }
function EventLegend() { return <footer className="match-event-legend" aria-label="事件图例">{eventLegend.map(([type, label]) => <span key={type}><MatchEventIcon type={type} />{label}</span>)}</footer>; }
function TeamOwnershipTag({ teamType }: { teamType: "home" | "away" | "neutral" }) { const label = teamType === "home" ? "主队" : teamType === "away" ? "客队" : "中立"; return <span className={`team-ownership-tag owner-${teamType}`}>{label}</span>; }
function FootballGoalHeadline({ item }: { item: MatchEvent }) { return <b className="football-goal-headline"><em>Goal!</em><i>当前比分：</i><span className={item.teamType === "home" ? "scored" : ""}>{item.homeScore}</span><small>：</small><span className={item.teamType === "away" ? "scored" : ""}>{item.awayScore}</span></b>; }
function MatchTeamsHeader({ event, showTeamColours = false }: { event: EventDetailEvent; showTeamColours?: boolean }) { return <header className={`match-timeline-teams${showTeamColours ? " has-team-colours" : ""}`}><span><TeamCrest name={event.home.name} /><b>{event.home.name}</b>{showTeamColours && <i className="home-team-colour" />}</span><span><i className={showTeamColours ? "away-team-colour" : undefined} /><b>{event.away.name}</b><TeamCrest name={event.away.name} /></span></header>; }
function KeyEventTimeline({ event, events }: { event: EventDetailEvent; events: MatchEvent[] }) { return <section className="key-events"><MatchTeamsHeader event={event} /><div className="key-event-list">{events.map((item) => item.type === "stage" ? <article className="timeline-stage" key={item.id}><div><span>{item.minute}</span><b>{item.stage}</b></div><small>{item.description}</small></article> : <article className={`key-event-row event-${item.teamType}`} key={item.id}><div className="key-event-card home-event">{item.teamType === "home" && <><div className="key-event-copy"><span>{item.description}</span><small>{item.homeScore}-{item.awayScore}</small></div><MatchEventIcon type={item.type} /></>}</div><div className="key-event-axis"><time>{item.minute}</time><i /></div><div className="key-event-card away-event">{item.teamType === "away" && <><MatchEventIcon type={item.type} /><div className="key-event-copy"><span>{item.description}</span><small>{item.homeScore}-{item.awayScore}</small></div></>}</div></article>)}</div><EventLegend /></section>; }
function TextLiveTimeline({ event: _event, events }: { event: EventDetailEvent; events: MatchEvent[] }) { return <section className="text-live"><div className="text-live-list">{events.map((item) => <article className={`text-live-row event-${item.teamType} ${item.type === "stage" ? "stage" : ""}`} key={item.id}><MatchEventIcon type={item.type} /><time>{item.minute}</time><div>{item.type === "goal" && <FootballGoalHeadline item={item} />}<span>{item.teamName ? `${item.teamName} ${item.description}` : item.description}</span><TeamOwnershipTag teamType={item.teamType} /></div></article>)}</div><EventLegend /></section>; }
function FootballMatchTimelinePanel({ event }: { event: EventDetailEvent }) { const [view, setView] = useState<"key" | "text">("key"); const events = matchEventsFor(event); return <section className="match-timeline-panel"><nav className="match-timeline-tabs" aria-label="赛况内容"><button className={view === "key" ? "active" : ""} onClick={() => setView("key")}>关键事件</button><button className={view === "text" ? "active" : ""} onClick={() => setView("text")}>文字直播</button></nav>{view === "key" ? <KeyEventTimeline event={event} events={events} /> : <TextLiveTimeline event={event} events={events} />}</section>; }

type BasketballLiveEvent = {
  id: string;
  quarter: number;
  quarterLabel: string;
  clock: string;
  homeScore: number;
  awayScore: number;
  teamType: "home" | "away" | "neutral";
  teamName?: string;
  eventType: string;
  description: string;
};

const basketballQuarterLabel = (quarter: number) => quarter <= 4 ? `第${["一", "二", "三", "四"][quarter - 1]}节` : `加时${quarter - 4}`;
const basketballClockValue = (clock: string) => { const [minutes, seconds] = clock.split(":").map(Number); return minutes * 60 + seconds; };
const basketballQuarterEnds = [[28, 24], [53, 48], [76, 68], [98, 91]];

function basketballLiveEventsFor(event: EventDetailEvent): BasketballLiveEvent[] {
  const maxQuarter = event.status === "upcoming" ? 0 : event.status === "finished" ? 4 : Math.max(1, ...(event.quarterScores ?? []).map((item) => item.quarter));
  const home = event.home.name;
  const away = event.away.name;
  const events: BasketballLiveEvent[] = [];
  for (let quarter = 1; quarter <= maxQuarter; quarter += 1) {
    const [endHome, endAway] = basketballQuarterEnds[quarter - 1] ?? [98 + (quarter - 4) * 10, 91 + (quarter - 4) * 8];
    const [startHome, startAway] = quarter === 1 ? [0, 0] : basketballQuarterEnds[quarter - 2] ?? [endHome - 10, endAway - 8];
    const label = basketballQuarterLabel(quarter);
    const score = (homeOffset: number, awayOffset: number) => ({ homeScore: Math.min(endHome, startHome + homeOffset), awayScore: Math.min(endAway, startAway + awayOffset) });
    const entry = (clock: string, teamType: BasketballLiveEvent["teamType"], eventType: string, description: string, homeOffset: number, awayOffset: number) => events.push({ id: `${event.id}-q${quarter}-${clock}-${events.length}`, quarter, quarterLabel: label, clock, teamType, eventType, description, teamName: teamType === "home" ? home : teamType === "away" ? away : undefined, ...score(homeOffset, awayOffset) });
    entry("12:00", "neutral", quarter === 1 ? "GAME_START" : "QUARTER_START", quarter === 1 ? "比赛开始" : `${label}开始`, 0, 0);
    entry("11:38", "home", "POSSESSION", `${home} 控球`, 0, 0);
    entry("11:16", "home", "TWO_POINT_MISSED", `${home} 两分出手，MISS`, 0, 0);
    entry("10:54", "away", "DEFENSIVE_REBOUND", `${away} 获得防守篮板`, 0, 0);
    entry("10:31", "away", "THREE_POINT_MADE", `漂亮！${away} 三分远投应声入篮`, 0, 3);
    entry("09:58", "home", "ASSIST", `${home} 助攻，内线配合完成`, 2, 3);
    entry("09:31", "away", "TURNOVER", `${away} 出现失误`, 2, 3);
    entry("08:47", "home", "STEAL", `${home} 抢断成功，发动快攻`, 4, 3);
    entry("08:18", "home", "FREE_THROW_MADE", `${home} 罚球命中`, 5, 3);
    entry("07:42", "away", "TWO_POINT_MADE", `${away} 两分命中`, 5, 5);
    entry("06:58", "neutral", "TIMEOUT", "比赛进入官方暂停", 5, 5);
    entry("06:31", "home", "SUBSTITUTION", `${home} 换人`, 7, 5);
    entry("05:54", "away", "BLOCK", `${away} 送出盖帽`, 7, 5);
    entry("05:08", "home", "OFFENSIVE_REBOUND", `${home} 获得进攻篮板`, 9, 5);
    entry("04:32", "away", "FOUL", `${away} 防守犯规`, 9, 7);
    entry("03:47", "home", "THREE_POINT_MISSED", `${home} 三分出手，MISS`, 9, 7);
    entry("02:58", "away", "FREE_THROW_MISSED", `${away} 罚球未中`, 11, 8);
    entry("02:14", "home", "THREE_POINT_MADE", `漂亮！${home} 三分远投应声入篮`, 14, 8);
    entry("01:36", "away", "POSSESSION", `${away} 控球`, 14, 11);
    entry("00:52", "home", "TWO_POINT_MADE", `${home} 突破上篮命中`, 18, 11);
    entry("00:25", "away", "TWO_POINT_MADE", `${away} 两分命中`, 18, 14);
    entry("00:00", "neutral", quarter === maxQuarter && event.status === "finished" ? "GAME_END" : "QUARTER_END", quarter === maxQuarter && event.status === "finished" ? "主裁判一声哨响，全场比赛结束" : `${label}结束`, endHome - startHome, endAway - startAway);
  }
  return events;
}

function BasketballSituationEmpty({ text }: { text: string }) { return <div className="basketball-situation-empty"><EmptyDetailState text={text} /></div>; }
function BasketballSituationModule({ title, text }: { title: string; text: string }) { return <section className="basketball-situation-module"><h3>{title}</h3><BasketballSituationEmpty text={text} /></section>; }
const basketballScoringEventTypes = new Set(["TWO_POINT_MADE", "THREE_POINT_MADE", "FREE_THROW_MADE"]);
function BasketballLiveScore({ item }: { item: BasketballLiveEvent }) { const isScoring = basketballScoringEventTypes.has(item.eventType); return <b className="basketball-live-score"><span className={isScoring && item.teamType === "home" ? "scored" : ""}>{item.homeScore}</span><i> - </i><span className={isScoring && item.teamType === "away" ? "scored" : ""}>{item.awayScore}</span></b>; }
function BasketballLiveList({ events }: { events: BasketballLiveEvent[] }) { return <div className="basketball-live-list">{events.sort((left, right) => basketballClockValue(left.clock) - basketballClockValue(right.clock)).map((item) => { const isScoring = basketballScoringEventTypes.has(item.eventType); return <article className={`basketball-live-row event-${item.teamType} ${isScoring ? "is-scoring" : "is-secondary"}`} key={item.id}><i className="basketball-live-dot" aria-hidden="true" /><div className="basketball-live-card"><header><time>{item.quarterLabel} {item.clock}</time><BasketballLiveScore item={item} /></header><footer><p>{item.description}</p><TeamOwnershipTag teamType={item.teamType} /></footer></div></article>; })}</div>; }
function BasketballSituationPanel({ event }: { event: EventDetailEvent }) {
  const allEvents = basketballLiveEventsFor(event);
  const periods = Array.from(new Set(allEvents.map((item) => item.quarter))).sort((left, right) => left - right);
  const currentPeriod = periods.at(-1) ?? 0;
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const visibleEvents = allEvents.filter((item) => item.quarter === selectedPeriod);
  return <section className="basketball-situation-panel">
    <BasketballSituationModule title="比分走势图" text="暂无比分走势数据" />
    <BasketballSituationModule title="小节数据" text="暂无小节数据" />
    <section className="basketball-situation-module basketball-text-live"><h3>文字直播</h3>
      {periods.length ? <><nav className="basketball-period-tabs" aria-label="文字直播小节">{periods.map((quarter) => <button key={quarter} className={quarter === selectedPeriod ? "active" : ""} onClick={() => setSelectedPeriod(quarter)}>{basketballQuarterLabel(quarter)}</button>)}</nav><BasketballLiveList events={visibleEvents} /></> : <BasketballSituationEmpty text="比赛尚未开始\n暂无文字直播数据" />}
    </section>
  </section>;
}
function MatchTimelinePanel({ event }: { event: EventDetailEvent }) { return event.sport === "basketball" ? <BasketballSituationPanel event={event} /> : <FootballMatchTimelinePanel event={event} />; }
function EventDetailTabs({ event }: { event: EventDetailEvent }) { const [tab, setTab] = useState<"statistics" | "timeline" | "lineup">("statistics"); return <section className="event-detail-tabs"><nav aria-label="赛事详情内容"><button className={tab === "statistics" ? "active" : ""} onClick={() => setTab("statistics")}>技术统计</button><button className={tab === "timeline" ? "active" : ""} onClick={() => setTab("timeline")}>赛况</button><button className={tab === "lineup" ? "active" : ""} onClick={() => setTab("lineup")}>阵容</button></nav>{tab === "statistics" ? <StatisticsPanel event={event} /> : tab === "timeline" ? <MatchTimelinePanel event={event} /> : event.sport === "football" ? <FootballLineup event={event} /> : <BasketballLineup event={event} />}</section>; }

export function EventDetailPage({ event, onBack }: { event?: EventDetailEvent; onBack: () => void }) { if (!event) return <main className="event-detail-page"><header className="event-missing-header"><button aria-label="返回" onClick={onBack}><ArrowLeftIcon /></button></header><EmptyDetailState text="赛事不存在或已下线" /></main>; return <main className="event-detail-page"><EventVisualHeader event={event} onBack={onBack} /><EventDetailTabs event={event} /></main>; }
