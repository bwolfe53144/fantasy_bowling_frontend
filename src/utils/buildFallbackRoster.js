export const buildFallbackRoster = (players) => {
    if (!Array.isArray(players) || players.length === 0) return [];
  
    const positions = ["1", "2", "3", "4", "5"];
    const assigned = new Set();
    const roster = [];
    let flexCounter = 1;
  
    // Assign players whose position matches 1–5
    positions.forEach(pos => {
      const player = players.find(p => p.position === pos);
      if (player && !assigned.has(player.id)) {
        roster.push({ playerId: player.id, setPosition: pos });
        assigned.add(player.id);
      }
    });
  
    // Assign the rest to Flex and Flex Bench
    players.forEach(player => {
      if (!assigned.has(player.id)) {
        const pos = flexCounter === 1 ? "Flex" : `Flex Bench ${flexCounter - 1}`;
        roster.push({ playerId: player.id, setPosition: pos });
        flexCounter++;
      }
    });
  
    return roster;
  };