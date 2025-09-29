export const promotePlayers = (rosters, targetWeek, completedLeagues) => {
  const starterPositions = ["1", "2", "3", "4", "5", "Flex"];
  const flexBenchPositions = [
    "Flex Bench 1","Flex Bench 2","Flex Bench 3","Flex Bench 4",
    "Flex Bench 5","Flex Bench 6","Flex Bench 7","Flex Bench 8","Flex Bench 9"
  ];

  const completedLeagueNames = (completedLeagues || []).map(c =>
    typeof c === "string" ? c : (c.league || c.name || String(c))
  );

  const weekRosters = rosters.filter(r => r.week === targetWeek);

  // Add gamesBowled + leagueCompleted
  weekRosters.forEach(r => {
    const ws = r.player?.weekScores?.find(ws => ws.week === r.week);
    r.gamesBowled = [ws?.game1, ws?.game2, ws?.game3].filter(g => typeof g === "number").length;
    r.leagueCompleted = completedLeagueNames.includes(r.player?.league);
  });

  // Group by team
  const grouped = {};
  weekRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  Object.values(grouped).forEach(teamRosters => {
    // Step 1: Fill missing starter positions
    starterPositions.forEach(pos => {
      const starter = teamRosters.find(r => r.position === pos);
      if (!starter || (starter.gamesBowled === 0 && starter.leagueCompleted)) {

        let candidate = null;
        let candidateIndex = null;

        // Flex first if not Flex starter
        if (pos !== "Flex") {
          candidate = teamRosters.find(r =>
            r.position === "Flex" &&
            r.player.position === pos &&
            !(r.leagueCompleted && r.gamesBowled === 0)
          );
          if (candidate) candidateIndex = "Flex";
        }

        // Then check Flex Bench
        if (!candidate) {
          for (let fb of flexBenchPositions) {
            const r = teamRosters.find(p =>
              p.position === fb &&
              (pos === "Flex" || p.player.position === pos) &&
              !(p.leagueCompleted && p.gamesBowled === 0)
            );
            if (r) {
              candidate = r;
              candidateIndex = fb;
              break;
            }
          }
        }

        // Promote candidate
        if (candidate) {
          const oldPos = candidate.position;
          candidate.position = pos;
          console.log(`🔁 ${candidate.player.name} promoted from ${oldPos} → ${pos}`);
        } else {
          console.log(`⚠️ No candidate found for starter position ${pos}`);
        }
      }
    });

    // Step 2: Move missed players to TO_BE_BENCHED
    teamRosters.forEach(r => {
      if (r.gamesBowled === 0 && r.leagueCompleted) {
        r.position = "TO_BE_BENCHED";
        console.log(`📉 ${r.player.name} missed all games → TO_BE_BENCHED`);
      }
    });

    // Step 3: Normalize bench sequentially
    teamRosters.forEach(r => {
      if (r.gamesBowled === 0 && r.leagueCompleted) {
        r.position = "TO_BE_BENCHED";
        console.log(`📉 ${r.player.name} missed all games → TO_BE_BENCHED`);
      }
    });
    
    // 2. Collect all bench players (Flex Bench + TO_BE_BENCHED)
    const benchPlayers = teamRosters
      .filter(r => r.position === "TO_BE_BENCHED" || r.position.startsWith("Flex Bench"));
    
    // 3. Split: normal bench vs missed-all
    const normalBench = benchPlayers.filter(r => 
      r.position.startsWith("Flex Bench") && (r.gamesBowled > 0 || !r.leagueCompleted)
    );
    const missedBench = benchPlayers.filter(r =>
      r.gamesBowled === 0 && r.leagueCompleted
    );
    
    // 4. Renumber bench sequentially: normal first, then missed-all at the end
    let benchNum = 1;
    
    // Normal bench stays in order
    normalBench.forEach(r => {
      const oldPos = r.position;
      r.position = `Flex Bench ${benchNum++}`;
      if (oldPos !== r.position) console.log(`🔢 ${r.player.name} renumbered ${oldPos} → ${r.position}`);
    });
    
    // Missed-all players go to the very end
    missedBench.forEach(r => {
      const oldPos = r.position;
      r.position = `Flex Bench ${benchNum++}`;
      if (oldPos !== r.position) console.log(`🔢 ${r.player.name} renumbered ${oldPos} → ${r.position}`);
    });
  });

  return rosters;
};