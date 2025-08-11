import React, { useEffect, useState } from 'react';
import { fetchAllClaims, processClaim } from '../src/utils/api';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamsToChoose, setTeamsToChoose] = useState([]);
  const [showClaimsDropdown, setShowClaimsDropdown] = useState(false);

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchClaims = async () => {
    try {
      const res = await fetchAllClaims();
      if (res.status === 200) {
        setClaims(res.data.allClaimedPlayers);
      } else {
        setErrorMessage('Failed to fetch claims');
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage(`Error fetching claims: ${error.response?.data?.message || error.message}`);
      setShowErrorModal(true);
    }
  };

  const handleProcessClaim = async () => {
    if (!selectedClaimId || (teamsToChoose.length > 1 && !selectedTeamId)) {
      setErrorMessage('Please select a claim and a team to process.');
      setShowErrorModal(true);
      return;
    }

    try {
      const payload = {
        playerId: selectedClaimId,
        teamId: selectedTeamId || teamsToChoose[0]?.id,
      };
      const res = await processClaim(payload);
      if (res.status === 200) {
        setShowSuccessModal(true);
        setSelectedClaimId('');
        setSelectedTeamId('');
        setTeamsToChoose([]);
        setShowClaimsDropdown(false);
        fetchClaims(); // Reload claims
      } else {
        setErrorMessage('Failed to process claim');
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage(`Error processing claim: ${error.response?.data?.message || error.message}`);
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="admin-section">
      <button
        onClick={() => setShowClaimsDropdown((prev) => !prev)}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Success!</h2>
            <p>Claim processed successfully.</p>
            <div className="modalActions">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="modal-cancel-button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Error</h2>
            <p>{errorMessage}</p>
            <div className="modalActions">
              <button
                onClick={() => setShowErrorModal(false)}
                className="modal-cancel-button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaims;