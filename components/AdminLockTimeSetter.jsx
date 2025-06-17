import React, { useState } from "react";
import { setLocktimes, resetRosters, resetPositions } from "../src/utils/api.js";

const holidays = [
  "2025-11-28", // Thanksgiving
  "2025-12-24", // Christmas Eve
  "2025-12-25", // Christmas Day
  "2025-12-31", // New Year's Eve
  "2026-01-01", // New Year's Day
];

const AdminLockTimeSetter = ({ response, playerList, weeks, season, skipWeeksArray }) => {
  const [leagueStartTimes, setLeagueStartTimes] = useState({});

  // Get unique leagues from playerList
  const leagues = Array.from(new Set(playerList.map((p) => p.league)));

  const handleLeagueStartChange = (league, value) => {
    setLeagueStartTimes((prev) => ({ ...prev, [league]: value }));
  };

  const submitLocktimes = async () => {
    const payload = [];

    const totalWeeks = parseInt(weeks);
    const skip = new Set(skipWeeksArray.map(Number));

    leagues.forEach((league) => {
      const baseDate = new Date(leagueStartTimes[league]);
      if (isNaN(baseDate)) return; // skip if no valid date
      let current = new Date(baseDate);

      for (let actualWeek = 1; actualWeek <= totalWeeks; actualWeek++) {
        const dateStr = current.toISOString().split("T")[0];
        const isHoliday = holidays.includes(dateStr);
        const isSkipped = skip.has(actualWeek);

        if (!isHoliday && !isSkipped) {
          payload.push({
            league,
            season: parseInt(season),
            week: actualWeek,
            lockTime: current.toISOString(),
          });
        }

        current.setDate(current.getDate() + 7);
      }
    });

    try {
      await setLocktimes(payload);
      await resetRosters(season);
      await resetPositions();

      alert("Locktimes submitted and rosters/positions reset!");
    } catch (err) {
      console.error(err);
      alert("Failed to set locktimes or reset data.");
    }
  };

  if (!response) return null; // Don't render if no schedule generated yet

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