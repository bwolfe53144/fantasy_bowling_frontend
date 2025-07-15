import { getTeamById, updateTeamStats, getCompletedLeagues, 
    getRostersForWeek, getWeekScoreForWeek, getTotalLeagues, 
    getMatchupsForWeek, generatePlayoffs, getCurrentWeek} from "../utils/api.js";
import { calculateFantasyPoints } from "../utils/FantasyPoints.js";
  
  export const useTeamRecords = () => {
    const updateTeamRecord = async (teamId, result, pointsEarned, pointsAgainst) => {
      try {
        const res = await getTeamById(teamId);
        const team = res.data;
  
        let { wins, losses, ties, streak, points, pointsAgainst: existingPointsAgainst } = team;
  
        if (!streak) streak = "";
  
        const [_, prevType, prevCountRaw] = /^([WLT])(\d+)?$/.exec(streak) || [];
        const prevCount = parseInt(prevCountRaw || "0");
  
        const currentType = result[0].toUpperCase();
  
        if (currentType === prevType) {
          streak = `${currentType}${prevCount + 1}`;
        } else {
          streak = `${currentType}1`;
        }
  
        wins += result === "win" ? 1 : 0;
        losses += result === "loss" ? 1 : 0;
        ties += result === "tie" ? 1 : 0;
  
        await updateTeamStats(teamId, {
          wins,
          losses,
          ties,
          points: points + pointsEarned,
          streak,
          pointsAgainst: (existingPointsAgainst || 0) + pointsAgainst,
        });
      } catch (err) {
        console.error(`Failed to update record for team ${teamId}:`, err);
      }
    };
  
    const updateTeamRecordsAfterUpload = async (targetWeek, triggerLeague, season = 2025) => {
      try {
        const fantasyLeagues = [
          "Ren Faire",
          "Beavers Latestarters",
          "Cheris Nite Out",
          "Andys Classic",
        ];
    
        // Bail out early if triggerLeague is NOT in fantasyLeagues
        if (!fantasyLeagues.includes(triggerLeague)) {
          console.log(`League "${triggerLeague}" is not a fantasy league. Skipping update.`);
          return false;
        }
    
        // Otherwise proceed as usual
        const [weekLocksRes, allRostersRes, allScoresRes, totalLeaguesRes] = await Promise.all([
          getCompletedLeagues(targetWeek),
          getRostersForWeek(targetWeek),
          getWeekScoreForWeek(targetWeek),
          getTotalLeagues(),
        ]);
    
        const weekLocks = weekLocksRes.data;
        const allRosters = allRostersRes.data;
        const allScores = allScoresRes.data;
        const { totalLeagues } = totalLeaguesRes.data;
    
        // Filter relevant leagues
        const relevantLeagues = totalLeagues.filter(l => fantasyLeagues.includes(l.league));
    
        // Filter locks for targetWeek and relevant leagues
        const locksForTargetWeek = weekLocks.filter(
          w => w.week === targetWeek && fantasyLeagues.includes(w.league)
        );
    
        // Check if all relevant leagues have completed the week
        const allCompleted =
          locksForTargetWeek.length === relevantLeagues.length &&
          locksForTargetWeek.every(w => w.completed === "yes");
    
        if (!allCompleted) {
          console.log(`Not all leagues completed for week ${targetWeek}. Skipping update.`);
          return false;
        }
    
        // Get current week info
        const response = await getCurrentWeek();
        const { totalWeeks, completedWeeks } = response.data;
        const remainingWeeks = totalWeeks - completedWeeks;
    
        // Update team records if 3 or more weeks remain
        if (remainingWeeks >= 3) {
          const teamScores = {};
          const validPositions = ["1", "2", "3", "4", "5", "Flex"];
    
          allRosters
            .filter(r => Number(r.week) === Number(targetWeek) && validPositions.includes(r.position))
            .forEach(r => {
              if (!teamScores[r.teamId]) teamScores[r.teamId] = { score: 0 };
    
              const playerWeekScores = allScores.filter(s => s.playerId === r.playerId && s.week === targetWeek);
              const fantasyPoints = calculateFantasyPoints(playerWeekScores);
              teamScores[r.teamId].score += fantasyPoints;
            });
    
          const matchups = await getMatchupsForWeek(targetWeek);
    
          for (const matchup of matchups.data) {
            const { team1Id, team2Id } = matchup;
            const teamAScore = teamScores[team1Id]?.score ?? 0;
            const teamBScore = teamScores[team2Id]?.score ?? 0;
    
            let resultA = "tie", resultB = "tie";
            if (teamAScore > teamBScore) [resultA, resultB] = ["win", "loss"];
            else if (teamAScore < teamBScore) [resultA, resultB] = ["loss", "win"];
    
            await updateTeamRecord(team1Id, resultA, teamAScore, teamBScore);
            await updateTeamRecord(team2Id, resultB, teamBScore, teamAScore);
          }
        }
    
        // Generate playoffs if 3 or fewer weeks remain
        if (remainingWeeks <= 3) {
          await generatePlayoffs({
            remainingWeeks,
            week: targetWeek,
            season,
          });
          console.log("✅ Playoff round generated.");
        }
    
        return true;
      } catch (err) {
        console.error("Error updating team records:", err);
        return false;
      }
    };
  
    return { updateTeamRecord, updateTeamRecordsAfterUpload };
  };