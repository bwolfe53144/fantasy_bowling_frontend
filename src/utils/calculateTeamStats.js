import { calculateFantasyPoints } from "./FantasyPoints";

export function calculateTeamStats(weekScores) {
  // Provide defaults so rendering is always safe
  const defaultStats = {
    highGame1: 0,
    highGame2: 0,
    highGame3: 0,
    highSeries: 0,
    bestWeekPoints: 0,
    totalFantasyPoints: 0,
    fantasyPointsPerGame: 0,
    gamesBowled: 0,
    avgGame1: 0,
    avgGame2: 0,
    avgGame3: 0,
    overallAvg: 0,
  };

  if (!weekScores || weekScores.length === 0) return defaultStats;

  const weekMap = {};

  for (const ws of weekScores) {
    const week = ws.week;
    if (!weekMap[week]) {
      weekMap[week] = {
        game1: 0,
        game2: 0,
        game3: 0,
        fantasyPoints: 0,
        gameCount: 0,
      };
    }
    weekMap[week].game1 += ws.game1 || 0;
    weekMap[week].game2 += ws.game2 || 0;
    weekMap[week].game3 += ws.game3 || 0;
    weekMap[week].fantasyPoints += calculateFantasyPoints([ws]);
    weekMap[week].gameCount += 3;
  }

  const weeks = Object.values(weekMap);
  if (weeks.length === 0) return defaultStats;

  const highGame1 = Math.max(...weeks.map(w => w.game1));
  const highGame2 = Math.max(...weeks.map(w => w.game2));
  const highGame3 = Math.max(...weeks.map(w => w.game3));
  const highSeries = Math.max(...weeks.map(w => w.game1 + w.game2 + w.game3));
  const bestWeekPoints = Math.max(...weeks.map(w => w.fantasyPoints));

  const totalFantasyPoints = weeks.reduce((sum, w) => sum + w.fantasyPoints, 0);
  const totalGames = weeks.reduce((sum, w) => sum + w.gameCount, 0);
  const totalGame1 = weeks.reduce((sum, w) => sum + w.game1, 0);
  const totalGame2 = weeks.reduce((sum, w) => sum + w.game2, 0);
  const totalGame3 = weeks.reduce((sum, w) => sum + w.game3, 0);

  const avgGame1 = totalGames ? (totalGame1 * 3) / totalGames : 0;
  const avgGame2 = totalGames ? (totalGame2 * 3) / totalGames : 0;
  const avgGame3 = totalGames ? (totalGame3 * 3) / totalGames : 0;
  const overallAvg = totalGames ? (totalGame1 + totalGame2 + totalGame3) / totalGames : 0;
  const fantasyPointsPerGame = totalGames ? totalFantasyPoints / totalGames : 0;

  return {
    highGame1,
    highGame2,
    highGame3,
    highSeries,
    bestWeekPoints,
    totalFantasyPoints,
    fantasyPointsPerGame,
    gamesBowled: totalGames,
    avgGame1,
    avgGame2,
    avgGame3,
    overallAvg,
  };
}