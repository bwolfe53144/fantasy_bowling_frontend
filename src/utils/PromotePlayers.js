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

  // Group by team
  const grouped = {};
  weekRosters.forEach(r => {
    const key = `${r.teamId}-${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  Object.values(grouped).forEach(teamRosters => {

    // Helper: check eligibility and log reason
    const checkAndLog = (r, requiredPos) => {
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

    // Step 1: Fill missing starter positions
    starterPositions.forEach(pos => {
      const starter = teamRosters.find(r => r.position === pos);
      if (!starter || (starter.gamesBowled === 0 && starter.leagueCompleted)) {

        let candidate = null;
        let candidateIndex = null;

        // Check Flex first if not Flex starter
        if (pos !== "Flex") {
          teamRosters.forEach(r => {
            if (!candidate && r.position === "Flex" && checkAndLog(r, pos)) {
              candidate = r;
              candidateIndex = "Flex";
            }
          });
        }

        // Check all Flex Bench slots
        flexBenchPositions.forEach(fb => {
          teamRosters.forEach(r => {
            if (!candidate && r.position === fb && checkAndLog(r, pos === "Flex" ? null : pos)) {
              candidate = r;
              candidateIndex = fb;
            }
          });
        });

        // Check Flex itself for Flex starter
        if (pos === "Flex") {
          teamRosters.forEach(r => {
            if (!candidate && r.position === "Flex" && checkAndLog(r, null)) {
              candidate = r;
              candidateIndex = "Flex";
            }
          });
        }

        // Promote candidate if found
        if (candidate) {
          const oldPosition = candidate.position;
          if (starter) starter.position = ""; // free starter
          candidate.position = pos;
          console.log(`🔁 ${candidate.player.name} promoted from ${oldPosition} → ${pos}`);

          // Step 2: Shift down remaining flex/flex bench players after candidate's original position
          if (candidateIndex !== null) {
            const candIndexNum = candidateIndex === "Flex" ? 1 : parseInt(candidateIndex.replace("Flex Bench ", ""), 10);
            const shiftPlayers = teamRosters
              .filter(r => r.position && r.position.startsWith("Flex Bench"))
              .sort((a, b) => parseInt(a.position.replace("Flex Bench ", "")) - parseInt(b.position.replace("Flex Bench ", "")));

            shiftPlayers.forEach(r => {
              const idx = parseInt(r.position.replace("Flex Bench ", ""), 10);
              if (candidateIndex === "Flex" && idx >= 1) {
                if (idx === 1) {
                  console.log(`🔀 ${r.player.name} moved from ${r.position} → Flex`);
                  r.position = "Flex";
                } else {
                  const newPos = `Flex Bench ${idx - 1}`;
                  console.log(`🔀 ${r.player.name} moved from ${r.position} → ${newPos}`);
                  r.position = newPos;
                }
              } else if (candidateIndex !== "Flex" && idx > candIndexNum) {
                const newPos = `Flex Bench ${idx - 1}`;
                console.log(`🔀 ${r.player.name} moved from ${r.position} → ${newPos}`);
                r.position = newPos;
              }
            });
          }
        } else {
          console.log(`⚠️ No candidate found for starter position ${pos}`);
        }
      }
    });

    // Step 3: Re-bench displaced or missed players
    teamRosters.forEach(r => {
      if (!r.position || r.position === "") {
        r.position = "TO_BE_BENCHED";
        console.log(`📥 ${r.player.name} → TO_BE_BENCHED`);
      }
      if (r.gamesBowled === 0 && r.leagueCompleted) {
        r.position = "TO_BE_BENCHED";
        console.log(`📉 ${r.player.name} missed all games → TO_BE_BENCHED`);
      }
    });

    // Step 4: Normalize bench sequentially
    const benchPlayers = teamRosters.filter(r =>
      r.position === "TO_BE_BENCHED" || r.position.startsWith("Flex Bench")
    );

    const normalBench = benchPlayers.filter(r => r.position !== "TO_BE_BENCHED" && r.gamesBowled > 0);
    const missedBench = benchPlayers.filter(r => r.gamesBowled === 0);

    let benchNum = 1;
    normalBench
      .sort((a, b) => parseInt(a.position.replace("Flex Bench ", "")) - parseInt(b.position.replace("Flex Bench ", "")))
      .forEach(r => {
        const oldPos = r.position;
        r.position = `Flex Bench ${benchNum++}`;
        if (oldPos !== r.position) console.log(`🔢 ${r.player.name} renumbered ${oldPos} → ${r.position}`);
      });

    missedBench.forEach(r => {
      const oldPos = r.position;
      r.position = `Flex Bench ${benchNum++}`;
      if (oldPos !== r.position) console.log(`🔢 ${r.player.name} renumbered ${oldPos} → ${r.position}`);
    });
  });

  return rosters;
};