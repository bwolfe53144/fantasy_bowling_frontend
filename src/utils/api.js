import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL,});

// GET requests
export const checkHasRegular = (teamId) => API.get(`/roster/has-regular/${teamId}`);
export const fetchAllClaims = () => API.get('/api/claims/all');
export const fetchAllLockStatuses = () => API.get(`/get-all-lock-statuses`);
export const fetchAllRosters = () => API.get(`/roster/all`);
export const fetchRecentTransactions = (page) => API.get(`/api/transactions/recent?page=${page}&limit=10`);
export const getAllOwners = () => API.get("/api/owners");
export const getAvailablePriorYears = () => API.get("/prior-years");
export const getCompletedLeagues = (week) => API.get(`/findCompletedLeagues/${week}`);
export const getCompletedWeekLocks = () => API.get("/api/weeklocks/completed");
export const getCurrentWeek = () => API.get('/getCurrentWeek');
export const getDraftState = () => API.get('/api/draft');
export const getEligibleSurvivorPlayers = (league, teamName) => API.get(`/api/survivor-eligible-players/${encodeURIComponent(league)}/${encodeURIComponent(teamName)}`);
export const getIncompleteWeekLocks = () => API.get('/api/weeklocks/incomplete');
export const getMatchById = (id) => API.get(`/api/match/${id}`);
export const getMatchupsForWeek = (week) => API.get(`/matchups/week/${week}`);
export const getMessages = (userId, page, limit) => API.get("/messages", { params: { userId, page, limit } });
export const getMessageById = (id) => API.get(`/messages/${id}`);
export const getMyClaims = (token) => API.get(`/api/claims/my`, { headers: { Authorization: `Bearer ${token}` } });
export const getOwner = (ownerName) => API.get(`/api/owner/${encodeURIComponent(ownerName)}`);
export const getPlayerByName = (decodedName) => API.get(`/api/player-by-name/${encodeURIComponent(decodedName)}`);
export const getPlayers = () => API.get("/players");
export const getPlayersByTeamName = (teamName) => API.get(`/api/fantasy-team/${encodeURIComponent(teamName)}/players`);
export const getPriorYearStandings = (year) => API.get(`/prior-year-standings/${year}`);
export const getRecentMatches = (teamName, currentWeek) => API.get(`/api/matches/recent/${encodeURIComponent(teamName)}/${currentWeek}`);
export const getRoster = (teamId, week) => API.get(`/roster/${teamId}/${week}`);
export const getRosterLockStatus = (teamId, week) => API.get(`/roster-lock-status/${teamId}/${week}`);
export const getRostersForWeek = (week) => API.get(`/rostersForTheWeek/${week}`);
export const getSchedule = () => API.get("/api/schedule");
export const getStarredMessages = (userId) => API.get(`/api/starred-messages/${userId}`);
export const getSurvivorEntriesForLeague = (league) => API.get(`/api/survivor-entries/${encodeURIComponent(league)}`);
export const getSurvivorPicksForTeam = (league, teamName) => API.get(`/api/survivor-picks/${encodeURIComponent(league)}/${encodeURIComponent(teamName)}`);
export const getSurvivorUserPicks = (league, teamName, userId) => API.get(`/api/survivor-picks/user/${league}/${teamName}?userId=${userId}`);
export const getTeamById = (teamId) => API.get(`/team-by-id/${teamId}`);
export const getTeamByName = (teamName) => API.get(`/team/${encodeURIComponent(teamName)}`);
export const getTeamPlayers = (teamName) => API.get(`/api/team/${encodeURIComponent(teamName)}/players`);
export const getTeamRanks = (league, teamName) => API.get(`/api/team/${encodeURIComponent(league)}/${encodeURIComponent(teamName)}/ranks`);
export const getTeams = () => API.get("/teams");
export const getTeamsForHome = () => API.get('/teamsForHome');
export const getTotalLeagues = () => API.get('/totalLeagues');
export const getUnassignedPlayers = () => API.get('/unassigned-players');
export const getUser = (token) => API.get("/user", { headers: { Authorization: `Bearer ${token}` },});  
export const getUsers = () => API.get('/api/get-users');
export const getUserSurvivorEntries = (userId) => API.get(`/survivor-entries/${userId}`);
export const getWeeks = () => API.get("/weeks");
export const getWeekScoreForWeek = (week) => API.get(`/weekscoreForWeek/${week}`);

// POST requests
export const addComment = (content, messageId, authorId) => API.post('/add-comment', { content, messageId, authorId });
export const addPriorYearStanding = (data) => API.post("/api/prior-year-standings", data);
export const assignPlayerBadge = (data) => API.post("/api/badges", data);
export const assignPlayerToTeam = (data) => API.post('/api/assign-player-to-team', data);
export const changeUserRole = (data) => API.post('/api/change-role', data);
export const claimWithDrop = (claimPlayerId, dropPlayerId, userId) => API.post("/api/claims/with-drop", { claimPlayerId, dropPlayerId: dropPlayerId || null, userId });
export const clearPlayersFromTeams = () => API.post('/clear-players');
export const clearWeekscores = (league) => API.post('/api/clear-weekscores', { league });
export const completeWeekLock = (data) => API.post('/api/weeklocks/complete', data);
export const completeSurvivorWeek = (data) => API.post('/api/survivor/complete-week', data);
export const createPlayer = (newPlayer) => API.post(`/api/player`, newPlayer);
export const createSurvivorTeam = (data) => API.post('/api/survivor/signup', data);
export const createTeam = (userId, teamName) => API.post('/create-team', { userId, teamName });
export const createWeekScore = (newScore) => API.post(`/api/weekscore`, newScore);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const generatePlayoffs = (data) => API.post('/api/playoffs/generate', data);
export const generateRoster = (teamId, week) => API.post('/generate-roster', { teamId, week });
export const generateTheSchedule = (data) => API.post('/generate-schedule', data);
export const globalStarMessage = (messageId) => API.post(`/api/messages/${messageId}/global-star`);
export const pickPlayer = (data) => API.post('/api/draft/pick', data);
export const postMessage = ({ title, content, authorId }) => API.post(`/messages`, { title, content, authorId });
export const postRoster = (teamId, week, players) => API.post(`/roster`, { teamId, week, players });
export const processClaim = (payload) => API.post('/api/admin-process-claim', payload);
export const resetPassword = (token, data) => API.post(`/auth/reset-password/${token}`, data);
export const resetPositions = () => API.post('/reset-positions');
export const resetRosters = (season) => API.post('/reset-rosters', { season: parseInt(season) });
export const resetSurvivorLeague = (league) => API.post("/survivor/reset-league", { league });
export const saveRoster = (payload) => API.post('/roster', payload);
export const sendStatsUpdateEmails = () => API.post('/api/admin/send-stats-update-email');
export const setLocktimes = (payload) => API.post('/api/setLocktimes', payload);
export const signIn = (data) => API.post("/signin", data);
export const signUp = (data) => API.post("/signup", data);
export const starMessage = (messageId, userId) => API.post(`/star-message/${messageId}`, { userId });
export const submitRegularRoster = (payload) => API.post("/roster/regular", payload);
export const submitSurvivorPicks = (league, teamName, picks) => API.post(`/api/survivor-picks/${league}/${teamName}`, { picks });export const updateColor = (userId, color) => API.patch("/update-color", { userId, color });
export const updateMultipleRosters = (changeRosterData) => API.post(`/multiple-rosters`, { rosters: changeRosterData });
export const uploadAvatar = (formData, token) => API.post("/upload-avatar", formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
export const changeTeamName = (userId, newTeamName) => API.patch("/change-team-name", { userId, newTeamName });

// DELETE requests
export const clearPlayerTransactions = () => API.delete(`/api/clear-transactions`);
export const deleteClaim = (playerId, userId, token) => API.delete(`/api/claims/delete/${playerId}`, { headers: { Authorization: `Bearer ${token}` }, data: { userId } });
export const deleteMessage = (messageId, userId) => API.delete(`/message/${messageId}`, { data: { userId } });
export const deleteTeamByName = (teamName) => API.delete(`/team/name/${encodeURIComponent(teamName)}`);
export const dropPlayer = (playerId, teamId) => API.delete(`/players/drop/${playerId}/${teamId}`);
export const removePlayerFromTeam = (playerId) => API.delete(`/player/remove/${playerId}`);

// PUT requests
export const updateEmailSubscription = (userId, { email, subscribe }) => {
    return API.patch(`/api/user/email-subscription`, { userId, email, subscribe });};
export const updatePlayerPosition = (playerId, position) => API.put(`/api/player/${playerId}/position`, { position });
export const updateTeamStats = (teamId, data) => API.put(`/api/team/${teamId}`, data);