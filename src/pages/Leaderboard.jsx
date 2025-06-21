import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { calculateFantasyPoints } from "../utils/FantasyPoints";
import { processPlayerStats } from "../utils/ProcessPlayerStats";
import { getThemeColors } from "../utils/themeColors";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const { user, players, loading } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [startWeek, setStartWeek] = useState(1);

  const { backgroundColor, color } = getThemeColors(user?.color);
  const tableHeaderStyle = { backgroundColor, color };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  const maxAvailableWeek = useMemo(() => {
    if (!players) return 1;
    return Math.max(
      ...players.flatMap(p =>
        (p.weekScores ?? []).map(ws => ws.week)
      )
    );
  }, [players]);

  const [endWeek, setEndWeek] = useState(() => maxAvailableWeek || 1);

  useEffect(() => {
    setEndWeek((prev) =>
      maxAvailableWeek > 0 && (prev > maxAvailableWeek || prev === 1)
        ? maxAvailableWeek
        : prev
    );
  }, [maxAvailableWeek]);

  useEffect(() => {
    if (startWeek > endWeek) {
      setStartWeek(endWeek);
    }
  }, [endWeek]);

  useEffect(() => {
    if (endWeek < startWeek) {
      setEndWeek(startWeek);
    }
  }, [startWeek]);

  const allPlayers = useMemo(() => {
    if (!players) return [];

    return players.map((player) => {
      const weekScores = (player.weekScores ?? []).filter(
        (ws) => ws.week >= startWeek && ws.week <= endWeek
      );

      let highGame1 = 0;
      let highGame2 = 0;
      let highGame3 = 0;
      let highSeries = 0;
      let bestWeekPoints = 0;
      let totalGames = 0;
      let totalFantasyPoints = 0;

      for (const score of weekScores) {
        const g1 = score.game1 || 0;
        const g2 = score.game2 || 0;
        const g3 = score.game3 || 0;
        const series = g1 + g2 + g3;

        highGame1 = Math.max(highGame1, g1);
        highGame2 = Math.max(highGame2, g2);
        highGame3 = Math.max(highGame3, g3);
        highSeries = Math.max(highSeries, series);

        const weeklyPoints = calculateFantasyPoints([score]);
        bestWeekPoints = Math.max(bestWeekPoints, weeklyPoints);
        totalFantasyPoints += weeklyPoints;

        totalGames += (g1 ? 1 : 0) + (g2 ? 1 : 0) + (g3 ? 1 : 0);
      }

      const baseStats = processPlayerStats({ ...player, weekScores });

      return {
        ...baseStats,
        highGame1,
        highGame2,
        highGame3,
        highSeries,
        bestWeekPoints,
        totalFantasyPoints,
        fantasyPointsPerGame: totalGames > 0 ? totalFantasyPoints / totalGames : 0,
        gamesBowled: totalGames,
        league: player.league ?? "",
      };
    });
  }, [players, startWeek, endWeek]);

  const topBy = (key, label, filterFn = () => true, valueLabel = "Value") => {
    const filtered = allPlayers.filter(filterFn);
    const allZero = filtered.every((p) => (p[key] ?? 0) === 0);

    const sorted = allZero
      ? filtered.slice(0, 5)
      : [...filtered].sort((a, b) => b[key] - a[key]);

    const topValue = allZero ? undefined : sorted[4]?.[key];
    const topPlayers = allZero
      ? sorted
      : sorted.filter((p) => topValue === undefined || p[key] >= topValue);

    return { label, key, valueLabel, players: topPlayers };
  };

  const maxGames = Math.max(...allPlayers.map((p) => p.gamesBowled));
  const minRequiredGames = Math.ceil((2 / 3) * maxGames);

  const leaderboards = [
    topBy(
      "average",
      `Top Averages (Min ${minRequiredGames} Games)`,
      (p) => p.gamesBowled >= minRequiredGames,
      "Average"
    ),
    topBy(
      "fantasyPointsPerGame",
      `Fantasy Points/Game (Min ${minRequiredGames} Games)`,
      (p) => p.gamesBowled >= minRequiredGames,
      "Avg PPG"
    ),
    topBy("highGame1", "High Game 1", undefined, "Score"),
    topBy("highGame2", "High Game 2", undefined, "Score"),
    topBy("highGame3", "High Game 3", undefined, "Score"),
    topBy("highSeries", "High Series", undefined, "Score"),
    topBy("bestWeekPoints", "Most Points in a Week", undefined, "Points"),
    topBy("totalFantasyPoints", "Most Fantasy Points", undefined, "Total Points"),
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Leaderboard</h1>

        <div className="weekRangeContainer">
          <label htmlFor="startWeek">Start Week:</label>
          <input
            type="number"
            id="startWeek"
            className="weekInput"
            min="1"
            max={endWeek}
            value={startWeek}
            onChange={(e) => setStartWeek(Number(e.target.value))}
          />
          <label htmlFor="endWeek">End Week:</label>
          <input
            type="number"
            id="endWeek"
            className="weekInput"
            min={startWeek}
            max={maxAvailableWeek}
            value={endWeek}
            onChange={(e) => setEndWeek(Number(e.target.value))}
          />
        </div>

        {leaderboards.map((board) => (
          <div key={board.label}>
            <h2>{board.label}</h2>
            <table>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th>Name (League)</th>
                  <th>Team</th>
                  <th>{board.valueLabel}</th>
                </tr>
              </thead>
              <tbody>
                {board.players.map((p, index) => (
                  <tr key={index}>
                    <td>
                      <Link to={`/player/${encodeURIComponent(p.name)}`}>
                        {p.name} ({p.league})
                      </Link>
                    </td>
                    <td>{p.team}</td>
                    <td>
                      {["average", "fantasyPointsPerGame"].includes(board.key)
                        ? p[board.key].toFixed(2)
                        : p[board.key]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;