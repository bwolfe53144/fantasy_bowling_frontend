export function updatePlayerPosition(players, assignedPositions, id, newPosition, onAlert) {
  // defensive copy
  const updatedPlayers = players.map(p => ({ ...p }));
  const updatedAssigned = { ...assignedPositions };

  // helpers
  const idStr = String(id);
  const normalize = (pos) => {
    if (pos === undefined || pos === null) return "";
    const s = String(pos).trim();
    if (s === "") return "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const normalizedNew = normalize(newPosition);

  const playerToUpdate = updatedPlayers.find(p => String(p.id) === idStr);
  if (!playerToUpdate) return { updatedPlayers, updatedAssigned };

  if (playerToUpdate.isLocked) {
    onAlert?.(`${playerToUpdate.name}'s position is locked!`);
    return { updatedPlayers, updatedAssigned };
  }

  // Build normalized allowed set for this player
  const allowedSet = new Set((playerToUpdate.allowedPositions || []).map(normalize));

  // Always allow Bench or clearing
  if (normalizedNew !== "" && normalizedNew !== "Bench" && !allowedSet.has(normalizedNew)) {
    onAlert?.(`${playerToUpdate.name} cannot be assigned to ${normalizedNew}.`);
    return { updatedPlayers, updatedAssigned };
  }

  const oldNormalized = normalize(playerToUpdate.setPosition);

  // no-op if they already are in that normalized position
  if (oldNormalized === normalizedNew) {
    return { updatedPlayers, updatedAssigned };
  }

  // If target is a real slot (not Bench/empty) and someone else occupies it, bump them to Bench
  if (normalizedNew && normalizedNew !== "Bench") {
    const previousId = Object.keys(updatedAssigned).find(
      pid => normalize(updatedAssigned[pid]) === normalizedNew && pid !== idStr
    );
    if (previousId) {
      updatedAssigned[previousId] = "Bench";
      const prevPlayer = updatedPlayers.find(p => String(p.id) === previousId);
      if (prevPlayer) prevPlayer.setPosition = "Bench";
    }
  }

  // Assign the new position to the current player (map empty -> Bench)
  const assignedPos = normalizedNew === "" ? "Bench" : normalizedNew;
  playerToUpdate.setPosition = assignedPos;
  updatedAssigned[idStr] = assignedPos;

  // Ensure no other id still claims this position (dedupe) — move any duplicates to Bench
  for (const pid of Object.keys(updatedAssigned)) {
    if (pid === idStr) continue;
    if (normalize(updatedAssigned[pid]) === normalize(assignedPos)) {
      updatedAssigned[pid] = "Bench";
      const p = updatedPlayers.find(x => String(x.id) === pid);
      if (p) p.setPosition = "Bench";
    }
  }

  // Stable sort for display (position then name)
  const newPlayerList = updatedPlayers.slice().sort((a, b) => {
    const pa = a.setPosition || "";
    const pb = b.setPosition || "";
    const posCompare = pa.localeCompare(pb);
    return posCompare === 0 ? a.name.localeCompare(b.name) : posCompare;
  });

  return { updatedPlayers: newPlayerList, updatedAssigned };
}