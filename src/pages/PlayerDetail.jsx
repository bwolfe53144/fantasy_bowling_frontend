import { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PlayerStatsTable from "../../components/PlayerStatsTable.jsx";
import LaneAverageChart from "../../components/LaneAverageChart.jsx";
import OpponentAverageChart from "../../components/OpponentAverageChart.jsx";
import PlayerBadgeDisplay from "../../components/PlayerBadgeDisplay.jsx";
import PlayerRankTable from "../../components/PlayerRankTable.jsx";
import StatsTable from "../../components/StatsTable.jsx";
import { AuthContext } from "../utils/AuthContext.jsx";
import { getPlayerByName, fetchAllClaims, deleteClaim, dropPlayer } from "../utils/api.js";
import { useModal } from "../../hooks/useModal.js";
import Modal from "../../components/Modal.jsx"; 
import { calculateStats } from "../utils/calculateStats.js";
import { useWeekRange } from "../../hooks/useWeekRange.js";
import { getThemeColors } from "../utils/themeColors.js";
import { ThemeContext } from "../utils/ThemeContext.jsx";
import "../styles/GraphPageStats.css";

const PlayerDetail = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const { playerName } = useParams();
  const decodedName = decodeURIComponent(playerName);
  const [playerData, setPlayerData] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLaneChart, setShowLaneChart] = useState(false);
  const [showOpponentChart, setShowOpponentChart] = useState(false);
  const [showClaimDropdown, setShowClaimDropdown] = useState(false);
  const [eligibleActions, setEligibleActions] = useState([]);
  const [modalProps, showModal] = useModal();

  const navigate = useNavigate();

  const maxWeek = Math.max(...(playerData?.weekScores?.map(w => parseInt(w.week, 10)) || [1]));
  const { startWeek, endWeek, handleStartWeekChange, handleEndWeekChange } = useWeekRange(maxWeek);
  const { buttonBackground, buttonColor, backgroundColor, color } = getThemeColors(user?.color, isDarkMode);

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
  
        // Filter out players with no weekScores
        const filteredPlayers = response.data.players.filter(
          (p) => p.weekScores && p.weekScores.length > 0
        );
  
        setPlayerData({
          ...response.data,
          players: filteredPlayers,
        });
      } catch (error) {
        console.error("Failed to fetch player:", error);
      }
    };
  
    fetchPlayer();
  }, [decodedName]);

  // Compute eligible actions
  useEffect(() => {
    if (!playerData || !user) return;

    const computeEligibleActions = async () => {
      const allowedRoles = ["MANAGER", "ADMIN", "SUPERADMIN"];
      if (!allowedRoles.includes(user.role)) return;
    
      // Fetch all current unresolved claims (still needed)
      const { data } = await fetchAllClaims();
      const allClaims = data.allClaimedPlayers || [];
    
      const myTeamName = user.team?.name?.trim()?.toLowerCase();
    
      const actions = playerData.players
        .filter(p => p.league !== "Heyden Classic") // optional filter
        .map(p => {
          const isOnMyTeam = p.team?.name?.trim()?.toLowerCase() === myTeamName;
          const isOnOtherTeam = p.team && !isOnMyTeam;
    
          // Determine if player is already involved in a trade
          const inTrade = p.tradePlayers?.some(tp => {
            const trade = tp.trade;
            if (!trade) return false;
          
            return trade.status === "ACCEPTED" || trade.fromTeamId === user.team?.id;
          });
    
          // Determine if there's an unresolved claim by your team
          const myClaim = allClaims.find(
            c =>
              c.playerName.toLowerCase() === p.name.toLowerCase() &&
              c.teams.some(t => t.name?.trim()?.toLowerCase() === myTeamName)
          );
    
          if (myClaim) return { player: p, actionType: "removeClaim" };
          if (inTrade) return { player: p, actionType: "inTrade" };
          if (isOnMyTeam) return { player: p, actionType: "drop" };
          if (isOnOtherTeam) return { player: p, actionType: "trade" };
    
          // Free agent
          return { player: p, actionType: "add" };
        })
        .filter(Boolean);
    
      setEligibleActions(actions);
    };

    computeEligibleActions();
  }, [playerData, user]);

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
    return adjustedGameScores.reduce((sum, g) => sum + g, 0) / adjustedGameScores.length;
  };

  const avgWithHandicap = calculateAvgWithWeekHandicap(scores);
  const firstName = decodedName.split(" ")[0];

  const handleAddPlayer = (player) => {
    navigate(`/drop-player/${player.id}/${encodeURIComponent(player.name)}/${player.league}/${player.position}`);
  };

  const handleDropPlayer = async (player) => {
    const confirmed = await showModal({
      title: "Confirm Drop Player",
      message: `Are you sure you want to drop ${player.name} from ${player.league}?`,
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });
  
    if (!confirmed) return;
  
    try {
      await dropPlayer(player.id, user.team.id);   
  
      // Refresh player data so UI updates
      const response = await getPlayerByName(decodedName);
      setPlayerData(response.data);
  
      await showModal({
        title: "Success",
        message: `${player.name} has been dropped.`,
        confirmText: "OK",
      });
    } catch (err) {
      console.error("Error dropping player:", err);
      await showModal({
        title: "Error",
        message: `Failed to drop ${player.name}.`,
        confirmText: "OK",
      });
    }
  };

  const handleRemoveClaim = async (player) => {
    const confirmed = await showModal({
      title: "Confirm Remove Claim",
      message: `Are you sure you want to remove the claim for ${player.name}?`,
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });
    if (!confirmed) return;

    try {
      await deleteClaim(player.id, user.id, user.token);

      const response = await getPlayerByName(decodedName);
      setPlayerData(response.data);

      await showModal({
        title: "Success",
        message: "Claim removed.",
        confirmText: "OK",
      });
    } catch (err) {
      console.error("Error removing claim:", err);
      await showModal({
        title: "Error",
        message: "Failed to remove claim.",
        confirmText: "OK",
      });
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="pageContainer graphPageStats">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Player: {decodedName}</h1>

        {/* Player Action Dropdown */}
        {eligibleActions.length > 0 && (
          <div className="claim-container">
            <button style={buttonStyle} onClick={() => setShowClaimDropdown(!showClaimDropdown)}>
              {showClaimDropdown ? "▼" : "►"} Player Options
            </button>
            {showClaimDropdown && (
              <div className="claim-dropdown">
                {eligibleActions.map(({ player, actionType }) => {
                  let color = "";
                  let label = "";

                  switch (actionType) {
                    case "add":
                      color = "green";
                      label = "Add";
                      break;
                    case "drop":
                      color = "orange";
                      label = "Drop";
                      break;
                    case "trade":
                      color = "blue";
                      label = "Propose Trade";
                      break;
                    case "removeClaim":
                      color = "red";
                      label = "Remove Claim";
                      break;
                    case "inTrade":
                      color = "red";
                      label = "Currently in Trade";
                      break;
                    default:
                      break;
                  }

                  const teamDisplay =
                    player.team?.name && actionType !== "inTrade" ? `(${player.team.name})` : "";

                  return (
                    <div
                      key={`${player.id}-${player.league}-${player.position}`}
                      className="claim-option"
                      style={{
                        color,
                        cursor: actionType === "inTrade" ? "not-allowed" : "pointer",
                      }}
                      onClick={() => {
                        if (actionType === "add") handleAddPlayer(player);
                        if (actionType === "drop") handleDropPlayer(player);
                        if (actionType === "trade") {
                          window.location.href = `/propose-trade/${player.team.name}/${player.id}`;
                        }
                        if (actionType === "removeClaim") handleRemoveClaim(player);
                      }}
                    >
                      {player.league} - {player.position} {teamDisplay} {label && `[${label}]`}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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

        {availableLeagues.length > 1 && (
          <div>
            <label>Filter by League </label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
            >
              {availableLeagues.map((league, idx) => (
                <option key={`${league}-${idx}`} value={league}>{league}</option>
              ))}
            </select>
          </div>
        )}

        <div className="week-filters">
          <label>
            Start Week:
            <input type="number" min="1" max={maxWeek} value={startWeek} onChange={handleStartWeekChange} />
          </label>
          <label>
            End Week:
            <input type="number" min="1" max={maxWeek} value={endWeek} onChange={handleEndWeekChange} />
          </label>
        </div>

        <div>
          <button style={buttonStyle} onClick={() => setShowLaneChart(!showLaneChart)}>
            {showLaneChart ? "▼" : "►"} Average Score by Lane
          </button>
          {showLaneChart && <LaneAverageChart scores={scores} />}
        </div>

        <div>
          <button style={buttonStyle} onClick={() => setShowOpponentChart(!showOpponentChart)}>
            {showOpponentChart ? "▼" : "►"} Average Score by Opponent
          </button>
          {showOpponentChart && <OpponentAverageChart scores={scores} />}
        </div>

        {stats ? (
          <StatsTable stats={stats} avgWithHandicap={avgWithHandicap} isSinglePlayer />
        ) : (
          <p>No stats available for this player.</p>
        )}

        <PlayerRankTable
          players={playerData?.players || []}
          headerBg={backgroundColor}
          headerColor={color}
          displayName={firstName}
        />

        <PlayerBadgeDisplay
          players={playerData?.players || []}
          displayName={firstName}
        />
      </div>
      {modalProps && <Modal {...modalProps} />}
      <Footer />
    </div>
  );
};

export default PlayerDetail;

