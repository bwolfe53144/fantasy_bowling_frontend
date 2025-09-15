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

  // Helper to normalize positions (capitalizes each word properly)
  const normalizePosition = (pos) => {
    if (!pos) return "";
    return pos
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Build assigned map after normalization
  const assigned = players.reduce((acc, player) => {
    if (player.setPosition) {
      acc[normalizePosition(player.setPosition)] = player.id;
    }
    return acc;
  }, {});

  // Check for missing required positions
  const missingPositions = requiredPositions.filter(pos => !assigned[pos]);
  if (missingPositions.length > 0) {
    await showModal({
      title: "Missing Positions",
      message: `Please assign players to all required positions: ${missingPositions.join(", ")}`,
      confirmText: "OK",
    });
    return;
  }

  // Fill Flex Bench for unassigned players
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

  // Prepare payload with normalized positions
  const payload = {
    teamId: user.team.id,
    week: currentWeek,
    players: updatedPlayers
      .map(p => ({
        playerId: p.id,
        setPosition: normalizePosition(p.setPosition || ""),
      }))
      .filter(p => !lockedPlayerIds.includes(p.playerId)),
  };

  try {
    const response = await saveRoster(payload);
    console.log("Submitting payload:", payload);
    if (response.status === 200) {
      await showModal({
        title: "Success",
        message: "Roster submitted successfully!",
        confirmText: "OK",
      });
      setPlayers(updatedPlayers);
      if (reload) navigate(0); // refresh page
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