export const promotePlayers = (rosters, targetWeek, completedLeagues) => {
  const rankPositions = [
    "1","2","3","4","5","Flex",
    "Flex Bench 1","Flex Bench 2","Flex Bench 3","Flex Bench 4",
    "Flex Bench 5","Flex Bench 6","Flex Bench 7","Flex Bench 8","Flex Bench 9"
  ];

  const completedLeagueNames = (completedLeagues || []).map(c =>
    typeof c === "string" ? c : (c.league || c.name || String(c))
  );

  const weekRosters = rosters.filter(r => r.week === targetWeek);

  // --- Annotate eligibility ---
  weekRosters.forEach(r => {
    const ws = r.player?.weekScores?.find(ws => ws.week === r.week);
    const gamesBowled = [ws?.game1, ws?.game2, ws?.game3].filter(g => typeof g === "number").length;
    const leagueCompleted = completedLeagueNames.includes(r.player?.league);

    r.gamesBowled = gamesBowled;
    r.leagueCompleted = leagueCompleted;
    r.isEligible = !(leagueCompleted && gamesBowled < 3);
  });

  // --- Group by team ---
  const grouped = {};
  weekRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  // --- Process each team ---
  Object.entries(grouped).forEach(([teamKey, teamRosters]) => {
    let hadChanges = false;

    // Sort by rank order
    let ordered = teamRosters.sort(
      (a, b) => rankPositions.indexOf(a.position) - rankPositions.indexOf(b.position)
    );

    // --- Step 1: Handle starters 1–5 ---
    for (let i = 0; i < 5; i++) {
      const starter = ordered[i];
      if (!starter) continue;

      if (!starter.isEligible) {
        // Look down the chain (Flex → Flex Benches) for same-position eligible replacement
        const replacementIndex = ordered.findIndex(
          (r, idx) => idx > i && r.isEligible && r.player?.position === starter.player?.position
        );

        if (replacementIndex !== -1) {
          const replacement = ordered[replacementIndex];
          [ordered[i], ordered[replacementIndex]] = [replacement, starter];
          hadChanges = true;
          console.log(`🔁 ${starter.player?.name} swapped with ${replacement.player?.name} for slot ${rankPositions[i]}`);
        } else {
          console.log(`ℹ️ ${starter.player?.name} stays in ${rankPositions[i]} (no eligible replacement)`);
        }
      }
    }

    // --- Step 2: Promote all remaining eligible players up the Flex chain ---
    const finalRoster = [];
    const eligibleQueue = ordered.filter(r => r.isEligible);
    const ineligibleQueue = ordered.filter(r => !r.isEligible);

    rankPositions.forEach(pos => {
      // First try to find an eligible player whose current position matches or is below
      const nextEligibleIndex = eligibleQueue.findIndex(r => rankPositions.indexOf(r.position) >= rankPositions.indexOf(pos));
      if (nextEligibleIndex !== -1) {
        finalRoster.push(eligibleQueue.splice(nextEligibleIndex, 1)[0]);
      } else {
        // No eligible player available, use ineligible if any
        if (ineligibleQueue.length) finalRoster.push(ineligibleQueue.shift());
      }
    });

    // --- Step 3: Assign final positions ---
    finalRoster.forEach((r, i) => {
      const newPos = rankPositions[i] || `Extra ${i}`;
      if (r.position !== newPos) {
        console.log(`➡️ ${r.player?.name} moved from ${r.position} → ${newPos}`);
        r.position = newPos;
        hadChanges = true;
      }
    });

    if (hadChanges) {
      console.log(`\n===== Team ${teamKey} (Week ${targetWeek}) =====`);
      finalRoster.forEach(r => {
        console.log(
          `${r.position.padEnd(12)} | ${r.player?.name || "Unknown"} | ${r.isEligible ? "✅ Eligible" : "❌ Ineligible"}`
        );
      });
    }
  });

  return rosters;
};



