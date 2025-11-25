import { calculateFantasyPoints } from "./FantasyPoints";

export const calculateStats = ({ scores = [], filterZeroGames = false }) => {
  let highGame1 = 0, highGame2 = 0, highGame3 = 0, highSeries = 0;
  let totalPoints = 0, totalGames = 0, bestWeekPoints = 0;
  let totalGame1 = 0, totalGame2 = 0, totalGame3 = 0;
  let countGame1 = 0, countGame2 = 0, countGame3 = 0;

  for (const score of scores) {
    const g1 = score.game1; // keep null if missed
    const g2 = score.game2;
    const g3 = score.game3;

    // Calculate series sum treating null as 0
    const series = [g1, g2, g3].reduce((sum, g) => sum + (g ?? 0), 0);

    // High game calculations only if game exists
    if (g1 != null) highGame1 = Math.max(highGame1, g1);
    if (g2 != null) highGame2 = Math.max(highGame2, g2);
    if (g3 != null) highGame3 = Math.max(highGame3, g3);
    highSeries = Math.max(highSeries, series);

    // Fantasy points calculation
    const points = calculateFantasyPoints([score]);
    totalPoints += points;
    bestWeekPoints = Math.max(bestWeekPoints, points);

    // Sum games and counts, ignoring nulls
    if (g1 != null) {totalGame1 += g1;countGame1++;}   
    if (g2 != null) { totalGame2 += g2 ?? 0; countGame2++; }
    if (g3 != null) { totalGame3 += g3 ?? 0; countGame3++; }

    totalGames +=
      (g1 != null ? 1 : 0) +
      (g2 != null ? 1 : 0) +
      (g3 != null ? 1 : 0);
  }

  const avgGame1 = countGame1 > 0 ? totalGame1 / countGame1 : 0;
  const avgGame2 = countGame2 > 0 ? totalGame2 / countGame2 : 0;
  const avgGame3 = countGame3 > 0 ? totalGame3 / countGame3 : 0;
  const overallAvg =
    (totalGame1 + totalGame2 + totalGame3) /
    ((countGame1 + countGame2 + countGame3) || 1);

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
