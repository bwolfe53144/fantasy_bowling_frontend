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

  // annotate gamesBowled and leagueCompleted
  weekRosters.forEach(r => {
    const ws = r.player?.weekScores?.find(ws => ws.week === r.week);
    r.gamesBowled = [ws?.game1, ws?.game2, ws?.game3].filter(g => typeof g === "number").length;
    r.leagueCompleted = completedLeagueNames.includes(r.player?.league);
  });

  // group by team
  const grouped = {};
  weekRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  Object.entries(grouped).forEach(([teamKey, teamRosters]) => {
    let eligible = teamRosters.filter(r => !r.leagueCompleted || r.gamesBowled >= 3);
    let ineligible = teamRosters.filter(r => r.leagueCompleted && r.gamesBowled < 3);

    const benchOrder = [
      "Flex","Flex Bench 1","Flex Bench 2","Flex Bench 3","Flex Bench 4",
      "Flex Bench 5","Flex Bench 6","Flex Bench 7","Flex Bench 8","Flex Bench 9"
    ];
    const sortByBench = arr => arr.sort((a,b) => benchOrder.indexOf(a.position) - benchOrder.indexOf(b.position));
    eligible = sortByBench(eligible);
    ineligible = sortByBench(ineligible);

    // record current starters so we know who is already assigned
    const currentStarters = {};
    rankPositions.slice(0,5).forEach(pos => {
      const starter = teamRosters.find(r => r.position === pos);
      if (starter && eligible.includes(starter)) currentStarters[pos] = starter;
    });

    // assign positions top-down
    rankPositions.forEach(pos => {
      let player;
      let oldPosition;

      if (["1","2","3","4","5"].includes(pos)) {
        if (currentStarters[pos]) {
          player = currentStarters[pos];
          eligible = eligible.filter(r => r !== player);
        } else {
          const idxFlex = eligible.findIndex(r => r.position === "Flex" && r.player.position === pos);
          if (idxFlex !== -1) player = eligible.splice(idxFlex,1)[0];
          else {
            const idxEligible = eligible.findIndex(r => r.player.position === pos);
            if (idxEligible !== -1) player = eligible.splice(idxEligible,1)[0];
            else {
              const idxFlexIneligible = ineligible.findIndex(r => r.position === "Flex" && r.player.position === pos);
              if (idxFlexIneligible !== -1) player = ineligible.splice(idxFlexIneligible,1)[0];
              else {
                const idxIneligible = ineligible.findIndex(r => r.player.position === pos);
                if (idxIneligible !== -1) player = ineligible.splice(idxIneligible,1)[0];
              }
            }
          }
        }
      } else {
        player = eligible.shift() || ineligible.shift();
      }

      if (player) {
        oldPosition = player.position;
        player.position = pos;
        if (oldPosition !== pos) {
          console.log(`Team ${teamKey}: ${player.player.name} moved from ${oldPosition} → ${pos}`);
        }
      }
    });

    // Move remaining ineligible players in 1–5 or Flex to first available Flex Bench slot
    const benchSlots = rankPositions.slice(6); // Flex Bench 1–9
    let benchIndex = 0;
    teamRosters.forEach(r => {
      if ((r.gamesBowled < 3 || r.leagueCompleted) && ["1","2","3","4","5","Flex"].includes(r.position)) {
        while (benchIndex < benchSlots.length && teamRosters.some(p => p.position === benchSlots[benchIndex])) {
          benchIndex++;
        }
        if (benchIndex < benchSlots.length) {
          const oldPos = r.position;
          r.position = benchSlots[benchIndex];
          console.log(`Team ${teamKey}: ${r.player.name} moved from ${oldPos} → ${benchSlots[benchIndex]}`);
          benchIndex++;
        }
      }
    });
  });

  return rosters;
};
