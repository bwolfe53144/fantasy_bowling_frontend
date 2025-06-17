import React from "react";
import '../src/styles/MatchupPage.css';

const MatchupHeader = ({ team1, team2 }) => {
  return (
    <div className="matchupHeader">
      <div className="teamInfo">
        <div className="teamText leftName">
          <div className="teamName">{team1.name}</div>
          <div className="ownerName">
            {team1.owner?.firstname} {team1.owner?.lastname?.[0]}.
          </div>
        </div>
        {team1.owner?.avatarUrl && (
          <img src={team1.owner.avatarUrl} alt="Avatar" className="avatar" />
        )}
      </div>

      <div className="vs">VS</div>

      <div className="teamInfo">
        {team2.owner?.avatarUrl && (
          <img src={team2.owner.avatarUrl} alt="Avatar" className="avatar" />
        )}
        <div className="teamText">
          <div className="teamName">{team2.name}</div>
          <div className="ownerName">
            {team2.owner?.firstname} {team2.owner?.lastname?.[0]}.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchupHeader;