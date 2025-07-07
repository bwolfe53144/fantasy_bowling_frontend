import React, { useContext } from "react";
import { AuthContext } from "../src/utils/AuthContext";
import { ThemeContext } from "../src/utils/ThemeContext";
import { getThemeColors } from "../src/utils/themeColors";

const StatsTable = ({ stats, avgWithHandicap, isSinglePlayer }) => {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const { backgroundColor, color } = getThemeColors(user?.color, isDarkMode);

  if (!stats) return null;

  const tableHeaderStyle = {
    backgroundColor,
    color,
  };

  return (
    <table>
      <thead style={tableHeaderStyle}>
        <tr>
          <th>Stat</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>High Game 1</td><td>{stats.highGame1}</td></tr>
        <tr><td>High Game 2</td><td>{stats.highGame2}</td></tr>
        <tr><td>High Game 3</td><td>{stats.highGame3}</td></tr>
        <tr><td>High Series</td><td>{stats.highSeries}</td></tr>
        <tr><td>Best Week Points</td><td>{stats.bestWeekPoints}</td></tr>
        <tr><td>Total Fantasy Points</td><td>{stats.totalFantasyPoints}</td></tr>
        <tr><td>Fantasy Points/Game</td><td>{stats.fantasyPointsPerGame.toFixed(2)}</td></tr>
        <tr><td>Games Bowled</td><td>{stats.gamesBowled}</td></tr>
        <tr><td>Avg Game 1</td><td>{stats.avgGame1.toFixed(2)}</td></tr>
        <tr><td>Avg Game 2</td><td>{stats.avgGame2.toFixed(2)}</td></tr>
        <tr><td>Avg Game 3</td><td>{stats.avgGame3.toFixed(2)}</td></tr>
        <tr><td>Overall Avg</td><td>{stats.overallAvg.toFixed(2)}</td></tr>
        {isSinglePlayer && (
          <tr>
            <td>Avg With Handicap</td>
            <td>{avgWithHandicap.toFixed(2)}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default StatsTable;