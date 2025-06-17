import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PlayerStatsTable from "../../components/PlayerStatsTable.jsx";
import LaneAverageChart from "../../components/LaneAverageChart.jsx";
import OpponentAverageChart from "../../components/OpponentAverageChart.jsx";
import StatsTable from "../../components/StatsTable.jsx";
import { AuthContext } from "../utils/AuthContext.jsx";
import { getPlayerByName } from "../utils/api.js";
import { calculateStats } from "../utils/calculateStats.js";
import { useWeekRange } from "../../hooks/useWeekRange.js";
import { getThemeColors } from "../utils/themeColors.js";
import "../styles/GraphPageStats.css";

const PlayerDetail = () => {
  const { user, loading } = useContext(AuthContext);
  const { playerName } = useParams();
  const decodedName = decodeURIComponent(playerName);
  const [playerData, setPlayerData] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLaneChart, setShowLaneChart] = useState(false);
  const [showOpponentChart, setShowOpponentChart] = useState(false);
  const maxWeek = Math.max(...(playerData?.weekScores?.map(w => parseInt(w.week, 10)) || [1]));

  const {
    startWeek,
    endWeek,
    handleStartWeekChange,
    handleEndWeekChange,
  } = useWeekRange(maxWeek);

  const { buttonBackground, buttonColor } = getThemeColors(user?.color);
  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    minWidth: "90px",
    border: "none",
    cursor: "pointer",
  };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await getPlayerByName(decodedName);
        setPlayerData(response.data);
      } catch (error) {
        console.error("Failed to fetch player:", error);
      }
    };
    fetchPlayer();
  }, [decodedName]);

  const getFilteredScores = () => {
    if (!playerData) return [];

    return playerData.weekScores?.filter(score => {
      const leagueMatch = selectedLeague === "All" || score.league === selectedLeague;
      const week = parseInt(score.week, 10);
      const weekMatch =
        (!startWeek || week >= parseInt(startWeek)) &&
        (!endWeek || week <= parseInt(endWeek));
      return leagueMatch && weekMatch;
    }) ?? [];
  };

  const scores = getFilteredScores();
  const stats = calculateStats({ scores });

  // Extract unique leagues and prepare league filter options
  const uniqueLeagues = [...new Set(playerData?.weekScores?.map(w => w.league) ?? [])];
  const availableLeagues = uniqueLeagues.length > 1 ? ["All", ...uniqueLeagues] : uniqueLeagues;

  const rawTeams = playerData?.weekScores
    ?.filter(w => w.myTeam && w.league)
    .map(w => ({ name: w.myTeam, league: w.league })) ?? [];

  const seen = new Set();
  const teamsPlayedFor = rawTeams.filter(({ name, league }) => {
    const key = `${name}|${league}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const teamNameCounts = teamsPlayedFor.reduce((acc, { name }) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const calculateAvgWithWeekHandicap = (weekScores) => {
    const adjustedGameScores = [];

    for (const week of weekScores) {
      const { game1, game2, game3, average } = week;
      const games = [game1, game2, game3];

      games.forEach(game => {
        if (average >= 220) {
          adjustedGameScores.push(game);
        } else {
          const handicap = (220 - average) * 0.9;
          adjustedGameScores.push(game + handicap);
        }
      });
    }

    if (adjustedGameScores.length === 0) return 0;

    const total = adjustedGameScores.reduce((sum, g) => sum + g, 0);
    return total / adjustedGameScores.length;
  };

  const avgWithHandicap = calculateAvgWithWeekHandicap(scores);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer graphPageStats">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Player: {decodedName}</h1>
        {/* Teams Played For */}
        {teamsPlayedFor.length > 0 && (
          <div className="bowling-teams">
            <strong>Bowling Teams:</strong>{" "}
            {teamsPlayedFor.map(({ name, league }, i) => {
              const showLeague = teamNameCounts[name] > 1;
              const label = showLeague ? `${name} (${league})` : name;
              return (
                <span key={`${name}-${league}`}>
                  <Link to={`/bowling-team/${encodeURIComponent(name)}/${league}`}>{label}</Link>
                  {i < teamsPlayedFor.length - 1 && " , "}
                </span>
              );
            })}
          </div>
        )}
        <PlayerStatsTable players={playerData?.players || []} isSinglePlayerPage />
        <h3>Filters for other stats</h3>
        {/* League Filter */}
        {availableLeagues.length > 1 && (
          <div>
            <label>Filter by League:</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
            >
              {availableLeagues.map((league, idx) => (
                <option key={`${league}-${idx}`} value={league}>
                  {league}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Week Filters */}
        <div className="week-filters">
          <label>Start Week:</label>
          <input
            type="number"
            min="1"
            max={maxWeek}
            value={startWeek}
            onChange={handleStartWeekChange}
          />
          <label>End Week:</label>
          <input
            type="number"
            min="1"
            max={maxWeek}
            value={endWeek}
            onChange={handleEndWeekChange}
          />
        </div>
        {/* Lane Average Chart */}
        <div>
          <button style={buttonStyle} onClick={() => setShowLaneChart(!showLaneChart)}>
            {showLaneChart ? "▼" : "►"} Average Score by Lane
          </button>
          {showLaneChart && <LaneAverageChart scores={scores} />}
        </div>
        {/* Opponent Average Chart */}
        <div>
          <button style={buttonStyle} onClick={() => setShowOpponentChart(!showOpponentChart)}>
            {showOpponentChart ? "▼" : "►"} Average Score by Opponent
          </button>
          {showOpponentChart && <OpponentAverageChart scores={scores} />}
        </div>
        {/* Stats Table */}
        {stats ? (
          <StatsTable stats={stats} avgWithHandicap={avgWithHandicap} isSinglePlayer />
        ) : (
          <p>No stats available for this player.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PlayerDetail;
