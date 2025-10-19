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

    // Sort by rank/eligibility order
    function normalizePosition(pos) {
      return pos ? pos.trim().replace(/\b\w/g, c => c.toUpperCase()) : pos;
    }

    const getRankIndex = pos => {
      const idx = rankPositions.indexOf(pos);
      return idx === -1 ? rankPositions.length + 100 : idx;
    };
    
    let ordered = teamRosters
      .map(r => ({ ...r, position: normalizePosition(r.position) }))
      .sort((a, b) => {
        if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
        return getRankIndex(a.position) - getRankIndex(b.position);
      });

    console.log(ordered);

    const finalRoster = [];
    for (let i=1; i <= 5; i++) {
        const index = ordered.findIndex(element => element.player.position === String(i));
      const firstMatch = ordered[index];
      finalRoster.push(firstMatch);
      ordered.splice(index, 1);
  }
    //Add the flex players
    finalRoster.push(...ordered);
    console.log(finalRoster);

    finalRoster.forEach((r, i) => {
      const idx = rosters.findIndex(orig => orig.player?.id === r.player?.id);
      const oldPos = rosters[idx].position;
      const newPos = rankPositions[i];
      if (oldPos !== newPos) {
        console.log(`➡️ ${r.player?.name} moved from ${oldPos} → ${newPos}`);
        rosters[idx].position = newPos;
      }
    });
  });

  return rosters;
};

/*

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

    // --- Step 2: Promote eligible Flex/Flex Bench players upward in their chain ---
    const finalRoster = [];
    const flexChainPositions = rankPositions.slice(5); // Flex + Flex Benches
    const eligibleFlex = ordered.filter(r => r.isEligible && flexChainPositions.includes(r.position));
    const ineligibleFlex = ordered.filter(r => !r.isEligible && flexChainPositions.includes(r.position));

    // Keep starter positions as is (already handled in Step 1)
    finalRoster.push(...ordered.slice(0, 5));

    // Fill Flex chain positions in order, same-position only, eligible first
    flexChainPositions.forEach(pos => {
      const idx = eligibleFlex.findIndex(r => true); // pick next eligible flex player
      if (idx !== -1) {
        finalRoster.push(eligibleFlex.splice(idx, 1)[0]);
      } else if (ineligibleFlex.length) {
        finalRoster.push(ineligibleFlex.shift());
      } else {
        finalRoster.push({ position: pos, player: { name: "Vacant" }, isEligible: false });
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
};*/


