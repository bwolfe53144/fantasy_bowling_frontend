import { submitRegularRoster } from "./api";

export const handleSaveRegularRoster = async ({
  players,
  user,
  currentWeek,
  flexBenchPool,
  setIsSaving,
  navigate,    
  showModal,   
}) => {
  setIsSaving(true);

  const requiredPositions = ["1", "2", "3", "4", "5", "Flex"];
  const currentPositions = players.map((p) => p.setPosition);
  const missing = requiredPositions.filter((pos) => !currentPositions.includes(pos));

  if (missing.length > 0) {
    await showModal({
      title: "Missing Positions",
      message: `You're missing required positions: ${missing.join(", ")}`,
      confirmText: "OK",
    });
    setIsSaving(false);
    return;
  }

  const usedPositions = new Set(currentPositions);
  const availableFlexBench = flexBenchPool.filter((pos) => !usedPositions.has(pos));
  const unassignedPlayers = players.filter((p) => !p.setPosition);
  const shuffled = [...unassignedPlayers].sort(() => 0.5 - Math.random());
  
  let flexBenchIndex = 0;
  const updatedUnassigned = shuffled.map((p) => {
    // Skip already used bench slots
    while (
      flexBenchIndex < availableFlexBench.length &&
      usedPositions.has(availableFlexBench[flexBenchIndex])
    ) {
      flexBenchIndex++;
    }
  
    if (flexBenchIndex < availableFlexBench.length) {
      const assigned = availableFlexBench[flexBenchIndex++];
      usedPositions.add(assigned); // ✅ mark it used
      return { ...p, setPosition: assigned };
    }
  
    return p;
  });

  const updatedPlayers = players.map((p) => {
    const updated = updatedUnassigned.find((u) => u.id === p.id);
    return updated ? updated : p;
  });

  const payload = {
    teamId: user.team.id,
    players: updatedPlayers.map((p) => ({
      playerId: p.id,
      setPosition: p.setPosition,
    })),
  };

  try {
    await submitRegularRoster(payload);

    await showModal({
      title: "Success",
      message: "Regular Roster saved!",
      confirmText: "OK",
    });

    navigate(`/roster/week/${currentWeek}`);
  } catch (err) {
    console.error("Error saving regular roster:", err);
    await showModal({
      title: "Error",
      message: "Failed to save. Please try again.",
      confirmText: "OK",
    });
  } finally {
    setIsSaving(false);
  }
};