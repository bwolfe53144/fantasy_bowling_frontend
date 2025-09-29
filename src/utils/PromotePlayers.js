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
    // Separate eligible vs ineligible
    let eligible = teamRosters.filter(r => !r.leagueCompleted || r.gamesBowled >= 3);
    let ineligible = teamRosters.filter(r => r.leagueCompleted && r.gamesBowled < 3);

    const benchOrder = [
      "Flex","Flex Bench 1","Flex Bench 2","Flex Bench 3","Flex Bench 4",
      "Flex Bench 5","Flex Bench 6","Flex Bench 7","Flex Bench 8","Flex Bench 9"
    ];
    const sortByBench = arr => arr.sort((a,b) => benchOrder.indexOf(a.position) - benchOrder.indexOf(b.position));
    eligible = sortByBench(eligible);
    ineligible = sortByBench(ineligible);

    const changes = [];

    rankPositions.forEach(pos => {
      // check if an eligible player is already in this position
      let current = teamRosters.find(r => r.position === pos && eligible.includes(r));
      if (current) return; // do not move anyone

      let player;

      if (["1","2","3","4","5"].includes(pos)) {
        // Starters: pick eligible Flex first, then any eligible matching player.position
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
      } else {
        // Flex / Bench: pick next eligible, fallback to ineligible
        player = eligible.shift() || ineligible.shift();
      }

      if (player) {
        const oldPos = player.position;
        player.position = pos;
        if (oldPos !== pos) {
          changes.push({ name: player.player.name, from: oldPos, to: pos });
        }
      }
    });

    // log only players that changed positions
    if (changes.length) {
      changes.forEach(c =>
        console.log(`Team ${teamKey}: ${c.name} moved from ${c.from} → ${c.to}`)
      );
    }
  });

  return rosters;
};
