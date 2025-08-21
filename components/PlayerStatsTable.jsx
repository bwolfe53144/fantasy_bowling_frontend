import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { getThemeColors } from "../src/utils/themeColors";
import { ThemeContext } from "../src/utils/ThemeContext";
import { processPlayerStats } from "../src/utils/ProcessPlayerStats";
import { calculateFantasyPoints } from "../src/utils/FantasyPoints";
import { AuthContext } from "../src/utils/AuthContext";

export default function PlayerStatsTable({ players, isSinglePlayerPage = false, isTeamPage = false }) {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const { backgroundColor, color } = getThemeColors(user?.color, isDarkMode);

  const getBaseName = (name) => name.split(" (")[0];

  useEffect(() => {
    if (players?.length) {
      const weeks = [...new Set(players.flatMap((p) => p.weekScores?.map((ws) => ws.week) || []))]
        .sort((a, b) => a - b);
      setAvailableWeeks(weeks);
      setSelectedWeek(weeks.at(-1) ?? null);
    }
  }, [players]);

  if (!players || players.length === 0) return <p>No players on this team.</p>;

  const allSameName = players.every(p => getBaseName(p.name) === getBaseName(players[0].name));
  const showPosition = !allSameName;

  const renderPlayerLabel = (player) => {
    if (isSinglePlayerPage) return player.league;
    if (isTeamPage) return getBaseName(player.name);
    return `${getBaseName(player.name)} (${player.league})`;
  };

  return (
    <div
      className="playerStatsTable"
      style={{
        "--header-bg": backgroundColor,
        "--header-color": color,
      }}
    >
      <label htmlFor="weekSelect">Select Week:</label>
      <select
        className="weekSelect"
        value={selectedWeek ?? ""}
        onChange={(e) => setSelectedWeek(Number(e.target.value))}
      >
        {availableWeeks.map(week => (
          <option key={week} value={week}>Week {week}</option>
        ))}
      </select>

      {selectedWeek !== null && (
        <div className="horizontalScrollArea">
          <table>
            <thead>
              <tr>
                <th className="sticky-col">
                  {isSinglePlayerPage
                    ? "League"
                    : isTeamPage
                    ? "Player Name"
                    : "Player Name (League)"}
                </th>
                {showPosition && <th>Team Pos</th>}
                <th>Points</th>
                <th>Avg</th>
                <th>G1</th>
                <th>G2</th>
                <th>G3</th>
                <th>Series</th>
              </tr>
            </thead>
            <tbody>
              {players
                .sort((a, b) => (parseInt(a.position) || 99) - (parseInt(b.position) || 99))
                .map(player => {
                  const thisWeekScore = player.weekScores?.find(ws => ws.week === selectedWeek);
                  const relevantScores = [
                    ...(player.weekScores?.filter(ws => ws.week < selectedWeek) || []),
                    ...(thisWeekScore ? [thisWeekScore] : []),
                  ];
                  const stats = processPlayerStats({ ...player, weekScores: relevantScores });
                  const fantasyPoints = thisWeekScore ? calculateFantasyPoints([thisWeekScore]) : null;

                  const g1 = thisWeekScore?.game1 ?? "-";
                  const g2 = thisWeekScore?.game2 ?? "-";
                  const g3 = thisWeekScore?.game3 ?? "-";
                  const series = [g1, g2, g3].every(val => typeof val === "number") ? g1 + g2 + g3 : "-";

                  return (
                    <tr key={`${player.name}-${player.league}`}>
                      <td className="sticky-col">
                        {isSinglePlayerPage ? player.league : (
                          <Link to={`/player/${encodeURIComponent(player.name)}`}>
                            {renderPlayerLabel(player)}
                          </Link>
                        )}
                      </td>
                      {showPosition && <td>{player.position || "-"}</td>}
                      <td>{typeof fantasyPoints === "number" ? fantasyPoints.toFixed(2) : "-"}</td>
                      <td>{stats.average?.toFixed(2) ?? "-"}</td>
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