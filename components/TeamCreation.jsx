import React from "react";

export default function TeamCreation({
  showCreateTeamForm,
  setShowCreateTeamForm,
  teamName,
  setTeamName,
  handleCreateTeam
}) {
  return (
    <div className="teamCreationContainer">
      {showCreateTeamForm ? (
        <div className="teamCreationForm">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter your team name"
            className="teamNameInput"
          />
          <button onClick={handleCreateTeam} className="confirmButton">
            Confirm
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateTeamForm(true)}
          className="createTeamButton"
        >
          Create Team
        </button>
      )}
    </div>
  );
}