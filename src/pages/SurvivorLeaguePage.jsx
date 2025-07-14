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

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);
  const buttonStyle = { backgroundColor: buttonBackground, color: buttonColor };

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

  const leagueConfigs = {
    "Sunday AM": {
      rulesText: "Sunday AM rules: You may reuse players twice.",
      allowRepeats: true,
    },
    "Tuesday PM": {
      rulesText: "Tuesday PM: Strict single-use only, must pick before Monday.",
      allowRepeats: false,
    },
    "Pro League": {
      rulesText: "Pro League: Advanced scoring, no repeat players at all.",
      allowRepeats: false,
    },
  };

  const config = leagueConfigs[league] || {
    rulesText: "Standard survivor rules apply.",
    allowRepeats: false,
  };

  const sortedEntries = [...entries].sort((a, b) => {
    if (!a.eliminated && b.eliminated) return -1;
    if (a.eliminated && !b.eliminated) return 1;
    if (a.eliminated && b.eliminated) {
      return b.eliminatedWeek - a.eliminatedWeek;
    }
    return 0;
  });

  const userEntry = entries.find((entry) => entry.userId === user?.id);
  const winnerEntry = entries.find((entry) => entry.winnerStatus === "winner");

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
      <div className="mainPage">
        <h1>Survivor League: {league}</h1>
        <p>{config.rulesText}</p>

        {winnerEntry && (
          <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#ffd700", borderRadius: "8px" }}>
            <h2>🏆 Winner: {winnerEntry.teamName}</h2>
            <p>
              Congratulations to {winnerEntry.user?.firstname} {winnerEntry.user?.lastname}!
            </p>
          </div>
        )}

        <h2>Leaderboard</h2>
        {sortedEntries.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Team Name</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Eliminated</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>User</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>View Picks</th>
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
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{entry.teamName}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{eliminatedText}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{userName}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                      <Link
                        to={`/survivor/${encodeURIComponent(league)}/${encodedTeamName}`}
                        style={{ color: buttonColor, textDecoration: "underline" }}
                      >
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
            <button style={buttonStyle} onClick={handleOpenPickSection}>
              Make your picks
            </button>

            {showPickSection && (
              <div style={{ marginTop: "1rem" }}>
                <h3>Select your lineup (1-5)</h3>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ marginBottom: "0.5rem" }}>
                    <label style={{ marginRight: "0.5rem" }}>Spot {i + 1}:</label>
                    <select
                      value={selectedPlayers[i]}
                      onChange={(e) => handleSelectPlayer(i, e.target.value)}
                      style={{ padding: "0.5rem" }}
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
                <button style={buttonStyle} onClick={handleSubmitPick}>
                  Submit Lineup
                </button>
                <button
                  onClick={() => {
                    setShowPickSection(false);
                    setSelectedPlayers(["", "", "", "", ""]);
                  }}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}

        {!userEntry && (
          <p style={{ marginTop: "1rem", fontStyle: "italic" }}>You don't have an entry in this league.</p>
        )}

        <h3>More features coming soon: Weekly results, stats, etc.</h3>
      </div>
      <Footer />
    </div>
  );
};

export default SurvivorLeaguePage;