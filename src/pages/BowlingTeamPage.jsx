import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PlayerStatsTable from "../../components/PlayerStatsTable.jsx";
import StatsTable from "../../components/StatsTable.jsx";
import BowlerAveragesChart from "../../components/BowlerAveragesChart.jsx";
import LaneAverageChart from "../../components/LaneAverageChart.jsx";
import OpponentAverageChart from "../../components/OpponentAverageChart.jsx";
import { AuthContext } from "../utils/AuthContext.jsx";
import { getTeamPlayers } from "../utils/api.js";
import { calculateTeamStats } from "../utils/calculateTeamStats.js";
import { getBowlerAverages } from "../utils/getBowlerAverages.js";
import { getAverageByLane } from "../utils/getAverageByLane.js";
import { getAverageByOpponent } from "../utils/getAverageByOpponent.js";
import { useWeekRange } from "../../hooks/useWeekRange.js";
import { getThemeColors } from "../utils/themeColors.js";
import "../styles/GraphPageStats.css";

const BowlingTeamPage = () => {
  const { teamName, league } = useParams();
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

  const getFilteredScores = (data) => {
    if (!data?.players) return [];

    return data.players.flatMap(player =>
      player.weekScores?.filter(score => {
        const week = parseInt(score.week, 10);
        return (!startWeek || week >= parseInt(startWeek)) &&
               (!endWeek || week <= parseInt(endWeek));
      }) || []
    );
  };

  useEffect(() => {
    const fetchTeamPlayers = async () => {
      try {
        const response = await getTeamPlayers(teamName);
        setTeamData(response.data);
      } catch (error) {
        console.error("Failed to fetch team players:", error);
      }
    };
    fetchTeamPlayers();
  }, [teamName]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("menuOpen");
    } else {
      document.body.classList.remove("menuOpen");
    }
  }, [isMenuOpen]);
  
  useEffect(() => {
    if (!teamData) return;

    const filteredScores = getFilteredScores(teamData);
    const combinedStats = calculateTeamStats(filteredScores);
    const lanes = getAverageByLane(teamData.players);
    const opponents = getAverageByOpponent(teamData.players);

    setStats({ ...combinedStats, lanes, opponents });
  }, [teamData, startWeek, endWeek]);

  const averageByName = teamData?.players
    ? getBowlerAverages(teamData.players, startWeek, endWeek)
    : [];

  if (loading || !teamData?.players?.length) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer graphPageStats">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Stats For {teamName} - {league}</h1>

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
          {showLaneChart && <LaneAverageChart scores={getFilteredScores(teamData)} />}
        </div>

        <div>
          <button style={buttonStyle} onClick={() => setShowOpponentChart(prev => !prev)}>
            {showOpponentChart ? "▼" : "►"} Average Score by Opponent
          </button>
          {showOpponentChart && <OpponentAverageChart scores={getFilteredScores(teamData)} />}
        </div>

        <h2>Team Stats</h2>
        {stats ? <StatsTable stats={stats} /> : <p>No stats available for this team.</p>}
      </div>
      <Footer />
    </div>
  );
};

export default BowlingTeamPage;