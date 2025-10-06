import { useEffect, useState, useContext, useMemo } from "react";
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
import { getTrades, submitTradeVote } from "../utils/api";
import "../styles/ViewAllTrades.css";

const ViewAllTrades = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState("ALL");

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
    try {
      const { data } = await getTrades();
      const tradesWithUserVote = data.map(trade => {
        const userVote = trade.votes.find(v => v.teamId === user.team.id) || null;
        return { ...trade, userVote };
      });
      setTrades(tradesWithUserVote);
    } catch (err) {
      console.error("Error fetching trades:", err);
    }
  };

  const handleVote = async (tradeId, veto) => {
    const confirmed = await showConfirmModal({
      title: veto ? "Confirm Veto" : "Confirm Approve",
      message: veto
        ? "Are you sure you want to veto this trade?"
        : "Are you sure you approve this trade?",
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });
    if (!confirmed) return;

    try {
      await submitTradeVote(tradeId, user.team.id, !veto);
      await showResultModal({
        title: veto ? "Trade Vetoed" : "Vote Submitted",
        message: veto
          ? "You have vetoed this trade."
          : "You approved this trade.",
        confirmText: "OK",
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      await showResultModal({
        title: "Error",
        message: "Failed to submit your vote.",
        confirmText: "OK",
      });
    }
  };

  const filteredTrades = useMemo(() => {
    let visibleTrades = trades;
  
    // Always hide pending/viewed trades the user is not involved in
    visibleTrades = visibleTrades.filter((t) => {
      if (["PENDING", "VIEWED"].includes(t.status)) {
        return t.fromTeamId === user?.team?.id || t.toTeamId === user?.team?.id;
      }
      return true; // show other statuses
    });
  
    if (filter === "ALL") return visibleTrades;
    if (filter === "PENDING") return visibleTrades.filter((t) => ["PENDING", "VIEWED"].includes(t.status));
    if (filter === "VETOED") return visibleTrades.filter((t) => t.userVote && t.userVote.approved === false);
    return visibleTrades.filter((t) => t.status === filter);
  }, [filter, trades, user]);

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

  if (loading) return <LoadingScreen />;

  return (
    <div className="pageContainer dropClaimPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>All Trades</h1>

        <div className="filterBar">
          <label>Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="tradeFilterSelect"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="VETOED">Vetoed</option>
          </select>
        </div>

        <div className="tradeList">
          {filteredTrades.length === 0 ? (
            <p className="claim-p">No trades found for this filter.</p>
          ) : (
            filteredTrades.map((trade) => {
              const isUserTrade =
                trade.fromTeamId === user?.team?.id || trade.toTeamId === user?.team?.id;

              return (
                <div key={trade.id} className={`tradeCard ${isDarkMode ? "dark" : ""}`}>
                  <div className="tradeCardHeader">
                    <h3>{trade.fromTeam.name} → {trade.toTeam.name}</h3>
                    {getStatusBadge(trade.status)}
                  </div>

                  <small className="tradeTimestamp">
                    {new Date(trade.createdAt).toLocaleString()}
                  </small>

                  <div className="tradePlayers">
                    <p className="claim-p">
                      <b>Players Offered:</b>{" "}
                      {trade.players.filter((p) => p.role === "OFFERED").map((p) => p.player.name).join(", ") || "None"}
                    </p>

                    <p className="claim-p">
                      <b>Players Requested:</b>{" "}
                      {trade.players.filter((p) => p.role === "REQUESTED").map((p) => p.player.name).join(", ") || "None"}
                    </p>

                    <p className="claim-p">
                      <b>Drops:</b>{" "}
                      {trade.drops.map((d) => d.player?.name).join(", ") || "None"}
                    </p>
                  </div>

                  <div className="tradeActions">
                    {isUserTrade ? (
                      trade.fromTeamId === user.team.id && trade.status !== "ACCEPTED" ? (
                        <button
                          className="tradeButton cancel"
                          style={{ background: buttonBackground, color: buttonColor }}
                          onClick={() => handleCancelTrade(trade.id)}
                        >
                          Cancel Trade
                        </button>
                      ) : trade.toTeamId === user.team.id && trade.status !== "ACCEPTED" ? (
                        // Check if user needs to drop someone (more than 1 offered player)
                        trade.players.filter(p => p.role === "OFFERED").length > 1 ? (
                          <a
                            href={`/view-trade/${trade.id}`}
                            className="tradeButton"
                            style={{ background: buttonBackground, color: buttonColor }}
                          >
                            View Trade
                          </a>
                        ) : (
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
                        )
                      ) : null
                    ) : !trade.userVote ? (
                      <>
                        <button
                          className="tradeButton"
                          style={{ background: buttonBackground, color: buttonColor }}
                          onClick={async () => await handleVote(trade.id, false)}
                        >
                          Approve
                        </button>
                        <button
                          className="tradeButton red"
                          onClick={async () => await handleVote(trade.id, true)}
                        >
                          Veto
                        </button>
                      </>
                    ) : (
                      <p className="claim-p">
                        You voted to {trade.userVote.approved ? "approve" : "veto"} the trade.
                      </p>
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

export default ViewAllTrades;