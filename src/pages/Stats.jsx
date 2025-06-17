import { useEffect, useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext.jsx";
import { processPlayerStats } from "../utils/ProcessPlayerStats.js";
import { getThemeColors } from "../utils/themeColors.js";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import BaseFilters from "../../components/BaseFilters.jsx";
import LoadingScreen from "../../components/LoadingScreen";
import { CSVLink } from "react-csv";
import '../styles/Players.css';
import '../styles/Stats.css';

const Stats = () => {
  const { user, teams, players, loading } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(0);
  const playersPerPage = 30;
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortPosition, setSortPosition] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [gamesFilter, setGamesFilter] = useState(null);
  const [lyGamesFilter, setLyGamesFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLastYear, setShowLastYear] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  // Process players once and map stats
  const allPlayers = useMemo(() => {
    if (!Array.isArray(players)) return [];
    return players.map(processPlayerStats);
  }, [players, teams]);

  // Unique leagues & teams for filters
  const uniqueLeagues = useMemo(() => [...new Set(allPlayers.map(p => p.league))].sort(), [allPlayers]);
  const uniqueTeams = useMemo(() => [...new Set(allPlayers.map(p => p.team))].sort(), [allPlayers]);

  // Filter players based on filters & search
  useEffect(() => {
    if (loading) return;

    let data = allPlayers;

    if (gamesFilter !== null) {
      data = data.filter(player => player.games >= gamesFilter);
    }
    if (leagueFilter) {
      data = data.filter(player => player.league === leagueFilter);
    }
    if (teamFilter) {
      data = data.filter(player => player.team === teamFilter);
    }
    if (sortPosition) {
      data = data.filter(player => String(player.position).toLowerCase() === sortPosition.toLowerCase());
    }
    if (searchQuery) {
      data = data.filter(player => player.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (showLastYear && lyGamesFilter !== null) {
      data = data.filter(player => parseInt(player.lyGames || 0) >= lyGamesFilter);
    }
  }

    setFilteredData(data);
    setCurrentPage(0);
  }, [searchQuery, gamesFilter, sortPosition, leagueFilter, teamFilter, allPlayers, loading]);

  const { backgroundColor, color, buttonBackground, buttonColor } = getThemeColors(user?.color);

  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    minWidth: "90px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "2rem"
  };

  // Sorting function triggered by header click
  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(0);
  };

  // Render table header with sorting arrows
  const renderSortableHeader = (label, field) => {
    const sortDirection = sortField === field ? sortOrder : 'none';
    return (
      <th
        onClick={() => handleSort(field)}
        style={{ cursor: 'pointer' }}
        aria-sort={sortDirection}
        role="columnheader"
        scope="col"
      >
        {label} {sortDirection === "asc" ? "▲" : sortDirection === "desc" ? "▼" : "●"}
      </th>
    );
  };

  // Sorted data memoized based on filteredData and sort params
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    const positionOrder = { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "flex": 6 };

    return [...filteredData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "position") {
        aValue = positionOrder[aValue] ?? 999;
        bValue = positionOrder[bValue] ?? 999;
      } else if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else {
        aValue = String(aValue ?? "").toLowerCase();
        bValue = String(bValue ?? "").toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [filteredData, sortField, sortOrder]);

  // CSV headers for export, conditional on showLastYear toggle
  const csvHeaders = useMemo(() => {
    const base = [
      { label: "Name", key: "name" },
      { label: "League", key: "league" },
      { label: "Position", key: "position" },
      { label: "Games", key: "games" },
      { label: "Total Pins", key: "totalPins" },
      { label: "Average", key: "average" },
      { label: "Total Fantasy Points", key: "newFormulaPoints" },
      { label: "Avg Fan Ppg", key: "avgFanppg" }
    ];
    const ly = showLastYear
      ? [
          { label: "LY Games", key: "lyGames" },
          { label: "LY Avg", key: "lyAverage" },
          { label: "LY Fan Pts", key: "lyPoints" },
          { label: "LY Fan Ppg", key: "lyFppg" }
        ]
      : [];
    const team = !showLastYear ? [{ label: "Team", key: "team" }] : [];
    return [...base, ...ly, ...team];
  }, [showLastYear]);

  // Prepare CSV data with formatting decimals
  const csvData = useMemo(() => {
    return sortedData.map(p => ({
      ...p,
      average: p.average?.toFixed(2),
      avgFanppg: p.avgFanppg?.toFixed(2),
      lyFppg: p.lyGames ? (p.lyPoints / p.lyGames).toFixed(2) : "0.00"
    }));
  }, [sortedData]);

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

  if (loading) return <LoadingScreen />;

  return (
    <div className="pageContainer statpage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage statpage">

        <div className="horizontalStickyBar">
          <h1>Player Stats</h1>
          <div className="buttonGroup">
            <button
              className="playerButton"
              style={buttonStyle}
              onClick={() => setShowFilters(prev => !prev)}
              aria-label="Toggle filter panel"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <CSVLink
              headers={csvHeaders}
              data={csvData}
              filename={`Player_Stats_${showLastYear ? "LastYear" : "Current"}.csv`}
              className="csvButton"
              style={buttonStyle}
              aria-label="Download player stats CSV"
            >
              Export CSV
            </CSVLink>
          </div>
        </div>

        {showFilters && (
          <div className="statsFilterContainer">
            <div className="baseFilterWrapper">
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
                teamFilter={teamFilter}
                setTeamFilter={setTeamFilter}
                uniqueTeams={uniqueTeams}
                showLastYear={showLastYear}
                setShowLastYear={setShowLastYear}
                lyGamesFilter={lyGamesFilter}
                setLyGamesFilter={setLyGamesFilter}
              />
            </div>
          </div>
        )}

        <div className="horizontalScrollArea">
          <table className="playerStatsTable" border="1" role="table" aria-label="Player statistics table">
            <caption className="sr-only">Player Statistics Table</caption>
            <thead style={{ backgroundColor, color }}>
              <tr>
                {renderSortableHeader("Name", "name")}
                {renderSortableHeader("League", "league")}
                {renderSortableHeader(showLastYear ? "Pos" : "Position", "position")}
                {renderSortableHeader("Games", "games")}
                {renderSortableHeader(showLastYear ? "Pins" : "Total Pins", "totalPins")}
                {renderSortableHeader(showLastYear ? "Avg" : "Average", "average")}
                {renderSortableHeader(showLastYear ? "Fan Pts" : "Total Fantasy Points", "totalPoints")}
                {renderSortableHeader("Avg Fan Ppg", "avgFanppg")}
                {showLastYear && renderSortableHeader("LY Games", "lyGames")}
                {showLastYear && renderSortableHeader("LY Avg", "lyAverage")}
                {showLastYear && renderSortableHeader("LY Fan Pts", "lyPoints")}
                {showLastYear && renderSortableHeader("LY Fan Ppg", "lyFppg")}
                {!showLastYear && <th>Team</th>}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData
                  .slice(currentPage * playersPerPage, (currentPage + 1) * playersPerPage)
                  .map((item, index) => {
                    const lyGames = parseInt(item.lyGames || "0");
                    const lyPoints = parseFloat(item.lyPoints || "0");
                    const lyAvg = parseFloat(item.lyAverage || "0");
                    const lyFppg = lyGames > 0 ? (lyPoints / lyGames).toFixed(2) : "0.00";

                    return (
                      <tr key={index} className={item.team === user?.team?.name ? "highlight" : ""}>
                        <td><Link to={`/player/${encodeURIComponent(item.name)}`}>{item.name || "Unknown Player"}</Link></td>
                        <td>{item.league || "N/A"}</td>
                        <td>{item.position || "N/A"}</td>
                        <td>{item.games || 0}</td>
                        <td>{item.totalPins || 0}</td>
                        <td>{item.average?.toFixed(2) || 0}</td>
                        <td>{item.totalPoints || 0}</td>
                        <td>{item.avgFanppg?.toFixed(2) || 0}</td>
                        {showLastYear && <td>{lyGames}</td>}
                        {showLastYear && <td>{lyAvg.toFixed(2)}</td>}
                        {showLastYear && <td>{lyPoints}</td>}
                        {showLastYear && <td>{item.lyFppg?.toFixed(2) ?? "0.00"}</td>}
                        {!showLastYear && (
                          <td>
                            {item.team && item.teamId ? (
                              <Link to={`/team/${encodeURIComponent(item.teamId)}`}>{item.team}</Link>
                            ) : (
                              "Free Agent"
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={showLastYear ? "13" : "9"} style={{ textAlign: "center" }}>
                    No players found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sortedData.length > playersPerPage && (
          <div className="pagination-buttons">
            <button
              className="playerButton playerPagButton"
              style={buttonStyle}
              onClick={handlePrev}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <span className="page-number">
              Page {currentPage + 1} of {Math.ceil(sortedData.length / playersPerPage)}
            </span>
            <button
              className="playerButton playerPagButton"
              style={buttonStyle}
              onClick={handleNext}
              disabled={(currentPage + 1) * playersPerPage >= sortedData.length}
            >
              Next
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default Stats;