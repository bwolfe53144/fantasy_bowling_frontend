import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { claimWithDrop } from "../utils/api";
import { getThemeColors } from "../utils/themeColors";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/DropClaimPlayer.css";

const DropClaimPlayer = () => {
  const { user, loading } = useContext(AuthContext);
  const { playerId, playerName, playerLeague, playerPosition } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playerToDrop, setPlayerToDrop] = useState(null);
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    if (user && user.team) {
      setRoster(user.team.players || []);
    }
  }, [user]);

  const { buttonBackground, buttonColor } = getThemeColors(user?.color);

  const buttonStyle = {
    backgroundColor: buttonBackground,
    padding: "1rem",
    color: buttonColor,
    marginTop: "1.5rem",
    borderRadius: "10px",
    minWidth: "90px",
    border: "none",
    cursor: "pointer",
  };

  const handleClaimAndDrop = async () => {
    const confirmed = window.confirm(
      playerToDrop?.name
        ? `Add: ${playerName}, Drop: ${playerToDrop.name}`
        : `Add: ${playerName}`
    );
    if (!confirmed) return;
    try {
      await claimWithDrop(playerId, playerToDrop?.id, user.id);
      alert("Claim successful!");
      navigate("/players");
    } catch (error) {
      console.error("Error claiming player and dropping another:", error);
      alert("Failed to claim and drop player.");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="pageContainer dropClaimPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Claim and Drop Player</h1>
        <p>
          You are about to claim this player:{" "}
          <strong>{playerName}</strong> – <strong>{playerLeague}</strong>
          <br />
          Position: <strong>{playerPosition || "Unknown"}</strong>
        </p>

        <h3>Select a player from your roster to drop:</h3>

        {roster && roster.length < 15 && (
          <div>
            <label>
              <input
                type="radio"
                value="none"
                checked={playerToDrop === null}
                onChange={() => setPlayerToDrop(null)}
              />
              <strong>Do not drop anyone</strong> (you have fewer than 15 players)
            </label>
          </div>
        )}

        {roster && roster.length > 0 ? (
          <div>
            {roster.map((player) => (
              <div key={player.id}>
                <label>
                  <input
                    type="radio"
                    value={player.id}
                    checked={playerToDrop?.id === player.id}
                    onChange={() => setPlayerToDrop(player)}
                  />
                  {player.name} <em>({player.position || "N/A"})</em>
                </label>
              </div>
            ))}
            <button
              onClick={handleClaimAndDrop}
              disabled={roster.length === 15 && !playerToDrop}
              style={buttonStyle}
            >
              Confirm Claim
            </button>
          </div>
        ) : (
          <p>Your roster is empty, cannot claim player.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DropClaimPlayer;