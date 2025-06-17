import React, { useState, useEffect } from "react";
import { processPlayerStats } from "../src/utils/ProcessPlayerStats";
import "../src/styles/Roster.css";

export default function PlayerRosterGrid({ players, updatePosition, lockedPositions, currentWeek, themeStyle }) {
  const [displayOrder, setDisplayOrder] = useState([]);
  const [initialPositions, setInitialPositions] = useState({});

  // Capture player order and original positions on first load
  useEffect(() => {
    if (players?.length && displayOrder.length === 0) {
      setDisplayOrder(players.map(player => player.id));

      const positionsSnapshot = {};
      players.forEach(player => {
        positionsSnapshot[player.id] = player.setPosition || "-";
      });
      setInitialPositions(positionsSnapshot);
    }
  }, [players]);

  if (!players || players.length === 0) {
    return (
      <div className="emptyPlayersMessage">
        <p>No players assigned to your team yet. Please add players to your team.</p>
      </div>
    );
  }

  const playersById = Object.fromEntries(players.map(p => [p.id, p]));

  return (
    <div className="rosterTableWrapper">
    <table className="rosterTable no-move">
      <thead>
        <tr style={themeStyle}>
          <th style={{ width: "90px" }}>Pos</th>
          <th style={{ width: "200px" }}>Player</th>
          <th style={{ width: "140px" }}>Set Position</th>
          <th style={{ width: "80px" }}>Points</th>
          <th style={{ width: "80px" }}>Avg</th>
          <th style={{ width: "60px" }}>G1</th>
          <th style={{ width: "60px" }}>G2</th>
          <th style={{ width: "60px" }}>G3</th>
          <th style={{ width: "80px" }}>Series</th>
        </tr>
      </thead>
      <tbody>
        {displayOrder.map((id) => {
          const player = playersById[id];
          if (!player) return null;

          const thisWeekScore = player.weekScores?.find(ws => ws.week === currentWeek);
          const prevWeekScores = player.weekScores?.filter(ws => ws.week < currentWeek) || [];

          const g1 = thisWeekScore?.game1 ?? "-";
          const g2 = thisWeekScore?.game2 ?? "-";
          const g3 = thisWeekScore?.game3 ?? "-";

          const avg = (() => {
            if (thisWeekScore?.average) return thisWeekScore.average;
            if (prevWeekScores.length === 0) return 0;
            const pseudoPlayer = { ...player, weekScores: prevWeekScores };
            const stats = processPlayerStats(pseudoPlayer);
            return stats.average || 0;
          })();

          const series = [g1, g2, g3].every(val => typeof val === "number")
            ? g1 + g2 + g3
            : "-";

          return (
            <tr key={player.id} className={player.isLocked ? "lockedPlayer" : ""}>
              <td>
                <div className="fixedCell">
                  {initialPositions[player.id] ?? "-"}
                </div>
              </td>
              <td>
                <div className="fixedCell playerName">
                  {player.name} ({player.allowedPositions[0]})
                  {player.isLocked && " 🔒"}
                </div>
              </td>
              <td>
                <select
                  value={player.setPosition || ""}
                  onChange={(e) => updatePosition(player.id, e.target.value)}
                  disabled={player.isLocked}
                >
                  <option value="">Select</option>
                  {[...new Set(player.allowedPositions)].map((pos) => (
                    <option key={pos} value={pos} disabled={lockedPositions.includes(pos)}>
                      {pos}
                    </option>
                  ))}
                </select>
              </td>
              <td>{typeof player.fantasyPoints === "number" ? player.fantasyPoints.toFixed(2) : "-"}</td>
              <td>{avg.toFixed(2)}</td>
              <td>{g1}</td>
              <td>{g2}</td>
              <td>{g3}</td>
              <td>{series}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}