import React, { useState } from "react";
import { generateTheSchedule } from "../src/utils/api";
import Modal from "./Modal";
import { useModal } from "../hooks/useModal";

const AdminScheduleGenerator = ({ setSkipWeeksArray }) => {
  const [weeks, setWeeks] = useState(14);
  const [numSkippedWeeks, setNumSkippedWeeks] = useState(0);
  const [modalProps, showModal] = useModal();

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

      const confirmed = await showModal({
        title: "Success",
        message: "Schedule generated successfully! Ready to continue?",
        confirmText: "Yes",
        cancelText: "No",
        showCancel: true,
      });

      if (!confirmed) {
        // doesn't really have any action if no is clicked for now
      }

    } catch (err) {
      console.error(err);
      await showModal({
        title: "Error",
        message: "Failed to generate schedule.",
        confirmText: "OK",
        showCancel: false,
      });
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

      {modalProps && <Modal {...modalProps} />}
    </div>
  );
};

export default AdminScheduleGenerator;