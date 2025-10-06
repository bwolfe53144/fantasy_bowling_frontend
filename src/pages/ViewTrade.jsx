import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/Modal";    
import { useModal } from "../../hooks/useModal";
import { getTradeById, acceptTrade, declineTrade } from "../utils/api.js";
import "../styles/DropClaimPlayer.css";

const ViewTrade = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trade, setTrade] = useState(null);
  const [loadingTrade, setLoadingTrade] = useState(true);

  // Modal hooks
  const [confirmModalProps, showConfirmModal] = useModal();
  const [resultModalProps, showResultModal] = useModal();

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);

  // Dropdown state for selecting a player to drop
  const [selectedDrop, setSelectedDrop] = useState("");

  // Toggle menu class
  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  // Fetch trade by ID
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await getTradeById(id);  
        setTrade(res.data); // API returns trade object
      } catch (err) {
        console.error("Error fetching trade:", err);
      } finally {
        setLoadingTrade(false);
      }
    })();
  }, [id, user]);

  if (loading || loadingTrade) return <LoadingScreen />;
  if (!user) return <Navigate to="/signin" replace />;
  if (!trade) return <div className="pageContainer"><h2>Trade not found</h2></div>;

  // Players
  const offeredPlayers = trade.players.filter(p => p.role === "OFFERED") || [];
  const requestedPlayers = trade.players.filter(p => p.role === "REQUESTED") || [];

  // Drops
  const droppedFromPlayers = trade.drops.filter(d => d.teamId === trade.fromTeamId) || [];
  const droppedToPlayers   = trade.drops.filter(d => d.teamId === trade.toTeamId) || [];

  // Filter eligible players for dropdown:
  const eligibleDropPlayers = (user?.team?.players || []).filter(p => {
    // Exclude players already involved in any trade
    return !p.tradePlayers || p.tradePlayers.length === 0;
  });

  // Accept trade
  const handleAcceptTrade = async (tradeId) => {
    if (offeredPlayers.length > 1 && !selectedDrop) {
      await showResultModal({
        title: "Select a Player",
        message: "Please select a player to drop before accepting the trade.",
        confirmText: "OK",
      });
      return;
    }

    const confirmed = await showConfirmModal({
      title: "Confirm Accept",
      message: "Are you sure you want to accept this trade?",
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });

    if (!confirmed) return;

    try {
      await acceptTrade(tradeId, selectedDrop); // Pass selectedDrop to API
      await showResultModal({
        title: "Trade Accepted!",
        message: "You have successfully accepted this trade.",
        confirmText: "OK",
      });
    } catch (err) {
      console.error(err);
      await showResultModal({
        title: "Error",
        message: "Failed to accept trade.",
        confirmText: "OK",
      });
    } finally {
      window.location.href = "/profile"; // always redirect after modal
    }
  };

  // Decline trade
  const handleDeclineTrade = async (tradeId) => {
    const confirmed = await showConfirmModal({
      title: "Confirm Decline",
      message: "Are you sure you want to decline this trade?",
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });

    if (!confirmed) return;

    try {
      await declineTrade(tradeId);
      await showResultModal({
        title: "Trade Declined",
        message: "You have declined this trade.",
        confirmText: "OK",
      });
    } catch (err) {
      console.error(err);
      await showResultModal({
        title: "Error",
        message: "Failed to decline trade.",
        confirmText: "OK",
      });
    } finally {
      window.location.href = "/profile"; // consistent redirect
    }
  };

  // Cancel trade (sender)
  const handleCancelTrade = async (tradeId) => {
    const confirmed = await showConfirmModal({
      title: "Confirm Cancel",
      message: "Are you sure you want to cancel this trade?",
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });

    if (!confirmed) return;

    try {
      await declineTrade(tradeId);
      await showResultModal({
        title: "Trade Cancelled",
        message: "Your trade has been cancelled.",
        confirmText: "OK",
      });
    } catch (err) {
      console.error(err);
      await showResultModal({
        title: "Error",
        message: "Failed to cancel trade.",
        confirmText: "OK",
      });
    } finally {
      window.location.href = "/profile";
    }
  };

  return (
    <div className="pageContainer dropClaimPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Trade Offer</h1>

        <p>
          From: <strong>{trade.fromTeam.name}</strong>  
          &nbsp;|&nbsp;
          To: <strong>{trade.toTeam.name}</strong>
        </p>

        <div className="tradePlayers">
          <h3>Players Offered:</h3>
          <ul>
            {offeredPlayers.map(p => (
              <li key={p.id}>{p.player.name}</li>
            ))}
          </ul>

          <h3>Players Requested:</h3>
          <ul>
            {requestedPlayers.map(p => (
              <li key={p.id}>{p.player.name}</li>
            ))}
          </ul>

          {/* Dropdown for selecting a player to drop */}
          {offeredPlayers.length > 1 && eligibleDropPlayers.length > 0 && (
            <div className="dropSelector">
              <label htmlFor="dropPlayer">Select a player to drop:</label>
              <select
                id="dropPlayer"
                value={selectedDrop}
                onChange={(e) => setSelectedDrop(e.target.value)}
              >
                <option value="">--Select player--</option>
                {eligibleDropPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {droppedFromPlayers.length > 0 && (
            <>
              <h3>Players Dropped by {trade.fromTeam.name}:</h3>
              <ul>
                {droppedFromPlayers.map(d => (
                  <li key={d.id}>{d.player.name}</li>
                ))}
              </ul>
            </>
          )}

          {droppedToPlayers.length > 0 && (
            <>
              <h3>Players Dropped by {trade.toTeam.name}:</h3>
              <ul>
                {droppedToPlayers.map(d => (
                  <li key={d.id}>{d.player.name}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Receiver side: Accept or Decline */}
        {trade.toTeamId === user.team.id && ["VIEWED", "PENDING"].includes(trade.status) && (
          <div className="tradeActions">
            <button
              style={{ backgroundColor: buttonBackground, color: buttonColor, marginRight: "10px" }}
              onClick={() => handleAcceptTrade(trade.id)}
            >
              Accept Trade
            </button>
            <button
              style={{ backgroundColor: buttonBackground, color: buttonColor }}
              onClick={() => handleDeclineTrade(trade.id)}
            >
              Decline Trade
            </button>
          </div>
        )}

        {/* Sender side: Cancel */}
        {trade.fromTeamId === user.team.id && ["VIEWED", "PENDING"].includes(trade.status) && (
          <div className="tradeActions">
            <button
              style={{ backgroundColor: buttonBackground, color: buttonColor }}
              onClick={() => handleCancelTrade(trade.id)}
            >
              Cancel Trade
            </button>
          </div>
        )}
      </div>

      <Footer />
      {confirmModalProps && <Modal {...confirmModalProps} />}
      {resultModalProps && <Modal {...resultModalProps} />}
    </div>
  );
};

export default ViewTrade;
