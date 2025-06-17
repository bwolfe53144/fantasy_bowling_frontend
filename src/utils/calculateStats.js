import { calculateFantasyPoints } from "./FantasyPoints";

export const calculateStats = ({ scores = [], filterZeroGames = false }) => {
  let highGame1 = 0, highGame2 = 0, highGame3 = 0, highSeries = 0;
  let totalPoints = 0, totalGames = 0, bestWeekPoints = 0;
  let totalGame1 = 0, totalGame2 = 0, totalGame3 = 0;
  let countGame1 = 0, countGame2 = 0, countGame3 = 0;

  for (const score of scores) {
    const g1 = score.game1 || 0;
    const g2 = score.game2 || 0;
    const g3 = score.game3 || 0;
    const series = g1 + g2 + g3;

    highGame1 = Math.max(highGame1, g1);
    highGame2 = Math.max(highGame2, g2);
    highGame3 = Math.max(highGame3, g3);
    highSeries = Math.max(highSeries, series);

    const points = calculateFantasyPoints([score]);
    totalPoints += points;
    bestWeekPoints = Math.max(bestWeekPoints, points);

    if (!filterZeroGames || g1 > 0) { totalGame1 += g1; countGame1++; }
    if (!filterZeroGames || g2 > 0) { totalGame2 += g2; countGame2++; }
    if (!filterZeroGames || g3 > 0) { totalGame3 += g3; countGame3++; }

    totalGames +=
      (!filterZeroGames || g1 > 0 ? 1 : 0) +
      (!filterZeroGames || g2 > 0 ? 1 : 0) +
      (!filterZeroGames || g3 > 0 ? 1 : 0);
  }

  const avgGame1 = countGame1 > 0 ? totalGame1 / countGame1 : 0;
  const avgGame2 = countGame2 > 0 ? totalGame2 / countGame2 : 0;
  const avgGame3 = countGame3 > 0 ? totalGame3 / countGame3 : 0;
  const overallAvg = (totalGame1 + totalGame2 + totalGame3) / ((countGame1 + countGame2 + countGame3) || 1);

  return {
    highGame1,
    highGame2,
    highGame3,
    highSeries,
    bestWeekPoints,
    totalFantasyPoints: totalPoints,
    fantasyPointsPerGame: totalGames > 0 ? totalPoints / totalGames : 0,
    gamesBowled: totalGames,
    avgGame1,
    avgGame2,
    avgGame3,
    overallAvg,
  };
};