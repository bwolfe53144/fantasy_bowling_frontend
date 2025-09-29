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

    console.log(
      `📋 Player: ${r.player?.name || "Unknown"} | TeamId: ${r.teamId} | Week: ${r.week} | Position: ${r.position} | GamesBowled: ${r.gamesBowled} | LeagueCompleted: ${r.leagueCompleted}`
    );
  });

  // Remove players with league completed true and games < 3
  const benchedPlayers = [];
  weekRosters.forEach((r, idx) => {
    if (r.leagueCompleted && r.gamesBowled < 3) {
      benchedPlayers.push(r);
      weekRosters[idx] = null;
    }
  });

  const benchedByTeam = {};
  benchedPlayers.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!benchedByTeam[key]) benchedByTeam[key] = [];
    benchedByTeam[key].push(r);
  });

  Object.entries(benchedByTeam).forEach(([teamKey, players]) => {
    console.log(`📉 Benched players for team ${teamKey}:`);
    players.forEach(r => {
      console.log(`Player: ${r.player.name} | Position: ${r.position} | GamesBowled: ${r.gamesBowled} | LeagueCompleted: ${r.leagueCompleted}`);
    });
  });

  const activeRosters = weekRosters.filter(r => r !== null);

  const grouped = {};
  activeRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  Object.entries(grouped).forEach(([teamKey, teamRosters]) => {
    // Promote starters
    const starters = teamRosters.filter(r => starterPositions.includes(r.position));
    let availablePlayers = teamRosters.filter(r => !starters.includes(r));

    const missingPositions = starterPositions.filter(pos =>
      !starters.some(r => r.position === pos)
    );

    missingPositions.forEach(pos => {
      const eligible = availablePlayers.filter(r =>
        (pos === "Flex" || r.player.position === pos) &&
        (!r.leagueCompleted || r.gamesBowled === 3)
      );

      if (eligible.length > 0) {
        const playerToAssign = eligible[0];
        console.log(`➡️ Assigning ${playerToAssign.player.name} to position ${pos} for team ${teamKey}`);
        playerToAssign.position = pos;
        availablePlayers = availablePlayers.filter(r => r !== playerToAssign);
      } else {
        console.log(`❌ No eligible players to fill position ${pos} for team ${teamKey}`);
      }
    });

    console.log(`✅ Final starters for team ${teamKey}:`);
    teamRosters.filter(r => starterPositions.includes(r.position))
      .forEach(r => console.log(`Player: ${r.player.name} | Position: ${r.position}`));

    // --- FLEX BENCH REASSIGNMENT LOGIC ---
    const allBenchPlayers = [
      ...teamRosters.filter(r => !starterPositions.includes(r.position)),
      ...(benchedByTeam[teamKey] || [])
    ];

    // Log current bench order before reassignment
    console.log(`📝 Bench order BEFORE reassignment for team ${teamKey}:`);
    allBenchPlayers.forEach(r =>
      console.log(`Player: ${r.player.name} | Current Position: ${r.position} | GamesBowled: ${r.gamesBowled} | LeagueCompleted: ${r.leagueCompleted}`)
    );

    // Eligible players: not league completed OR gamesBowled >= 3
    const eligibleBench = allBenchPlayers.filter(r => !r.leagueCompleted || r.gamesBowled >= 3);
    // Ineligible players: league completed AND games < 3
    const ineligibleBench = allBenchPlayers.filter(r => r.leagueCompleted && r.gamesBowled < 3);

    // Shift eligible players forward, preserving order, then place ineligible players
    let flexIdx = 0;
    eligibleBench.forEach(r => {
      r.position = flexBenchPositions[flexIdx++];
    });
    ineligibleBench.forEach(r => {
      r.position = flexBenchPositions[flexIdx++];
    });
  });

  return rosters;
};