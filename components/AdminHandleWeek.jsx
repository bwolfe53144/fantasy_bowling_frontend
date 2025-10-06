import React, { useState, useEffect } from "react";
import {
  completeWeekLock,
  completeSurvivorWeek,
  getIncompleteWeekLocks,
  getCompletedLeagues,
  getRostersWithScoresForWeek,
  updateMultipleRosters,
} from "../src/utils/api.js";
import { promotePlayers } from "../src/utils/PromotePlayers.js";
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
    console.log("Selected Week:", selectedWeek);

    try {
      // 1️⃣ Complete the selected league/week
      await completeWeekLock({
        league: selectedWeek.league,
        week: selectedWeek.week,
        season: 2025,
      });

      await completeSurvivorWeek({
        league: selectedWeek.league,
        week: selectedWeek.week,
      });

      // 2️⃣ Fetch all completed leagues for this week
      const { data: alreadyCompleted } = await getCompletedLeagues(selectedWeek.week);

      // ✅ Ensure the one we just finished is included
      const completedLeagues = Array.from(
        new Set([...alreadyCompleted, selectedWeek.league])
      );
      console.log("Completed leagues for this week (with current):", completedLeagues);

      // 3️⃣ Fetch rosters for this week (includes weekScores)
      const { data: rosters } = await getRostersWithScoresForWeek(selectedWeek.week);
      console.log(`Fetched ${rosters.length} roster entries`);

      // 4️⃣ Promote players for all completed leagues
      const updatedRosters = promotePlayers(rosters, selectedWeek.week, completedLeagues);
      // 5️⃣ Prepare roster payload for API
      const groupedByTeamWeek = updatedRosters.reduce((acc, entry) => {
        const key = `${entry.teamId}-${entry.week}`;
        if (!acc[key]) acc[key] = { teamId: entry.teamId, week: entry.week, players: [] };
        acc[key].players.push({
          playerId: entry.player?.id ?? null,
          name: entry.player?.name ?? "",
          position: entry.position ?? "",
        });
        return acc;
      }, {});

      const changeRosterData = Object.values(groupedByTeamWeek);
      await updateMultipleRosters(changeRosterData);

      // 6️⃣ Update team records
      const allCompleted = await updateTeamRecordsAfterUpload(
        selectedWeek.week,
        selectedWeek.league
      );

      // 7️⃣ Show success modal
      showModal({
        title: "Success",
        message: `Marked ${selectedWeek.league} Week ${selectedWeek.week} as complete.`,
        confirmText: "OK",
        showCancel: false,
      });

      // 8️⃣ Clean up
      setIncompleteWeeks(prev =>
        prev.filter(w => !(w.league === selectedWeek.league && w.week === selectedWeek.week))
      );

      if (!allCompleted) return;
      setSelectedWeek(null);

    } catch (err) {
      console.error("Error completing week:", err);
      showModal({
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
        {incompleteWeeks.map(w => (
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