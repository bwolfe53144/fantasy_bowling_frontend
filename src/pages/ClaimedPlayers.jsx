import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../utils/AuthContext";
import { fetchAllClaims, fetchRecentTransactions } from "../utils/api";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/ClaimedPlayers.css";
import "../styles/MyClaimedPlayers.css";

const ClaimedPlayers = () => {
  const { user, loading } = useContext(AuthContext);
  const [allClaims, setAllClaims] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clientReady, setClientReady] = useState(false); // for client-side only rendering

  // Mark component as client-ready
  useEffect(() => {
    setClientReady(true);
  }, []);

  // Toggle menu class
  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  // Set background class
  useEffect(() => {
    document.documentElement.classList.add("claimed-bg");
    document.body.classList.add("claimed-bg");
    return () => {
      document.documentElement.classList.remove("claimed-bg");
      document.body.classList.remove("claimed-bg");
    };
  }, []);

  // Fetch all claimed players
  useEffect(() => {
    const getAllClaims = async () => {
      try {
        const res = await fetchAllClaims();
        setAllClaims(res.data.allClaimedPlayers || []);
        console.log(res.data.allClaimedPlayers);
      } catch (err) {
        console.error("Error fetching claimed players:", err);
      }
    };

    if (user) getAllClaims();
  }, [user]);

  // Fetch recent transactions
  const fetchTransactions = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetchRecentTransactions(page);
      setTransactions(res.data.transactions);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchTransactions(currentPage);
  }, [user, currentPage, fetchTransactions]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="pageContainer claimed-bg">
        <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
        <Navbar />
        <div className="mainPage my-claimed-players">
          <p>You must be logged in to view claimed players.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pageContainer claimed-bg">
      <div className="background-overlay"></div>
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage my-claimed-players">
        <div className="claimsSection">
          <h2>All Claimed Players</h2>
          {allClaims.length === 0 ? (
            <p>No players are currently claimed.</p>
          ) : (
            <ul>
              {allClaims.map(claim => (
                <li key={claim.playerId}>
                  <strong>{claim.playerName}</strong> ({claim.league}) — Claimed by{" "}
                  <em>{claim.teams.map(t => t.name).join(", ")}</em> — {claim.timeLeft}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="transactionsSection">
          <h2>Recent Transactions</h2>
          <div className="transaction-wrapper">
            {transactions.length === 0 ? (
              <p>No recent transactions.</p>
            ) : (
              <ul className={isLoading ? "dimmed" : ""}>
                {transactions.map(tx => {
                  const isVeto = tx.action.startsWith("Trade vetoed");

                  // Only parse and format timestamp on client
                  const timestampStr = clientReady && tx.timestamp
                    ? new Date(tx.timestamp).toLocaleString("en-US", { timeZone: "America/Chicago" })
                    : "Loading...";

                  return (
                    <li key={tx.id}>
                      {isVeto ? (
                        <span>{tx.action}</span>
                      ) : (
                        <>
                          <strong>{tx.teamName}</strong>{" "}
                          {tx.action === "add"
                            ? "added"
                            : tx.action === "drop"
                            ? "dropped"
                            : tx.action === "traded for"
                            ? "traded for"
                            : tx.action === "traded"
                            ? "traded"
                            : tx.action}{" "}
                          <em>{tx.playerName}</em>
                        </>
                      )}{" "}
                      — {timestampStr}
                    </li>
                  );
                })}
              </ul>
            )}
            {isLoading && <div className="loader-overlay">Loading...</div>}
          </div>

          <div className="pagination">
            <button className="claimPagButton" onClick={handlePreviousPage} disabled={currentPage <= 1}>
              Previous
            </button>
            <span className="claimSpan">
              Page {currentPage} of {totalPages}
            </span>
            <button className="claimPagButton" onClick={handleNextPage} disabled={currentPage >= totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClaimedPlayers;
