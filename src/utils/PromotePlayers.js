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

  const weekRosters = rosters.filter(r => r.week === targetWeek);

  // Add gamesBowled + leagueCompleted
  weekRosters.forEach(r => {
    const ws = r.player?.weekScores?.find(ws => ws.week === r.week);
    r.gamesBowled = [ws?.game1, ws?.game2, ws?.game3].filter(g => typeof g === "number").length;
    r.leagueCompleted = completedLeagueNames.includes(r.player?.league);
  });

  // Group by team-week
  const grouped = {};
  weekRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  Object.entries(grouped).forEach(([teamWeek, teamRosters]) => {
    const assignedPlayers = new Set();

    console.log(`\n--- Team ${teamWeek} BEFORE promotions ---`);
    teamRosters.forEach(r => {
      console.log(`${r.player.name} | ${r.position} | games: ${r.gamesBowled}`);
    });

    // Step 1: Fill starters if missing or invalid
    starterPositions.forEach(pos => {
      const starter = teamRosters.find(r => r.position === pos);

      if (!starter || (starter.gamesBowled === 0 && starter.leagueCompleted)) {
        const candidates = flexBenchPositions
          .map(fb => teamRosters.find(r =>
            r.position === fb &&
            !assignedPlayers.has(r.player.name) &&
            (r.leagueCompleted === false || (r.leagueCompleted && r.gamesBowled === 3))
          ))
          .filter(Boolean);

        let candidate = null;
        if (candidates.length > 0) {
          if (pos === "Flex" || !starter) {
            candidate = candidates[0]; // any valid player
          } else {
            // Try to match position, fallback to first
            candidate =
              candidates.find(c => c.player.position === starter.player?.position) ||
              candidates[0];
          }
        }

        if (candidate) {
          console.log(`🔁 Filling ${pos} with ${candidate.player.name} (from ${candidate.position})`);
          if (starter) starter.position = ""; // free old starter
          candidate.position = pos;
          assignedPlayers.add(candidate.player.name);
        } else {
          console.log(`⚠️ No suitable replacement for ${pos}`);
        }
      }
    });

    // Step 2: Re-bench displaced players
    teamRosters.forEach(r => {
      if (!r.position && (r.gamesBowled > 0 || !r.leagueCompleted)) {
        r.position = "TO_BE_BENCHED"; // placeholder for now
      }
    });

    // Step 3: Push missed players to bench bottom
    teamRosters.forEach(r => {
      if (r.gamesBowled === 0 && r.leagueCompleted) {
        r.position = "TO_BE_BENCHED"; // also bench them
      }
    });

    // Step 4: Normalize benches sequentially (no gaps/dupes)
    const benchPlayers = teamRosters
      .filter(r => r.position.startsWith("Flex Bench") || r.position === "TO_BE_BENCHED")
      .sort((a, b) => (a.player.name > b.player.name ? 1 : -1)); // deterministic order

    benchPlayers.forEach((r, idx) => {
      r.position = `Flex Bench ${idx + 1}`;
    });
  });

  // Debug table
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