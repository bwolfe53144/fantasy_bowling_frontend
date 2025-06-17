export function resolveDuplicatePositions(playersList, lockedIds = []) {
    const assignedPositions = {};
    const takenPositions = new Set();
    const flexBenchPool = Array.from({ length: 9 }, (_, i) => `Flex Bench ${i + 1}`);
  
    // Step 1: Assign locked players
    for (const player of playersList) {
      const isLocked = lockedIds.includes(player.id);
      if (player.setPosition && isLocked) {
        assignedPositions[player.id] = player.setPosition;
        takenPositions.add(player.setPosition);
      }
    }
  
    // Step 2: Assign unlocked players
    for (const player of playersList) {
      const isLocked = lockedIds.includes(player.id);
      if (isLocked) continue;
  
      const desired = player.setPosition;
  
      if (
        desired &&
        !takenPositions.has(desired) &&
        player.allowedPositions.includes(desired)
      ) {
        assignedPositions[player.id] = desired;
        takenPositions.add(desired);
        continue;
      }
  
      const available = player.allowedPositions.find(pos => !takenPositions.has(pos));
      if (available) {
        assignedPositions[player.id] = available;
        takenPositions.add(available);
        continue;
      }
  
      const fallbackFlex = flexBenchPool.find(pos => !takenPositions.has(pos));
      if (fallbackFlex) {
        assignedPositions[player.id] = fallbackFlex;
        takenPositions.add(fallbackFlex);
      } else {
        assignedPositions[player.id] = "Flex";
      }
    }
  
    return assignedPositions;
  }