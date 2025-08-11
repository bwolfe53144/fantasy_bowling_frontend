import React, { useState } from "react";
import { setLocktimes, resetRosters, resetPositions } from "../src/utils/api.js";
import Modal from "./Modal";
import { useModal } from "../hooks/useModal";

const holidays = [
  "2025-11-28",
  "2025-12-25",
  "2025-12-26",
  "2026-01-01",
];

const AdminLockTimeSetter = ({ playerList }) => {
  const [leagueStartTimes, setLeagueStartTimes] = useState({});
  const [resetting, setResetting] = useState(false);
  const totalWeeks = 34;
  const currentYear = new Date().getFullYear();
  const [modalProps, showModal] = useModal();

  const leagues = Array.from(new Set(playerList.map((p) => p.league)));

  const handleLeagueStartChange = (league, value) => {
    setLeagueStartTimes((prev) => ({ ...prev, [league]: value }));
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
      await showModal({
        title: "Missing Data",
        message: "Please enter at least one valid league start time before submitting.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    try {
      await setLocktimes(payload);
      await showModal({
        title: "Success",
        message: "Selected lock times submitted!",
        confirmText: "OK",
        showCancel: false,
      });
    } catch (err) {
      console.error(err);
      await showModal({
        title: "Error",
        message: "Failed to set lock times.",
        confirmText: "OK",
        showCancel: false,
      });
    }
  };

  const handleReset = async () => {
    const confirmed = await showModal({
      title: "Confirm Reset",
      message: "Are you sure you want to reset all rosters and positions?",
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
    });

    if (!confirmed) return;

    setResetting(true);
    try {
      await resetRosters(currentYear);
      await resetPositions();
      await showModal({
        title: "Success",
        message: "Rosters and positions have been reset.",
        confirmText: "OK",
        showCancel: false,
      });
    } catch (err) {
      console.error(err);
      await showModal({
        title: "Error",
        message: "Failed to reset rosters or positions.",
        confirmText: "OK",
        showCancel: false,
      });
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

      {modalProps && <Modal {...modalProps} />}
    </div>
  );
};

export default AdminLockTimeSetter;