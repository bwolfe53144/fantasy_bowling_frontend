export async function handleRosterSubmit({
    players,
    user,
    currentWeek,
    lockedPlayerIds,
    saveRoster,
    setPlayers,
    alert,
    reload = true
  }) {
    const requiredPositions = ["1", "2", "3", "4", "5", "Flex"];
    const assigned = players.reduce((acc, player) => {
      if (player.setPosition) {
        acc[player.setPosition] = player.id;
      }
      return acc;
    }, {});
  
    const missingPositions = requiredPositions.filter(pos => !assigned[pos]);
  
    if (missingPositions.length > 0) {
      alert(`Please assign players to all required positions: ${missingPositions.join(", ")}`);
      return;
    }
  
    // Fill Flex Bench
    const usedPositions = new Set(Object.keys(assigned));
    const flexBenchPool = Array.from({ length: 9 }, (_, i) => `Flex Bench ${i + 1}`);
    const updatedPlayers = players.map(player => {
      if (!player.setPosition) {
        const availableBench = flexBenchPool.find(pos => !usedPositions.has(pos));
        if (availableBench) {
          usedPositions.add(availableBench);
          return { ...player, setPosition: availableBench };
        }
      }
      return player;
    });
  
    const payload = {
      teamId: user.team.id,
      week: currentWeek,
      players: updatedPlayers
        .map(p => ({
          playerId: p.id,
          setPosition: p.setPosition || "",
        }))
        .filter(p => !lockedPlayerIds.includes(p.playerId)),
    };
  
    try {
      const response = await saveRoster(payload);
      if (response.status === 200) {
        alert("Roster submitted successfully!");
        setPlayers(updatedPlayers); // if you want to update local state
        if (reload) window.location.reload();
      } else {
        alert("Error submitting roster.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Server error.");
    }
  }