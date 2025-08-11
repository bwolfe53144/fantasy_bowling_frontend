export async function handleRosterSubmit({
  players,
  user,
  currentWeek,
  lockedPlayerIds,
  saveRoster,
  setPlayers,
  showModal,
  navigate,
  reload = true,
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
    await showModal({
      title: "Missing Positions",
      message: `Please assign players to all required positions: ${missingPositions.join(", ")}`,
      confirmText: "OK",
    });
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
      await showModal({
        title: "Success",
        message: "Roster submitted successfully!",
        confirmText: "OK",
      });
      setPlayers(updatedPlayers); // update local state if needed
      if (reload) navigate(0); // refresh current route programmatically
    } else {
      await showModal({
        title: "Error",
        message: "Error submitting roster.",
        confirmText: "OK",
      });
    }
  } catch (error) {
    console.error("Submit error:", error);
    await showModal({
      title: "Server Error",
      message: "There was a server error. Please try again later.",
      confirmText: "OK",
    });
  }
}