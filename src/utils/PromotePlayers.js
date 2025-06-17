import { calculateFantasyPoints } from "./FantasyPoints.js";

   export const promotePlayers = (rosters, allLockStatuses) => {
        const numberedPositions = ["1", "2", "3", "4", "5"];
        const starterPositions = [...numberedPositions, "Flex"];
        const flexBenchPositions = [
          "Flex Bench 1", "Flex Bench 2", "Flex Bench 3", "Flex Bench 4",
          "Flex Bench 5", "Flex Bench 6", "Flex Bench 7", "Flex Bench 8", "Flex Bench 9"
        ];
      
        const lockStatuses = {};
        allLockStatuses.forEach(({ league, week, lockTime }) => {
          if (!league || typeof week !== "number") return;
          if (!lockStatuses[league]) lockStatuses[league] = {};
          lockStatuses[league][week] = new Date(lockTime);
        });
      
        const isLocked = (league, week) => {
          const lockTime = lockStatuses[league]?.[week];
          const now = new Date();
          return lockTime && now <= lockTime;
        };
      
        // Add fantasyPoints, lock status, and gamesBowled
        rosters.forEach(r => {
          const ws = r.player.weekScores?.find(ws => ws.week === r.week);
          r.fantasyPoints = ws?.points ?? 0;
          r.gamesBowled = [ws?.game1, ws?.game2, ws?.game3].filter(g => typeof g === "number").length;
          r.isLocked = isLocked(r.player.league, r.week);
        });
      
        const grouped = {};
        rosters.forEach(r => {
          const key = `${r.teamId}-${r.week}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(r);
        });
      
        Object.entries(grouped).forEach(([teamWeek, teamRosters]) => {
          const assignedPlayers = new Set();
      
          // Step 1: Move Flex to 1–5 if eligible and needed
          const flexStarter = teamRosters.find(r => r.position === "Flex");
          if (flexStarter && flexStarter.gamesBowled === 3) {
            for (const pos of numberedPositions) {
              const starter = teamRosters.find(r => r.position === pos);
              const needsReplacement = !starter || starter.gamesBowled < 3;
              const positionMatches = starter
                ? flexStarter.player.position === starter.player.position
                : true;
      
              if (needsReplacement && positionMatches) {
                console.log(`⬆️ Promoting Flex ${flexStarter.player.name} → position ${pos}`);
                if (starter) starter.position = "";
                flexStarter.position = pos;
                break;
              }
            }
          }
      
          // Step 2: Promote Flex Bench players to any positions with missing or <3 games bowled
          starterPositions.forEach(pos => {
            const starter = teamRosters.find(r => r.position === pos);
            const needsReplacement = !starter || starter.gamesBowled < 3;
            if (!needsReplacement) return;
      
            let candidates = teamRosters.filter(r =>
              flexBenchPositions.includes(r.position) &&
              (
                pos === "Flex"
                  ? true
                  : r.player.position === starter?.player?.position
              ) &&
              (
                (!r.isLocked) || (r.isLocked && r.fantasyPoints > 0 && r.gamesBowled === 3)
              ) &&
              !assignedPlayers.has(r.player.name)
            );
      
            candidates.sort((a, b) => b.fantasyPoints - a.fantasyPoints);
      
            if (candidates.length > 0) {
              const candidate = candidates[0];
              console.log(`🔁 Replacing ${starter?.player.name || 'empty'} at ${pos} with ${candidate.player.name} from ${candidate.position}`);
              if (starter) starter.position = "";
              candidate.position = pos;
              assignedPlayers.add(candidate.player.name);
            } else {
              console.log(`⚠️ No suitable replacement for position ${pos} on teamWeek ${teamWeek}`);
            }
          });
      
          // Step 3: Re-bench any displaced players
          const usedPositions = new Set(teamRosters.map(r => r.position));
          let flexBenchCounter = 1;
          teamRosters.forEach(r => {
            if (!r.position) {
              let newBench;
              do {
                newBench = `Flex Bench ${flexBenchCounter++}`;
              } while (usedPositions.has(newBench) && flexBenchCounter <= 9);
      
              if (flexBenchCounter <= 10) {
                r.position = newBench;
                usedPositions.add(newBench);
                console.log(`📥 Re-benching ${r.player.name} → ${newBench}`);
              } else {
                console.warn(`⚠️ Too many players, no bench spot for ${r.player.name}`);
              }
            }
          });
          starterPositions.forEach(pos => {
            const starter = teamRosters.find(r => r.position === pos);
            const needsReplacement = !starter || starter.gamesBowled < 3;
            if (!needsReplacement) return;
    
            const fallbackCandidates = teamRosters.filter(r =>
              flexBenchPositions.includes(r.position) &&
              (
                pos === "Flex"
                  ? true
                  : starter
                    ? r.player.position === starter.player.position
                    : true
              ) &&
              !assignedPlayers.has(r.player.name)
            );
    
            if (fallbackCandidates.length > 0) {
              fallbackCandidates.sort((a, b) => b.gamesBowled - a.gamesBowled || b.fantasyPoints - a.fantasyPoints);
              const candidate = fallbackCandidates[0];
              if (candidate && candidate.gamesBowled > 0) {
                console.log(`🔄 Fallback promotion: ${candidate.player.name} with ${candidate.gamesBowled} games → ${pos}`);
                if (starter) starter.position = "";
                candidate.position = pos;
                assignedPlayers.add(candidate.player.name);
              }
            }
          });
        });
        
        const sorted = [...rosters].sort((a, b) => a.week - b.week);
        console.table(
          sorted.map(r => {
            const weekScore = r.player.weekScores?.find(ws => ws.week === r.week);
            return {
              week: r.week,
              teamId: r.teamId,
              name: r.player.name,
              position: r.position,
              average: weekScore?.average ?? "N/A",
              isLocked: r.isLocked,
              fantasyPoints: calculateFantasyPoints(
                r.player.weekScores?.filter(ws => ws.week === r.week) ?? []
              )
            };
          })
        );
      
        return rosters;
      };