export function updatePlayerPosition(players, assignedPositions, id, newPosition, onAlert) {
    const updatedPlayers = [...players];
    const playerToUpdate = updatedPlayers.find(player => player.id === id);
    const updatedAssigned = { ...assignedPositions };
  
    if (!playerToUpdate) return { updatedPlayers, updatedAssigned };
  
    if (playerToUpdate.isLocked) {
      onAlert?.(`${playerToUpdate.name}'s position is locked!`);
      return { updatedPlayers, updatedAssigned };
    }
  
    if (!playerToUpdate.allowedPositions.includes(newPosition)) {
      onAlert?.(`${playerToUpdate.name} cannot be assigned to ${newPosition}.`);
      return { updatedPlayers, updatedAssigned };
    }
  
    if (Object.values(updatedAssigned).includes(newPosition)) {
      const previousPlayer = updatedPlayers.find(p => p.setPosition === newPosition);
      if (previousPlayer) previousPlayer.setPosition = "";
    }
  
    updatedAssigned[id] = newPosition;
  
    const newPlayerList = updatedPlayers.map(player =>
      player.id === id ? { ...player, setPosition: newPosition } : player
    );
  
    newPlayerList.sort((a, b) => {
      const posCompare = a.setPosition?.localeCompare(b.setPosition || "") || 0;
      return posCompare === 0 ? a.name.localeCompare(b.name) : posCompare;
    });
  
    return { updatedPlayers: newPlayerList, updatedAssigned };
  }