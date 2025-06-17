import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Roster from "./pages/Roster";
import RegularRoster from "./pages/RegularRoster";
import Rules from "./pages/Rules";
import Schedule from "./pages/Schedule";
import Leaderboard from "./pages/Leaderboard";
import Forum from "./pages/Forum";
import Other from "./Other";
import PlayerDetail from "./pages/PlayerDetail";
import AdminPage from "./pages/AdminPage";
import TeamDetail from "./pages/TeamDetail";
import MatchupPage from "./pages/MatchupPage";
import MyClaimedPlayers from "./pages/MyClaimedPlayers";
import DropClaimPlayer from "./pages/DropClaimPlayer";
import EditInfo from "./pages/EditInfo";
import ViewMessage from "./pages/ViewMessage";
import NewMessageForm from "./pages/NewMessageForm";
import BowlingTeamPage from "./pages/BowlingTeamPage";
import TeamFantasyStats from "./pages/TeamFantasyStats";
import ErrorPage from "./pages/ErrorPage";
import ScrollToTop from "../components/ScrollToTop";
import Stats from "./pages/Stats";
import Players from "./pages/Players";
import ClaimedPlayers from "./pages/ClaimedPlayers";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/about" element={<About />} />
        <Route path="/schedule/:week" element={<Schedule />} />       
        <Route path="/matchup/:id" element={<MatchupPage />} />
        <Route path="/roster/week/:weekNumber" element={<Roster />} />
        <Route path="/regular-roster" element={<RegularRoster />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/players" element={<Players />} />
        <Route path="/player/:playerName" element={<PlayerDetail />} />
        <Route path="/team/:teamName" element={<TeamDetail />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/other" element={<Other />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/edit-team" element={<EditInfo />} />
        <Route path="/all-claims" element={<ClaimedPlayers />} />
        <Route path="/my-claims" element={<MyClaimedPlayers />} />
        <Route path="/new-message" element={<NewMessageForm />} />
        <Route path="/message/:id" element={<ViewMessage />} />
        <Route path="/drop-player/:playerId/:playerName/:playerLeague/:playerPosition" element={<DropClaimPlayer />} />
        <Route path="/bowling-team/:teamName/:league" element={<BowlingTeamPage />} />
        <Route path="/fantasy-stats/:teamName" element={<TeamFantasyStats />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;