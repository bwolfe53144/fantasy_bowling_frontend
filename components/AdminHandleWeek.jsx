import React, { useState, useEffect } from "react";
import {
  completeWeekLock,
  completeSurvivorWeek,
  getIncompleteWeekLocks,
} from "../src/utils/api.js";
import { useTeamRecords } from "../src/utils/useTeamRecords.js";
import Modal from "./Modal";
import { useModal } from "../hooks/useModal";

const AdminHandleWeek = () => {
  const [incompleteWeeks, setIncompleteWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const { updateTeamRecordsAfterUpload } = useTeamRecords();

  const [modalProps, showModal] = useModal();

  useEffect(() => {
    const fetchIncompleteWeeks = async () => {
      try {
        const res = await getIncompleteWeekLocks();
        setIncompleteWeeks(res.data);
      } catch (err) {
        console.error("Failed to fetch incomplete weeks", err);
        await showModal({
          title: "Error",
          message: "Failed to fetch incomplete weeks.",
          confirmText: "OK",
          showCancel: false,
        });
      }
    };
    fetchIncompleteWeeks();
  }, [showModal]);

  const handleCompleteWeek = async () => {
    if (!selectedWeek) return;

    try {
      await completeWeekLock({
        league: selectedWeek.league,
        week: selectedWeek.week,
        season: 2025,
      });

      await completeSurvivorWeek({
        league: selectedWeek.league,
        week: selectedWeek.week,
      });

      await showModal({
        title: "Success",
        message: `Marked ${selectedWeek.league} Week ${selectedWeek.week} as complete.`,
        confirmText: "OK",
        showCancel: false,
      });

      setIncompleteWeeks((prev) =>
        prev.filter(
          (w) => !(w.league === selectedWeek.league && w.week === selectedWeek.week)
        )
      );

      const allCompleted = await updateTeamRecordsAfterUpload(
        selectedWeek.week,
        selectedWeek.league
      );
      if (!allCompleted) {
        return;
      }

      setSelectedWeek(null);
    } catch (err) {
      console.error("Error completing week:", err);
      await showModal({
        title: "Error",
        message: "Failed to complete week.",
        confirmText: "OK",
        showCancel: false,
      });
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

      {modalProps && <Modal {...modalProps} />}
    </div>
  );
};

export default AdminHandleWeek;