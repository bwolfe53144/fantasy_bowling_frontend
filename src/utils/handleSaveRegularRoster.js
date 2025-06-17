import { submitRegularRoster } from "./api";

export const handleSaveRegularRoster = async ({
  players,
  user,
  currentWeek,
  flexBenchPool,
  setIsSaving,
}) => {
  setIsSaving(true);

  const requiredPositions = ["1", "2", "3", "4", "5", "Flex"];
  const currentPositions = players.map((p) => p.setPosition);
  const missing = requiredPositions.filter((pos) => !currentPositions.includes(pos));

  if (missing.length > 0) {
    alert(`You're missing required positions: ${missing.join(", ")}`);
    setIsSaving(false);
    return;
  }

  const usedPositions = new Set(currentPositions);
  const availableFlexBench = flexBenchPool.filter((pos) => !usedPositions.has(pos));
  const unassignedPlayers = players.filter((p) => !p.setPosition);
  const shuffled = [...unassignedPlayers].sort(() => 0.5 - Math.random());

  let flexBenchIndex = 0;
  const updatedUnassigned = shuffled.map((p) => {
    if (flexBenchIndex < availableFlexBench.length) {
      return { ...p, setPosition: availableFlexBench[flexBenchIndex++] };
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
    alert("Regular Roster saved!");
    window.location.href = `/roster/week/${currentWeek}`;
  } catch (err) {
    console.error("Error saving regular roster:", err);
    alert("Failed to save. Please try again.");
  } finally {
    setIsSaving(false);
  }
};