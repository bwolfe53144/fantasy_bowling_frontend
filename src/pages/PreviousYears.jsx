import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import { getAvailablePriorYears } from "../utils/api";
import "../styles/PreviousYears.css";

const PreviousYears = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [years, setYears] = useState([]);
  const [isLoadingYears, setIsLoadingYears] = useState(true);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await getAvailablePriorYears();
        if (res.status === 200) {
          setYears(res.data.years.sort((a, b) => b - a)); // sort newest first
        }
      } catch (err) {
        console.error("Failed to fetch prior years:", err);
      } finally {
        setIsLoadingYears(false);
      }
    };

    fetchYears();
  }, []);

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);

  const buttonStyle = {
    backgroundColor: buttonBackground,
    padding: "1rem 1.5rem",
    color: buttonColor,
    margin: "1rem",
    borderRadius: "10px",
    minWidth: "140px",
    maxWidth: "200px",
    fontWeight: "bold",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    textAlign: "center",
  };

  if (loading || isLoadingYears) return <LoadingScreen />;

  return (
    <div className="pageContainer">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage previous" style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: "2rem" }}>Prior Year Standings</h1>

        {years.length > 0 ? (
          years.map((year) => (
            <Link key={year} to={`/previous-standings/${year}`} style={buttonStyle}>
              📅 {year} Standings
            </Link>
          ))
        ) : (
          <p>No previous seasons found.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PreviousYears;