import type { EventDetailEvent } from "./eventDetail";

export type MomentumPoint = { minute: number; momentum: number };
export type MomentumSegment = { start: MomentumPoint; end: MomentumPoint; control1: MomentumPoint; control2: MomentumPoint };
export type MomentumEventSource = { id: string; minute: string; type: string; teamType: "home" | "away" | "neutral"; description: string; homeScore: number; awayScore: number };
export type MomentumEvent = { id: string; minute: number; addedTime: number; minuteLabel: string; eventType: string; teamType: "home" | "away" | "neutral"; description: string; homeScore: number; awayScore: number };
export type MatchStatistics = {
  homeShots: number; awayShots: number;
  homeShotsOnTarget: number; awayShotsOnTarget: number;
  homePossession: number; awayPossession: number;
  homeAttacks: number; awayAttacks: number;
  homeDangerousAttacks: number; awayDangerousAttacks: number;
  homeCorners: number; awayCorners: number;
  homeRedCards: number; awayRedCards: number;
  homeYellowCards: number; awayYellowCards: number;
};
export type FootballSituationData = {
  currentMinute?: number;
  matchDuration?: 90 | 120;
  matchMomentum?: MomentumPoint[];
  matchStatistics?: MatchStatistics;
};

export function footballMinute(value: string) {
  const parts = value.match(/(\d+)(?:['′]?\s*\+\s*(\d+))?/);
  return parts ? Number(parts[1]) + Number(parts[2] ?? 0) : 0;
}

export function momentumEventsFor(events: MomentumEventSource[]): MomentumEvent[] {
  return events.map((item) => {
    const parts = item.minute.match(/(\d+)(?:['′]?\s*\+\s*(\d+))?/);
    return { id: item.id, minute: Number(parts?.[1] ?? 0), addedTime: Number(parts?.[2] ?? 0), minuteLabel: item.minute, eventType: item.type, teamType: item.teamType, description: item.description, homeScore: item.homeScore, awayScore: item.awayScore };
  });
}

export function comparisonRatio(home: number, away: number) {
  const safeHome = Math.max(0, Number.isFinite(home) ? home : 0);
  const safeAway = Math.max(0, Number.isFinite(away) ? away : 0);
  const total = safeHome + safeAway;
  return {
    side: safeHome > safeAway ? "home" as const : safeAway > safeHome ? "away" as const : "neutral" as const,
    ratio: total ? Math.max(safeHome, safeAway) / total : 0,
  };
}

// Monotone Bezier interpolation keeps one signed curve and avoids overshooting peaks.
export function momentumSegments(points: MomentumPoint[]): MomentumSegment[] {
  if (points.length < 2) return [];
  const gaps = points.slice(1).map((point, i) => point.minute - points[i].minute);
  const slopes = gaps.map((gap, i) => (points[i + 1].momentum - points[i].momentum) / gap);
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === points.length - 1) return slopes.at(-1)!;
    if (slopes[i - 1] * slopes[i] <= 0) return 0;
    const w1 = 2 * gaps[i] + gaps[i - 1];
    const w2 = gaps[i] + 2 * gaps[i - 1];
    return (w1 + w2) / (w1 / slopes[i - 1] + w2 / slopes[i]);
  });
  return gaps.map((gap, i) => {
    const start = points[i];
    const end = points[i + 1];
    const clamp = (value: number) => Math.max(Math.min(start.momentum, end.momentum), Math.min(Math.max(start.momentum, end.momentum), value));
    return { start, end, control1: { minute: start.minute + gap / 3, momentum: clamp(start.momentum + tangents[i] * gap / 3) }, control2: { minute: end.minute - gap / 3, momentum: clamp(end.momentum - tangents[i + 1] * gap / 3) } };
  });
}

export function placeMomentumMarkers(events: MomentumEvent[], width: number, domain: number) {
  const inset = 11;
  return (["home", "away"] as const).flatMap((side) => {
    const row = events.filter((event) => event.teamType === side).sort((a, b) => (a.minute + a.addedTime) - (b.minute + b.addedTime));
    const exactPositions = row.map((event) => inset + (event.minute + event.addedTime) / domain * (width - inset * 2));
    const positions = [...exactPositions];
    // Only near-overlapping icons move slightly along X; all retain the same Y band.
    for (let i = 1; i < positions.length; i += 1) positions[i] = Math.max(positions[i], positions[i - 1] + 11);
    if (positions.length) {
      positions[positions.length - 1] = Math.min(width - 6, positions.at(-1)!);
      for (let i = positions.length - 2; i >= 0; i -= 1) positions[i] = Math.min(positions[i], positions[i + 1] - 11);
    }
    return row.map((item, i) => ({ item, x: positions[i], timeX: exactPositions[i] }));
  });
}

export function footballSituationFor(event: EventDetailEvent, actualEndMinute = 90) {
  const supplied = event.detail?.footballSituation;
  const stage = event.stage ?? "";
  const baseMinute = Number(stage.match(/\d+/)?.[0] ?? 0);
  const hasExtraTime = supplied?.matchDuration === 120 || /加时/.test(stage) || baseMinute > 90;
  const duration = hasExtraTime ? 120 : 90;
  const elapsed = event.status === "upcoming" ? 0 : supplied?.currentMinute ?? (event.status === "finished" ? Math.max(duration, actualEndMinute) : /中场/.test(stage) ? 45 : footballMinute(stage));
  const rawStatistics = event.detail?.statistics;
  const value = (key: string, side: "home" | "away") => rawStatistics?.[key]?.[side] ?? 0;
  const matchStatistics: MatchStatistics | undefined = event.status === "upcoming" ? undefined : supplied?.matchStatistics ?? (rawStatistics ? {
    homeShots: value("shotsOnTarget", "home") + value("shotsOffTarget", "home"),
    awayShots: value("shotsOnTarget", "away") + value("shotsOffTarget", "away"),
    homeShotsOnTarget: value("shotsOnTarget", "home"), awayShotsOnTarget: value("shotsOnTarget", "away"),
    homePossession: value("possession", "home"), awayPossession: value("possession", "away"),
    homeAttacks: value("attacks", "home"), awayAttacks: value("attacks", "away"),
    homeDangerousAttacks: value("dangerousAttacks", "home"), awayDangerousAttacks: value("dangerousAttacks", "away"),
    homeCorners: value("corners", "home"), awayCorners: value("corners", "away"),
    homeRedCards: value("redCards", "home"), awayRedCards: value("redCards", "away"),
    homeYellowCards: value("yellowCards", "home"), awayYellowCards: value("yellowCards", "away"),
  } : undefined);
  // One signed sample per minute: a single team's advantage, or neutral at zero.
  const matchMomentum: MomentumPoint[] = event.status === "upcoming" ? [] : supplied?.matchMomentum
    ? Array.from(new Map(supplied.matchMomentum.filter((point) => Number.isFinite(point.minute) && Number.isFinite(point.momentum) && point.minute >= 0 && point.minute <= elapsed).map((point) => [point.minute, { minute: point.minute, momentum: Math.max(-5, Math.min(5, point.momentum)) }])).values()).sort((a, b) => a.minute - b.minute)
    : Array.from({ length: Math.max(0, Math.floor(elapsed)) + 1 }, (_, minute) => ({
      minute,
      momentum: minute === 0 ? 0 : Math.max(-5, Math.min(5, 3.1 * Math.sin(minute * .19) + 1.25 * Math.sin(minute * .43) + .65 * Math.sin(minute * .07))),
    }));
  return { elapsed, duration, matchMomentum, matchStatistics };
}
