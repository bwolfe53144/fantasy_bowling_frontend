import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/Modal";    
import { useModal } from "../../hooks/useModal";
import { proposeTrade } from "../utils/api.js";
import "../styles/DropClaimPlayer.css";

const Trade = () => {
  const { user, loading, players } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const { team: toTeamName, id: playerId } = useParams();
  const decodedTeamName = decodeURIComponent(toTeamName);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [roster, setRoster] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [requestedPlayers, setRequestedPlayers] = useState([]);
  const [dropPlayer, setDropPlayer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [confirmModalProps, showConfirmModal] = useModal();
  const [resultModalProps, showResultModal] = useModal();

  // Grab your roster from user.team
  useEffect(() => {
    if (user?.team?.players) setRoster(user.team.players);
  }, [user]);

  // Find the target player
  const player = players?.find(p => String(p.id) === String(playerId));

  // Other team roster
  const otherTeamRoster = players?.filter(p => p.team?.name === decodedTeamName) || [];

  // Only disable other team players in accepted trades
  const otherTeamPlayerIdsInAcceptedTrade = useMemo(() => {
    return new Set(
      otherTeamRoster
        .filter(p => p.tradePlayers?.some(tp => tp.trade.status === "ACCEPTED"))
        .map(p => p.id)
    );
  }, [otherTeamRoster]);

  // Selection helpers
  const toggleSelectPlayer = (pid) => {
    setSelectedPlayers(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const toggleRequestedPlayer = (pid) => {
    setRequestedPlayers(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const handleDropPlayerChange = (e) => setDropPlayer(e.target.value);

  const canSelectPlayer = (p) => {
    const inTrade = p.tradePlayers?.some(tp => tp.trade.status === "ACCEPTED" || tp.trade.status === "PENDING");
    const inClaim = p.claims?.some(claim => !claim.resolved) || p.dropClaimants?.some(c => !c.claim.resolved);
    return !inTrade && !inClaim;
  };

  const myTeamPlayerIdsInvolved = useMemo(() => {
    if (!user?.team?.players) return new Set();
    return new Set(
      user.team.players
        .filter(p => !canSelectPlayer(p))
        .map(p => p.id)
    );
  }, [user?.team?.players]);

  // Pre-select the target player
  useEffect(() => {
    if (player) setRequestedPlayers([player.id]);
  }, [player]);

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);

  // Trade validation
  const isTradeValid = useMemo(() => {
    if (!selectedPlayers.length || !requestedPlayers.length) return false;
    if (selectedPlayers.length >= requestedPlayers.length) return true;
    return dropPlayer !== null;
  }, [selectedPlayers, requestedPlayers, dropPlayer]);

  const handleSubmitTrade = async () => {
    const offeredNames = roster
      .filter(p => selectedPlayers.includes(p.id))
      .map(p => p.name)
      .join(", ");

    const requestedNames = otherTeamRoster
      .filter(p => requestedPlayers.includes(p.id))
      .map(p => p.name)
      .join(", ");

    const dropName = dropPlayer ? roster.find(p => p.id === dropPlayer)?.name : null;
    const dropText = dropName ? ` and will drop ${dropName}` : "";

    const confirmed = await showConfirmModal({
      title: "Confirm Trade",
      message: `Offer ${offeredNames} for ${requestedNames}${dropText}?`,
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });
    if (!confirmed) return;

    try {
      setIsSubmitting(true);

      await proposeTrade({
        fromTeamId: user.team.id,
        toTeamId: player.team.id,
        offeredPlayerIds: selectedPlayers,
        requestedPlayerIds: requestedPlayers,
        dropPlayerIds: dropPlayer ? [dropPlayer] : [], // ✅ FIXED
      });

      await showResultModal({
        title: "Success",
        message: "Trade proposed!",
        confirmText: "OK",
      });

      navigate(`/player/${encodeURIComponent(player?.name)}`);
    } catch (err) {
      console.error("Error proposing trade:", err);
      await showResultModal({
        title: "Error",
        message: "Failed to propose trade.",
        confirmText: "OK",
      });
      window.location.href = `/player/${encodeURIComponent(player?.name)}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  if (loading || !player) return <LoadingScreen />;

  return (
    <div className="pageContainer dropClaimPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>Propose Trade with {decodedTeamName}</h1>
        <p>
          Trading for {player.name} ({player.league} - {player.position})
        </p>

        {/* Your team */}
        <h3>Your Players (Select to Offer)</h3>
        {roster.length === 0 ? (
          <p>No players on your team.</p>
        ) : (
          <ul className="trade-player-list">
            {roster.map(p => (
              <li key={p.id} style={{ opacity: canSelectPlayer(p) ? 1 : 0.5 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(p.id)}
                    disabled={!canSelectPlayer(p)}
                    onChange={() => toggleSelectPlayer(p.id)}
                  />
                  {p.name} ({p.league} - {p.position}) {!canSelectPlayer(p) && "(In Trade/Claim)"}
                </label>
              </li>
            ))}
          </ul>
        )}

        {/* Other team */}
        <h3>{decodedTeamName} Players (Select to Request)</h3>
        {otherTeamRoster.length === 0 ? (
          <p>No players found on that team.</p>
        ) : (
          <ul className="trade-player-list">
            {otherTeamRoster.map(p => {
              const disabled = otherTeamPlayerIdsInAcceptedTrade.has(p.id);
              return (
                <li key={p.id} style={{ opacity: disabled ? 0.5 : 1 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={requestedPlayers.includes(p.id)}
                      disabled={disabled}
                      onChange={() => toggleRequestedPlayer(p.id)}
                    />
                    {p.name} ({p.league} - {p.position}) {disabled && "(In Accepted Trade)"}
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {/* Drop player selector */}
        {requestedPlayers.length > selectedPlayers.length && (
          <>
            <h3>Select a Player to Drop if Trade Proceeds</h3>
            <select className="tradeInput" value={dropPlayer || ""} onChange={handleDropPlayerChange}>
              <option value="" disabled>Select player to drop</option>
              {roster.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
              ))}
            </select>
          </>
        )}

        <button className="tradeSubmit"
          onClick={handleSubmitTrade}
          style={{
            backgroundColor: buttonBackground,
            color: buttonColor,
            cursor: isSubmitting || !isTradeValid ? "not-allowed" : "pointer",
          }}
          disabled={isSubmitting || !isTradeValid}
        >
          {isSubmitting ? "Submitting..." : "Submit Trade"}
        </button>
      </div>
      <Footer />
      {confirmModalProps && <Modal {...confirmModalProps} />}
      {resultModalProps && <Modal {...resultModalProps} />}
    </div>
  );
};

export default Trade;

