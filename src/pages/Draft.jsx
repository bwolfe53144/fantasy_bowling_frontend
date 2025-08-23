import { useEffect, useState, useContext, useMemo, useRef, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext.jsx";
import { processPlayerStats } from "../utils/ProcessPlayerStats.js";
import { getThemeColors } from "../utils/themeColors.js";
import { ThemeContext } from "../utils/ThemeContext.jsx";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import BaseFilters from "../../components/BaseFilters.jsx";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/Modal.jsx";
import { useModal } from "../../hooks/useModal.js";
import { io } from "socket.io-client";
import { getAudioContext } from "../utils/audioManager.js";
import '../styles/Draft.css';
import '../styles/Players.css';

const draftOrderBase = ["Bowling Stones", "Lisa's Team", "The Underdogs", "Gutter Control", "Go Packers Go", "Bergernation", "Joel Jr's Team", "The Takeover", "The Wolf Pack", "Scott's Team", "Will's Team", "Greg's Team", "My Drinking Team", "Dewbertz", "Pinsanity", "Shirts Off", "Bowlyfans", "My Imaginary Friends", "Erik B's Team", "TSAO", "Poblo" ];
const fantasyLeagues = [
  "Andys Classic",
  "Beavers Latestarters",
  "Cheris Night Out",
  "Ren Faire",
  "Inner City",
  "Sunday AM",
];
const totalRounds = 15;
const SOCKET_SERVER_URL = "https://fantasybowlingbackend.onrender.com"; 
const DEFAULT_TIMER = 15;

const Draft = () => {
  const { user, loading, players, loadPlayers } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [draftedPlayers, setDraftedPlayers] = useState([]);
  const [inactiveTeams, setInactiveTeams] = useState(new Set());
  const [currentTimer, setCurrentTimer] = useState(DEFAULT_TIMER);
  const [teamStatus, setTeamStatus] = useState({}); // Online status map
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const playersPerPage = 50;
  const [sortField, setSortField] = useState("lyAverage");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortPosition, setSortPosition] = useState("");
  const [showLastYear, setShowLastYear] = useState(true);
  const [leagueFilter, setLeagueFilter] = useState([]);
  const [gamesFilter, setGamesFilter] = useState(null);      
  const [lyGamesFilter, setLyGamesFilter] = useState(45);   
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [modalProps, showModal] = useModal();
  const socketRef = useRef(null);
  const draftedPlayersRef = useRef(draftedPlayers);
  const playersRef = useRef(players);
  const userRef = useRef(user);
  const availablePlayersRef = useRef([]);
  const autoPickInProgressRef = useRef(false);
  const beepSound = useRef(new Audio("/sounds/beep.mp3"));
  const turnSound = useRef(new Audio("/sounds/turn.mp3"));
  
  useEffect(() => { draftedPlayersRef.current = draftedPlayers; }, [draftedPlayers]);
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { availablePlayersRef.current = sortedData; }, [sortedData]);

  const draftOrder = useMemo(() => {
    const picks = [];
    for (let round = 1; round <= totalRounds; round++) {
      if (round % 2 === 1) picks.push(...draftOrderBase);
      else picks.push(...[...draftOrderBase].reverse());
    }
    return picks;
  }, []);

  const picksUntilYourTurn = useMemo(() => {
    if (!user?.team?.name) return null;
    for (let i = currentPickIndex; i < draftOrder.length; i++) {
      if (draftOrder[i] === user.team.name) {
        return i - currentPickIndex;
      }
    }
    return null; // draft finished or your team already picked
  }, [currentPickIndex, draftOrder, user]);

  const currentTeamOnClock = draftOrder[currentPickIndex] || "";

  const lastPick = draftedPlayers.length > 0 
  ? draftedPlayers[draftedPlayers.length - 1] 
  : null;

  const processedPlayers = useMemo(() => {
    if (!Array.isArray(players)) return [];
    return players.map(p => processPlayerStats(p));
  }, [players]);

  const allAvailablePlayers = useMemo(() => {
    const draftedIds = new Set(draftedPlayers.map(d => d.playerId));
    return processedPlayers
      .filter(p =>
        fantasyLeagues.includes(p.league) &&
        !draftedIds.has(p.id) &&
        !p.teamId &&
        p.lyAverage !== undefined
      );
  }, [processedPlayers, draftedPlayers]);

  const applySort = useCallback((arr, field = sortField, order = sortOrder) => {
    if (!field) return arr.slice();
    const sorted = [...arr].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      if (field === "position") {
        const positionOrder = { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "flex": 6 };
        aVal = positionOrder[aVal] ?? 999;
        bVal = positionOrder[bVal] ?? 999;
      } else {
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          aVal = aNum;
          bVal = bNum;
        } else {
          aVal = (aVal ?? "").toString().toLowerCase();
          bVal = (bVal ?? "").toString().toLowerCase();
        }
      }

      if (aVal > bVal) return order === "asc" ? 1 : -1;
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [sortField, sortOrder]);

    useEffect(() => {
      document.body.classList.toggle("menuOpen", isMenuOpen);
      return () => document.body.classList.remove("menuOpen");
    }, [isMenuOpen]);

    const lastBeepRef = useRef(null);

// Draft countdown sound
useEffect(() => {
  if (!user?.team?.name) return;

  // Stop the beep immediately if not your turn or inactive
  if (user.team.name !== currentTeamOnClock || inactiveTeams.has(currentTeamOnClock)) {
    beepSound.current.pause();
    beepSound.current.currentTime = 0;
    lastBeepRef.current = null;
    return;
  }

  // Only start beep once at exactly 10 seconds
  if (currentTimer === 10 && lastBeepRef.current !== 10) {
    lastBeepRef.current = 10;

    const ctx = getAudioContext();
    ctx.resume().then(() => {
      beepSound.current.currentTime = 0;
      beepSound.current.play().catch(err => console.warn("Sound blocked:", err));
    });
  }
}, [currentTimer, user, currentTeamOnClock, inactiveTeams]);

// Play a one-time "your turn" sound when it switches to your team
const previousTeamRef = useRef(null);
useEffect(() => {
  if (!user?.team?.name) return;

  if (user.team.name === currentTeamOnClock && previousTeamRef.current !== currentTeamOnClock) {
    const ctx = getAudioContext();
    ctx.resume().then(() => {
      turnSound.current.currentTime = 0;
      turnSound.current.play().catch(err => console.warn("Sound blocked:", err));
    });
  }
  previousTeamRef.current = currentTeamOnClock;
}, [currentTeamOnClock, user]);

  useEffect(() => {
    let data = allAvailablePlayers;
    if (gamesFilter !== null) data = data.filter(p => p.lyGames >= gamesFilter);
    if (lyGamesFilter !== null) data = data.filter(p => p.lyGames >= lyGamesFilter);
    if (leagueFilter.length > 0) data = data.filter(p => leagueFilter.includes(p.league));
    if (sortPosition) data = data.filter(p => String(p.position).toLowerCase() === sortPosition.toLowerCase());
    if (searchQuery) data = data.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredData(data);
    setSortedData(applySort(data, sortField, sortOrder));
    setCurrentPage(0);
  }, [allAvailablePlayers, gamesFilter, lyGamesFilter, leagueFilter, sortPosition, searchQuery, applySort, sortField, sortOrder]);

  const handleSort = (field) => {
    const order = (sortField === field && sortOrder === "asc") ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    setSortedData(prev => applySort(prev, field, order));
    setCurrentPage(0);
  };

  const handleNextPage = () => { if ((currentPage + 1) * playersPerPage < sortedData.length) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 0) setCurrentPage(currentPage - 1); };

  useEffect(() => {
    if (!loading && (!players || players.length === 0)) {
      loadPlayers();
    }
  }, [players, loadPlayers, loading]);

  // --- SOCKET SETUP ---
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    // Draft updates
    socket.on("draftUpdate", (draftState) => {
      setCurrentPickIndex(draftState.currentPickIndex || 0);
      setDraftedPlayers(draftState.draftedPlayers || []);
      setInactiveTeams(new Set(draftState.inactiveTeams || []));
      if (typeof draftState.timer === "number") setCurrentTimer(draftState.timer);
      autoPickInProgressRef.current = false;
    });

    socket.on("timerUpdate", (timeLeft) => {
      if (typeof timeLeft === "number") setCurrentTimer(timeLeft);
    });

    socket.on("draftStarted", (draftState) => {
      setCurrentPickIndex(draftState.currentPickIndex || 0);
      setDraftedPlayers(draftState.draftedPlayers || []);
      setInactiveTeams(new Set(draftState.inactiveTeams || []));
      if (typeof draftState.timer === "number") setCurrentTimer(draftState.timer);
      autoPickInProgressRef.current = false;
    });

    // Team online/offline updates
    socket.on("teamStatusUpdate", (status) => {
      setTeamStatus(status); // e.g., { "The Wolf Pack": true, "Poblo": false }
    });

    socket.on("error", (msg) => console.warn("Server error:", msg));

    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  useEffect(() => {
    if (!socketRef.current || players.length === 0) return;
    const sendPlayers = () => {
      socketRef.current.emit("setAllPlayers", players);
    };
    if (socketRef.current.connected) sendPlayers();
    else socketRef.current.once("connect", sendPlayers);
  }, [players]);

  useEffect(() => {
    if (!socketRef.current || !user?.team?.name) return;
    socketRef.current.emit("registerTeam", user.team.name);
  }, [user]);

  const handlePickPlayer = (player) => {
    if (user?.team?.name !== currentTeamOnClock) {
      alert("It's not your team's turn.");
      return;
    }
    if (!socketRef.current) {
      alert("Socket disconnected.");
      return;
    }
  
    socketRef.current.emit("pickPlayer", {
      playerId: player.id,
      teamName: currentTeamOnClock,
      playerData: { ...player },
    });
  
    // Create a brand new Audio instance each time for immediate playback
    const ding = new Audio("/sounds/ding.mp3");
    ding.volume = 0.6; // optional, adjust volume
    ding.play().catch(err => console.warn("Pick sound blocked:", err));
  };

  const removeInactivity = (teamName) => {
    if (!socketRef.current) return;
    socketRef.current.emit("removeInactivity", { teamName });
  };

  const handleStartDraft = async () => {
    if (!socketRef.current) return;
  
    const confirmed = await showModal({
      title: "Start Draft",
      message: "Are you sure you want to start/reset the draft?",
      confirmText: "Yes, Start Draft",
      cancelText: "Cancel",
      showCancel: true,
    });
  
    if (!confirmed) return;
  
    socketRef.current.emit("startDraft", { timer: DEFAULT_TIMER });
  };

  const draftedByTeam = useMemo(() => {
    const map = {};
    draftedPlayers.forEach(({ teamName, playerData }) => {
      if (!map[teamName]) map[teamName] = [];
      map[teamName].push(playerData);
    });
    return map;
  }, [draftedPlayers]);

  const { backgroundColor, color, buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className={`pageContainer player-page ${isDarkMode ? "dark" : "light"}`}>
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
  
      <div className="mainPage player-page">
        <h1 className="draftTitle">Draft Room</h1>
          <button
            className="draftButton"
            onClick={handleStartDraft}
            style={{ backgroundColor: buttonBackground, color: buttonColor }}
          >
            Mock Draft
          </button>

        {/* Drafted Players */}
        <div className="draftedTeamsContainer">
          {draftOrderBase.map(teamName => (
            <div
            key={teamName}
            className={`draftedTeamBox ${teamName === currentTeamOnClock ? "activeDrafting" : ""}`}
          >
            <h3 className="draftedTeamName">{teamName}</h3>
            {draftedByTeam[teamName]?.length ? (
              draftedByTeam[teamName].map((player, idx) => (
                <div key={player.id ?? `${teamName}-${idx}`} className="draftedPlayerItem">
                  {player.name} ({player.position})
                </div>
              ))
            ) : (
              <p className="noPicksYet">No picks yet</p>
            )}
          </div>
          ))}
        </div>
        {/* Your Team Drafted Players */}
        {user?.team?.name && (
          <div className="yourDraftedPlayersContainer">
            <h2>Your Drafted Players</h2>
            {draftedByTeam[user.team.name]?.length ? (
              <div className="yourDraftedPlayersList">
                {draftedByTeam[user.team.name].map((player, idx) => (
                  <div key={player.id ?? `${user.team.name}-${idx}`} className="draftedPlayerCard">
                    {player.name} ({player.position})
                  </div>
                ))}
              </div>
            ) : (
              <p>No picks yet</p>
            )}
          </div>
        )}
        {/* Remove Inactivity button */}
        {user?.team?.name && inactiveTeams.has(user.team.name) && (
              <button className="inactive-button" onClick={() => removeInactivity(user.team.name)}>Remove Inactivity</button>
          )}
        <div className="pickInfo">
          {/* --- Last Pick --- */}
          {lastPick && (
            <div className="lastPickInfo">
              <strong>Last Pick:</strong> {lastPick.playerData?.name} ({lastPick.playerData?.position}) 
              by {lastPick.teamName}
            </div>
          )}
          {/* --- Current Pick --- */}
          <strong>Current Pick:</strong>
          {currentPickIndex >= draftOrder.length
            ? (
              <>
                Draft Completed
                {user?.role === "SUPERADMIN" && (
                  <button
                    className="inactive-button"
                    style={{ marginLeft: "1rem", backgroundColor: buttonBackground, color: buttonColor }}
                    onClick={() => {
                      if (!socketRef.current) return;
                      if (!window.confirm("Assign all drafted players to their teams?")) return;
                      socketRef.current.emit("assignDraftedPlayersToTeams");
                    }}
                  >
                    Assign Drafted Players
                  </button>
                )}
              </>
            )
            : ` ${currentTeamOnClock} (Pick ${currentPickIndex + 1} of ${draftOrder.length})`}
          
          {currentPickIndex < draftOrder.length && inactiveTeams.has(currentTeamOnClock) && (
            <span className="inactiveLabel">(Inactive - auto drafting)</span>
          )}

          {currentPickIndex < draftOrder.length && (
            <div><strong>Time Remaining: {currentTimer} seconds</strong></div>
          )}

          {picksUntilYourTurn !== null && picksUntilYourTurn > 0 && (
            <div className="pick-text">
              Your team drafts in {picksUntilYourTurn} pick{picksUntilYourTurn > 1 ? "s" : ""}
            </div>
          )}
        </div>
        <button
        onClick={() => setShowFilters((prev) => !prev)}
        className="draftButton"
        style={{color: buttonColor , backgroundColor: buttonBackground}}>
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>
      {showFilters && (
        <BaseFilters
          sortPosition={sortPosition} setSortPosition={setSortPosition}
          leagueFilter={leagueFilter} setLeagueFilter={setLeagueFilter}
          uniqueLeagues={fantasyLeagues}
          gamesFilter={gamesFilter} setGamesFilter={setGamesFilter}
          lyGamesFilter={lyGamesFilter} setLyGamesFilter={setLyGamesFilter}
          showLastYear={showLastYear} setShowLastYear={setShowLastYear}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          hideLastYearToggle={true}
        />
      )}
        {/* Players Table */}
        <div className="horizontalScrollArea">
          <table className="playerStatsTable">
            <thead className="statsHeader" >
              <tr>
                <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("name")}>
                  Name {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
                </th>
                <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("league")}>
                  League {sortField === "league" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
                </th>
                <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("position")}>
                  Position {sortField === "position" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
                </th>
                <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("games")}>
                  Games {sortField === "games" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
                </th>
                <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("lyGames")}>
                  Games (LY) {sortField === "lyGames" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
                </th>
                <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("average")}>
                  Average {sortField === "average" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
                </th>
                <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("lyAverage")}>
                  Last Year Average {sortField === "lyAverage" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
                </th>
                <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("totalPoints")}>
                  Total Fantasy Points {sortField === "totalPoints" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
                </th>
                <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("avgFanppg")}>
                  Avg Fan Ppg {sortField === "avgFanppg" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
                </th>
                <th style={{ backgroundColor, color }}>Pick</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="noPlayersCell">No players found.</td>
                </tr>
              ) : (
                sortedData
                  .slice(currentPage * playersPerPage, (currentPage + 1) * playersPerPage)
                  .map(player => (
                    <tr key={player.id}>
                      <td>
                        <Link to={`/player/${encodeURIComponent(player.name)}`} className="playerLink">
                          {player.name}
                        </Link>
                      </td>
                      <td>{player.league}</td>
                      <td>{player.position}</td>
                      <td>{player.games}</td>
                      <td>{player.lyGames}</td>
                      <td>{typeof player.average === "number" ? player.average.toFixed(2) : "-"}</td>
                      <td>{player.lyAverage ? Number(player.lyAverage).toFixed(2) : "-"}</td>
                      <td>{player.totalPoints}</td>
                      <td>{typeof player.avgFanppg === "number" ? player.avgFanppg.toFixed(2) : "-"}</td>
                      <td>
                        {user?.team?.name === currentTeamOnClock && (
                          <button className="pickButton" onClick={() => handlePickPlayer(player)}>Pick</button>
                        )}
                      </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
  
        {sortedData.length > playersPerPage && (
          <div className="pagination-buttons">
            <button className="playerButton playerPageButton" style={{ backgroundColor: buttonBackground, color: buttonColor }} onClick={handlePrevPage} disabled={currentPage === 0}>Prev</button>
            <span className="page-number">Page {currentPage + 1} / {Math.ceil(sortedData.length / playersPerPage)}</span>
            <button className="playerButton playerPageButton" style={{ backgroundColor: buttonBackground, color: buttonColor }} onClick={handleNextPage} disabled={(currentPage + 1) * playersPerPage >= sortedData.length}>Next</button>
          </div>
        )}
        {/* --- Teams Online / Inactive Panel --- */}
      <div className="teamStatusContainer">
    

    <h2>Teams</h2>
    <div className="teamsGrid">
      {draftOrderBase.map(team => (
        <div
          key={team}
          className="teamBox"
          style={{ color: teamStatus[team] ? "green" : "red" }}
        >
          {team} {teamStatus[team] ? "(Online)" : "(Offline)"}
        </div>
      ))}
    </div>
  </div>
  {modalProps && <Modal {...modalProps} />}

      </div>
    </div>
  );
};

export default Draft;