import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import LoadingScreen from "../../components/LoadingScreen";
import { AuthContext } from "../utils/AuthContext";
import { deleteClaim, getMyClaims } from "../utils/api";
import "../styles/MyClaimedPlayers.css";

const MyClaimedPlayers = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myClaims, setMyClaims] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fadingOutIds, setFadingOutIds] = useState([]);


  useEffect(() => {
    document.body.classList.add("claimed-bg");
    return () => {
      document.body.classList.remove("claimed-bg");
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user]);

  const fetchClaims = async () => {
    try {
      const res = await getMyClaims(user?.token);
      setMyClaims(res.data.myClaimedPlayers || []);
    } catch (err) {
      console.error("Error fetching my claimed players:", err);
    }
  };

  const handleRemoveClaim = async (playerId) => {
    const confirmed = window.confirm("Are you sure you want to remove this claim?");
    if (!confirmed) return;

    try {
      setFadingOutIds((prev) => [...prev, playerId]);

      setTimeout(async () => {
        await deleteClaim(playerId, user.id, user.token);
        setMyClaims((prevClaims) =>
          prevClaims.filter((claim) => claim.playerId !== playerId)
        );
        setFadingOutIds((prev) => prev.filter((id) => id !== playerId));
        alert("Claim removed.");
      }, 300);
    } catch (error) {
      console.error("Error removing claim:", error);
      alert("Failed to remove claim.");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer claimed-bg">
      <div className="background-overlay"></div>
  
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      
      <div className="mainPage my-claimed-players">
        <h2>My Claimed Players</h2>
  
        {myClaims.length === 0 ? (
          <div className="empty-message">
            <p>You haven't claimed any players yet.</p>
            <button
              onClick={() => navigate("/players")}
              className="go-to-players-button"
            >
              Go to Players Page
            </button>
          </div>
        ) : (
          <ul className="claims-list">
            {myClaims.map((claim) => (
              <li
                key={claim.playerId}
                className={`claim-item ${fadingOutIds.includes(claim.playerId) ? "fade-out" : ""}`}
              >
                <strong>{claim.playerName}</strong> ({claim.league}) — Claimed by{" "}
                <em>{claim.teams.map((t) => t.name).join(", ")}</em> — {claim.timeLeft}
                <br />
                <button
                  onClick={() => handleRemoveClaim(claim.playerId)}
                  disabled={loading}
                  className="remove-claim-button"
                  aria-label={`Remove claim for ${claim.playerName}`}
                >
                  Remove Claim
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
  
      <Footer page={myClaims} />
    </div>
  );
};

export default MyClaimedPlayers;