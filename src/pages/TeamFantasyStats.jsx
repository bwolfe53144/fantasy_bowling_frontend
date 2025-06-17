import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext.jsx";
import { useWeekRange } from "../../hooks/useWeekRange.js";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PlayerStatsTable from "../../components/PlayerStatsTable.jsx";
import BowlerAveragesChart from "../../components/BowlerAveragesChart.jsx";
import LaneAverageChart from "../../components/LaneAverageChart.jsx";
import OpponentAverageChart from "../../components/OpponentAverageChart.jsx";
import StatsTable from "../../components/StatsTable.jsx";
import { getPlayersByTeamName } from "../utils/api.js";
import { getBowlerAverages } from "../utils/getBowlerAverages.js";
import { calculateTeamAndStarterStats } from "../utils/calculateTeamAndStarterStats.js";
import { getThemeColors } from "../utils/themeColors.js";
import "../styles/GraphPageStats.css";

const TeamFantasyStats = () => {
  const { teamName } = useParams();
  const { user, loading } = useContext(AuthContext);
  const [teamData, setTeamData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNameChart, setShowNameChart] = useState(false);
  const [showLaneChart, setShowLaneChart] = useState(false);
  const [showOpponentChart, setShowOpponentChart] = useState(false);
  const maxWeek = Math.max(
    1,
    ...(teamData?.players?.flatMap(player =>
      player.weekScores?.map(w => parseInt(w.week, 10)) || []
    ) || [])
  );

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
    const fetchTeamPlayers = async () => {
      try {
        const response = await getPlayersByTeamName(teamName);
        setTeamData(response.data);

        const combinedStats = await calculateTeamAndStarterStats(
          response.data.players,
          response.data.teamId,
          startWeek,
          endWeek
        );

        setStats(combinedStats);
      } catch (error) {
        console.error("❌ Failed to fetch team players or calculate stats:", error);
      }
    };

    fetchTeamPlayers();
  }, [teamName, startWeek, endWeek]);

  const getFilteredScores = () => {
    if (!teamData?.players) return [];
    return teamData.players.flatMap(player =>
      player.weekScores?.filter(score => {
        const week = parseInt(score.week, 10);
        return week >= startWeek && week <= endWeek;
      }) || []
    );
  };

  const getFilteredPlayers = () => {
    if (!teamData?.players) return [];
    return teamData.players.map(player => ({
      ...player,
      weekScores: player.weekScores?.filter(score => {
        const week = parseInt(score.week, 10);
        return week >= startWeek && week <= endWeek;
      }) || [],
    }));
  };

  const filteredPlayers = getFilteredPlayers();
  const averageByName = getBowlerAverages(filteredPlayers);

  if (loading || !teamData || !teamData.players || teamData.players.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer graphPageStats">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Fantasy Team Stats: {teamName}</h1>

        <h2>Individual Stats</h2>
        <PlayerStatsTable players={teamData.players} />

        <h3>Week range filter for other stats</h3>
        <div className="week-filters">
          <label>
            Start Week:
            <input
              type="number"
              min="1"
              max={maxWeek}
              value={startWeek}
              onChange={handleStartWeekChange}
            />
          </label>
          <label>
            End Week:
            <input
              type="number"
              min="1"
              max={maxWeek}
              value={endWeek}
              onChange={handleEndWeekChange}
            />
          </label>
        </div>

        <div>
          <button style={buttonStyle} onClick={() => setShowNameChart(prev => !prev)}>
            {showNameChart ? "▼" : "►"} Bowler Averages
          </button>
          {showNameChart && <BowlerAveragesChart averages={averageByName} />}
        </div>

        <div>
          <button style={buttonStyle} onClick={() => setShowLaneChart(prev => !prev)}>
            {showLaneChart ? "▼" : "►"} Average Score by Lane
          </button>
          {showLaneChart && <LaneAverageChart scores={getFilteredScores()} />}
        </div>

        <div>
          <button style={buttonStyle} onClick={() => setShowOpponentChart(prev => !prev)}>
            {showOpponentChart ? "▼" : "►"} Average Score by Opponent
          </button>
          {showOpponentChart && <OpponentAverageChart scores={getFilteredScores()} />}
        </div>

        <h2>Team Stats (High games, series, and fantasy points for a week based on starters for the week)</h2>
        {stats ? <StatsTable stats={stats} /> : <p>No stats available for this team.</p>}
      </div>
      <Footer />
    </div>
  );
};

export default TeamFantasyStats;