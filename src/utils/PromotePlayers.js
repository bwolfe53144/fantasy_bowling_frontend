export const promotePlayers = (rosters, targetWeek, completedLeagues) => {
  const numberedPositions = ["1", "2", "3", "4", "5"];
  const starterPositions = [...numberedPositions, "Flex"];
  const flexBenchPositions = [
    "Flex Bench 1","Flex Bench 2","Flex Bench 3","Flex Bench 4",
    "Flex Bench 5","Flex Bench 6","Flex Bench 7","Flex Bench 8","Flex Bench 9"
  ];

  // Normalize completedLeagues into an array of league names (strings)
  const completedLeagueNames = (completedLeagues || []).map(c =>
    typeof c === "string" ? c : (c.league || c.name || String(c))
  );

  console.log("promotePlayers called for week", targetWeek, "completedLeagues:", completedLeagueNames);

  // Work with the rosters for the requested week
  const weekRosters = rosters.filter(r => r.week === targetWeek);

  // Add gamesBowled and whether player's league is completed
  weekRosters.forEach(r => {
    const ws = r.player?.weekScores?.find(ws => ws.week === r.week);
    r.gamesBowled = [ws?.game1, ws?.game2, ws?.game3].filter(g => typeof g === "number").length;
    r.leagueCompleted = completedLeagueNames.includes(r.player?.league);
  });

  console.log(`\n=== Player / League Completed Snapshot for week ${targetWeek} ===`);
  weekRosters.forEach(r => {
    console.log(
      `${r.player?.name ?? "UNKNOWN"} | League: ${r.player?.league ?? "??"} | leagueCompleted: ${r.leagueCompleted} | Position: ${r.position} | GamesBowled: ${r.gamesBowled}`
    );
  });

  // Group by team-week for promotion logic
  const grouped = {};
  weekRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  Object.entries(grouped).forEach(([teamWeek, teamRosters]) => {
    const assignedPlayers = new Set();

    console.log(`\n--- Team ${teamWeek} Roster BEFORE promotions ---`);
    teamRosters.forEach(r => {
      console.log(`${r.player.name} | ${r.position} | games: ${r.gamesBowled}`);
    });

    // Step 1: Promote any starters that need replacement (gamesBowled === 0 && leagueCompleted === true)
    starterPositions.forEach(pos => {
      const starter = teamRosters.find(r => r.position === pos);
      if (!starter || (starter.gamesBowled === 0 && starter.leagueCompleted === true)) {
    
        // FIX: select candidates in flex/flex bench order
        const candidates = flexBenchPositions
          .map(fb => teamRosters.find(r =>
            r.position === fb &&
            !assignedPlayers.has(r.player.name) &&
            (r.leagueCompleted === false || (r.leagueCompleted === true && r.gamesBowled === 3)) &&
            (pos === "Flex" ? true : r.player.position === starter?.player?.position)
          ))
          .filter(Boolean); // remove nulls
    
        if (candidates.length > 0) {
          const candidate = candidates[0]; // first eligible in bench order
          console.log(`🔁 Replacing ${starter?.player.name || 'empty'} at ${pos} with ${candidate.player.name} from ${candidate.position}`);
          if (starter) starter.position = "";
          candidate.position = pos;
          assignedPlayers.add(candidate.player.name);
        } else {
          console.log(`⚠️ No suitable replacement for position ${pos} on teamWeek ${teamWeek}`);
        }
      }
    });

    // Step 2: Re-bench displaced non-zero game players
    const usedPositions = new Set(teamRosters.map(r => r.position));
    let flexBenchCounter = 1;
    teamRosters.forEach(r => {
      if (!r.position && (r.gamesBowled > 0 || r.leagueCompleted === false)) {
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

    // Step 3: Push zero-game & completed players to bottom benches
    let nextBench = 9;
    teamRosters.forEach(r => {
      if (r.gamesBowled === 0 && r.leagueCompleted === true) {
        while (nextBench > 0) {
          const benchName = `Flex Bench ${nextBench}`;
          const occupied = teamRosters.find(p => p.position === benchName);
          if (!occupied) {
            r.position = benchName;
            console.log(`📉 Player missed all games → ${r.player.name} moved to ${benchName}`);
            nextBench--;
            break;
          }
          nextBench--;
        }
        if (!r.position) console.warn(`⚠️ No available bottom bench for ${r.player.name}`);
      }
    });
  });

  // Debug table at the end
  const sorted = [...weekRosters].sort((a, b) => a.week - b.week);
  console.table(
    sorted.map(r => {
      const ws = r.player.weekScores?.find(ws => ws.week === r.week);
      return {
        week: r.week,
        teamId: r.teamId,
        name: r.player.name,
        league: r.player.league,
        position: r.position,
        average: ws?.average ?? "N/A",
        gamesBowled: r.gamesBowled,
        leagueCompleted: r.leagueCompleted
      };
    })
  );

  return rosters;
};