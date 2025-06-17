import { useState, useEffect, useContext } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen";
import PlayerRosterGrid from "../../components/PlayerRosterGrid.jsx";
import WeekSelector from "../../components/WeekSelector.jsx";
import { AuthContext } from "../utils/AuthContext.jsx";
import { getThemeColors } from "../utils/themeColors.js";
import { getCurrentWeek, generateRoster, saveRoster, createTeam } from "../utils/api.js";
import { updatePlayerPosition } from "../utils/updatePlayerPosition.js";
import { fetchRoster } from "../utils/fetchRoster.js";
import { handleRosterSubmit } from "../utils/handleRosterSubmit.js";
import "../styles/Roster.css";

export default function Roster() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { weekNumber } = useParams();
  const [players, setPlayers] = useState(null);
  const [assignedPositions, setAssignedPositions] = useState({});
  const [lockedPlayerIds, setLockedPlayerIds] = useState([]);
  const [lockedPositions, setLockedPositions] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [checkingRegularRoster, setCheckingRegularRoster] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(Number(weekNumber) || null);
  const [firstWeek, setFirstWeek] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { backgroundColor, color, buttonBackground, buttonColor } = getThemeColors(user?.color);

  const themeStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    border: "none",
    cursor: "pointer",
  };

  const buttonStyle = {
    backgroundColor,
    color,
  };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    if (user && currentWeek !== null) {
      fetchRoster({
        user,
        currentWeek,
        navigate,
        setPlayers,
        setAssignedPositions,
        setLockedPlayerIds,
        setLockedPositions,
        setPlayersLoaded,
        setCheckingRegularRoster,
        generateRosterForWeek,
      });
    }
  }, [user, currentWeek]);

  useEffect(() => {
    if (weekNumber) {
      setCurrentWeek(Number(weekNumber));
    }
  }, [weekNumber]);

  useEffect(() => {
    async function fetchWeekData() {
      try {
        const response = await getCurrentWeek();
        const { totalWeeks, currentWeek: fetchedWeek, firstWeek } = response.data;
        setTotalWeeks(totalWeeks);
        setFirstWeek(firstWeek);
        if (currentWeek === null) {
          setCurrentWeek(fetchedWeek);
        }
      } catch (error) {
        console.error("Error fetching week data:", error);
      }
    }

    fetchWeekData();
  }, [currentWeek]);

  const generateRosterForWeek = async (teamId, week) => {
    try {
      const response = await generateRoster(teamId, week);
      if (response.status === 200) {
        await fetchRoster({
          user,
          currentWeek,
          navigate,
          setPlayers,
          setAssignedPositions,
          setLockedPlayerIds,
          setLockedPositions,
          setPlayersLoaded,
          setCheckingRegularRoster,
          generateRosterForWeek,
        });
      }
    } catch (error) {
      console.error("Error generating roster:", error);
    }
  };

  const updatePosition = (id, newPosition) => {
    setPlayers(prevPlayers => {
      const { updatedPlayers, updatedAssigned } = updatePlayerPosition(
        prevPlayers,
        assignedPositions,
        id,
        newPosition,
        alert
      );

      setAssignedPositions(updatedAssigned);
      return updatedPlayers;
    });
  };

  const handleSubmit = () => {
    handleRosterSubmit({
      players,
      user,
      currentWeek,
      lockedPlayerIds,
      saveRoster,
      setPlayers,
      alert,
      reload: true,
    });
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert("Please enter a team name.");
      return;
    }
    try {
      const response = await createTeam(user.id, teamName);
      if (response.status === 200) {
        alert("Team created successfully!");
        window.location.reload();
      } else {
        alert("Error creating team.");
      }
    } catch (error) {
      console.error("Create team error:", error);
      alert("Server error.");
    }
  };

  // Week change logic
  const handleWeekChange = (e) => {
    navigate(`/roster/week/${e.target.value}`);
  };

  const goToPreviousWeek = () => {
    navigate(`/roster/week/${currentWeek - 1}`);
    window.location.reload();
  };

  const goToNextWeek = () => {
    navigate(`/roster/week/${currentWeek + 1}`);
    window.location.reload();
  };

  if (checkingRegularRoster) return null;

  if (loading || (players === null && user?.team)) {
    return <LoadingScreen />;
  }

  if (!user || !["ADMIN", "MANAGER", "SUPERADMIN"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="pageContainer rosterpage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1 className="pageTitle">
          Roster{user.team ? ` - Week ${currentWeek}` : ""}
        </h1>

        {!user.team && (
          <>
            {!showCreateTeamForm ? (
              <button
                style={themeStyle}
                className="createTeamToggleButton"
                onClick={() => setShowCreateTeamForm(true)}
              >
                Create Team
              </button>
            ) : (
              <div className="createTeamForm">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                />
                <button onClick={handleCreateTeam}>Submit</button>
              </div>
            )}
          </>
        )}

        {user.team && (
          <>
              <div className="weekSelectorContainer">
            <WeekSelector
              weekNumber={currentWeek?.toString()}
              totalWeeks={totalWeeks}
              firstWeek={firstWeek}
              onWeekChange={handleWeekChange}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              buttonStyle={buttonStyle}
            />

            {players.length > 0 && (
              <button
                style={buttonStyle}
                className="viewRosterButton"
                onClick={() => navigate("/regular-roster")}
              >
                View Regular Roster
              </button>
            )}
            </div>
            <PlayerRosterGrid
              players={players}
              updatePosition={updatePosition}
              lockedPositions={lockedPositions}
              currentWeek={currentWeek}
              themeStyle={themeStyle}
            />

            {players.length > 0 && (
              <button
                style={buttonStyle}
                onClick={handleSubmit}
                className="submitLineupButton"
              >
                Submit Lineup for Week {currentWeek}
              </button>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}