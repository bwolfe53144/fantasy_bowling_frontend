export function resolveDuplicatePositions(playersList) {
    const assignedPositions = {};
    const takenPositions = new Set();
    const flexBenchPool = Array.from({ length: 9 }, (_, i) => `Flex Bench ${i + 1}`);
  
    // Step 1: Assign locked players to their set positions
    for (const player of playersList) {
      if (player.setPosition && player.isLocked) {
        assignedPositions[player.id] = player.setPosition;
        takenPositions.add(player.setPosition);
      }
    }
  
    // Step 2: Assign unlocked players
    for (const player of playersList) {
      if (player.isLocked) continue;
  
      const desired = player.setPosition;
  
      // Valid and available desired position
      if (
        desired &&
        !takenPositions.has(desired) &&
        player.allowedPositions.includes(desired)
      ) {
        assignedPositions[player.id] = desired;
        takenPositions.add(desired);
        continue;
      }
  
      // Fallback 1: First allowed position that's not taken
      const available = player.allowedPositions.find(pos => !takenPositions.has(pos));
      if (available) {
        assignedPositions[player.id] = available;
        takenPositions.add(available);
        continue;
      }
  
      // Fallback 2: Next Flex Bench spot
      const fallbackFlex = flexBenchPool.find(pos => !takenPositions.has(pos));
      if (fallbackFlex) {
        assignedPositions[player.id] = fallbackFlex;
        takenPositions.add(fallbackFlex);
      } else {
        // Fallback 3: Default to "Flex"
        assignedPositions[player.id] = "Flex";
      }
    }
  
    return assignedPositions;
  }