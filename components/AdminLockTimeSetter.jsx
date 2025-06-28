import React, { useState } from "react";
import { setLocktimes, resetRosters, resetPositions } from "../src/utils/api.js";

const holidays = [
  "2025-11-28", // Thanksgiving
  "2025-12-24", // Christmas Eve
  "2025-12-25", // Christmas Day
  "2025-12-31", // New Year's Eve
  "2026-01-01", // New Year's Day
];

const AdminLockTimeSetter = ({ playerList }) => {
  const [leagueStartTimes, setLeagueStartTimes] = useState({});
  const totalWeeks = 34;
  const currentYear = new Date().getFullYear();

  // Get unique leagues from playerList
  const leagues = Array.from(new Set(playerList.map((p) => p.league)));

  const handleLeagueStartChange = (league, value) => {
    setLeagueStartTimes((prev) => ({ ...prev, [league]: value }));
  };

  const submitLocktimes = async () => {
    // Find leagues with missing or invalid start times
    const missingLeagues = leagues.filter(league => {
      const time = leagueStartTimes[league];
      return !time || isNaN(new Date(time));
    });
  
    if (missingLeagues.length > 0) {
      alert(`Please enter valid start times for: ${missingLeagues.join(", ")}`);
      return; // prevent submission
    }
  
    const payload = [];
  
    leagues.forEach((league) => {
      const baseDate = new Date(leagueStartTimes[league]);
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
  
    try {
      await setLocktimes(payload);
      await resetRosters(currentYear);
      await resetPositions();
  
      alert("Lock times submitted and rosters/positions reset!");
    } catch (err) {
      console.error(err);
      alert("Failed to set lock times or reset data.");
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
    </div>
  );
};

export default AdminLockTimeSetter;