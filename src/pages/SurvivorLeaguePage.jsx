import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import {
  getSurvivorEntriesForLeague,
  getSurvivorUserPicks,
  getEligibleSurvivorPlayers,
  submitSurvivorPicks,
} from "../utils/api";
import "../styles/Survivor.css";

const SurvivorLeaguePage = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const [eligiblePlayers, setEligiblePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState(["", "", "", "", ""]);
  const [showPickSection, setShowPickSection] = useState(false);

  const { league } = useParams();

  const { buttonBackground, buttonColor, color, backgroundColor } = getThemeColors(user?.color, isDarkMode);
  const buttonStyle = { 
    backgroundColor: buttonBackground, 
    color: buttonColor, 
    marginTop: "2rem",
    maxWidth: "220px"
  };
  const headerStyle = { color, backgroundColor };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await getSurvivorEntriesForLeague(league);
        setEntries(response.data.entries || []);
      } catch (error) {
        console.error("Failed to fetch survivor entries:", error);
      } finally {
        setLoadingEntries(false);
      }
    };

    fetchEntries();
  }, [league]);

  const leagueCutoffs = {
    "Sunday AM": 0.4,
    "Cheris Night Out": 0.6,
    "Ren Faire": 0.3,
    "Beavers Latestarters": 0.3,
    "Andys Classic": 0.25,
    "Heyden Classic": 0.4,
  };

  const cutoff = leagueCutoffs[league];
  const cutoffText = `Each week, your chosen bowler must finish in the top ${Math.round(cutoff * 100)}% of scores in this league to advance.`;

  const userEntry = entries.find((entry) => entry.userId === user?.id);
  const winnerEntry = entries.find((entry) => entry.winnerStatus === "winner");

  const sortedEntries = [...entries].sort((a, b) => {
    if (!a.eliminated && b.eliminated) return -1;
    if (a.eliminated && !b.eliminated) return 1;
    if (a.eliminated && b.eliminated) {
      return b.eliminatedWeek - a.eliminatedWeek;
    }
    return 0;
  });

  const handleOpenPickSection = async () => {
    if (!userEntry) return;
    try {
      const [playersRes, picksRes] = await Promise.all([
        getEligibleSurvivorPlayers(league, userEntry.teamName),
        getSurvivorUserPicks(league, userEntry.teamName, user.id),
      ]);

      setEligiblePlayers(playersRes.data.players || []);
      const currentPicks = picksRes.data.picks || [];

      const initialSelected = Array(5).fill("");
      currentPicks.forEach((pick, i) => {
        if (i < 5) {
          initialSelected[i] = pick.playerId;
        }
      });

      setSelectedPlayers(initialSelected);
      setShowPickSection(true);
    } catch (error) {
      console.error("Failed to fetch players or picks:", error);
    }
  };

  const handleSelectPlayer = (index, playerId) => {
    const updated = selectedPlayers.map((id, i) =>
      i !== index && id === playerId ? "" : id
    );
    updated[index] = playerId;
    setSelectedPlayers(updated);
  };

  const handleSubmitPick = async () => {
    if (selectedPlayers.includes("") || new Set(selectedPlayers).size < 5) {
      alert("Please select 5 unique players before submitting.");
      return;
    }

    const picks = selectedPlayers.map((playerId, i) => ({
      playerId,
      rank: i + 1,
    }));

    try {
      await submitSurvivorPicks(league, userEntry.teamName, picks);
      alert("Picks submitted successfully!");
      setShowPickSection(false);
      setSelectedPlayers(["", "", "", "", ""]);
      const response = await getSurvivorEntriesForLeague(league);
      setEntries(response.data.entries || []);
    } catch (error) {
      console.error("Failed to submit picks:", error);
      alert("Failed to submit picks. Please try again.");
    }
  };

  if (loading || loadingEntries) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage survivor">
        <h1>Survivor League: {league}</h1>

        {winnerEntry && (
          <div className="winnerBanner">
            <h2>🏆 Winner: {winnerEntry.teamName}</h2>
          </div>
        )}

        <h2>Leaderboard</h2>
        {sortedEntries.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <table className="survivorLeaderboard">
            <thead style={headerStyle}>
              <tr>
                <th>Team Name</th>
                <th>Eliminated</th>
                <th>User</th>
                <th>View Picks</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry) => {
                const userName = entry.user
                  ? `${entry.user.firstname} ${entry.user.lastname ? entry.user.lastname.charAt(0) : ""}.`
                  : "Unknown";
                const eliminatedText = entry.eliminated
                  ? `Week ${entry.eliminatedWeek || "?"}`
                  : "Active";
                const encodedTeamName = encodeURIComponent(entry.teamName);

                return (
                  <tr key={entry.id}>
                    <td>{entry.teamName}</td>
                    <td>{eliminatedText}</td>
                    <td>{userName}</td>
                    <td>
                      <Link to={`/survivor/${encodeURIComponent(league)}/${encodedTeamName}`}>
                        View Picks
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {userEntry && !userEntry.eliminated && !winnerEntry && (
          <>
            <button style={buttonStyle} className="survivorAction" onClick={handleOpenPickSection}>
              Make your picks
            </button>

            {showPickSection && (
              <div className="pickSection">
                <h3>Select your lineup (1–5)</h3>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="pickRow">
                    <label>Spot {i + 1} </label>
                    <select
                      value={selectedPlayers[i]}
                      onChange={(e) => handleSelectPlayer(i, e.target.value)}
                    >
                      <option value="">-- Select Player --</option>
                      {eligiblePlayers.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={selectedPlayers.includes(p.id) && selectedPlayers[i] !== p.id}
                        >
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <button className="survivorAction" onClick={handleSubmitPick}>
                  Submit Lineup
                </button>
                <button className="cancelButton" onClick={() => {
                  setShowPickSection(false);
                  setSelectedPlayers(["", "", "", "", ""]);
                }}>
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
        <h2>Rules</h2>
        <p>{cutoffText}</p>

        {!userEntry && (
          <p className="noEntryNotice">
            You don't have an entry in this league.
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SurvivorLeaguePage;