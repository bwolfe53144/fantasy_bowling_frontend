export const getAverageByOpponent = (
  weekScores,
  sortOption = "averageDesc",
  startWeek = 1,
  endWeek = Infinity
) => {
  const opponentStats = {};

  weekScores
    .filter(({ week }) => {
      const w = parseInt(week, 10);
      return w >= startWeek && w <= endWeek;
    })
    .forEach(({ opponent, game1, game2, game3 }) => {
      const games = [game1, game2, game3].filter(g => g != null);

      if (!opponentStats[opponent]) {
        opponentStats[opponent] = { total: 0, count: 0 };
      }

      games.forEach(g => {
        opponentStats[opponent].total += g;
        opponentStats[opponent].count += 1;
      });
    });

  const averages = Object.entries(opponentStats).map(([opponent, { total, count }]) => ({
    opponent,
    average: count > 0 ? total / count : 0,
  }));

  return averages.sort((a, b) => {
    if (sortOption === "averageDesc") return b.average - a.average;
    if (sortOption === "averageAsc") return a.average - b.average;
    if (sortOption === "nameAsc") return a.opponent.localeCompare(b.opponent);
    if (sortOption === "nameDesc") return b.opponent.localeCompare(a.opponent);
    return 0;
  });
};