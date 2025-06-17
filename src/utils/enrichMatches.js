import { getRostersForWeek, getWeekScoreForWeek } from "./api.js";
import { calculateFantasyPoints } from "./FantasyPoints.js";

export const enrichRecentMatchesWithScores = async (recentMatches) => {
  const weeks = [...new Set(recentMatches.map(m => m.week))];

  const results = await Promise.all(
    weeks.map(async (week) => {
      const [rostersRes, scoresRes] = await Promise.all([
        getRostersForWeek(week),
        getWeekScoreForWeek(week),
      ]);

      return {
        week,
        rosters: rostersRes.data,
        scores: scoresRes.data,
      };
    })
  );

  const normalize = (pos) => pos?.trim().toLowerCase();
  const starterOrder = ["1", "2", "3", "4", "5", "flex"];
  const getPoints = (scores) => calculateFantasyPoints(scores ? [scores] : []);

  const weekTeamScores = {};
  const weekTeamMeta = {}; // 🆕 Store team avatar and name

  for (const { week, rosters, scores } of results) {
    const teamScores = {};
    const teamMeta = {};

    const rosterByTeam = rosters.reduce((acc, r) => {
      if (!acc[r.teamId]) acc[r.teamId] = [];
      acc[r.teamId].push(r);
      return acc;
    }, {});

    for (const [teamId, teamRoster] of Object.entries(rosterByTeam)) {
      const starters = teamRoster.filter(r =>
        starterOrder.includes(normalize(r.position))
      );

      const teamScore = starters.reduce((acc, r) => {
        const playerScore = scores.find(s => s.playerId === r.playerId);
        return acc + getPoints(playerScore);
      }, 0);

      const teamInfo = teamRoster[0]?.team;

      teamScores[teamId] = teamScore;

      if (teamInfo) {
        teamMeta[teamId] = {
          name: teamInfo.name,
          wins: teamInfo.wins,
          losses: teamInfo.losses,
          ties: teamInfo.ties,
          avatarUrl: teamInfo.owner?.avatarUrl || null
        };
      }
    }

    weekTeamScores[week] = teamScores;
    weekTeamMeta[week] = teamMeta;
  }

  return recentMatches.map(match => {
    const { week, team1Id, team2Id } = match;
    const teamScores = weekTeamScores[week] || {};
    const teamMeta = weekTeamMeta[week] || {};

    return {
      ...match,
      team1Score: teamScores[team1Id] ?? 0,
      team2Score: teamScores[team2Id] ?? 0,
      team1Meta: teamMeta[team1Id] || {},
      team2Meta: teamMeta[team2Id] || {}
    };
  });
};