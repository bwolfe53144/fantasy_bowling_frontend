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

    const finalRoster = [];
    for (let i = 1; i <= 5; i++) {
      const index = ordered.findIndex(element => element.player.position === String(i));
    
      if (index !== -1) {
        const firstMatch = ordered[index];
        finalRoster.push(firstMatch);
        ordered.splice(index, 1);
      } else {
        finalRoster.push({
          position: String(i),
          player: { name: "Vacant" },
          isEligible: false,
          isEmpty: true
        });
      }
    }
    //Add the flex players
    finalRoster.push(...ordered);
    console.log(finalRoster);

    finalRoster.forEach((r, i) => {
      const idx = rosters.findIndex(orig => orig.player?.id === r.player?.id);
      if (idx === -1) return;
      const oldPos = rosters[idx].position;
      const newPos = rankPositions[i];
      if (oldPos !== newPos) {
        console.log(`➡️ ${r.player?.name} moved from ${oldPos} → ${newPos}`);
        rosters[idx].position = newPos;
        hadChanges = true;
      }
    });

    if (hadChanges) {
      console.log(`\n===== Team ${teamKey} (Week ${targetWeek}) =====`);
      finalRoster.forEach(r => {
        console.log(
          `${r.position.padEnd(12)} | ${r.player?.name || "Vacant"} | ${
            r.isEligible ? "✅ Eligible" : "❌ Ineligible"
          }`
        );
      });
    }
  });

  return rosters;
};


