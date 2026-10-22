// Shared by the host replay list and the unified room.
export function replayDetails(recordId: string, hostName: string) {
  const index = Math.max(0, (Number(recordId.split("-").at(-1)) || 1) - 1);
  const duration = [7716, 6738, 8465][index % 3];
  return {
    index, duration,
    title: [`${hostName}解说｜英超焦点战复盘`, `${hostName}陪你看球｜攻防对决`, `${hostName}赛事精选｜精彩全场回顾`][index % 3],
    eventId: index % 2 ? "basketball-finished-1" : "football-finished-1",
    durationLabel: [Math.floor(duration / 3600), Math.floor(duration / 60) % 60, duration % 60].map(n => String(n).padStart(2, "0")).join(":"),
  };
}
