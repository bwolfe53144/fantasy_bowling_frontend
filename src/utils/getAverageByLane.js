export const getAverageByLane = (weekScores, sortOption = "averageDesc") => {
    const laneStats = {};
  
    weekScores.forEach(({ lanes, game1, game2, game3 }) => {
      let laneLabel = normalizeLaneLabel(lanes);
  
      const games = [game1, game2, game3].filter(g => g != null);
      if (!laneStats[laneLabel]) {
        laneStats[laneLabel] = { total: 0, count: 0 };
      }
      games.forEach(g => {
        laneStats[laneLabel].total += g;
        laneStats[laneLabel].count += 1;
      });
    });
  
    const laneAverages = Object.entries(laneStats).map(([lane, { total, count }]) => ({
      lane,
      average: count > 0 ? (total / count).toFixed(2) : 0,
    }));
  
    return sortLaneAverages(laneAverages, sortOption);
  };
  
  const normalizeLaneLabel = (lanes) => {
    let label = lanes;
  
    // ISO date to MM-DD
    if (typeof label === "string" && label.includes("T") && Date.parse(label)) {
      const date = new Date(label);
      label = `${date.getMonth() + 1}-${date.getDate()}`;
    }
  
    // Convert "3/4" to "3-4"
    if (typeof label === "string" && label.includes("/")) {
      label = label.replace(/\//g, "-");
    }
  
    return label;
  };
  
  const sortLaneAverages = (laneAverages, sortOption) => {
    return laneAverages.sort((a, b) => {
      if (sortOption === "averageDesc") return b.average - a.average;
      if (sortOption === "averageAsc") return a.average - b.average;
  
      const parseLane = (label) => {
        const parts = label.split("-").map(Number);
        return parts.length === 2 ? parts[0] * 100 + parts[1] : parseInt(label, 10);
      };
  
      if (sortOption === "laneAsc") return parseLane(a.lane) - parseLane(b.lane);
      if (sortOption === "laneDesc") return parseLane(b.lane) - parseLane(a.lane);
  
      return 0;
    });
  };