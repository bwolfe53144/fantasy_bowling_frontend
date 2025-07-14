import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import { getSurvivorPicksForTeam } from "../utils/api";

const SurvivorTeamPage = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [picks, setPicks] = useState([]);
  const [loadingPicks, setLoadingPicks] = useState(true);

  const { league, teamname } = useParams();

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);
  const buttonStyle = { backgroundColor: buttonBackground, color: buttonColor };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const response = await getSurvivorPicksForTeam(league, teamname);
        setPicks(response.data.picks || []);
      } catch (error) {
        console.error("Failed to fetch picks:", error);
      } finally {
        setLoadingPicks(false);
      }
    };

    fetchPicks();
  }, [league, teamname]);

  if (loading || loadingPicks) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Picks for Team: {teamname}</h1>
        <h2>League: {league}</h2>

        {picks.length === 0 ? (
          <p>This team has not submitted any completed picks yet.</p>
        ) : (
          <table className="survivor-picks-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Player Picked</th>
              </tr>
            </thead>
            <tbody>
              {picks.map((pick, index) => (
                <tr key={index}>
                  <td>{pick.week}</td>
                  <td>{pick.player.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SurvivorTeamPage;