import test from 'node:test';
import assert from 'node:assert/strict';
import { basketballSituationFor, basketballClockValue, basketballScoringEventTypes } from '../src/basketballSituationData.ts';
import { comparisonRatio } from '../src/footballSituationData.ts';

function fixture(status = 'finished', stage, quarters = [[23,26],[27,19],[22,29],[21,19]]) {
  return { id: 'basketball-test', sport: 'basketball', league: 'NBA', status, stage,
    home: { name: '湖人', score: quarters.reduce((n,q)=>n+q[0],0) }, away: { name: '勇士', score: quarters.reduce((n,q)=>n+q[1],0) },
    quarterScores: quarters.map(([home,away],i)=>({quarter:i+1,home,away})) };
}

test('quarter totals, scoring deltas, statistics and signed curve share one dataset', () => {
  const data = basketballSituationFor(fixture());
  assert.deepEqual([data.events.at(-1).homeScore,data.events.at(-1).awayScore],[93,93]);
  let previous = {homeScore:0,awayScore:0};
  for (const event of data.events) {
    const homeDelta = event.homeScore-previous.homeScore, awayDelta = event.awayScore-previous.awayScore;
    const expected = {THREE_POINT_MADE:3,TWO_POINT_MADE:2,FREE_THROW_MADE:1}[event.eventType] ?? 0;
    assert.equal(homeDelta+awayDelta,expected);
    if (expected) assert.equal(event.teamType === 'home' ? homeDelta : awayDelta,expected);
    previous=event;
  }
  for (const quarter of data.quarterScores) {
    assert.ok(data.events.filter(e=>e.quarter===quarter.quarter).length>20);
    const stats = data.stats.get(quarter.quarter);
    for (const side of ['home','away']) assert.equal(stats[side].threePointPoints+stats[side].twoPointPoints+stats[side].freeThrowPoints,quarter[side]);
  }
  assert.ok(data.points.some(p=>p.momentum>0));
  assert.ok(data.points.some(p=>p.momentum<0));
  assert.ok(data.points.some(p=>p.minute>0 && p.momentum===0));
  assert.equal(data.maxAbsDiff,Math.max(...data.events.map(e=>Math.abs(e.homeScore-e.awayScore))));
  assert.notDeepEqual(data.stats.get(1),data.stats.get(4));
});

for (const [quarter,clock] of [[1,'08:32'],[2,'04:16'],[4,'00:04'],[5,'02:30'],[6,'01:00']]) {
  test(`live Q${quarter} only includes already happened events`, () => {
    const quarters = [[23,26],[27,19],[22,29],[21,19],[7,5],[4,6]].slice(0,quarter);
    const data = basketballSituationFor(fixture('live',quarter<=4?`第${quarter}节 ${clock}`:`加时${quarter-4} ${clock}`,quarters));
    assert.equal(data.currentQuarter,quarter);
    assert.equal(data.chartPeriods.length,Math.max(4,quarter));
    assert.ok(data.points.every(p=>p.minute<=data.elapsed));
    assert.ok(data.events.filter(e=>e.quarter===quarter).every(e=>basketballClockValue(e.clock)>=basketballClockValue(clock)));
    assert.equal(data.events.at(-1).clock,clock);
    assert.ok(data.events.every(e=>e.quarter<=quarter));
    assert.equal(data.stats.size,quarter);
  });
}

test('upcoming has no fictional events, curve or statistics',()=>{
  const data=basketballSituationFor(fixture('upcoming'));
  assert.equal(data.events.length,0); assert.equal(data.points.length,0); assert.equal(data.stats.size,0); assert.equal(data.quarterScores.length,0);
});
test('current stage wins over preallocated future quarter rows',()=>{
  const data=basketballSituationFor(fixture('live','第2节 04:16'));
  assert.equal(data.currentQuarter,2); assert.equal(data.quarterScores.length,2);
  assert.ok(data.events.every(e=>e.quarter<=2));
});
test('zero scores are finite and safe; halftime ends second quarter',()=>{
  const zero=basketballSituationFor(fixture('finished',undefined,[[0,0],[0,0],[0,0],[0,0]]));
  assert.ok(Number.isFinite(zero.maxAbsDiff)); assert.ok(zero.points.every(p=>p.momentum===0));
  const half=basketballSituationFor(fixture('live','半场',[[23,26],[27,19]]));
  assert.equal(half.currentQuarter,2); assert.equal(half.currentClock,'00:00'); assert.equal(half.elapsed,1440);
});
test('non-scoring events never change score',()=>{
  const events=basketballSituationFor(fixture()).events;
  assert.ok(events.some(e=>e.eventType==='FOUL'));
  assert.ok(events.some(e=>e.eventType==='TIMEOUT'));
  for(let i=1;i<events.length;i++) if(!basketballScoringEventTypes.has(events[i].eventType)) assert.deepEqual([events[i].homeScore,events[i].awayScore],[events[i-1].homeScore,events[i-1].awayScore]);
});
test('shared progress comparison supports home/away/tie/zero/percentage',()=>{
  assert.deepEqual(comparisonRatio(27,33),{side:'away',ratio:33/60});
  assert.deepEqual(comparisonRatio(38,42),{side:'away',ratio:42/80});
  assert.deepEqual(comparisonRatio(25,18),{side:'home',ratio:25/43});
  assert.deepEqual(comparisonRatio(86.2,85.7),{side:'home',ratio:86.2/(86.2+85.7)});
  assert.deepEqual(comparisonRatio(5,5),{side:'neutral',ratio:.5});
  assert.deepEqual(comparisonRatio(0,0),{side:'neutral',ratio:0});
});
