import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext.jsx";
import { processPlayerStats } from "../utils/ProcessPlayerStats.js";
import { getThemeColors } from "../utils/themeColors.js";
import { fetchAllClaims, deleteClaim } from "../utils/api.js";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import BaseFilters from "../../components/BaseFilters.jsx";
import LoadingScreen from "../../components/LoadingScreen";
import '../styles/Players.css';

const Players = () => {
  const { user, teams, loading, players } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const playersPerPage = 30;
  const [sortedData, setSortedData] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortPosition, setSortPosition] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");
  const [gamesFilter, setGamesFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [allclaims, setAllClaims] = useState([]);
  const [claimedPlayers, setClaimedPlayers] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    if (!user) return;
  
    const getAllClaims = async () => {
      try {
        const { data } = await fetchAllClaims();
        const rawClaims = data.allClaimedPlayers || [];
  
        setAllClaims(rawClaims);
  
        // → get your team name from the decoded user object
        const myTeamName = user.team?.name?.trim()?.toLowerCase();

        if (myTeamName) {
          const myClaimedIds = rawClaims
            .filter((pc) => 
              pc.teams.some(t => t.name?.trim().toLowerCase() === myTeamName)
            )
            .map((pc) => pc.playerId);

          setClaimedPlayers(myClaimedIds);
        }
      } catch (err) {
        console.error("Error fetching all claims:", err);
      }
    };
  
    getAllClaims();
  }, [user]);

  const allPlayers = useMemo(() => {
    if (!Array.isArray(players)) return [];
  
    return players
      .filter(player => {
        const hasTeam = teams?.some(t => t.id === player.teamId);
        return !player.teamId || !hasTeam; // Keep only unassigned players
      })
      .map(player => {
        return processPlayerStats({
          ...player,
        });
      });
  }, [players, teams]);

  useEffect(() => {
    if (loading) return;

    let data = allPlayers;

    if (gamesFilter !== null) {
      data = data.filter(player => player.games >= gamesFilter);
    }
    if (leagueFilter) {
      data = data.filter(player => player.league === leagueFilter);
    }
    if (sortPosition) {
      data = data.filter(player => String(player.position).toLowerCase() === sortPosition.toLowerCase());
    }
    if (searchQuery) {
      data = data.filter(player => player.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredData(data);
    setSortedData(data);
    setCurrentPage(0);
    }, [searchQuery, gamesFilter, sortPosition, leagueFilter, allPlayers, loading]);

    const uniqueLeagues = useMemo(() => {
      return [...new Set(allPlayers.map(p => p.league))].sort();
    }, [allPlayers]);

  const isClaimedByOthers = (playerId) => {
    const claimEntry = allclaims.find(pc => pc.playerId === playerId);
    if (!claimEntry) return false;
  
    const myTeamName = user.team?.name?.trim()?.toLowerCase();
  
    const claimedTeamNames = claimEntry.teams
      .map(t => t.name?.trim().toLowerCase())
      .filter(Boolean); // remove nulls or undefined
  
    return claimedTeamNames.length > 0 && !claimedTeamNames.includes(myTeamName);
  };

  const { backgroundColor, color, buttonBackground } = getThemeColors(user?.color);
  
  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: "white",
    minWidth: "90px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const claimButtonStyle = {
    backgroundColor: backgroundColor,
    color: "white",
    minWidth: "90px",
    border: "none",
    padding: "1rem 1.4rem",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const handleRemoveClaim = async (playerId) => {
    const confirmed = window.confirm("Are you sure you want to remove this claim?");
    if (!confirmed) return;
  
    try {
      await deleteClaim(playerId, user.id, user.token); 
      setClaimedPlayers(prev => prev.filter(id => id !== playerId));
      alert("Claim removed.");
    } catch (error) {
      console.error("Error removing claim:", error);
      alert("Failed to remove claim.");
    }
  };

  const handleAddPlayer = (player) => {
    navigate(`/drop-player/${player.id}/${player.name}/${player.league}/${player.position}`);
  };

  const handleNext = () => {
    if ((currentPage + 1) * playersPerPage < sortedData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
  
    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
  
      if (field === "position") {
        const positionOrder = { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "flex": 6 };
        aValue = positionOrder[aValue] ?? 999;
        bValue = positionOrder[bValue] ?? 999;
      } else if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
  
      return order === "asc"
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
  
    setSortedData(sorted);
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(0);
  };

  const renderSortableHeader = (label, field, style = {}) => (
    <th 
      onClick={() => handleSort(field)} 
      style={{ cursor: 'pointer', ...style }}
    >
      {label} {sortField === field ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
    </th>
  );
  
  if (loading) {
    return  <LoadingScreen />
  }
  
  return (
    <div className="pageContainer player-page">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
  
      <div className="mainPage player-page">
        <div className="horizontalStickyBar">
          <h1>Available Players</h1>
          <button
            className="playerButton"
            style={buttonStyle}
            onClick={() => setShowFilters(prev => !prev)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
  
        {showFilters && (
          <div className="statsFilterContainer baseFilterWrapper">
            <BaseFilters
              sortPosition={sortPosition}
              setSortPosition={setSortPosition}
              leagueFilter={leagueFilter}
              setLeagueFilter={setLeagueFilter}
              uniqueLeagues={uniqueLeagues}
              gamesFilter={gamesFilter}
              setGamesFilter={setGamesFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        )}
  
        <div className="horizontalScrollArea">
          <table className="playerStatsTable" border="1">
          <thead className="statsHeader">
            <tr>
              {renderSortableHeader("Name", "name", { backgroundColor, color })}
              {renderSortableHeader("League", "league", { backgroundColor, color })}
              {renderSortableHeader("Position", "position", { backgroundColor, color })}
              {renderSortableHeader("Games", "games", { backgroundColor, color })}
              {renderSortableHeader("Total Pins", "totalPins", { backgroundColor, color })}
              {renderSortableHeader("Average", "average", { backgroundColor, color })}
              {renderSortableHeader("Total Fantasy Points", "totalPoints", { backgroundColor, color })}
              {renderSortableHeader("Avg Fan Ppg", "avgFanppg", { backgroundColor, color })}
              {(user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPERADMIN") && (
                <th style={{ backgroundColor, color }}>Actions</th>
              )}
            </tr>
          </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData
                  .slice(currentPage * playersPerPage, (currentPage + 1) * playersPerPage)
                  .map((item, index) => {
                    const isClaimedOther = isClaimedByOthers(item.id);
                    return (
                      <tr key={index} className={isClaimedOther ? "claimed-by-other" : ""}>
                        <td>
                          <Link to={`/player/${encodeURIComponent(item.name)}`}>
                            {item.name}
                          </Link>
                          {isClaimedOther && (
                            <span className="claimed-label">Claimed by another team</span>
                          )}
                        </td>
                        <td>{item.league}</td>
                        <td>{item.position}</td>
                        <td>{item.games}</td>
                        <td>{item.totalPins}</td>
                        <td>{item.average.toFixed(2)}</td>
                        <td>{item.totalPoints}</td>
                        <td>{item.avgFanppg.toFixed(2)}</td>
                        {(user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPERADMIN") && (
                          <td>
                            {claimedPlayers.includes(item.id) ? (
                              <button className="claimButton" style={buttonStyle} onClick={() => handleRemoveClaim(item.id)}>Remove Claim</button>
                            ) : (
                              <button className="claimButton" style={buttonStyle} onClick={() => handleAddPlayer(item)}>Add Player</button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "1rem" }}>
                    No players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
  
        {sortedData.length > 0 && (
          <div className="pagination-buttons">
            <button className="playerButton playerPagButton" style={buttonStyle} onClick={handlePrev} disabled={currentPage === 0}>Previous</button>
            <span className="page-number">
              Page {currentPage + 1} of {Math.ceil(sortedData.length / playersPerPage)}
            </span>
            <button className="playerButton playerPagButton" style={buttonStyle} onClick={handleNext} disabled={(currentPage + 1) * playersPerPage >= sortedData.length}>Next</button>
          </div>
        )}
  
        <div>
          <Link to="/all-claims">
            <button style={claimButtonStyle}>View Claimed Players</button>
          </Link>
        </div>
      </div>
  
      <Footer />
    </div>
  );
};

export default Players;