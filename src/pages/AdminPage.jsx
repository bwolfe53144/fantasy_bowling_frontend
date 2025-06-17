import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../utils/AuthContext.jsx";
import { clearWeekscores, clearPlayerTransactions, deleteTeamByName, 
  sendStatsUpdateEmails } from "../utils/api.js";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen";
import AdminUploadSection from "../../components/AdminUploadSection.jsx";
import AdminLockTimeSetter from "../../components/AdminLockTimeSetter.jsx";
import AdminScheduleGenerator from "../../components/AdminScheduleGenerator.jsx";
import AdminClaims from "../../components/AdminClaims.jsx";
import AdminAssignPlayer from "../../components/AdminManageRosters.jsx";
import AdminRoleChange from "../../components/AdminRoleChange.jsx";
import AdminHandleWeek from "../../components/AdminHandleWeek.jsx";
import '../styles/Admin.css';

const AdminPage = () => {
  const { user, players, teams, weekScores, loading } = useContext(AuthContext);
  const playerList = Array.isArray(players) ? players : players.data || [];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [removeTeamName, setRemoveTeamName] = useState("");
  const [weeks, setWeeks] = useState(10);
  const [season, setSeason] = useState(2025);
  const [skipWeeksArray, setSkipWeeksArray] = useState([]);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  const handleRemoveTeam = async () => {
    if (!removeTeamName) return alert("Select a team to remove");
    confirm("You sure you want to delete this team?")
    try {
      await deleteTeamByName(removeTeamName);
      alert("Team removed");
    } catch (err) {
      console.error("Error removing team:", err);
      alert("Failed to remove team");
    }
  };

  const handleClearTransactions = async () => {
    const confirmed = window.confirm('Are you sure you want to delete ALL player transactions? This action cannot be undone.');
    if (!confirmed) return;
  
    try {
      const res = await clearPlayerTransactions();
      if (res.status !== 200) throw new Error('Failed to clear player transactions');
      alert('All player transactions cleared successfully!');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

const handleClearWeekScores = async () => {
  const confirmed = window.confirm('Are you sure you want to delete ALL weekscores? This action cannot be undone.');
  if (!confirmed) return; 

  try {
    const res = await clearWeekscores();
    if (res.status !== 200) throw new Error('Failed to clear weekscores');
    alert('All team weekscores cleared successfully!');
  } catch (error) {
    alert(`Error: ${error.response?.data?.message || error.message}`);
  }
};

const handleSendStatsUpdateEmail = async () => {
  if (!window.confirm("Send stats update email to all opted-in users?")) return;

  try {
    await sendStatsUpdateEmails();
    alert("Stats update emails sent successfully!");
  } catch (error) {
    alert(`Error sending emails: ${error.response?.data?.error || error.message}`);
  }
};

if (loading) {
  return  <LoadingScreen />
}

if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
  return <Navigate to="/" replace />;
}

return (
  <div className="pageContainer">
    <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
    <Navbar />
    <div className="mainPage">
      <div className="admin-page">
        <h1>Admin Page</h1>
        <AdminUploadSection playerList={playerList} weekScores={weekScores} />
        <AdminHandleWeek />
        <div>
        <button className="admin-button" onClick={handleSendStatsUpdateEmail}>
          Send Stats Update Email
        </button>
      </div>
        {/* SUPERADMIN ONLY */}
        {user.role === "SUPERADMIN" && (
          <>
            {/* Process Claims */}
            <AdminClaims />
            <AdminRoleChange />
            {/* Assign Player to Team */}
            <AdminAssignPlayer teams={teams} />
            <AdminScheduleGenerator
              setResponse={setResponse}
              setSkipWeeksArray={setSkipWeeksArray}
              weeks={weeks}
              setWeeks={setWeeks}
              season={season}
              setSeason={setSeason}
            />
            <AdminLockTimeSetter
              response={response}
              playerList={playerList}
              weeks={weeks}
              season={season}
              skipWeeksArray={skipWeeksArray}
            />
            <div className="admin-section">
              <h3>Remove a Team</h3>
              <select value={removeTeamName} onChange={e => setRemoveTeamName(e.target.value)}>
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
              <button onClick={handleRemoveTeam} className="admin-button danger">Remove Team</button>
            </div>
            {/* Dangerous Actions */}
            <div>
              <button onClick={handleClearWeekScores} className="admin-button danger">
                Clear All WeekScores
              </button>
            </div>
            <div>
              <button onClick={handleClearTransactions} className="admin-button danger">
                Clear All Player Transactions
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    <Footer />
  </div>
);
};

export default AdminPage;