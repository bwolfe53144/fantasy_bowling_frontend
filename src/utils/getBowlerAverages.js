export const getBowlerAverages = (players, startWeek = 1, endWeek = Infinity) => {
  return players
    .map(player => {
      const scores = (player.weekScores || []).filter(s => {
        const week = parseInt(s.week, 10);
        return week >= startWeek && week <= endWeek;
      });

      // Sum all valid games
      const total = scores.reduce((sum, s) => {
        const games = [s.game1, s.game2, s.game3].filter(g => g != null);
        return sum + games.reduce((a, b) => a + b, 0);
      }, 0);

      // Count total games played
      const count = scores.reduce((sum, s) => {
        return sum + [s.game1, s.game2, s.game3].filter(g => g != null).length;
      }, 0);

      const avgNum = count > 0 ? total / count : 0;

      return {
        name: player.name,
        averageNum: avgNum,
        average: avgNum.toFixed(2),
      };
    })
    .sort((a, b) => b.averageNum - a.averageNum); // Sort by avg desc
};