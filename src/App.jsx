import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./utils/ThemeContext";
import ScrollToTop from "../components/ScrollToTop";
import Home from "./pages/Home";
import Signup from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import EditInfo from "./pages/EditInfo";
import Roster from "./pages/Roster";
import RegularRoster from "./pages/RegularRoster";
import Schedule from "./pages/Schedule";
import MatchupPage from "./pages/MatchupPage";
import Survivor from "./pages/Survivor";
import SurvivorLeaguePage from "./pages/SurvivorLeaguePage";
import SurvivorTeamPage from "./pages/SurvivorTeamPage";
import TeamDetail from "./pages/TeamDetail";
import PlayerDetail from "./pages/PlayerDetail";
import Players from "./pages/Players";
import BowlingTeamPage from "./pages/BowlingTeamPage";
import TeamFantasyStats from "./pages/TeamFantasyStats";
import Stats from "./pages/Stats";
import Leaderboard from "./pages/Leaderboard";
import Forum from "./pages/Forum";
import NewMessageForm from "./pages/NewMessageForm";
import ViewMessage from "./pages/ViewMessage";
import ClaimedPlayers from "./pages/ClaimedPlayers";
import MyClaimedPlayers from "./pages/MyClaimedPlayers";
import DropClaimPlayer from "./pages/DropClaimPlayer";
import AdminPage from "./pages/AdminPage";
import Rules from "./pages/Rules";
import About from "./pages/About";
import PreviousYears from "./pages/PreviousYears";
import PreviousYearStandings from "./pages/PreviousYearStandings";
import OwnerDetail from "./pages/OwnerDetail";
import AllOwners from "./pages/AllOwners";
import Draft from "./pages/Draft";
import Other from "./Other";
import ErrorPage from "./pages/ErrorPage";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-team" element={<EditInfo />} />
          <Route path="/team/:teamName" element={<TeamDetail />} />
          <Route path="/player/:playerName" element={<PlayerDetail />} />
          <Route path="/players" element={<Players />} />
          <Route path="/bowling-team/:teamName/:league" element={<BowlingTeamPage />} />
          <Route path="/fantasy-stats/:teamName" element={<TeamFantasyStats />} />
          <Route path="/schedule/:week" element={<Schedule />} />
          <Route path="/matchup/:id" element={<MatchupPage />} />
          <Route path="/survivor" element={<Survivor />} />
          <Route path="/survivor/:league" element={<SurvivorLeaguePage />} />
          <Route path="/survivor/:league/:teamname" element={<SurvivorTeamPage />} />
          <Route path="/roster/week/:weekNumber" element={<Roster />} />
          <Route path="/regular-roster" element={<RegularRoster />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/all-claims" element={<ClaimedPlayers />} />
          <Route path="/my-claims" element={<MyClaimedPlayers />} />
          <Route path="/drop-player/:playerId/:playerName/:playerLeague/:playerPosition" element={<DropClaimPlayer />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/new-message" element={<NewMessageForm />} />
          <Route path="/message/:id" element={<ViewMessage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/other" element={<Other />} />
          <Route path="/draft" element={<Draft />} />
          <Route path="/previous-standings" element={<PreviousYears />} />
          <Route path="/previous-standings/:year" element={<PreviousYearStandings />} />
          <Route path="/owner/:ownerName" element={<OwnerDetail />} />
          <Route path="/owners" element={<AllOwners />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;