import React, { useState, useEffect } from "react";
import { completeWeekLock, getIncompleteWeekLocks } from "../src/utils/api.js";
import { useTeamRecords } from "../src/utils/useTeamRecords.js";

const AdminHandleWeek = () => {
  const [incompleteWeeks, setIncompleteWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const { updateTeamRecordsAfterUpload } = useTeamRecords();

  useEffect(() => {
    const fetchIncompleteWeeks = async () => {
      try {
        const res = await getIncompleteWeekLocks();
        setIncompleteWeeks(res.data);
      } catch (err) {
        console.error("Failed to fetch incomplete weeks", err);
      }
    };
    fetchIncompleteWeeks();
  }, []);

  const handleCompleteWeek = async () => {
    if (!selectedWeek) return;

    try {
      await completeWeekLock({
        league: selectedWeek.league,
        week: selectedWeek.week,
        season: 2025,
      });

      alert(`Marked ${selectedWeek.league} Week ${selectedWeek.week} as complete.`);

      // Remove the completed week from the incompleteWeeks list
      setIncompleteWeeks((prev) =>
        prev.filter(
          (w) => !(w.league === selectedWeek.league && w.week === selectedWeek.week)
        )
      );

      // Update team records and generate playoffs if needed (inside this function)
      const allCompleted = await updateTeamRecordsAfterUpload(selectedWeek.week);
      if (!allCompleted) {
        return;
      }

      // Clear selectedWeek after successful completion
      setSelectedWeek(null);
    } catch (err) {
      console.error("Error completing week:", err);
      alert("Failed to complete week.");
    }
  };

  return (
    <div className="admin-section admin-column">
      <h2>Complete a Week</h2>
      <select
        value={selectedWeek ? `${selectedWeek.league}-${selectedWeek.week}` : ""}
        onChange={(e) => {
          const [league, week] = e.target.value.split("-");
          const match = incompleteWeeks.find(
            (w) => w.league === league && w.week === parseInt(week)
          );
          setSelectedWeek(match || null);
        }}
        className="admin-input"
      >
        <option value="">Select League / Week</option>
        {incompleteWeeks.map((w) => (
          <option key={`${w.league}-${w.week}`} value={`${w.league}-${w.week}`}>
            {w.league} - Week {w.week}
          </option>
        ))}
      </select>
      <button
        onClick={handleCompleteWeek}
        className="admin-button success"
        disabled={!selectedWeek}
      >
        Complete Week
      </button>
    </div>
  );
};

export default AdminHandleWeek;