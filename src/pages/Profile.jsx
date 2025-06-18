import { useEffect, useState, useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext.jsx";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import Claims from "../../components/Claims.jsx";
import { MatchupTable } from "../../components/MatchupTable.jsx";
import { fetchAllClaims, getCurrentWeek, getRostersForWeek, 
  getWeekScoreForWeek, getStarredMessages,
  getRecentMatches, } from "../utils/api.js";
import { fetchCompletedWeeks } from "../utils/weekHelpers.js";
import { getThemeColors } from "../utils/themeColors.js";
import { calculateFantasyPoints } from "../utils/FantasyPoints.js";
import "../styles/Profile.css";

const Profile = () => {
  // Context
  const { user, loading, team } = useContext(AuthContext);

  // State
  const [myClaims, setMyClaims] = useState([]);
  const [allClaims, setAllClaims] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [enrichedMatches, setEnrichedMatches] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [starredMessages, setStarredMessages] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          claim.teams.some((t) => t.id === user.team?.id)
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

      if (isCompleted) {
        return match;
      }

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

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="pageContainer profile">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <div>
          <h1>Profile</h1>
  
          {/* Claims Section */}
          <Claims myClaims={myClaims} />
  
          {/* Team's Recent Schedule (only if user has a team) */}
          {user.team && (
            <MatchupTable
              matches={enrichedMatches}
              teamName={user.team.name}
              completedWeeks={completedWeeks}
              currentWeek={currentWeek}
            />
          )}
  
          {/* Edit Team Info Button */}
          <Link to="/edit-team" style={buttonStyle} className="edit-team-button">
            Customize My Profile
          </Link>
  
          {/* Starred Messages */}
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
      </div>
      <Footer />
    </div>
  );
};

export default Profile;