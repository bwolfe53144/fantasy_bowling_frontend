import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/Modal";
import { useModal } from "../../hooks/useModal";
import {
  getSurvivorEntriesForLeague,
  getSurvivorUserPicks,
  getEligibleSurvivorPlayers,
  submitSurvivorPicks,
  getLeagueCurrentWeek,
} from "../utils/api";
import "../styles/Survivor.css";

const SurvivorLeaguePage = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [modalProps, showModal] = useModal();
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
    const fetchCurrentWeek = async () => {
      try {
        const res = await getLeagueCurrentWeek(league);
        setCurrentWeek(res.data.currentWeek);
      } catch (err) {
        console.error("Failed to fetch current week:", err);
      }
    };
  
    fetchCurrentWeek();
  }, [league]);

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
    "Inner City" : .3,
  };

  const cutoff = leagueCutoffs[league];

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
      await showModal({
        title: "Incomplete Picks",
        message: "Please select 5 unique players before submitting.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }
  
    const picks = selectedPlayers.map((playerId, i) => ({
      playerId,
      rank: i + 1,
    }));
  
    try {
      await submitSurvivorPicks(league, userEntry.teamName, picks);
  
      await showModal({
        title: "Success!",
        message: "Picks submitted successfully!",
        confirmText: "OK",
        showCancel: false,
      });
  
      setShowPickSection(false);
      setSelectedPlayers(["", "", "", "", ""]);
  
      const response = await getSurvivorEntriesForLeague(league);
      setEntries(response.data.entries || []);
    } catch (error) {
      console.error("Failed to submit picks:", error);
      await showModal({
        title: "Error",
        message: "Failed to submit picks. Please try again.",
        confirmText: "OK",
        showCancel: false,
      });
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
        {currentWeek && <h2>Current Week: {currentWeek}</h2>}

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
              {currentWeek && currentWeek >= 10
                ? `Make Week ${currentWeek} picks`
                : "Make Week 10 picks"}
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
        <div className="rulesSection">
          <p>
            In Fantasy Bowling Survivor, you pick 5 bowlers from your league each week and rank them 1–5. 
            Your top-ranked bowler is your active score.
          </p>
          <p>
            To survive each week, your top bowler must finish in the top{" "}
            {Math.round(cutoff * 100)}% of scores in that league. Once a bowler is used, 
            they cannot be picked again.
          </p>
          {(!currentWeek || currentWeek < 11) && (
            <p>Survivor leagues start week 10.</p>
          )}
          <p>
            The last team standing wins. Remaining bowlers not used in a week are eligible for later weeks.
          </p>
        </div>
      </div>
      <Footer />
      {modalProps && <Modal {...modalProps} />}
    </div>
  );
};

export default SurvivorLeaguePage;