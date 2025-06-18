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
  const weekTeamMeta = {};

  for (const { week, rosters, scores } of results) {
    const teamScores = {};
    const teamMeta = {};

    const rosterByTeam = rosters.reduce((acc, r) => {
      if (!acc[r.teamId]) acc[r.teamId] = [];
      acc[r.teamId].push(r);
      return acc;
    }, {});

    const matchTeamIds = recentMatches
      .filter(m => m.week === week)
      .flatMap(m => [m.team1Id, m.team2Id]);

    for (const teamId of matchTeamIds) {
      const teamRoster = rosterByTeam[teamId] || [];

      const starters = teamRoster.filter(r =>
        starterOrder.includes(normalize(r.position))
      );

      const teamScore = starters.reduce((acc, r) => {
        const playerScore = scores.find(s => s.playerId === r.playerId);
        return acc + getPoints(playerScore);
      }, 0);

      teamScores[teamId] = teamScore;

      let teamInfo = teamRoster[0]?.team;

      // fallback to match-level metadata if no players exist
      if (!teamInfo) {
        const match = recentMatches.find(
          m => m.week === week && (m.team1Id === teamId || m.team2Id === teamId)
        );
        teamInfo = match?.team1Id === teamId ? match?.team1 : match?.team2;
      }

      if (teamInfo) {
        teamMeta[teamId] = {
          name: teamInfo.name || "Unknown Team",
          wins: teamInfo.wins ?? 0,
          losses: teamInfo.losses ?? 0,
          ties: teamInfo.ties ?? 0,
          avatarUrl: teamInfo.owner?.avatarUrl || null
        };
      } else {
        teamMeta[teamId] = {
          name: "Unknown Team",
          wins: 0,
          losses: 0,
          ties: 0,
          avatarUrl: null
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