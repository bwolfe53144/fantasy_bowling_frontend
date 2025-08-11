import React, { useState } from "react";
import { setLocktimes, resetRosters, resetPositions } from "../src/utils/api.js";

const holidays = [
  "2025-11-28",
  "2025-12-25",
  "2025-12-26",
  "2026-01-01",
];

const AdminLockTimeSetter = ({ playerList }) => {
  const [leagueStartTimes, setLeagueStartTimes] = useState({});
  const [resetting, setResetting] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(null);
  const totalWeeks = 34;
  const currentYear = new Date().getFullYear();

  const leagues = Array.from(new Set(playerList.map((p) => p.league)));

  const handleLeagueStartChange = (league, value) => {
    setLeagueStartTimes((prev) => ({ ...prev, [league]: value }));
  };

  const openAlert = (msg) => {
    setAlertMessage(msg);
    setShowAlertModal(true);
  };

  const submitLocktimes = async () => {
    const payload = [];

    leagues.forEach((league) => {
      const baseDate = new Date(leagueStartTimes[league]);
      if (!leagueStartTimes[league] || isNaN(baseDate)) return;

      let current = new Date(baseDate);
      let week = 1;

      while (week <= totalWeeks) {
        const dateStr = current.toISOString().split("T")[0];
        const isHoliday = holidays.includes(dateStr);

        if (!isHoliday) {
          payload.push({
            league,
            season: currentYear,
            week,
            lockTime: current.toISOString(),
          });
          week++; // only increment if not a holiday
        }

        current.setDate(current.getDate() + 7); // always move forward a week
      }
    });

    if (payload.length === 0) {
      openAlert("Please enter at least one valid league start time before submitting.");
      return;
    }

    try {
      await setLocktimes(payload);
      openAlert("Selected lock times submitted!");
    } catch (err) {
      console.error(err);
      openAlert("Failed to set lock times.");
    }
  };

  const handleReset = () => {
    setConfirmCallback(() => async () => {
      setShowConfirmModal(false);
      setResetting(true);
      try {
        await resetRosters(currentYear);
        await resetPositions();
        openAlert("Rosters and positions have been reset.");
      } catch (err) {
        console.error(err);
        openAlert("Failed to reset rosters or positions.");
      } finally {
        setResetting(false);
      }
    });
    setShowConfirmModal(true);
  };

  return (
    <div className="admin-locktime-section">
      <h2>Set Weekly Lock Times Per League</h2>
      {leagues.map((league) => (
        <div key={league} className="admin-league-locktime">
          <label>{league} Start Date & Time:</label>
          <input
            type="datetime-local"
            value={leagueStartTimes[league] || ""}
            onChange={(e) => handleLeagueStartChange(league, e.target.value)}
            className="admin-input"
          />
        </div>
      ))}
      <button onClick={submitLocktimes} className="admin-button">
        Submit Lock Times
      </button>

      <button
        onClick={handleReset}
        className="admin-button danger"
        disabled={resetting}
      >
        {resetting ? "Resetting..." : "Reset Rosters & Positions"}
      </button>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Notice</h2>
            <p>{alertMessage}</p>
            <div className="modalActions">
              <button
                onClick={() => setShowAlertModal(false)}
                className="modal-cancel-button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Confirm Reset</h2>
            <p>Are you sure you want to reset all rosters and positions?</p>
            <div className="modalActions">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                }}
                className="modal-cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmCallback) confirmCallback();
                }}
                className="modal-confirm-button"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLockTimeSetter;