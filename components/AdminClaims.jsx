import React, { useEffect, useState } from 'react';
import { fetchAllClaims, processClaim } from '../src/utils/api';  

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamsToChoose, setTeamsToChoose] = useState([]);
  const [showClaimsDropdown, setShowClaimsDropdown] = useState(false);

  const fetchClaims = async () => {
    try {
      const res = await fetchAllClaims();
      if (res.status === 200) {
        setClaims(res.data.allClaimedPlayers);
      } else {
        alert('Failed to fetch claims');
      }
    } catch (error) {
      alert(`Error fetching claims: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleProcessClaim = async () => {
    if (!selectedClaimId || (teamsToChoose.length > 1 && !selectedTeamId)) {
      alert('Please select a claim and a team to process.');
      return;
    }

    try {
      const payload = {
        playerId: selectedClaimId,
        teamId: selectedTeamId || teamsToChoose[0]?.id,
      };
      const res = await processClaim(payload);
      if (res.status === 200) {
        alert('Claim processed successfully!');
        setSelectedClaimId('');
        setSelectedTeamId('');
        setTeamsToChoose([]);
        setShowClaimsDropdown(false);
        fetchClaims(); // Reload claims
      } else {
        alert('Failed to process claim');
      }
    } catch (error) {
      alert(`Error processing claim: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="admin-section">
      <button
        onClick={() => setShowClaimsDropdown(!showClaimsDropdown)}
        className="admin-button success"
      >
        Process Claims
      </button>

      {showClaimsDropdown && (
        <div className="admin-form-card">
          <label>Select a claim:</label>
          <select
            value={selectedClaimId || ''}
            onChange={(e) => {
              const claimId = e.target.value;
              const claim = claims.find((c) => c.playerId === claimId);
              setSelectedClaimId(claimId);

              if (claim?.teams?.length > 1) {
                setTeamsToChoose(claim.teams);
                setSelectedTeamId('');
              } else if (claim?.teams?.length === 1) {
                setTeamsToChoose([]);
                setSelectedTeamId(claim.teams[0].id);
              } else {
                setTeamsToChoose([]);
                setSelectedTeamId('');
              }
            }}
            className="admin-input"
          >
            <option value="">-- Select a Claim --</option>
            {claims?.length > 0 ? (
              claims.map((claim) => (
                <option key={claim.playerId} value={claim.playerId}>
                  {claim.playerName} (claimed by {claim.teams?.length} team
                  {claim.teams?.length > 1 ? 's' : ''})
                </option>
              ))
            ) : (
              <option disabled>No claims available</option>
            )}
          </select>

          {teamsToChoose.length > 1 && (
            <div>
              <label>Select a team to assign the player:</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="admin-input"
              >
                <option value="">-- Select a Team --</option>
                {teamsToChoose.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(selectedClaimId && (teamsToChoose.length <= 1 || selectedTeamId)) && (
            <button onClick={handleProcessClaim} className="admin-button">
              Process Claim
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminClaims;