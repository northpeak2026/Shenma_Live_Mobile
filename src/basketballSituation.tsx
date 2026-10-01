import type { ReactNode } from "react";
import type { EventDetailEvent } from "./eventDetail";
import { BarMetric, useCanvas } from "./footballSituation";
import { momentumSegments } from "./footballSituationData";
import type { basketballSituationFor, BasketballPeriodStatistics } from "./basketballSituationData";
import { Carousel } from "./mobile/Carousel";
import "./basketballSituation.css";

type Situation = ReturnType<typeof basketballSituationFor>;
export function BasketballDifferenceChart({ event, data, renderLogo }: { event: EventDetailEvent; data: Situation; renderLogo: (name: string) => ReactNode }) {
  const ref = useCanvas((context, width, height) => {
    const top = 26, bottom = height - 10, axis = (top + bottom) / 2;
    const x = (seconds: number) => 5 + seconds / data.domain * (width - 10);
    const y = (diff: number) => axis - diff / data.maxAbsDiff * (bottom - top) / 2;
    context.lineWidth = 1;
    context.strokeStyle = "#e5ecf4";
    data.chartPeriods.forEach((quarter) => { context.beginPath(); context.moveTo(x(data.elapsedBefore(quarter)), top); context.lineTo(x(data.elapsedBefore(quarter)), bottom); context.stroke(); });
    context.beginPath(); context.moveTo(width - 5, top); context.lineTo(width - 5, bottom); context.stroke();
    for (const diff of [data.maxAbsDiff, 0, -data.maxAbsDiff]) {
      context.strokeStyle = diff === 0 ? "#c3d2e6" : "#edf1f6";
      context.beginPath(); context.moveTo(5, y(diff)); context.lineTo(width - 5, y(diff)); context.stroke();
    }
    if (!data.points.length) return;
    const segments = momentumSegments(data.points);
    const trace = () => { context.moveTo(x(data.points[0].minute), y(data.points[0].momentum)); segments.forEach((segment) => context.bezierCurveTo(x(segment.control1.minute), y(segment.control1.momentum), x(segment.control2.minute), y(segment.control2.momentum), x(segment.end.minute), y(segment.end.momentum))); };
    for (const side of ["home", "away"] as const) {
      context.save(); context.beginPath(); context.rect(0, side === "home" ? top : axis, width, (bottom - top) / 2); context.clip();
      context.beginPath(); trace(); context.lineTo(x(data.points.at(-1)!.minute), axis); context.lineTo(x(data.points[0].minute), axis); context.closePath();
      context.fillStyle = side === "home" ? "#ef61712b" : "#4998f52b"; context.fill();
      context.beginPath(); trace(); context.strokeStyle = side === "home" ? "#ef6171" : "#4998f5"; context.lineWidth = 1.5; context.stroke(); context.restore();
    }
    if (event.status === "live") {
      context.setLineDash([3, 3]); context.strokeStyle = "#a4b9d4"; context.beginPath(); context.moveTo(x(data.elapsed), top); context.lineTo(x(data.elapsed), bottom); context.stroke();
    }
  });
  return <section className="basketball-difference-chart" aria-label="分差统计" data-max-diff={data.maxAbsDiff} data-elapsed={data.elapsed}>
    <div className="basketball-difference-teams"><span aria-label={`主队：${event.home.name}`}>{renderLogo(event.home.name)}</span><span aria-label={`客队：${event.away.name}`}>{renderLogo(event.away.name)}</span></div>
    <div className="basketball-difference-plot"><canvas ref={ref} role="img" aria-label={`单一分差曲线，主队领先在上，客队领先在下；对称分差范围正负${data.maxAbsDiff}分，已发生${data.points.length}个比分节点`} /><div className="basketball-difference-periods">{data.chartPeriods.map((quarter) => <span key={quarter} style={{ left: `${(data.elapsedBefore(quarter) + data.durationFor(quarter) / 2) / data.domain * 100}%` }}>{quarter <= 4 ? `Q${quarter}` : `OT${quarter - 4}`}</span>)}</div></div>
    <div className="basketball-difference-scale"><span>+{data.maxAbsDiff}</span><span>0</span><span>−{data.maxAbsDiff}</span></div>
  </section>;
}

export function BasketballPeriodScoreTable({ event, data }: { event: EventDetailEvent; data: Situation }) {
  const columns = { gridTemplateColumns: `minmax(88px,1fr) repeat(${data.chartPeriods.length}, minmax(29px,1fr)) minmax(39px,1fr)` };
  const rows = <div className="basketball-period-score-grid" role="table" aria-label="小节比分" style={data.chartPeriods.length > 5 ? { minWidth: 92 + data.chartPeriods.length * 31 + 45 } : undefined}>
    <div role="row" className="basketball-period-score-head" style={columns}><span role="columnheader">球队</span>{data.chartPeriods.map((quarter) => <span role="columnheader" key={quarter} className={event.status === "live" && quarter === data.currentQuarter ? "is-current" : ""}>{quarter <= 4 ? ["一", "二", "三", "四"][quarter - 1] : `OT${quarter - 4}`}</span>)}<span role="columnheader">总分</span></div>
    {(["home", "away"] as const).map((side) => <div role="row" className={`basketball-period-score-row score-${side}`} key={side} style={columns}><strong role="cell" title={event[side].name}>{event[side].name}</strong>{data.chartPeriods.map((quarter) => <span role="cell" key={quarter} className={event.status === "live" && quarter === data.currentQuarter ? "is-current" : ""}>{event.status === "upcoming" ? "-" : data.quarterScores.find((row) => row.quarter === quarter)?.[side] ?? "-"}</span>)}<b role="cell">{event.status === "upcoming" ? "-" : data.quarterScores.reduce((sum, row) => sum + row[side], 0)}</b></div>)}
  </div>;
  // Keep normal and single-OT tables fluid; many OTs scroll inside the table only.
  return <section className={`basketball-period-scores${data.chartPeriods.length > 5 ? " has-many-periods" : ""}`} aria-label="各小节比分">{data.chartPeriods.length > 5 ? <Carousel ariaLabel="小节比分横向查看">{rows}</Carousel> : rows}</section>;
}

export function BasketballPeriodMetrics({ stats }: { stats: BasketballPeriodStatistics }) {
  return <section className="basketball-period-metrics" aria-label={`${stats.quarter <= 4 ? `第${stats.quarter}节` : `加时${stats.quarter - 4}`}本节数据`} data-quarter={stats.quarter}>
    <div className="basketball-side-metrics" aria-label="主队本节统计"><div><span>本节犯规</span><b>{stats.home.fouls}</b></div><div><span>剩余暂停</span><b>{stats.home.timeoutsRemaining}</b></div></div>
    <div className="basketball-core-metrics"><BarMetric label="3分球得分" home={stats.home.threePointPoints} away={stats.away.threePointPoints} /><BarMetric label="2分球得分" home={stats.home.twoPointPoints} away={stats.away.twoPointPoints} /><BarMetric label="罚球得分" home={stats.home.freeThrowPoints} away={stats.away.freeThrowPoints} /><BarMetric label="罚球命中率" home={stats.home.freeThrowPercentage} away={stats.away.freeThrowPercentage} percentage /></div>
    <div className="basketball-side-metrics" aria-label="客队本节统计"><div><span>本节犯规</span><b>{stats.away.fouls}</b></div><div><span>剩余暂停</span><b>{stats.away.timeoutsRemaining}</b></div></div>
  </section>;
}
