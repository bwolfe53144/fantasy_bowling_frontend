import { useEffect, useState, useContext } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext.jsx";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import Claims from "../../components/Claims.jsx";
import { MatchupTable } from "../../components/MatchupTable.jsx";
import PlayerBadgeDisplay from "../../components/PlayerBadgeDisplay.jsx";
import PlayerRankTable from "../../components/PlayerRankTable.jsx";
import {
  fetchAllClaims,
  getCurrentWeek,
  getRostersForWeek,
  getWeekScoreForWeek,
  getStarredMessages,
  getRecentMatches,
  getPlayerByName,
  getCurrentWeekLocksByLeague,
  getUserSurvivorEntries,
  getTrades,
  markTradeViewed,
} from "../utils/api.js";
import { fetchCompletedWeeks } from "../utils/weekHelpers.js";
import { getThemeColors } from "../utils/themeColors.js";
import { ThemeContext } from "../utils/ThemeContext.jsx";
import { calculateFantasyPoints } from "../utils/FantasyPoints.js";
import PlayerStatsTable from "../../components/PlayerStatsTable.jsx";

import "../styles/Profile.css";

const Profile = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [myClaims, setMyClaims] = useState([]);
  const [allClaims, setAllClaims] = useState([]);
  const [myTrades, setMyTrades] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [enrichedMatches, setEnrichedMatches] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [starredMessages, setStarredMessages] = useState([]);
  const [myPlayerStats, setMyPlayerStats] = useState(null);
  const [mySurvivorLeagues, setMySurvivorLeagues] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentWeekLocksByLeague, setCurrentWeekLocksByLeague] = useState([]);
  const [showWeekLocks, setShowWeekLocks] = useState(false);
  const navigate = useNavigate();
  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);

  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    minWidth: "90px",
    margin: "1rem",
    border: "none",
    cursor: "pointer",
  };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    (async () => {
      try {
        const weeks = await fetchCompletedWeeks();
        setCompletedWeeks(weeks);
      } catch (err) {
        console.error("Error fetching completed weeks:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
  
    (async () => {
      try {
        const res = await getCurrentWeekLocksByLeague();
        console.log("Current Week Locks by League:", res.data);
        setCurrentWeekLocksByLeague(res.data);
      } catch (err) {
        console.error("Error fetching current week locks by league:", err);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const res = await getStarredMessages(user.id);
        setStarredMessages(res.data);
      } catch (err) {
        console.error("Error fetching starred messages:", err);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const weekRes = await getCurrentWeek();
        setCurrentWeek(weekRes.data.currentWeek);
        const claimsRes = await fetchAllClaims();
        const all = claimsRes.data.allClaimedPlayers || [];
        setAllClaims(all);

        const mine = all.filter((claim) =>
          user?.team?.id ? claim.teams.some((t) => t.id === user.team.id) : false
        );
        setMyClaims(mine);
      } catch (err) {
        console.error("Error fetching claims or current week:", err);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user?.team?.id || currentWeek === null) return;

    (async () => {
      try {
        const res = await getRecentMatches(user.team.name, currentWeek);
        setRecentMatches(res.data);
      } catch (err) {
        console.error("Error fetching recent matches:", err);
      }
    })();
  }, [user, currentWeek]);

  useEffect(() => {
    if (!user?.team?.id) return;

    (async () => {
      try {
        const res = await getTrades();
        const trades = res.data || [];
        setAllTrades(trades);

        const mine = trades.filter(
          (t) => user?.team?.id ? t.fromTeamId === user.team.id || t.toTeamId === user.team.id : false
        );
        setMyTrades(mine);
      } catch (err) {
        console.error("Error fetching trades:", err);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const res = await getUserSurvivorEntries(user.id);
        setMySurvivorLeagues(res.data || []);
      } catch (err) {
        console.error("Error fetching survivor entries:", err);
      }
    })();
  }, [user]);

  const enrichMatchesWithScores = async (matches) => {
    const uniqueWeeks = [...new Set(matches.map((m) => m.week))];

    const weekData = await Promise.all(
      uniqueWeeks.map(async (week) => {
        const [rostersRes, scoresRes] = await Promise.all([
          getRostersForWeek(week),
          getWeekScoreForWeek(week),
        ]);
        return {
          week,
          rosters: rostersRes.data,
          scores: scoresRes.data,
        };
      })
    );

    const weekTeamScores = {};
    const validPositions = ["1", "2", "3", "4", "5", "Flex"];

    for (const { week, rosters, scores } of weekData) {
      const teamScores = {};
      rosters
        .filter((r) => validPositions.includes(r.position))
        .forEach((r) => {
          if (!teamScores[r.teamId]) teamScores[r.teamId] = 0;

          const playerScores = scores.filter((s) => s.playerId === r.playerId);
          const playerFantasyPoints = calculateFantasyPoints(playerScores);

          teamScores[r.teamId] += playerFantasyPoints;
        });

      weekTeamScores[week] = teamScores;
    }

    return matches.map((match) => {
      const { week, team1Id, team2Id } = match;
      const isCompleted = completedWeeks.includes(week);
      const scores = weekTeamScores[week] || {};

      if (isCompleted) return match;

      return {
        ...match,
        team1Score: scores[team1Id] ?? 0,
        team2Score: scores[team2Id] ?? 0,
      };
    });
  };

  useEffect(() => {
    if (recentMatches.length === 0) return;

    (async () => {
      try {
        const enriched = await enrichMatchesWithScores(recentMatches);
        setEnrichedMatches(enriched);
      } catch (err) {
        console.error("Error enriching matches:", err);
      }
    })();
  }, [recentMatches, completedWeeks]);

  useEffect(() => {
    if (!user) return;

    const fullName = `${user.firstname} ${user.lastname}`;
    (async () => {
      try {
        const res = await getPlayerByName(fullName);
        setMyPlayerStats(res.data.players || []);
      } catch (err) {
        console.error("Error fetching player stats:", err);
      }
    })();
  }, [user]);

  const allTradesCount = user?.team?.id
    ? allTrades.filter(
        (t) =>
          t.fromTeamId === user.team.id ||
          t.toTeamId === user.team.id ||
          t.status === "ACCEPTED"
      ).length
    : 0;

    const handleToggleWeekLocks = async () => {
      if (!showWeekLocks && currentWeekLocksByLeague.length === 0) {
        try {
          const res = await getCurrentWeekLocksByLeague(); // API call
          setCurrentWeekLocksByLeague(res.data);
          console.log("Week locks:", res.data);
        } catch (err) {
          console.error("Error fetching week locks:", err);
        }
      }
      setShowWeekLocks(prev => !prev);
    };

  const handleTradeClick = async () => {
    if (!myTrades?.length) return;

    const pendingTrade = myTrades.find(
      (t) => t.toTeamId === user.team?.id && t.status === "PENDING"
    );

    if (pendingTrade) {
      try {
        markTradeViewed(pendingTrade.id);
        navigate(`/view-trade/${pendingTrade.id}`);
      } catch (err) {
        console.error("Failed to mark trade as viewed:", err);
      }
    } else {
      navigate(`/view-my-trades`);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="pageContainer profile">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <div>
          <h1>Profile</h1>
          <Link to="/edit-team" style={buttonStyle} className="edit-team-button">
            Customize My Profile
          </Link>
          <Claims myClaims={myClaims} />
          {allClaims.length - myClaims.length > 0 && (
            <Link to="/all-claims">📍 View All Claimed Players</Link>
          )}
          {myTrades.length > 0 && (
            <div>
              <button className="tradeButton" onClick={handleTradeClick}>
                {myTrades.some(t => t.toTeamId === user.team?.id && t.status === "PENDING")
                  ? `📝 ${myTrades.find(t => t.toTeamId === user.team?.id && t.status === "PENDING")?.fromTeam?.name || "Unknown"} requested a trade`
                  : `📝 View My Trades (${myTrades.length})`}
              </button>
            </div>
          )}

          {allTradesCount > 0 && (
            <div style={{ marginTop: "10px" }}>
              <Link to="/view-all-trades">📝 View All Trades ({allTradesCount})</Link>
            </div>
          )}
          <div className="league-locks">
            <button style={buttonStyle} onClick={handleToggleWeekLocks}>
              {showWeekLocks ? "Hide League Lock Times" : "Show League Lock Times"}
            </button>

            {showWeekLocks && currentWeekLocksByLeague.length > 0 && (
              <ul className="lock-times-list">
                {currentWeekLocksByLeague.map((lock, idx) => {
                  const lockDate = new Date(lock.lockTime);
                  const formattedDate = lockDate.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = lockDate.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <li key={idx}>
                      <strong>{lock.league}</strong> - Week {lock.week} - {formattedDate} at {formattedTime}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {myPlayerStats && myPlayerStats.length > 0 && (
            <div>
              <h2>🎳 My Bowling Stats</h2>
              <PlayerStatsTable players={myPlayerStats} isSinglePlayerPage={true} />
            </div>
          )}

          {user?.team?.id && enrichedMatches.length > 0 && (
            <MatchupTable
              matches={enrichedMatches}
              teamName={user.team.name}
              completedWeeks={completedWeeks}
              currentWeek={currentWeek}
            />
          )}

          {mySurvivorLeagues && mySurvivorLeagues.length > 0 && (
            <div>
              <h2>My Survivor Leagues</h2>
              <ul>
                {mySurvivorLeagues.map((entry) => {
                  let statusText = "Active";
                  let statusColor = "green";

                  if (entry.winnerStatus === "winner") {
                    statusText = "Winner";
                    statusColor = "goldenrod";
                  } else if (entry.eliminated) {
                    statusText = "Eliminated";
                    statusColor = "red";
                  }

                  return (
                    <li key={entry.id} style={{ marginBottom: "1rem" }}>
                      <Link to={`/survivor/${entry.league}`}>
                        <strong>{entry.league}</strong>
                      </Link>
                      <div>
                        {entry.teamName}:{" "}
                        <span style={{ color: statusColor, fontWeight: "bold" }}>
                          {statusText}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {starredMessages.length > 0 && (
            <div>
              <h2>⭐ Starred Messages</h2>
              <ul>
                {starredMessages.map((msg) => (
                  <li key={msg.id}>
                    <div>{msg.message.content}</div>
                    <div>
                      From{" "}
                      <span className="font-medium">
                        {msg.message.author?.firstname || "Unknown"}{" "}
                        {msg.message.author?.lastname || ""}
                      </span>{" "}
                      on {new Date(msg.message.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <Link to={`/message/${msg.message.id}`}>View Message</Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <PlayerRankTable
          players={myPlayerStats}
          headerBg={isDarkMode ? "#222" : "#f0f0f0"}
          headerColor={isDarkMode ? "#fff" : "#000"}
        />
        <PlayerBadgeDisplay players={myPlayerStats} />
      </div>
      <Footer />
    </div>
  );
};

export default Profile;

