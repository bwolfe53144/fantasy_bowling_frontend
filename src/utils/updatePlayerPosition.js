export function updatePlayerPosition(players, assignedPositions, id, newPosition, onAlert) {
  const updatedPlayers = [...players];
  const playerToUpdate = updatedPlayers.find(player => player.id === id);
  const updatedAssigned = { ...assignedPositions };

  if (!playerToUpdate) return { updatedPlayers, updatedAssigned };
  if (playerToUpdate.isLocked) {
    onAlert?.(`${playerToUpdate.name}'s position is locked!`);
    return { updatedPlayers, updatedAssigned };
  }

  const lowerPos = newPosition.toLowerCase();
  const isFlexSlot = lowerPos === "flex" || lowerPos.startsWith("flex bench");

  // STEP 1: Clear any other player in the same slot type
  updatedPlayers.forEach(p => {
    if (p.id === id) return;

    const pLower = (p.setPosition || "").toLowerCase();
    if (pLower === lowerPos) {
      // Exact same position → clear it
      p.setPosition = "";
      delete updatedAssigned[p.id];
    }

    // Optional: if it's a Flex Bench, clear any previous player in the same bench number
    if (isFlexSlot && pLower.startsWith("flex bench") && lowerPos.startsWith("flex bench")) {
      const benchNumber = lowerPos.split("flex bench ")[1];
      const pBenchNumber = pLower.split("flex bench ")[1];
      if (benchNumber === pBenchNumber) {
        p.setPosition = "";
        delete updatedAssigned[p.id];
      }
    }
  });

  // STEP 2: Assign new player
  playerToUpdate.setPosition = newPosition;
  updatedAssigned[id] = newPosition;

  // STEP 3: Sort by position then name
  updatedPlayers.sort((a, b) => {
    const posCompare = (a.setPosition || "").localeCompare(b.setPosition || "");
    return posCompare === 0 ? a.name.localeCompare(b.name) : posCompare;
  });

  return { updatedPlayers, updatedAssigned };
}