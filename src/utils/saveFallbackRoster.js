import { postRoster } from "./api.js";

export const saveFallbackRoster = async (teamId, week, fallbackRoster) => {
  if (!Array.isArray(fallbackRoster) || fallbackRoster.length === 0) {
    console.error(`Fallback roster is empty for team ID: ${teamId}`);
    return;
  }
  try {
    await postRoster(teamId, week, fallbackRoster);
  } catch (error) {
    console.error(`Failed to save fallback roster for team ${teamId}, week ${week}:`, error.message);
    throw error;
  }
};