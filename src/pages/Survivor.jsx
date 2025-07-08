import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/Leaderboard.css";

const Survivor = () => {
  const { user, players, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { backgroundColor, color, buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);
  const tableHeaderStyle = { backgroundColor, color };
  const buttonStyle = { backgroundColor: buttonBackground, color: buttonColor };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);


  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Survivor Homepage</h1>
        <h2>More coming soon!</h2>
      </div>
      <Footer />
    </div>
  );
};

export default Survivor;