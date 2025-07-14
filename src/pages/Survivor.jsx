import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import {
  createSurvivorTeam,
  getTotalLeagues,
  fetchAllLockStatuses,
  getUserSurvivorEntries,
} from "../utils/api";

const Survivor = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [leagues, setLeagues] = useState([]);
  const [locks, setLocks] = useState([]);
  const [survivorEntries, setSurvivorEntries] = useState([]);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(true);

  const [activeLeagueForSignup, setActiveLeagueForSignup] = useState(null);
  const [teamNameInput, setTeamNameInput] = useState("");

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);
  const buttonStyle = { backgroundColor: buttonBackground, color: buttonColor };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaguesRes, locksRes, entriesRes] = await Promise.all([
          getTotalLeagues(),
          fetchAllLockStatuses(),
          getUserSurvivorEntries(user.id),
        ]);

        setLeagues(leaguesRes.data.totalLeagues || []);
        setLocks(locksRes.data || []);
        setSurvivorEntries(entriesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingLeagues(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const handleStartSignup = (leagueName) => {
    setActiveLeagueForSignup(leagueName);
    setTeamNameInput("");
  };

  const handleSubmitSignup = async () => {
    if (!teamNameInput.trim()) {
      alert("Please enter a team name.");
      return;
    }
    try {
      const response = await createSurvivorTeam({
        userId: user.id,
        league: activeLeagueForSignup,
        teamName: teamNameInput.trim(),
      });
      alert(`Survivor team created successfully: ${response.data.team.teamName}`);
      setActiveLeagueForSignup(null);
      setTeamNameInput("");
      const entriesRes = await getUserSurvivorEntries(user.id);
      setSurvivorEntries(entriesRes.data || []);
    } catch (error) {
      console.error("Failed to create survivor team:", error);
      alert("Failed to create survivor team. Please try again.");
    }
  };

  const openLeagues = leagues.filter((leagueObj) => {
    const leagueName = leagueObj.league;
  
    const week3Lock = locks.find(
      (lock) => lock.league === leagueName && lock.week === 3
    );
  
    if (!week3Lock || !week3Lock.lockTime) {
      return false; // disallow if no lock info
    }
  
    const now = new Date();
    const lockTime = new Date(week3Lock.lockTime);
  
    return now < lockTime;
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Survivor Bowling</h1>

        {!user ? (
          <>
            <p>
              Welcome to Fantasy Bowling Survivor! In this game, you create a Survivor team by picking 5 bowlers from a league each week and ranking them from 1 to 5. Your top-ranked bowler (who bowled that week) will be your active score.
            </p>
            <p>
              To survive each week, your chosen bowler must finish in the top 30–40% of all scores in that league. Once you use a bowler, they cannot be used again. If your top bowler doesn't qualify, you're eliminated!
            </p>
            <p>
              The last team standing wins. The rest of your bowlers who are not used for the week are eligible to use later.
            </p>
            <p style={{ fontStyle: "italic" }}>
              Sign up or log in to create your Survivor team and join the fun!
            </p>
          </>
        ) : (
          <>
            {openLeagues.length === 0 ? (
              <p>No leagues currently open for Survivor sign-ups.</p>
            ) : (
              openLeagues.map((leagueObj) => {
                const league = leagueObj.league;
                const isActive = activeLeagueForSignup === league;
                const userEntry = survivorEntries.find((entry) => entry.league === league);

                return (
                  <div
                    key={league}
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                    }}
                  >
                    <h2>{league}</h2>
                    <p>Sign up before week 3!</p>

                    {userEntry ? (
                      <p>
                        ✅ You already have a Survivor team:{" "}
                        <strong>{userEntry.teamName}</strong>.{" "}
                        <Link to={`/survivor/${league}`}>View your Survivor team</Link>
                      </p>
                    ) : !isActive ? (
                      <button
                        style={buttonStyle}
                        onClick={() => handleStartSignup(league)}
                      >
                        Sign up for Survivor Bowling
                      </button>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Enter your Survivor team name"
                          value={teamNameInput}
                          onChange={(e) => setTeamNameInput(e.target.value)}
                          style={{ marginRight: "0.5rem" }}
                        />
                        <button style={buttonStyle} onClick={handleSubmitSignup}>
                          Submit
                        </button>
                        <button
                          style={{ marginLeft: "0.5rem" }}
                          onClick={() => setActiveLeagueForSignup(null)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Survivor;
  