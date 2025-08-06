import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getOwner } from "../utils/api";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/DropClaimPlayer.css";

const OwnerDetail = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const { ownerName } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        const response = await getOwner(ownerName);
        setOwnerData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load owner data.");
        setOwnerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [ownerName]);

  if (authLoading || loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="pageContainer">
        <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
        <Navbar />
        <div className="mainPage">
          <h1>Owner Page</h1>
          <p style={{ color: "red" }}>{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="pageContainer">
        <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
        <Navbar />
        <div className="mainPage">
          <h1>Owner Page</h1>
          <p>No data found for owner "{ownerName}".</p>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    firstname,
    lastname,
    email,
    team,
    priorYearStandings,
  } = ownerData;

  return (
    <div
      className="pageContainer"
      style={{ "--button-bg": buttonBackground, "--button-color": buttonColor }}
    >
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>{ownerName}</h1>
        {email && <p>Email: {email}</p>}

        {team && (
          <section>
            <h2>Current Team</h2>
            <p><strong>Team Name:</strong> {team.name}</p>
            <p><strong>Record:</strong> {team.ties > 0 ? `${team.wins}-${team.losses}-${team.ties}` : `${team.wins}-${team.losses}`}</p>
            <p><strong>Points For:</strong> {team.points}</p>
            <p><strong>Points Against:</strong> {team.pointsAgainst}</p>
            <p><strong>Streak:</strong> {team.streak}</p>
          </section>
        )}

        {priorYearStandings?.length > 0 && (
          <section>
            <h2>Prior Year Standings</h2>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Team Name</th>
                  <th>Place</th>
                  <th>Record</th>
                  <th>Points For</th>
                  <th>Points Against</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {priorYearStandings.map((standing) => (
                  <tr key={standing.id}>
                    <td>{standing.year}</td>
                    <td>{standing.teamName}</td>
                    <td>{standing.place}</td>
                    <td>{standing.ties > 0 ? `${standing.wins}-${standing.losses}-${standing.ties}` : `${standing.wins}-${standing.losses}`}</td>
                    <td>{standing.pointsFor}</td>
                    <td>{standing.pointsAgainst}</td>
                    <td>{standing.streak || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link to="/owners" className="signUpButton">
            📊 Compare All Owners
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OwnerDetail;