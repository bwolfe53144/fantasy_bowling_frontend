import { calculateFantasyPoints } from "./FantasyPoints.js";
import { buildFallbackRoster } from "./buildFallbackRoster.js";
import { saveFallbackRoster } from "./saveFallbackRoster.js";
import { getRoster, getTeamByName } from "./api.js";

// Starter positions order
const starterOrder = ["1", "2", "3", "4", "5", "flex"];

// Normalize position string helper
export const normalize = (pos) => pos?.trim().toLowerCase();

// Map starters to a dictionary of pos -> player
export const mapStarters = (roster) => {
  const map = {};
  roster.forEach(entry => {
    const player = entry.player || entry;
    const pos = normalize(entry.position || player.position);
    if (starterOrder.includes(pos)) {
      map[pos] = player;
    }
  });
  return map;
};

// Calculate fantasy points for a player for a given week
export const getPoints = (player, week) => {
  if (!player || !player.weekScores) return 0;
  const scores = player.weekScores.filter(ws => ws.week === week);
  return calculateFantasyPoints(scores);
};

// Fetch team roster with fallback if roster is empty
export const fetchTeamRoster = async (teamId, teamName, week) => {
  try {
    const rosterRes = await getRoster(teamId, week);
    let roster = rosterRes.data;

    if (Array.isArray(roster) && roster.length > 0) return roster;

    const teamRes = await getTeamByName(teamName);
    const teamData = teamRes.data;
    if (teamData?.players?.length > 0) {
      const fallbackRoster = buildFallbackRoster(teamData.players);
      await saveFallbackRoster(teamId, week, fallbackRoster);

      const retryRes = await getRoster(teamId, week);
      roster = retryRes.data;

      if (Array.isArray(roster) && roster.length > 0) return roster;

      console.error(`Fallback roster still empty for team ${teamId}`);
      return [];
    } else {
      console.error(`Team ${teamName} has no players to build fallback roster.`);
      return [];
    }
  } catch (err) {
    console.error(`Error fetching roster for team ${teamId}:`, err.message);
    return [];
  }
};

// Export the starterOrder if you want to reuse in other files
export { starterOrder };