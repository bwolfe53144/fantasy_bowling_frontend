import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { claimWithDrop } from "../utils/api";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/Modal";    
import { useModal } from "../../hooks/useModal";
import "../styles/DropClaimPlayer.css";

const DropClaimPlayer = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const { playerId, playerName, playerLeague, playerPosition } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playerToDrop, setPlayerToDrop] = useState(null);
  const [roster, setRoster] = useState([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null); // 'success' or 'error'

  // useModal returns [modalProps, showModal]
  const [confirmModalProps, showConfirmModal] = useModal();
  const [resultModalProps, showResultModal] = useModal();

    useEffect(() => {
      document.body.classList.toggle("menuOpen", isMenuOpen);
      return () => document.body.classList.remove("menuOpen");
    }, [isMenuOpen]);

  useEffect(() => {
    if (user && user.team) {
      setRoster(user.team.players || []);
    }
  }, [user]);

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);

  // Start claim process: show confirm modal, wait for user to confirm/cancel
  const handleStartClaim = async () => {
    const confirmed = await showConfirmModal({
      title: "Confirm Claim",
      message: playerToDrop
        ? `Add: ${playerName}, Drop: ${playerToDrop.name}`
        : `Add: ${playerName}`,
      confirmText: "Confirm",
      cancelText: "Cancel",
      showCancel: true,
    });

    if (confirmed) {
      await handleConfirmClaim();
    }
  };

  const handleConfirmClaim = async () => {
    setIsClaiming(true);
    try {
      await claimWithDrop(playerId, playerToDrop?.id, user.id);
      setClaimResult("success");
      await showResultModal({
        title: "Success!",
        message: "Claim successful!",
        confirmText: "OK",
        showCancel: false,
      });
      navigate("/players");
    } catch (error) {
      console.error("Error claiming player and dropping another:", error);
      setClaimResult("error");
      await showResultModal({
        title: "Error",
        message: "Failed to claim and drop player.",
        confirmText: "OK",
        showCancel: false,
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const canDropPlayer = (player) => {
    if (!player.tradePlayers || player.tradePlayers.length === 0) return true;
  
    return !player.tradePlayers.some(tp =>
      tp.trade.status === "ACCEPTED" ||
      (tp.trade.status === "PENDING" && tp.trade.fromTeam?.id === user.team.id)
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="pageContainer dropClaimPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Claim and Drop Player</h1>
        <p className="claim-p">
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
            {roster.map((player) => {
              const dropDisabled = !canDropPlayer(player);
              return (
                <div key={player.id} style={{ opacity: dropDisabled ? 0.5 : 1 }}>
                  <label>
                    <input
                      type="radio"
                      value={player.id}
                      checked={playerToDrop?.id === player.id}
                      onChange={() => setPlayerToDrop(player)}
                      disabled={dropDisabled}
                    />
                    {player.name} <em>({player.position || "N/A"})</em>
                    {dropDisabled && " — Currently In A Trade"}
                  </label>
                </div>
              );
            })}
            <button
              onClick={handleStartClaim}
              disabled={roster.length === 15 && !playerToDrop}
              style={{
                backgroundColor: buttonBackground,
                padding: "1rem",
                color: buttonColor,
                marginTop: "1.5rem",
                borderRadius: "10px",
                minWidth: "90px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {isClaiming ? "Claiming..." : "Confirm Claim"}
            </button>
          </div>
        ) : (
          <p>Your roster is empty, cannot claim player.</p>
        )}
      </div>
      <Footer />

      {confirmModalProps && (
        <Modal
          {...confirmModalProps}
        />
      )}
      {resultModalProps && (
        <Modal
          {...resultModalProps}
        />
      )}
    </div>
  );
};

export default DropClaimPlayer;