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
import { getTeamPlayers, getTeamRanks } from "../utils/api.js";
import { calculateTeamStats } from "../utils/calculateTeamStats.js";
import { getBowlerAverages } from "../utils/getBowlerAverages.js";
import { getAverageByLane } from "../utils/getAverageByLane.js";
import { getAverageByOpponent } from "../utils/getAverageByOpponent.js";
import { useWeekRange } from "../../hooks/useWeekRange.js";
import { getThemeColors } from "../utils/themeColors.js";
import { ThemeContext } from "../utils/ThemeContext.jsx";
import "../styles/GraphPageStats.css";

const BowlingTeamPage = () => {
  const { teamName, league } = useParams();
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [teamData, setTeamData] = useState(null);
  const [teamRank, setTeamRank] = useState(null);
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

  const { buttonColor, buttonBackground } = getThemeColors(user?.color, isDarkMode);

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
    const fetchData = async () => {
      try {
        const [teamRes, rankRes] = await Promise.allSettled([
          getTeamPlayers(teamName),
          getTeamRanks(league, teamName)
        ]);
  
        if (teamRes.status === "fulfilled") {
          setTeamData(teamRes.value.data);
        } else {
          console.error("Failed to fetch team data:", teamRes.reason);
        }
  
        if (rankRes.status === "fulfilled") {
          setTeamRank(rankRes.value.data.rank);
        } else {
          // Only log if it's not a simple 404
          const status = rankRes.reason?.response?.status;
          if (status !== 404) {
            console.error("Failed to fetch team rank:", rankRes.reason);
          }
        }
      } catch (error) {
        console.error("Unexpected error fetching team data:", error);
      }
    };
  
    fetchData();
  }, [teamName, league]);

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

  const getPercentClass = (percent) => {
    if (percent === 100) return "rank-tan";
    if (percent >= 99) return "rank-pink";
    if (percent >= 95) return "rank-orange";
    if (percent >= 75) return "rank-purple";
    if (percent >= 50) return "rank-blue";
    if (percent >= 25) return "rank-green";
    return "rank-grey";
  };

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
        <PlayerStatsTable players={teamData.players} isTeamPage={true} />

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

        {teamRank ? (
          <>
            <h2>Team Rankings</h2>
            <table className="statTable">
              <thead>
                <tr>
                  <th>Average</th>
                  <th>Fan Points</th>
                  <th>Fan PPG</th>
                  <th>Series</th>
                  <th>Pinfall</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {teamRank.avgRank ? (
                      <>
                        {teamRank.avgRank}{" "}
                        <span className={getPercentClass(teamRank.avgPercent ?? 0)}>
                          ({teamRank.avgPercent ?? 0}%)
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {teamRank.fanPoints ? (
                      <>
                        {teamRank.fanPoints}{" "}
                        <span className={getPercentClass(teamRank.fanPercent ?? 0)}>
                          ({teamRank.fanPercent ?? 0}%)
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {teamRank.fanPPG ? (
                      <>
                        {teamRank.fanPPG}{" "}
                        <span className={getPercentClass(teamRank.fanPPGPercent ?? 0)}>
                          ({teamRank.fanPPGPercent ?? 0}%)
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {teamRank.seriesRank ? (
                      <>
                        {teamRank.seriesRank}{" "}
                        <span className={getPercentClass(teamRank.seriesPercent ?? 0)}>
                          ({teamRank.seriesPercent ?? 0}%)
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {teamRank.pinfallRank ? (
                      <>
                        {teamRank.pinfallRank}{" "}
                        <span className={getPercentClass(teamRank.pinfallPercent ?? 0)}>
                          ({teamRank.pinfallPercent ?? 0}%)
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : null}
      </div>
      <Footer />
    </div>
  );
};

export default BowlingTeamPage;