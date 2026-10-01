import type { EventDetailEvent } from "./eventDetail";

export type BasketballLiveEvent = {
  id: string; quarter: number; quarterLabel: string; clock: string;
  homeScore: number; awayScore: number;
  teamType: "home" | "away" | "neutral";
  teamName?: string; eventType: string; description: string;
};
export type BasketballPeriodSide = {
  threePointPoints: number; twoPointPoints: number; freeThrowPoints: number;
  freeThrowPercentage: number; fouls: number; timeoutsRemaining: number;
};
export type BasketballPeriodStatistics = { quarter: number; home: BasketballPeriodSide; away: BasketballPeriodSide };
export type BasketballSituationData = {
  currentQuarter?: number; currentClock?: string; quarterMinutes?: number;
  events?: BasketballLiveEvent[]; periodStatistics?: BasketballPeriodStatistics[];
};
export const basketballQuarterLabel = (quarter: number) => quarter <= 4 ? `第${["一", "二", "三", "四"][quarter - 1]}节` : `加时${quarter - 4}`;
export const basketballClockValue = (clock: string) => { const [minutes, seconds] = clock.split(":").map(Number); return minutes * 60 + seconds; };
export const basketballScoringEventTypes = new Set(["TWO_POINT_MADE", "THREE_POINT_MADE", "FREE_THROW_MADE"]);
const clockLabel = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const safeScore = (score: number | undefined) => Math.max(0, Math.floor(score ?? 0));

// Decompose the existing quarter score into actual 3/2/1-point scoring events.
function scoringUnits(total: number, seed: number) {
  const threes = Math.floor(total * (.28 + seed % 3 * .06) / 3);
  let frees = Math.floor(total * .14);
  if ((total - threes * 3 - frees) % 2) frees += 1;
  const twos = (total - threes * 3 - frees) / 2;
  const units = [...Array(threes).fill(3), ...Array(twos).fill(2), ...Array(frees).fill(1)] as number[];
  return units.map((value, index) => ({ value, order: (index * 7 + seed * 3) % Math.max(1, units.length) })).sort((a, b) => a.order - b.order).map((item) => item.value);
}

const ordinaryEvents = [
  ["POSSESSION", "控球"], ["TWO_POINT_MISSED", "两分出手，MISS"],
  ["DEFENSIVE_REBOUND", "获得防守篮板"], ["ASSIST", "助攻，内线配合完成"],
  ["TURNOVER", "出现失误"], ["STEAL", "抢断成功，发动快攻"],
  ["THREE_POINT_MISSED", "三分出手，MISS"], ["SUBSTITUTION", "换人"],
  ["BLOCK", "送出盖帽"], ["OFFENSIVE_REBOUND", "获得进攻篮板"],
  ["FOUL", "防守犯规"], ["FREE_THROW_MISSED", "罚球未中"],
  ["TIMEOUT", "请求暂停"], ["THREE_POINT_ATTEMPT", "三分出手"],
  ["TWO_POINT_ATTEMPT", "两分出手"], ["FREE_THROW_ATTEMPT", "执行罚球"],
] as const;

export function basketballSituationFor(event: EventDetailEvent) {
  const supplied = event.detail?.basketballSituation;
  const regulationSeconds = (supplied?.quarterMinutes ?? (/NBA/.test(event.league) && !/WNBA/.test(event.league) ? 12 : 10)) * 60;
  const durationFor = (quarter: number) => quarter <= 4 ? regulationSeconds : 300;
  const stageQuarter = Number(event.stage?.match(/第\s*(\d+)\s*节/)?.[1] ?? 0) || (/加时/.test(event.stage ?? "") ? 4 + Number(event.stage?.match(/加时\s*(\d+)/)?.[1] ?? 1) : /半场/.test(event.stage ?? "") ? 2 : 0);
  const recordedQuarter = Math.max(1, ...(event.quarterScores ?? []).map((row) => row.quarter), ...(supplied?.events ?? []).map((item) => item.quarter));
  const currentQuarter = event.status === "upcoming" ? 0 : event.status === "finished" ? Math.max(4, supplied?.currentQuarter ?? recordedQuarter) : Math.max(1, supplied?.currentQuarter ?? (stageQuarter || recordedQuarter));
  const currentClock = event.status === "finished" || /半场/.test(event.stage ?? "") ? "00:00" : supplied?.currentClock ?? event.stage?.match(/\d{1,2}:\d{2}/)?.[0] ?? clockLabel(durationFor(currentQuarter));
  const elapsedInCurrent = Math.max(0, Math.min(durationFor(currentQuarter), durationFor(currentQuarter) - basketballClockValue(currentClock)));
  const elapsedBefore = (quarter: number) => Array.from({ length: quarter - 1 }, (_, i) => durationFor(i + 1)).reduce((sum, seconds) => sum + seconds, 0);
  const elapsed = currentQuarter ? elapsedBefore(currentQuarter) + elapsedInCurrent : 0;
  const chartPeriods = Array.from({ length: Math.max(4, currentQuarter) }, (_, i) => i + 1);
  const domain = chartPeriods.reduce((sum, quarter) => sum + durationFor(quarter), 0);
  const fallbackScore = (side: "home" | "away", quarter: number) => {
    const total = safeScore(event[side].score);
    return Math.floor(total * quarter / currentQuarter) - Math.floor(total * (quarter - 1) / currentQuarter);
  };
  const quarterScores = currentQuarter ? Array.from({ length: currentQuarter }, (_, index) => {
    const quarter = index + 1;
    return event.quarterScores?.find((row) => row.quarter === quarter) ?? { quarter, home: fallbackScore("home", quarter), away: fallbackScore("away", quarter) };
  }) : [];

  const generated: BasketballLiveEvent[] = [];
  let homeScore = 0, awayScore = 0;
  for (const row of quarterScores) {
    const quarter = row.quarter;
    const seconds = durationFor(quarter);
    const played = quarter === currentQuarter ? elapsedInCurrent : seconds;
    if (!played) {
      generated.push({ id: `${event.id}-q${quarter}-start`, quarter, quarterLabel: basketballQuarterLabel(quarter), clock: clockLabel(seconds), teamType: "neutral", eventType: quarter === 1 ? "GAME_START" : "QUARTER_START", description: quarter === 1 ? "比赛开始" : `${basketballQuarterLabel(quarter)}开始`, homeScore, awayScore });
      continue;
    }
    const drafts: Array<{ teamType: BasketballLiveEvent["teamType"]; eventType: string; description: string; points: number }> = [];
    const add = (teamType: BasketballLiveEvent["teamType"], eventType: string, description: string, points = 0) => drafts.push({ teamType, eventType, description, points });
    const units = { home: scoringUnits(safeScore(row.home), quarter), away: scoringUnits(safeScore(row.away), quarter + 1) };
    // Irregular possessions produce ties and lead changes without an artificial wave.
    const possessionOrder = ["away", "home", "away", "away", "home", "home", "home", "away"] as const;
    let index = 0;
    while (units.home.length || units.away.length) {
      let side: "home" | "away" = possessionOrder[(index + (quarter - 1) * 3) % possessionOrder.length];
      if (!units[side].length) side = side === "home" ? "away" : "home";
      const points = units[side].shift()!;
      const name = event[side].name;
      add(side, points === 3 ? "THREE_POINT_MADE" : points === 2 ? "TWO_POINT_MADE" : "FREE_THROW_MADE", points === 3 ? `漂亮！${name} 三分远投应声入篮` : `${name} ${points === 2 ? "两分命中" : "罚球命中"}`, points);
      const [type, copy] = ordinaryEvents[index % ordinaryEvents.length];
      const ordinarySide = index % 2 ? side : side === "home" ? "away" : "home";
      add(ordinarySide, type, `${event[ordinarySide].name} ${copy}`);
      index += 1;
    }
    // Keep a rich feed even in a low-scoring/just-started quarter.
    while (drafts.length < 22) {
      const [type, copy] = ordinaryEvents[drafts.length % ordinaryEvents.length];
      const side = drafts.length % 2 ? "home" : "away";
      add(side, type, `${event[side].name} ${copy}`);
    }
    add("neutral", "TIMEOUT", "比赛进入官方暂停");
    const entry = (clock: string, teamType: BasketballLiveEvent["teamType"], eventType: string, description: string) => generated.push({ id: `${event.id}-q${quarter}-${generated.length}`, quarter, quarterLabel: basketballQuarterLabel(quarter), clock, teamType, eventType, description, teamName: teamType === "neutral" ? undefined : event[teamType].name, homeScore, awayScore });
    entry(clockLabel(seconds), "neutral", quarter === 1 ? "GAME_START" : "QUARTER_START", quarter === 1 ? "比赛开始" : `${basketballQuarterLabel(quarter)}开始`);
    drafts.forEach((draft, i) => {
      if (draft.teamType === "home") homeScore += draft.points;
      if (draft.teamType === "away") awayScore += draft.points;
      // Uneven clock spacing, bounded by the current game's actual cutoff.
      const progress = Math.pow((i + 1) / (drafts.length + 1), 1.08);
      const clock = clockLabel(Math.max(seconds - played, seconds - Math.floor(played * progress)));
      entry(clock, draft.teamType, draft.eventType, draft.description);
    });
    const ended = quarter < currentQuarter || event.status === "finished" || currentClock === "00:00";
    entry(clockLabel(seconds - played), "neutral", ended ? quarter === currentQuarter && event.status === "finished" ? "GAME_END" : "QUARTER_END" : "LIVE_UPDATE", ended ? quarter === currentQuarter && event.status === "finished" ? "主裁判一声哨响，全场比赛结束" : `${basketballQuarterLabel(quarter)}结束` : "比赛正在进行");
  }
  const events = event.status === "upcoming" ? [] : (supplied?.events ?? generated).filter((item) => item.quarter <= currentQuarter && item.quarter > 0 && (item.quarter !== currentQuarter || basketballClockValue(item.clock) >= basketballClockValue(currentClock))).sort((a, b) => a.quarter - b.quarter || basketballClockValue(b.clock) - basketballClockValue(a.clock));
  const emptySide = (): BasketballPeriodSide => ({ threePointPoints: 0, twoPointPoints: 0, freeThrowPoints: 0, freeThrowPercentage: 0, fouls: 0, timeoutsRemaining: 0 });
  const stats = new Map<number, BasketballPeriodStatistics>();
  const remainingTimeouts = { home: 7, away: 7 };
  for (let quarter = 1; quarter <= currentQuarter; quarter += 1) {
    const row = { quarter, home: emptySide(), away: emptySide() };
    const misses = { home: 0, away: 0 };
    for (const item of events.filter((entry) => entry.quarter === quarter)) {
      if (item.teamType === "neutral") continue;
      const side = item.teamType;
      if (item.eventType === "THREE_POINT_MADE") row[side].threePointPoints += 3;
      if (item.eventType === "TWO_POINT_MADE") row[side].twoPointPoints += 2;
      if (item.eventType === "FREE_THROW_MADE") row[side].freeThrowPoints += 1;
      if (item.eventType === "FREE_THROW_MISSED") misses[side] += 1;
      if (item.eventType === "FOUL") row[side].fouls += 1;
      if (item.eventType === "TIMEOUT") remainingTimeouts[side] = Math.max(0, remainingTimeouts[side] - 1);
    }
    for (const side of ["home", "away"] as const) {
      const attempts = row[side].freeThrowPoints + misses[side];
      row[side].freeThrowPercentage = attempts ? Math.round(row[side].freeThrowPoints / attempts * 1000) / 10 : 0;
      row[side].timeoutsRemaining = remainingTimeouts[side];
    }
    stats.set(quarter, supplied?.periodStatistics?.find((item) => item.quarter === quarter) ?? row);
  }
  const pointMap = new Map<number, { minute: number; momentum: number }>();
  for (const item of events) {
    const second = elapsedBefore(item.quarter) + durationFor(item.quarter) - basketballClockValue(item.clock);
    pointMap.set(second, { minute: second, momentum: item.homeScore - item.awayScore });
  }
  const points = [...pointMap.values()].sort((a, b) => a.minute - b.minute);
  const maxAbsDiff = Math.max(1, ...events.map((item) => Math.abs(item.homeScore - item.awayScore)));
  return { events, points, maxAbsDiff, stats, quarterScores, currentQuarter, currentClock, chartPeriods, elapsed, domain, durationFor, elapsedBefore };
}
