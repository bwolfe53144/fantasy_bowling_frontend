import React, { useState, useEffect } from "react";
import { processPlayerStats } from "../src/utils/ProcessPlayerStats";
import { fetchSpecificWeekLocks } from "../src/utils/api";
import "../src/styles/Roster.css";

export default function PlayerRosterGrid({ players = [], updatePosition, lockedPositions = [], currentWeek, themeStyle }) {
  const [displayOrder, setDisplayOrder] = useState([]);
  const [initialPositions, setInitialPositions] = useState({});
  const [weekLocks, setWeekLocks] = useState({});

  function capitalizePosition(pos) {
    if (!pos) return "";
    return pos
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  const normalizedLockedPositions = (lockedPositions || []).map(capitalizePosition);

  // Load week locks for current week
  useEffect(() => {
    const loadLocks = async () => {
      try {
        const res = await fetchSpecificWeekLocks(currentWeek);
        const locksByLeague = {};
        res.data.forEach(lock => {
          locksByLeague[lock.league] = new Date(lock.lockTime); // use `league` from your Prisma model
        });
        setWeekLocks(locksByLeague);
      } catch (err) {
        console.error("Failed to fetch week locks:", err);
      }
    };
    if (currentWeek) loadLocks();
  }, [currentWeek]);

  // Capture player order and initial positions
  useEffect(() => {
    if (!Array.isArray(players) || players.length === 0) {
      setDisplayOrder([]);
      setInitialPositions({});
      return;
    }
    if (displayOrder.length === 0 || displayOrder.length !== players.length) {
      setDisplayOrder(players.map(player => player.id));
      const positionsSnapshot = {};
      players.forEach(player => {
        positionsSnapshot[player.id] = capitalizePosition(player.setPosition) || "-";
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
            <th style={{ width: "80px" }}>LY Avg</th>
            <th style={{ width: "60px" }}>G1</th>
            <th style={{ width: "60px" }}>G2</th>
            <th style={{ width: "60px" }}>G3</th>
            <th style={{ width: "100px" }}>Series</th>
            <th style={{ width: "140px" }}>Lock Time</th>
          </tr>
        </thead>
        <tbody>
          {displayOrder.map((id) => {
            const player = playersById[id];
            if (!player) return null;

            const stats = processPlayerStats(player);
            const thisWeekScore = player.weekScores?.find(ws => ws.week === currentWeek);
            const prevWeekScores = player.weekScores?.filter(ws => ws.week < currentWeek) || [];

            const g1 = thisWeekScore?.game1 ?? "-";
            const g2 = thisWeekScore?.game2 ?? "-";
            const g3 = thisWeekScore?.game3 ?? "-";

            const avg = (() => {
              if (thisWeekScore?.average) return thisWeekScore.average;
              if (prevWeekScores.length === 0) return 0;
              const pseudoPlayer = { ...player, weekScores: prevWeekScores };
              const computed = processPlayerStats(pseudoPlayer);
              return computed.average || 0;
            })();

            const series = [g1, g2, g3].every(val => typeof val === "number") ? g1 + g2 + g3 : "-";
            const normalizedPositions = [...new Set((player.allowedPositions || []).map(pos => capitalizePosition(pos)))];

            const lockDate = player.league ? weekLocks[player.league] : null;
            const lockDisplay = lockDate ? lockDate.toLocaleString() : "-";

            return (
              <tr key={player.id} className={player.isLocked ? "lockedPlayer" : ""}>
                <td><div className="fixedCell">{initialPositions[player.id] ?? "-"}</div></td>
                <td><div className="fixedCell playerName">{player.name} ({normalizedPositions[0] || "-"}){player.isLocked && " 🔒"}</div></td>
                <td>
                  <select
                    value={capitalizePosition(player.setPosition) || ""}
                    onChange={(e) => updatePosition(player.id, e.target.value)}
                    disabled={player.isLocked}
                  >
                    <option value="">Select</option>
                    {normalizedPositions.map(pos => (
                      <option key={pos} value={pos} disabled={normalizedLockedPositions.includes(pos)}>{pos}</option>
                    ))}
                  </select>
                </td>
                <td>{typeof player.fantasyPoints === "number" ? player.fantasyPoints.toFixed(2) : "-"}</td>
                <td>{typeof avg === "number" ? avg.toFixed(2) : "-"}</td>
                <td>{(typeof stats.lyAverage === "number" && stats.lyAverage > 0) ? stats.lyAverage.toFixed(2) : "-"}</td>
                <td>{g1}</td>
                <td>{g2}</td>
                <td>{g3}</td>
                <td>{series}</td>
                <td>{lockDisplay}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}