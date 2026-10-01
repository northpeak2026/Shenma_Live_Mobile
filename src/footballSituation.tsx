import { useEffect, useRef, useState, type ReactNode } from "react";
import type { EventDetailEvent } from "./eventDetail";
import { comparisonRatio, footballMinute, footballSituationFor, momentumEventsFor, momentumSegments, placeMomentumMarkers, type MatchStatistics, type MomentumEventSource } from "./footballSituationData";
import "./footballSituation.css";

type ChartEvent = MomentumEventSource;
const colours = { home: "#ef6171", away: "#4998f5", neutral: "#a8b4c5", track: "#e3e9f1" };

export function useCanvas(draw: (context: CanvasRenderingContext2D, width: number, height: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const paint = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.scale(scale, scale);
      draw(context, width, height);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);
  return ref;
}

function MomentumChart({ event, events, renderIcon, renderTeamLogo }: { event: EventDetailEvent; events: ChartEvent[]; renderIcon: (type: string) => ReactNode; renderTeamLogo: (name: string) => ReactNode }) {
  const data = footballSituationFor(event, Math.max(90, ...events.map((item) => footballMinute(item.minute))));
  const eligibleTypes = new Set(["goal", "corner", "yellow", "red", "secondYellow", "substitution", "penalty", "penaltyMiss", "var", "ownGoal"]);
  const markers = momentumEventsFor(events).filter((item) => item.teamType !== "neutral" && eligibleTypes.has(item.eventType) && item.minute + item.addedTime <= data.elapsed);
  // Reserve a little domain for injury time without adding new 15-minute ticks.
  const domain = Math.max(data.duration, data.elapsed, ...markers.map((item) => item.minute + item.addedTime));
  const ticks = Array.from({ length: data.duration / 15 + 1 }, (_, index) => index * 15);
  const plot = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);
  useEffect(() => {
    const element = plot.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const canvas = useCanvas((context, w, h) => {
    const inset = 11;
    const x = (minute: number) => inset + minute / domain * (w - inset * 2);
    const chartTop = 25;
    const axis = chartTop + (h - chartTop) / 2;
    const y = (momentum: number) => axis - momentum * 8;
    context.strokeStyle = "#e6edf5";
    context.lineWidth = 1;
    ticks.forEach((minute) => { context.beginPath(); context.moveTo(x(minute), chartTop); context.lineTo(x(minute), h); context.stroke(); });
    context.strokeStyle = "#cbd7e5";
    context.beginPath(); context.moveTo(inset, axis); context.lineTo(w - inset, axis); context.stroke();
    const points = data.matchMomentum;
    const segments = momentumSegments(points);
    const traceCurve = () => {
      context.moveTo(x(points[0].minute), y(points[0].momentum));
      segments.forEach(({ control1, control2, end }) => context.bezierCurveTo(x(control1.minute), y(control1.momentum), x(control2.minute), y(control2.momentum), x(end.minute), y(end.momentum)));
    };
    // Clip the SAME path above/below the axis: never two independent series.
    (["home", "away"] as const).forEach((side) => {
      context.save();
      context.beginPath();
      context.rect(0, side === "home" ? chartTop : axis, w, side === "home" ? axis - chartTop : h - axis);
      context.clip();
      context.beginPath(); traceCurve();
      context.lineTo(x(points.at(-1)!.minute), axis); context.lineTo(x(points[0].minute), axis); context.closePath();
      context.fillStyle = side === "home" ? "#ef61712b" : "#4998f52b";
      context.fill();
      context.beginPath(); traceCurve();
      context.strokeStyle = colours[side]; context.lineWidth = 1.5; context.stroke();
      context.restore();
    });
    if (data.elapsed < domain) {
      context.strokeStyle = "#b2c2d6";
      context.setLineDash([3, 3]);
      context.beginPath(); context.moveTo(x(data.elapsed), chartTop); context.lineTo(x(data.elapsed), h); context.stroke();
    }
  });
  const positioned = placeMomentumMarkers(markers, width, domain);
  const plotHeight = 166;
  return <div className="football-momentum">
    <div className="football-momentum-teams" style={{ height: plotHeight }}>
      <span aria-label={`主队：${event.home.name}`} title={`主队：${event.home.name}`}>{renderTeamLogo(event.home.name)}</span>
      <span aria-label={`客队：${event.away.name}`} title={`客队：${event.away.name}`}>{renderTeamLogo(event.away.name)}</span>
    </div>
    <div ref={plot} className="football-momentum-plot" style={{ height: plotHeight }} data-elapsed={data.elapsed} data-domain={domain}>
      <canvas ref={canvas} role="img" aria-label={`单一进攻趋势：正值代表${event.home.name}，负值代表${event.away.name}，已展示至${data.elapsed}分钟`} />
      <div className="football-momentum-axis">{ticks.map((minute) => <span key={minute} style={{ left: `${11 + minute / domain * (width - 22)}px` }}>{minute === 45 ? "HT" : `${minute}′`}</span>)}</div>
      {positioned.map(({ item, x, timeX }) => <span className={`football-momentum-marker momentum-${item.teamType}`} key={item.id} style={{ left: x, top: item.teamType === "home" ? 29 : plotHeight - 16 }} title={`${item.minuteLabel} ${item.description}`} aria-label={`${item.teamType === "home" ? "主队" : "客队"} ${item.minuteLabel} ${item.description}`} data-minute={item.minute + item.addedTime} data-time-x={timeX}>{renderIcon(item.eventType)}</span>)}
    </div>
  </div>;
}

function RingMetric({ label, home, away, percentage = false }: { label: string; home: number; away: number; percentage?: boolean }) {
  const { side, ratio } = comparisonRatio(home, away);
  const canvas = useCanvas((context, w, h) => {
    const r = Math.min(w, h) / 2 - 3;
    context.lineWidth = 4;
    context.strokeStyle = colours.track;
    context.beginPath(); context.arc(w / 2, h / 2, r, 0, Math.PI * 2); context.stroke();
    if (ratio) {
      context.strokeStyle = colours[side];
      context.lineCap = "round";
      context.beginPath();
      context.arc(w / 2, h / 2, r, -Math.PI / 2, -Math.PI / 2 + (side === "away" ? 1 : -1) * ratio * Math.PI * 2, side !== "away");
      context.stroke();
    }
  });
  const format = (value: number) => `${value}${percentage ? "%" : ""}`;
  return <div className="football-ring-metric" data-side={side} data-ratio={ratio} aria-label={`${label} 主队${format(home)} 客队${format(away)}`}><b>{format(home)}</b><div><canvas ref={canvas} aria-hidden="true" /><span>{label}</span></div><b>{format(away)}</b></div>;
}

export function BarMetric({ label, home, away, percentage = false }: { label: string; home: number; away: number; percentage?: boolean }) {
  const { side, ratio } = comparisonRatio(home, away);
  return <div className="football-bar-metric"><header><b>{home}{percentage ? "%" : ""}</b><span>{label}</span><b>{away}{percentage ? "%" : ""}</b></header><div className="football-metric-track"><i className={`metric-fill-${side}`} style={{ width: `${ratio * 100}%` }} /></div></div>;
}

function KeyStatistics({ stats, renderIcon }: { stats: MatchStatistics; renderIcon: (type: string) => ReactNode }) {
  const counts = [{ type: "corner", label: "角球", home: stats.homeCorners, away: stats.awayCorners }, { type: "red", label: "红牌", home: stats.homeRedCards, away: stats.awayRedCards }, { type: "yellow", label: "黄牌", home: stats.homeYellowCards, away: stats.awayYellowCards }];
  return <div className="football-key-statistics">
    <div className="football-ring-metrics"><RingMetric label="射门" home={stats.homeShots} away={stats.awayShots} /><RingMetric label="射正" home={stats.homeShotsOnTarget} away={stats.awayShotsOnTarget} /><RingMetric label="控球" home={stats.homePossession} away={stats.awayPossession} percentage /></div>
    <div className="football-secondary-metrics">
      <div className="football-count-side" aria-label="主队辅助指标">{counts.map(({ type, label, home }) => <div key={type} aria-label={`主队${label}${home}`} title={`主队${label}`}>{renderIcon(type)}<b>{home}</b></div>)}</div>
      <div className="football-bar-metrics"><BarMetric label="进攻" home={stats.homeAttacks} away={stats.awayAttacks} /><BarMetric label="危险进攻" home={stats.homeDangerousAttacks} away={stats.awayDangerousAttacks} /></div>
      <div className="football-count-side" aria-label="客队辅助指标">{[...counts].reverse().map(({ type, label, away }) => <div key={type} aria-label={`客队${label}${away}`} title={`客队${label}`}>{renderIcon(type)}<b>{away}</b></div>)}</div>
    </div>
  </div>;
}

export function FootballSituationOverview({ event, events, renderIcon, renderEmpty, renderTeamLogo }: { event: EventDetailEvent; events: ChartEvent[]; renderIcon: (type: string) => ReactNode; renderEmpty: (text: string) => ReactNode; renderTeamLogo: (name: string) => ReactNode }) {
  const data = footballSituationFor(event);
  return <div className="football-situation-overview">
    <section aria-label="进攻趋势">{data.matchMomentum.length ? <MomentumChart event={event} events={events} renderIcon={renderIcon} renderTeamLogo={renderTeamLogo} /> : renderEmpty(event.status === "upcoming" ? "比赛尚未开始，暂无进攻趋势数据" : "暂无进攻趋势数据")}</section>
    <section aria-label="关键指标">{data.matchStatistics ? <KeyStatistics stats={data.matchStatistics} renderIcon={renderIcon} /> : renderEmpty("暂无关键指标统计")}</section>
  </div>;
}
