import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { ThemeContext } from "../utils/ThemeContext";
import { getThemeColors } from "../utils/themeColors";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/Modal";
import { useModal } from "../../hooks/useModal";
import { useTradeActions } from "../../hooks/useTradeActions";
import { getTrades } from "../utils/api";
import "../styles/ViewAllTrades.css";

const ViewMyTrades = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trades, setTrades] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(false);

  const [confirmModalProps, showConfirmModal] = useModal();
  const [resultModalProps, showResultModal] = useModal();

  const { handleAcceptTrade, handleDeclineTrade, handleCancelTrade } = useTradeActions(
    showConfirmModal,
    showResultModal
  );

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    if (user) loadTrades();
  }, [user]);

  const loadTrades = async () => {
    setLoadingTrades(true);
    try {
      const { data } = await getTrades();
      const myTrades = data.filter(
        (t) => t.fromTeamId === user.team.id || t.toTeamId === user.team.id
      );
      setTrades(myTrades);
    } catch (err) {
      console.error("Error fetching trades:", err);
    } finally {
      setLoadingTrades(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: { bg: "#facc15", text: "black" },
      ACCEPTED: { bg: "#4ade80", text: "white" },
      VETOED: { bg: "#ef4444", text: "white" },
      CANCELLED: { bg: "#6b7280", text: "white" },
      DECLINED: { bg: "#9ca3af", text: "white" },
    };
    const c = colors[status] || colors.PENDING;
    return (
      <span className="tradeStatusBadge" style={{ backgroundColor: c.bg, color: c.text }}>
        {status}
      </span>
    );
  };

  if (loading || loadingTrades) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className="pageContainer dropClaimPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>My Trades</h1>

        <div className="tradeList">
          {trades.length === 0 ? (
            <p>You have no trades at the moment.</p>
          ) : (
            trades.map((trade) => {
              const isSender = trade.fromTeamId === user.team.id;
              const isRecipient = trade.toTeamId === user.team.id;

              return (
                <div key={trade.id} className={`tradeCard ${isDarkMode ? "dark" : ""}`}>
                  <div className="tradeCardHeader">
                    <h3>
                      {trade.fromTeam.name} → {trade.toTeam.name}
                    </h3>
                    {getStatusBadge(trade.status)}
                  </div>

                  <small className="tradeTimestamp">
                    {new Date(trade.createdAt).toLocaleString()}
                  </small>

                  <div className="tradePlayers">
                    <p>
                      <b>Players Offered:</b>{" "}
                      {trade.players.filter((p) => p.role === "OFFERED").map((p) => p.player.name).join(", ") || "None"}
                    </p>

                    <p>
                      <b>Players Requested:</b>{" "}
                      {trade.players.filter((p) => p.role === "REQUESTED").map((p) => p.player.name).join(", ") || "None"}
                    </p>

                    <p>
                      <b>Drops:</b>{" "}
                      {trade.drops.map((d) => d.player?.name).join(", ") || "None"}
                    </p>
                  </div>

                  <div className="tradeActions">
                    {isSender && trade.status !== "ACCEPTED" && (
                      <button
                        className="tradeButton cancel"
                        style={{ background: buttonBackground, color: buttonColor }}
                        onClick={() => handleCancelTrade(trade.id)}
                      >
                        Cancel Trade
                      </button>
                    )}

                    {isRecipient && trade.status !== "ACCEPTED" && (
                      <>
                        {trade.players.filter(p => p.role === "OFFERED").length > trade.players.filter(p => p.role === "REQUESTED").length ? (
                          // Trade is uneven, need to drop -> link to viewTrade page
                          <button
                            className="tradeButton"
                            style={{ background: buttonBackground, color: buttonColor }}
                            onClick={() => navigate(`/view-trade/${trade.id}`)}
                          >
                            View Trade
                          </button>
                        ) : (
                          // Even trade -> allow direct accept/decline
                          <>
                            <button
                              className="tradeButton"
                              style={{ background: buttonBackground, color: buttonColor }}
                              onClick={() => handleAcceptTrade(trade.id)}
                            >
                              Accept
                            </button>
                            <button
                              className="tradeButton gray"
                              onClick={() => handleDeclineTrade(trade.id)}
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </>
                    )}

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
      {confirmModalProps && <Modal {...confirmModalProps} />}
      {resultModalProps && <Modal {...resultModalProps} />}
    </div>
  );
};

export default ViewMyTrades;
