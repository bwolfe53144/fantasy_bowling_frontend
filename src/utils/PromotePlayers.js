export const promotePlayers = (rosters, targetWeek, completedLeagues) => {
  const rankPositions = [
    "1","2","3","4","5","Flex",
    "Flex Bench 1","Flex Bench 2","Flex Bench 3","Flex Bench 4",
    "Flex Bench 5","Flex Bench 6","Flex Bench 7","Flex Bench 8","Flex Bench 9"
  ];

  const completedLeagueNames = (completedLeagues || []).map(c =>
    typeof c === "string" ? c : (c.league || c.name || String(c))
  );

  // Filter rosters for the target week
  const weekRosters = rosters.filter(r => r.week === targetWeek);

  // Annotate eligibility
  weekRosters.forEach(r => {
    const ws = r.player?.weekScores?.find(ws => ws.week === r.week);
    const gamesBowled = [ws?.game1, ws?.game2, ws?.game3].filter(g => typeof g === "number").length;
    const leagueCompleted = completedLeagueNames.includes(r.player?.league);

    r.gamesBowled = gamesBowled;
    r.leagueCompleted = leagueCompleted;
    r.isEligible = !(leagueCompleted && gamesBowled < 3);
  });

  // Group by team
  const grouped = {};
  weekRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  // Process each team
  Object.entries(grouped).forEach(([teamKey, teamRosters]) => {
    let hadChanges = false;

    // Sort by rank order
    let ordered = teamRosters.sort(
      (a, b) => rankPositions.indexOf(a.position) - rankPositions.indexOf(b.position)
    );

    // Positions 1–5: promote eligible replacements if starter is ineligible
    for (let i = 0; i < 5; i++) {
      const starter = ordered[i];
      const targetPos = rankPositions[i]; // "1"-"5"
      if (!starter) continue;

      if (!starter.isEligible) {
        // Look for eligible replacement *after* this starter
        const replacementIndex = ordered.findIndex(
          (r, idx) =>
            idx > i &&
            r.isEligible &&
            r.player?.position === starter.player?.position
        );

        if (replacementIndex !== -1) {
          const replacement = ordered[replacementIndex];
          [ordered[i], ordered[replacementIndex]] = [replacement, starter];
          hadChanges = true;
          console.log(`🔁 ${starter.player?.name} swapped with ${replacement.player?.name} for slot ${targetPos}`);
        } else {
          console.log(`ℹ️ ${starter.player?.name} stays in ${targetPos} (no eligible replacement)`);
        }
      }
    }

    // After positions 1–5, move all eligible players up to fill gaps
    const eligible = ordered.filter(r => r.isEligible);
    const ineligible = ordered.filter(r => !r.isEligible);
    const combined = [...eligible, ...ineligible];

    // Assign final positions according to rankPositions
    combined.forEach((r, i) => {
      const newPos = rankPositions[i] || `Extra ${i}`;
      if (r.position !== newPos) {
        console.log(`➡️ ${r.player?.name} moved from ${r.position} → ${newPos}`);
        r.position = newPos;
        hadChanges = true;
      }
    });

    // Log final team roster
    if (hadChanges) {
      console.log(`\n===== Team ${teamKey} (Week ${targetWeek}) =====`);
      combined.forEach(r => {
        console.log(
          `${r.position.padEnd(12)} | ${r.player?.name || "Unknown"} | ${r.isEligible ? "✅ Eligible" : "❌ Ineligible"}`
        );
      });
    }
  });

  return rosters;
};



