import { useContext, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import { getPriorYearStandings } from "../utils/api";

export default function PreviousYearStandings() {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [standings, setStandings] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { backgroundColor, color } = getThemeColors(user?.color, isDarkMode);
  const { year } = useParams();
  const selectedYear = parseInt(year);

useEffect(() => {
  async function fetchPriorStandings() {
    try {
      const res = await getPriorYearStandings(selectedYear);
      setStandings(res.data);
    } catch (error) {
      console.error("Failed to fetch prior year standings:", error);
    }
  }
  if (!isNaN(selectedYear)) {
    fetchPriorStandings();
  }
}, [selectedYear]);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  if (loading) return <LoadingScreen />;

  return (
    <div
      className="pageContainer homepage"
      style={{
        "--table-bg": backgroundColor,
        "--table-color": color,
      }}
    >
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage homepage">
      <h1 className="mainTitle">Fantasy Bowling League - {selectedYear}</h1>
        <div className="standingsContainer">
          <div className="standingsHeader">
            <h2 className="standingsTitle">Standings</h2>
          </div>
          <div className="horizontalScrollArea">
            <table>
              <caption className="visually-hidden">
                Fantasy Bowling League Standings for {selectedYear}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Place</th>
                  <th scope="col">Team</th>
                  <th scope="col">Record</th>
                  <th scope="col">Points For</th>
                  <th scope="col">Points Against</th>
                  <th scope="col">Streak</th>
                  <th scope="col">Captain</th>
                </tr>
              </thead>
              <tbody>
                {standings.length > 0 ? (
                  standings.map((team, index) => {
                    const record = team.ties > 0
                      ? `${team.wins}-${team.losses}-${team.ties}`
                      : `${team.wins}-${team.losses}`;
                      const place = parseInt(team.place);
                      const trophy =
                        place === 1 ? "🏆 1" :
                        place === 2 ? "🥈 2" :
                        place === 3 ? "🥉 3" :
                        "";
                    return (
                      <tr key={team.id || index}>
                        <td>{trophy || team.place}</td>
                        <td>{team.teamName}</td>
                        <td>{record}</td>
                        <td>{team.pointsFor}</td>
                        <td>{team.pointsAgainst}</td>
                        <td>{team.streak || "N/A"}</td>
                        <td>
                          <Link to={`/owner/${encodeURIComponent(team.captainName)}`}>
                            {team.captainName}
                          </Link>
                        </td>                      
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No prior year standings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}