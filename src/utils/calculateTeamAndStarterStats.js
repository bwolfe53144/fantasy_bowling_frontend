import { calculateFantasyPoints } from "./FantasyPoints";
import { getRoster } from "./api";

export const calculateTeamAndStarterStats = async (players, teamId, startWeek, endWeek) => {
  const weekMap = {};        // All players
  const starterWeekMap = {}; // Starters only

  // Step 1: Aggregate all player stats by week
  for (const player of players) {
    for (const ws of player.weekScores || []) {
      const { week, game1 = 0, game2 = 0, game3 = 0 } = ws;
      const parsedWeek = parseInt(week);
      if (parsedWeek < startWeek || parsedWeek > endWeek) continue;

      if (!weekMap[parsedWeek]) {
        weekMap[parsedWeek] = { game1: 0, game2: 0, game3: 0, fantasyPoints: 0, gameCount: 0 };
      }

      const points = calculateFantasyPoints([ws]);
      const gamesPlayed = [game1, game2, game3].filter(g => g > 0).length;

      weekMap[parsedWeek].game1 += game1;
      weekMap[parsedWeek].game2 += game2;
      weekMap[parsedWeek].game3 += game3;
      weekMap[parsedWeek].fantasyPoints += points;
      weekMap[parsedWeek].gameCount += gamesPlayed;
    }
  }

  const allWeeks = Object.keys(weekMap);
  if (allWeeks.length === 0) {
    return {
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
  }

  // Step 2: Get rostered starters for each week
  const starterMap = {};
  for (const week of allWeeks) {
    try {
      const res = await getRoster(teamId, week);
      const rosterData = res.data;
      if (Array.isArray(rosterData)) {
        const starters = rosterData.filter(p =>
          ["1", "2", "3", "4", "5", "Flex", "flex"].includes(p.position)
        );
        starterMap[week] = starters.map(s => s.playerId || s.id);
      } else {
        console.warn(`Roster data for week ${week} is not an array`);
      }
    } catch (err) {
      console.error(`Error fetching roster for week ${week}:`, err);
    }
  }

  // Step 3: Aggregate starter-only stats
  for (const player of players) {
    const pid = player.id;
    for (const ws of player.weekScores || []) {
      const { week, game1 = 0, game2 = 0, game3 = 0 } = ws;
      const parsedWeek = parseInt(week);
      if (parsedWeek < startWeek || parsedWeek > endWeek) continue;
      if (!starterMap[parsedWeek]?.includes(pid)) continue;

      if (!starterWeekMap[parsedWeek]) {
        starterWeekMap[parsedWeek] = { game1: 0, game2: 0, game3: 0, fantasyPoints: 0 };
      }

      const points = calculateFantasyPoints([ws]);

      starterWeekMap[parsedWeek].game1 += game1;
      starterWeekMap[parsedWeek].game2 += game2;
      starterWeekMap[parsedWeek].game3 += game3;
      starterWeekMap[parsedWeek].fantasyPoints += points;
    }
  }

  const starterWeeks = Object.values(starterWeekMap);
  const allWeeksData = Object.values(weekMap);

  // === STATS from starters only ===
  const highGame1 = Math.max(0, ...starterWeeks.map(w => w.game1));
  const highGame2 = Math.max(0, ...starterWeeks.map(w => w.game2));
  const highGame3 = Math.max(0, ...starterWeeks.map(w => w.game3));
  const highSeries = Math.max(0, ...starterWeeks.map(w => w.game1 + w.game2 + w.game3));
  const bestWeekPoints = Math.max(0, ...starterWeeks.map(w => w.fantasyPoints));

  // === STATS from full team ===
  const totalFantasyPoints = allWeeksData.reduce((sum, w) => sum + w.fantasyPoints, 0);
  const totalGames = allWeeksData.reduce((sum, w) => sum + w.gameCount, 0);
  const totalGame1 = allWeeksData.reduce((sum, w) => sum + w.game1, 0);
  const totalGame2 = allWeeksData.reduce((sum, w) => sum + w.game2, 0);
  const totalGame3 = allWeeksData.reduce((sum, w) => sum + w.game3, 0);

  const avgGame1 = totalGames ? totalGame1 / (totalGames / 3) : 0;
  const avgGame2 = totalGames ? totalGame2 / (totalGames / 3) : 0;
  const avgGame3 = totalGames ? totalGame3 / (totalGames / 3) : 0;
  const overallAvg = totalGames ? (totalGame1 + totalGame2 + totalGame3) / totalGames : 0;

  return {
    highGame1,
    highGame2,
    highGame3,
    highSeries,
    bestWeekPoints,
    totalFantasyPoints,
    fantasyPointsPerGame: totalGames ? totalFantasyPoints / totalGames : 0,
    gamesBowled: totalGames,
    avgGame1,
    avgGame2,
    avgGame3,
    overallAvg,
  };
};