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
import {
  DraftedTeamsContainer,
  YourDraftedPlayers,
  PickInfo,
  PlayersTable,
} from "../../components/DraftRoomComponents";
import { useModal } from "../../hooks/useModal.js";
import { io } from "socket.io-client";
import { getAudioContext } from "../utils/audioManager.js";
import '../styles/Draft.css';
import '../styles/Players.css';

const draftOrderBase = ["Bowling Stones", "Lisa's Team", "Hell’s Kitchen", "Gutter Control", "Go Packers Go", "Bergernation", "Joel Jr's Team", "The Takeover", "The Wolf Pack", "Scott's Team", "Iconic Ink", "Greg's Team", "My Drinking Team", "Dewbertz", "Pinsanity", "Shirts Off", "My Imaginary Friends", "Erik B's Team", "Waddle You Doing Step Burrow", "Poblo" ];
const fantasyLeagues = [
  "Andys Classic",
  "Beavers Latestarters",
  "Cheris Night Out",
  "Ren Faire",
  "Inner City",
  "Sunday AM",
];
const totalRounds = 15;
const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL;
const DEFAULT_TIMER = 5;

const Draft = () => {
  const { user, loading, players, loadPlayers } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [draftedPlayers, setDraftedPlayers] = useState([]);
  const [inactiveTeams, setInactiveTeams] = useState(() => new Set());
  const [currentTimer, setCurrentTimer] = useState(DEFAULT_TIMER);
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
      p.lyAverage !== undefined &&               
      Number(p.lyGames ?? 0) >= lyGamesFilter && 
      Number(p.games ?? 0) >= gamesFilter       
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
    if (gamesFilter !== null) data = data.filter(p => p.games >= gamesFilter);
    if (lyGamesFilter !== null) data = data.filter(p => p.lyGames >= lyGamesFilter);
    if (leagueFilter.length > 0) data = data.filter(p => leagueFilter.includes(p.league));
    if (sortPosition) data = data.filter(p => String(p.position).toLowerCase() === sortPosition.toLowerCase());
    if (searchQuery) data = data.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredData(data);
    setSortedData(applySort(data, sortField, sortOrder));
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
  
    // --- Draft updates ---
    socket.on("draftUpdate", (draftState) => {
      setCurrentPickIndex(draftState.currentPickIndex || 0);
      setDraftedPlayers(draftState.draftedPlayers || []);
  
      // ⚡ Only merge if server sends new inactive teams
      if (draftState.inactiveTeams && draftState.inactiveTeams.length > 0) {
        setInactiveTeams(prev => {
          const merged = new Set(prev);
          draftState.inactiveTeams.forEach(team => merged.add(team));
          return merged;
        });
      }
  
      if (typeof draftState.timer === "number") setCurrentTimer(draftState.timer);
      autoPickInProgressRef.current = false;
    });
  
    // --- Draft start / restart ---
    socket.on("draftStarted", (draftState) => {
      setCurrentPickIndex(draftState.currentPickIndex || 0);
      setDraftedPlayers(draftState.draftedPlayers || []);
      if (typeof draftState.timer === "number") setCurrentTimer(draftState.timer);
      autoPickInProgressRef.current = false;
    });
  
    // --- Timer updates ---
    socket.on("timerUpdate", (timeLeft) => {
      if (typeof timeLeft === "number") setCurrentTimer(timeLeft);
    });
  
    // --- Error logging ---
    socket.on("error", (msg) => console.warn("Server error:", msg));
  
    // --- Cleanup ---
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || players.length === 0) return;
    const sendPlayers = () => {
      socketRef.current.emit("setAllPlayers", processedPlayers);
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
    setInactiveTeams(prev => {
      const copy = new Set(prev);
      copy.delete(teamName);
      return copy;
    });
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
  
    socketRef.current.emit("startDraft"); // ✅ no timer sent, backend decides
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
          Start Mock Draft
        </button>
  
        {/* Drafted Players */}
        <DraftedTeamsContainer
          draftOrderBase={draftOrderBase}
          draftedByTeam={draftedByTeam}
          currentTeamOnClock={currentTeamOnClock}
        />
  
        {/* Your Team Drafted Players */}
        <YourDraftedPlayers user={user} draftedByTeam={draftedByTeam} />
  
        {/* Remove Inactivity button */}
        {user?.team?.name && inactiveTeams.has(user.team.name) && (
          <button
            className="inactive-button"
            onClick={() => removeInactivity(user.team.name)}
          >
            Remove Inactivity
          </button>
        )}
  
        {/* Pick Info */}
        <PickInfo
          lastPick={lastPick}
          currentPickIndex={currentPickIndex}
          draftOrder={draftOrder}
          currentTeamOnClock={currentTeamOnClock}
          inactiveTeams={inactiveTeams}
          currentTimer={currentTimer}
          picksUntilYourTurn={picksUntilYourTurn}
          user={user}
          buttonBackground={buttonBackground}
          buttonColor={buttonColor}
          socketRef={socketRef}
        />
  
        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="draftButton"
          style={{ color: buttonColor, backgroundColor: buttonBackground }}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
        {showFilters && (
          <BaseFilters
            sortPosition={sortPosition}
            setSortPosition={setSortPosition}
            leagueFilter={leagueFilter}
            setLeagueFilter={setLeagueFilter}
            uniqueLeagues={fantasyLeagues}
            gamesFilter={gamesFilter}
            setGamesFilter={setGamesFilter}
            lyGamesFilter={lyGamesFilter}
            setLyGamesFilter={setLyGamesFilter}
            showLastYear={showLastYear}
            setShowLastYear={setShowLastYear}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            hideLastYearToggle={true}
          />
        )}
  
        {/* Players Table */}
        <PlayersTable
          sortedData={sortedData}
          sortField={sortField}
          sortOrder={sortOrder}
          handleSort={handleSort}
          backgroundColor={backgroundColor}
          color={color}
          currentPage={currentPage}
          playersPerPage={playersPerPage}
          user={user}
          currentTeamOnClock={currentTeamOnClock}
          handlePickPlayer={handlePickPlayer}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          buttonBackground={buttonBackground}
          buttonColor={buttonColor}
        />
  
        {/* Teams Online / Inactive Panel */}
        <div className="teamStatusContainer">
          <h2>Teams</h2>
          <div className="teamsGrid">
            {draftOrderBase.map((teamName) => (
              <div
                key={teamName}
                className="teamBox"
                style={{
                  color: inactiveTeams.has(teamName) ? "red" : "green",
                  fontWeight: currentTeamOnClock === teamName ? "bold" : "normal",
                }}
              >
                {teamName} {inactiveTeams.has(teamName) ? "(Inactive)" : "(Active)"}
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