import { calculateFantasyPoints } from "./FantasyPoints.js";

export const processPlayerStats = (player) => {
  const weekScores = player.weekScores ?? [];

  const totalPins = weekScores.reduce((sum, score) => {
    return sum + (score.game1 || 0) + (score.game2 || 0) + (score.game3 || 0);
  }, 0);

  const totalGames = weekScores.reduce((sum, score) => {
    let gamesPlayed = 0;
    if (score.game1 != null) gamesPlayed += 1;
    if (score.game2 != null) gamesPlayed += 1;
    if (score.game3 != null) gamesPlayed += 1;
    return sum + gamesPlayed;
  }, 0);

  const totalPoints = calculateFantasyPoints(weekScores);

  return {
    id: player.id,
    name: player.name ?? `${player.firstname} ${player.lastname}`,
    team: player.team?.name ?? "Free Agent",
    teamId: player.team?.id || null,
    league: player.league,
    position: player.position,

    // Current season stats
    games: totalGames,
    totalPins,
    average: totalGames > 0 ? totalPins / totalGames : 0,
    totalPoints,
    avgFanppg: totalGames > 0 ? totalPoints / totalGames : 0,

    // Stored LY stats
    lyAverage: player.lyAverage ?? null,
    lyGames: player.lyGames ?? null,
    lyPoints: player.lyPoints ?? null,
    lyFppg: player.lyGames ? player.lyPoints / player.lyGames : 0,
  };
};