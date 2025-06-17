import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { processPlayerStats } from "../src/utils/ProcessPlayerStats";
import { calculateFantasyPoints } from "../src/utils/FantasyPoints";

export default function PlayerStatsTable({ players, isSinglePlayerPage = false }) {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);

  const getBaseName = (name) => name.split(" (")[0];
  const allSameName = players.every(
    (p) => getBaseName(p.name) === getBaseName(players[0].name)
  );
  const showPosition = !allSameName;

  useEffect(() => {
    if (players?.length) {
      const weeks = [
        ...new Set(players.flatMap((p) => p.weekScores?.map((ws) => ws.week) || [])),
      ].sort((a, b) => a - b);
      setAvailableWeeks(weeks);
      setSelectedWeek(weeks.at(-1) || null);
    }
  }, [players]);

  if (!players || players.length === 0) {
    return <p>No players on this team.</p>;
  }

  return (
    <div className="playerStatsTable">
      <label htmlFor="weekSelect">Select Week:</label>
      <select
        className="weekSelect"
        value={selectedWeek ?? ""}
        onChange={(e) => setSelectedWeek(Number(e.target.value))}
      >
        {availableWeeks.map((week) => (
          <option key={week} value={week}>Week {week}</option>
        ))}
      </select>

      {selectedWeek !== null && (
                <div className="horizontalScrollArea">

  <table>
    <thead>
      <tr>
        {showPosition && <th>Team Pos</th>}
        <th>{isSinglePlayerPage ? "League" : "Player Name"}</th>
        <th>Points</th>
        <th>Avg</th>
        <th>G1</th>
        <th>G2</th>
        <th>G3</th>
        <th>Series</th>
      </tr>
    </thead>
    <tbody>
      {[...players]
        .sort((a, b) => {
          const posA = a.position ? parseInt(a.position) || 99 : 99;
          const posB = b.position ? parseInt(b.position) || 99 : 99;
          return posA - posB;
        })
        .map((player) => {
          const thisWeekScore = player.weekScores?.find((ws) => ws.week === selectedWeek);
          const prevScores = player.weekScores?.filter((ws) => ws.week < selectedWeek) || [];
          const fantasyPoints = thisWeekScore ? calculateFantasyPoints([thisWeekScore]) : null;
          const g1 = thisWeekScore?.game1 ?? "-";
          const g2 = thisWeekScore?.game2 ?? "-";
          const g3 = thisWeekScore?.game3 ?? "-";
          const avg = (() => {
            if (thisWeekScore?.average) return thisWeekScore.average;
            if (!prevScores.length) return 0;
            const pseudoPlayer = { ...player, weekScores: prevScores };
            const stats = processPlayerStats(pseudoPlayer);
            return stats.average || 0;
          })();
          const series = [g1, g2, g3].every((val) => typeof val === "number") ? g1 + g2 + g3 : "-";

          return (
            <tr key={`${player.name}-${player.league}`}>
              {showPosition && <td>{player.position || "-"}</td>}
              <td>
                {isSinglePlayerPage ? (
                  player.league
                ) : (
                  <Link to={`/player/${encodeURIComponent(player.name)}`}>
                    {`${getBaseName(player.name)} (${player.league})`}
                  </Link>
                )}
              </td>
              <td>{typeof fantasyPoints === "number" ? fantasyPoints.toFixed(2) : "-"}</td>
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
)}
    </div>
  );
}