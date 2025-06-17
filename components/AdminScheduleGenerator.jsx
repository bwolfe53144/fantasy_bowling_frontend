import React, { useState } from "react";
import { generateTheSchedule } from "../src/utils/api";

const AdminScheduleGenerator = ({ setResponse, setSkipWeeksArray }) => {
  const [season, setSeason] = useState(new Date().getFullYear());
  const [weeks, setWeeks] = useState(14);
  const [numSkippedWeeks, setNumSkippedWeeks] = useState(0);

  const generateSchedule = async () => {
    try {
      const totalWeeks = parseInt(weeks);
      const numToSkip = parseInt(numSkippedWeeks);
      const skipWeeks = [];
  
      // Skip the first N weeks
      for (let i = 1; i <= numToSkip; i++) {
        skipWeeks.push(i);
      }
  
      setSkipWeeksArray(skipWeeks);
  
      const res = await generateTheSchedule({
        weeks: totalWeeks,
        season: parseInt(season),
        skipWeeks,
      });
  
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate schedule.");
    }
  };

  return (
    <div className="admin-section admin-column">
      <h1>Schedule Generator</h1>
      <label>Season Year:</label>
      <input
        type="number"
        value={season}
        onChange={(e) => setSeason(e.target.value)}
        className="admin-input"
      />
      <label>Weeks:</label>
      <input
        type="number"
        value={weeks}
        onChange={(e) => setWeeks(e.target.value)}
        className="admin-input"
      />
      <label>Number of Skipped Weeks:</label>
      <input
        type="number"
        value={numSkippedWeeks}
        onChange={(e) => setNumSkippedWeeks(parseInt(e.target.value) || 0)}
        className="admin-input"
      />
      <button onClick={generateSchedule} className="admin-button success">
        Generate Schedule
      </button>
    </div>
  );
};

export default AdminScheduleGenerator;