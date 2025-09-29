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

  const activeRosters = weekRosters.filter(r => r !== null);

  const grouped = {};
  activeRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  Object.entries(grouped).forEach(([teamKey, teamRosters]) => {
    // --- STARTER PROMOTION LOGIC ---
    const starters = teamRosters.filter(r => starterPositions.includes(r.position));
    let availablePlayers = teamRosters.filter(r => !starters.includes(r));

    // Promote positions 1–5
    ["1", "2", "3", "4", "5"].forEach(pos => {
      // First, look for eligible Flex players (Flex starting position or Flex-eligible)
      const flexEligible = availablePlayers.filter(r =>
        r.player.position === "Flex" &&
        (!r.leagueCompleted || r.gamesBowled >= 3)
      );
      let playerToAssign = flexEligible[0];

      if (!playerToAssign) {
        // No Flex-eligible player, look for eligible players with matching position
        const matching = availablePlayers.filter(r =>
          r.player.position === pos &&
          (!r.leagueCompleted || r.gamesBowled >= 3)
        );
        playerToAssign = matching[0];
      }

      if (playerToAssign) {
        playerToAssign.position = pos;
        availablePlayers = availablePlayers.filter(r => r !== playerToAssign);
        starters.push(playerToAssign);
      }
    });

    // Now fill the Flex starter spot
    if (!starters.some(r => r.position === "Flex")) {
      const flexCandidate = availablePlayers.find(r =>
        (!r.leagueCompleted || r.gamesBowled >= 3)
      );
      if (flexCandidate) {
        flexCandidate.position = "Flex";
        availablePlayers = availablePlayers.filter(r => r !== flexCandidate);
      }
    }

    // --- FLEX BENCH REASSIGNMENT LOGIC ---
    const allBenchPlayers = [
      ...teamRosters.filter(r => !starterPositions.includes(r.position)),
      ...(benchedByTeam[teamKey] || [])
    ];

    const eligibleBench = [];
    const ineligibleBench = [];
    allBenchPlayers.forEach(r => {
      if (!r.leagueCompleted || r.gamesBowled >= 3) {
        eligibleBench.push(r);
      } else {
        ineligibleBench.push(r);
      }
    });

    const reorderedBench = [...eligibleBench, ...ineligibleBench];
    reorderedBench.forEach((r, idx) => {
      if (flexBenchPositions[idx]) {
        r.position = flexBenchPositions[idx];
      }
    });
  });

  return rosters;
};