import React, { useState } from "react";
import { setLocktimes, resetRosters, resetPositions } from "../src/utils/api.js";

const holidays = [
  "2025-11-28",
  "2025-12-24",
  "2025-12-25",
  "2025-12-31",
  "2026-01-01",
];

const AdminLockTimeSetter = ({ playerList }) => {
  const [leagueStartTimes, setLeagueStartTimes] = useState({});
  const [resetting, setResetting] = useState(false);
  const totalWeeks = 34;
  const currentYear = new Date().getFullYear();

  const leagues = Array.from(new Set(playerList.map((p) => p.league)));

  const handleLeagueStartChange = (league, value) => {
    setLeagueStartTimes((prev) => ({ ...prev, [league]: value }));
  };

  const submitLocktimes = async () => {
    const payload = [];

    leagues.forEach((league) => {
      const baseDate = new Date(leagueStartTimes[league]);
      if (!leagueStartTimes[league] || isNaN(baseDate)) return; // Skip empty

      let current = new Date(baseDate);

      for (let week = 1; week <= totalWeeks; week++) {
        const dateStr = current.toISOString().split("T")[0];
        const isHoliday = holidays.includes(dateStr);

        if (!isHoliday) {
          payload.push({
            league,
            season: currentYear,
            week,
            lockTime: current.toISOString(),
          });
        }

        current.setDate(current.getDate() + 7);
      }
    });

    if (payload.length === 0) {
      alert("Please enter at least one valid league start time before submitting.");
      return;
    }

    try {
      await setLocktimes(payload);
      alert("Selected lock times submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to set lock times.");
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all rosters and positions?")) {
      return;
    }
    setResetting(true);
    try {
      await resetRosters(currentYear);
      await resetPositions();
      alert("Rosters and positions have been reset.");
    } catch (err) {
      console.error(err);
      alert("Failed to reset rosters or positions.");
    } finally {
      setResetting(false);
    }
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
    </div>
  );
};

export default AdminLockTimeSetter;