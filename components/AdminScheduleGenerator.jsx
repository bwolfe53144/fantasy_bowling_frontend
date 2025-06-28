import React, { useState } from "react";
import { generateTheSchedule } from "../src/utils/api";

const AdminScheduleGenerator = ({ setSkipWeeksArray }) => {
  const [weeks, setWeeks] = useState(14);
  const [numSkippedWeeks, setNumSkippedWeeks] = useState(0);

  const generateSchedule = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const totalWeeks = parseInt(weeks);
      const numToSkip = parseInt(numSkippedWeeks);
      const skipWeeks = [];

      for (let i = 1; i <= numToSkip; i++) {
        skipWeeks.push(i);
      }

      setSkipWeeksArray(skipWeeks);

      await generateTheSchedule({
        weeks: totalWeeks,
        season: currentYear,
        skipWeeks,
      });

      window.confirm("Schedule generated successfully! Ready to continue?");
    } catch (err) {
      console.error(err);
      alert("Failed to generate schedule.");
    }
  };

  return (
    <div className="admin-section admin-column">
      <h1>Schedule Generator</h1>
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