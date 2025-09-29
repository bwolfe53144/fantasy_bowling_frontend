export const promotePlayers = (rosters, targetWeek, completedLeagues) => {
  const starterPositions = ["1", "2", "3", "4", "5", "Flex"];
  const flexBenchPositions = [
    "Flex Bench 1","Flex Bench 2","Flex Bench 3","Flex Bench 4",
    "Flex Bench 5","Flex Bench 6","Flex Bench 7","Flex Bench 8","Flex Bench 9"
  ];

  // Flatten completedLeagues to names
  const completedLeagueNames = (completedLeagues || []).map(c =>
    typeof c === "string" ? c : (c.league || c.name || String(c))
  );

  // Filter rosters for this week
  const weekRosters = rosters.filter(r => r.week === targetWeek);

  // Add gamesBowled and leagueCompleted flags
  weekRosters.forEach(r => {
    const ws = r.player?.weekScores?.find(ws => ws.week === r.week);
    r.gamesBowled = [ws?.game1, ws?.game2, ws?.game3].filter(g => typeof g === "number").length;
    r.leagueCompleted = completedLeagueNames.includes(r.player?.league);
  });

  // Group by team
  const grouped = {};
  weekRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  Object.values(grouped).forEach(teamRosters => {

    // Helper: check eligibility
    const checkEligibility = (r, requiredPos) => {
      const reasons = [];
      if (requiredPos && r.player.position !== requiredPos) reasons.push(`wrong natural position (${r.player.position})`);
      if (r.leagueCompleted && r.gamesBowled !== 3) reasons.push(`leagueCompleted but gamesBowled=${r.gamesBowled}`);
      if (reasons.length > 0) {
        console.log(`❌ ${r.player.name} at ${r.position} skipped: ${reasons.join(", ")}`);
        return false;
      }
      console.log(`✅ ${r.player.name} at ${r.position} is eligible`);
      return true;
    };

    // Step 1: Promote starters
    starterPositions.forEach(pos => {
      const starter = teamRosters.find(r => r.position === pos);
      if (!starter || (starter.gamesBowled === 0 && starter.leagueCompleted)) {
        let candidate = null;
        let candidateIndex = null;

        // Check Flex first (for non-Flex starter)
        if (pos !== "Flex") {
          teamRosters.forEach(r => {
            if (!candidate && r.position === "Flex" && checkEligibility(r, pos)) {
              candidate = r;
              candidateIndex = "Flex";
            }
          });
        }

        // Check Flex Bench in order
        flexBenchPositions.forEach(fb => {
          teamRosters.forEach(r => {
            if (!candidate && r.position === fb && checkEligibility(r, pos === "Flex" ? null : pos)) {
              candidate = r;
              candidateIndex = fb;
            }
          });
        });

        // Check Flex itself for Flex starter
        if (pos === "Flex") {
          teamRosters.forEach(r => {
            if (!candidate && r.position === "Flex" && checkEligibility(r, null)) {
              candidate = r;
              candidateIndex = "Flex";
            }
          });
        }

        // Promote candidate if found
        if (candidate) {
          const oldPosition = candidate.position;
          if (starter) starter.position = ""; // free starter spot
          candidate.position = pos;
          console.log(`🔁 ${candidate.player.name} promoted from ${oldPosition} → ${pos}`);
        } else {
          console.log(`⚠️ No candidate found for starter position ${pos}`);
        }
      }
    });

    // Step 2: Move unbowled players in completed leagues to end of bench
    const benchPlayers = teamRosters.filter(r =>
      r.position === "Flex" || r.position.startsWith("Flex Bench")
    );
    benchPlayers.forEach(r => {
      if (r.leagueCompleted && r.gamesBowled === 0) {
        console.log(`📉 ${r.player.name} has not bowled → will be moved to end of bench`);
        r._needsEndMove = true; // temporary marker
      }
    });

    // Step 3: Normalize bench sequentially
    let benchNum = 1;
    // Start with all bench/flex players who bowled
    benchPlayers
      .filter(r => !r._needsEndMove)
      .sort((a, b) => {
        const aNum = a.position === "Flex" ? 0 : parseInt(a.position.replace("Flex Bench ", ""));
        const bNum = b.position === "Flex" ? 0 : parseInt(b.position.replace("Flex Bench ", ""));
        return aNum - bNum;
      })
      .forEach(r => {
        const oldPos = r.position;
        r.position = `Flex Bench ${benchNum++}`;
        if (oldPos !== r.position) console.log(`🔢 ${r.player.name} renumbered ${oldPos} → ${r.position}`);
      });

    // Then move unbowled players to the end
    benchPlayers
      .filter(r => r._needsEndMove)
      .forEach(r => {
        const oldPos = r.position;
        r.position = `Flex Bench ${benchNum++}`;
        delete r._needsEndMove;
        console.log(`📥 ${r.player.name} moved to end of bench: ${oldPos} → ${r.position}`);
      });
  });

  return rosters;
};