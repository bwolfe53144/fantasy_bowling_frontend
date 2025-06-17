import { useEffect, useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import { getCurrentWeek, getTeamByName, dropPlayer } from "../utils/api";
import { handleSaveRegularRoster } from "../utils/handleSaveRegularRoster";
import { getThemeColors } from "../utils/themeColors";
import { processPlayerStats } from "../utils/ProcessPlayerStats";
import "../styles/RegularRoster.css";

export default function RegularRoster() {
  const { user, loading } = useContext(AuthContext);
  const [players, setPlayers] = useState([]);
  const [assignedPositions, setAssignedPositions] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [weeks, setWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [teamWithScores, setTeamWithScores] = useState(null);

  const flexBenchPool = Array.from({ length: 9 }, (_, i) => `Flex Bench ${i + 1}`);

  const { backgroundColor, color, buttonBackground, buttonColor } = getThemeColors(user?.color);

  const buttonStyle = {
    backgroundColor: backgroundColor,
    color: color,
    border: "none",
    cursor: "pointer",
  };

  const themeStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
  };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  // === Fetch Current Week & All Weeks ===
  useEffect(() => {
    const fetchCurrentWeekAndWeeks = async () => {
      try {
        const response = await getCurrentWeek();
        const { currentWeek: fetchedCurrentWeek, weeks: fetchedWeeks } = response.data;

        if (Array.isArray(fetchedWeeks)) {
          const sortedWeeks = fetchedWeeks.sort((a, b) => a - b);
          setWeeks(sortedWeeks);
        }

        if (fetchedCurrentWeek && fetchedCurrentWeek !== currentWeek) {
          setCurrentWeek(fetchedCurrentWeek);
        }
      } catch (error) {
        console.error("Failed to fetch current week and weeks:", error);
      }
    };

    fetchCurrentWeekAndWeeks();
  }, []);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (user?.team?.name) {
        try {
          const res = await getTeamByName(user.team.name);
          setTeamWithScores(res.data);
        } catch (err) {
          console.error("Error fetching team data:", err);
        }
      }
    };

    fetchTeamData();
  }, [user]);

  // === Initialize Players When Team Data Loads ===
  useEffect(() => {
    if (teamWithScores?.players?.length) {
      const usedPositions = new Set();

      const initialized = teamWithScores.players.map(player => {
        const primary = player.position;
        let setPosition = player.setPosition || "";

        if (setPosition && usedPositions.has(setPosition)) {
          setPosition = flexBenchPool.find(fb => !usedPositions.has(fb)) || "";
        }

        if (setPosition) usedPositions.add(setPosition);

        const stats = processPlayerStats(player);
        return {
          ...player,
          setPosition,
          allowedPositions: [primary, "Flex", ...flexBenchPool],
          avg: stats.average.toFixed(1),
          avgFanppg: stats.avgFanppg?.toFixed(1) || "0.0",
          totalPoints: stats.totalPoints?.toFixed(1) || "0.0",
        };
      });

      const initAssignments = initialized.reduce((acc, p) => {
        acc[p.id] = p.setPosition;
        return acc;
      }, {});

      const sorted = [...initialized].sort((a, b) => {
        const posA = a.position || "";
        const posB = b.position || "";
        if (posA === posB) return a.name.localeCompare(b.name);
        return posA.localeCompare(posB);
      });

      setPlayers(sorted);
      setAssignedPositions(initAssignments);
    }
  }, [teamWithScores]);

  // === Update Position Handler ===
  const updatePosition = (id, newPosition) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, setPosition: newPosition }
          : p.setPosition === newPosition
            ? { ...p, setPosition: "" }
            : p
      )
    );

    setAssignedPositions(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(pid => {
        if (parseInt(pid) !== id && updated[pid] === newPosition) {
          updated[pid] = "";
        }
      });
      updated[id] = newPosition;
      return updated;
    });
  };

  const dropMyPlayer = async (playerId) => {
    if (!window.confirm("Are you sure you want to drop this player?")) return;

    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return alert("Player not found.");

      await dropPlayer(playerId, user.team.id);
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      alert(`${player.name} has been dropped from the roster.`);
    } catch (err) {
      console.error("Error dropping player:", err);
      alert("Failed to drop player.");
    }
  };

  if (loading || !teamWithScores || players.length === 0) {
    return <LoadingScreen />;
  }

  if (!user || !["ADMIN", "MANAGER", "SUPERADMIN"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="pageContainer regularRosterPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
      <div className="roster-content">

        <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Set Your Regular Roster</h1>
        <p>This is your default lineup for all weeks that haven't started. You can edit week-by-week later.</p>

        <div className="regroster-table-wrapper">
          <table className="roster-table">
            <thead>
              <tr> 
                <th style={themeStyle}>Name (Position)</th>
                <th style={themeStyle}>Set Position</th>
                <th style={themeStyle}>Average</th>
                <th style={themeStyle}>Total Points</th>
                <th style={themeStyle}>Avg Fantasy PPG</th>
                <th style={themeStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id}>
                  <td>{player.name} ({player.allowedPositions[0]})</td>
                  <td>
                    <select
                      value={player.setPosition || ""}
                      onChange={(e) => updatePosition(player.id, e.target.value)}
                    >
                      <option value="">Select Position</option>
                      {player.allowedPositions.map((pos, idx) => (
                        <option key={`${player.id}-${idx}`} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{player.avg}</td>
                  <td>{player.totalPoints}</td>
                  <td>{player.avgFanppg}</td>
                  <td>
                    <button
                      className="drop-button"
                      onClick={() => dropMyPlayer(player.id)}
                    >
                      Drop
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          className="submitLineupButton"
          style={buttonStyle}
          onClick={() =>
            handleSaveRegularRoster({
              players,
              user,
              currentWeek,
              flexBenchPool,
              setIsSaving,
            })
          }
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Regular Roster"}
        </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}