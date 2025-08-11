import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../src/utils/AuthContext.jsx";
import { 
  clearPlayersFromTeams, 
  getUnassignedPlayers, 
  assignPlayerToTeam, 
  removePlayerFromTeam, 
  updatePlayerPosition 
} from "../src/utils/api.js";
import Modal from "./Modal";
import { useModal } from "../hooks/useModal";

const AdminManageRosters = ({ teams }) => {
  const { players } = useContext(AuthContext);
  const [assignPlayerId, setAssignPlayerId] = useState("");
  const [assignTeamId, setAssignTeamId] = useState("");
  const [unassignedPlayers, setUnassignedPlayers] = useState([]);
  const [removeTeamId, setRemoveTeamId] = useState("");
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [removePlayerId, setRemovePlayerId] = useState("");
  const [positionPlayerId, setPositionPlayerId] = useState("");
  const [newPosition, setNewPosition] = useState("");

  const [modalProps, showModal] = useModal();

  const fetchUnassignedPlayers = async () => {
    try {
      const res = await getUnassignedPlayers();
      setUnassignedPlayers(res.data);
    } catch (error) {
      console.error("Error fetching unassigned players:", error);
    }
  };

  useEffect(() => {
    if (!removeTeamId) {
      setTeamPlayers([]);
      setRemovePlayerId("");
      return;
    }
    const filteredPlayers = players.filter(p => p.teamId === removeTeamId);
    setTeamPlayers(filteredPlayers);
    setRemovePlayerId("");
  }, [removeTeamId, players]);

  useEffect(() => {
    fetchUnassignedPlayers();
  }, []);

  const handleClearPlayers = async () => {
    const confirmed = await showModal({
      title: "Confirm Clear All",
      message: "Are you sure you want to delete ALL team rosters? This action cannot be undone.",
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });
    if (!confirmed) return;

    try {
      const res = await clearPlayersFromTeams();
      if (res.status !== 200) throw new Error("Failed to clear players from teams");
      await showModal({
        title: "Success",
        message: "All players removed from teams!",
        confirmText: "OK",
        showCancel: false,
      });
      await fetchUnassignedPlayers();
    } catch (error) {
      await showModal({
        title: "Error",
        message: error.response?.data?.message || error.message || "Error clearing players.",
        confirmText: "OK",
        showCancel: false,
      });
    }
  };

  const handleAssignPlayer = async () => {
    if (!assignPlayerId || !assignTeamId) {
      await showModal({
        title: "Missing Selection",
        message: "Please select both a player and a team to assign.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }
    try {
      const res = await assignPlayerToTeam({ playerId: assignPlayerId, teamId: assignTeamId });
      if (res.status !== 200) throw new Error("Failed to assign player");
      await showModal({
        title: "Success",
        message: "Player assigned successfully!",
        confirmText: "OK",
        showCancel: false,
      });
      setAssignPlayerId("");
      setAssignTeamId("");
      await fetchUnassignedPlayers();
    } catch (error) {
      await showModal({
        title: "Error",
        message: "Error assigning player to team",
        confirmText: "OK",
        showCancel: false,
      });
      console.error(error);
    }
  };

  const handleRemovePlayer = async () => {
    if (!removeTeamId || !removePlayerId) {
      await showModal({
        title: "Missing Selection",
        message: "Please select both a team and a player to remove.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    const confirmed = await showModal({
      title: "Confirm Remove Player",
      message: "Are you sure you want to remove this player from the team?",
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });
    if (!confirmed) return;

    try {
      const res = await removePlayerFromTeam(removePlayerId);
      if (res.status !== 200) throw new Error("Failed to remove player");
      await showModal({
        title: "Success",
        message: "Player removed successfully!",
        confirmText: "OK",
        showCancel: false,
      });
      const updatedPlayers = players.filter(p => p.id !== removePlayerId);
      setTeamPlayers(updatedPlayers.filter(p => p.teamId === removeTeamId));
      setRemovePlayerId("");
      await fetchUnassignedPlayers();
    } catch (error) {
      await showModal({
        title: "Error",
        message: "Error removing player from team",
        confirmText: "OK",
        showCancel: false,
      });
      console.error(error);
    }
  };

  const handleChangePlayerPosition = async () => {
    if (!positionPlayerId || !newPosition) {
      await showModal({
        title: "Missing Selection",
        message: "Select both player and new position",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }
  
    try {
      const res = await updatePlayerPosition(positionPlayerId, newPosition);
      if (res.status !== 200) throw new Error("Failed to update position");
      await showModal({
        title: "Success",
        message: "Player position updated!",
        confirmText: "OK",
        showCancel: false,
      });
      setPositionPlayerId("");
      setNewPosition("");
    } catch (error) {
      await showModal({
        title: "Error",
        message: "Error updating player position",
        confirmText: "OK",
        showCancel: false,
      });
      console.error(error);
    }
  };

  return (
    <div className="admin-section admin-column">
      <h2>Manage Team Rosters</h2>

      {/* Clear All Rosters */}
      <div>
        <button onClick={handleClearPlayers} className="admin-button danger">
          Clear All Team Rosters
        </button>
      </div>

      {/* Assign Player to Team */}
      <div>
        <h3>Assign Player to Team</h3>
        <div className="admin-column">
          <label>Select Player:</label>
          <select
            value={assignPlayerId}
            onChange={(e) => setAssignPlayerId(e.target.value)}
            className="admin-input"
          >
            <option value="">-- Select Player --</option>
            {unassignedPlayers.map(p => (
              <option key={p.id} value={p.id}>{p.name} - {p.league}</option>
            ))}
          </select>

          <label>Select Team:</label>
          <select
            value={assignTeamId}
            onChange={(e) => setAssignTeamId(e.target.value)}
            className="admin-input"
          >
            <option value="">-- Select Team --</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <button
            onClick={handleAssignPlayer}
            disabled={!assignPlayerId || !assignTeamId}
            className="admin-button"
            style={{ marginTop: "1rem" }}
          >
            Assign Player to Team
          </button>
        </div>
      </div>

      {/* Remove Player from Team */}
      <div>
        <div className="admin-column">
          <h3>Remove Player from Team</h3>
          <label>Select Team:</label>
          <select
            value={removeTeamId}
            onChange={(e) => setRemoveTeamId(e.target.value)}
            className="admin-input"
          >
            <option value="">-- Select Team --</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {teamPlayers.length > 0 && (
            <>
              <label>Select Player:</label>
              <select
                value={removePlayerId}
                onChange={(e) => setRemovePlayerId(e.target.value)}
                className="admin-input"
              >
                <option value="">-- Select Player --</option>
                {teamPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </>
          )}

          <button
            onClick={handleRemovePlayer}
            disabled={!removeTeamId || !removePlayerId}
            className="admin-button danger"
            style={{ marginTop: "1rem" }}
          >
            Remove Player from Team
          </button>
        </div>

        {/* Change Player Position */}
        <div>
          <h3>Change Player Position</h3>
          <div className="admin-column">
            <label>Select Player:</label>
            <select
              value={positionPlayerId}
              onChange={(e) => setPositionPlayerId(e.target.value)}
              className="admin-input"
            >
              <option value="">-- Select Player --</option>
              {[...players]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.league} - {p.position}
                  </option>
              ))}
            </select>

            <label>Select New Position:</label>
            <select
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              className="admin-input"
            >
              <option value="">-- Select Position --</option>
              {[1, 2, 3, 4, 5, "flex"].map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>

            <button
              onClick={handleChangePlayerPosition}
              disabled={!positionPlayerId || !newPosition}
              className="admin-button success"
              style={{ marginTop: "1rem" }}
            >
              Update Position
            </button>
          </div>
        </div>
      </div>

      {modalProps && <Modal {...modalProps} />}
    </div>
  );
};

export default AdminManageRosters;