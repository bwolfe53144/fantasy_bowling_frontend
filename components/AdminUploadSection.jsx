import React, { useState } from "react";
import {
  createPlayer,
  createWeekScore,
  fetchAllRosters,
  fetchAllLockStatuses,
  updateMultipleRosters,
} from "../src/utils/api.js";
import { promotePlayers } from "../src/utils/PromotePlayers.js";

const normalizeName = (name) => {
  if (!name) return "";
  let normalized = name.trim().toLowerCase();
  const suffixes = ["jr", "sr", "ii", "iii", "iv"];
  let suffix = "";
  const suffixRegex = new RegExp(`\\b(${suffixes.join("|")})\\.?$`, "i");

  if (normalized.includes(",")) {
    const [lastRaw, firstRaw] = normalized.split(",").map((s) => s.trim());
    const lastParts = lastRaw.split(" ");
    const firstParts = firstRaw.split(" ");
    const lastSuffix = lastParts.find((part) => suffixes.includes(part.replace(/\./, "")));
    const firstSuffix = firstParts.find((part) => suffixes.includes(part.replace(/\./, "")));

    if (lastSuffix) {
      suffix = lastSuffix.replace(/\./, "");
      lastParts.splice(lastParts.indexOf(lastSuffix), 1);
    }

    if (firstSuffix && !suffix) {
      suffix = firstSuffix.replace(/\./, "");
      firstParts.splice(firstParts.indexOf(firstSuffix), 1);
    }

    normalized = `${firstParts.join(" ")} ${lastParts.join(" ")}`.trim();
  } else {
    const parts = normalized.split(" ");
    const lastPart = parts[parts.length - 1].replace(/\./, "");
    if (suffixes.includes(lastPart)) {
      suffix = lastPart;
      parts.pop();
    }
    normalized = parts.join(" ");
  }

  if (suffix) {
    normalized += ` ${suffix}`;
  }

  return normalized.trim();
};

const capitalizeName = (name) =>
  name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
    .join(" ");

const fetchAndParseApiData = async (apiUrl) => {
  const response = await fetch(apiUrl);
  const json = await response.json();
  return Object.values(json)[0];
};

const getOrCreatePlayer = async (entry, playerList) => {
  const { Name, League } = entry;
  const matchingPlayer = playerList.find(
    (p) =>
      normalizeName(p.name) === normalizeName(Name) &&
      p.league.toLowerCase() === League.toLowerCase()
  );

  if (matchingPlayer) return matchingPlayer;

  console.warn(`Player not found: ${Name} (${League}) — creating new player.`);
  const newPlayer = {
    name: capitalizeName(normalizeName(Name)),
    league: League,
    teamId: null,
    position: "flex",
  };

  const res = await createPlayer(newPlayer);
  return res.data;
};

const postWeekScoreIfNotExists = async (entry, playerId, weekScores) => {
  const { Game1, Game2, Game3, Average, Week, Opponent, Lanes, Name, myTeam } = entry;
  const parsedWeek = parseInt(Week?.toString().replace(/[^0-9]/g, ""), 10) || 0;

  const weekExists = weekScores?.some(
    (ws) => ws.playerId === playerId && ws.week === parsedWeek
  );
  if (weekExists) {
    console.log(`Score already exists for ${Name}, week ${parsedWeek}`);
    return;
  }

  const allGamesNull = [Game1, Game2, Game3].every((g) => !g || isNaN(parseInt(g)));
  if (allGamesNull) {
    console.warn(`Skipping ${Name} (Week ${parsedWeek}): all games are null.`);
    return;
  }

  const newScore = {
    week: parsedWeek,
    game1: parseInt(Game1) || null,
    game2: parseInt(Game2) || null,
    game3: parseInt(Game3) || null,
    average: parseFloat(Average) || 0,
    playerId,
    opponent: Opponent || "",
    lanes: Lanes || "",
    myTeam: myTeam || "",
  };

  const postRes = await createWeekScore(newScore);
  console.log(`Inserted score for ${Name} (week ${Week})`, postRes.data);
};

const updateRostersAfterScoring = async (promotePlayers) => {
  const rostersResponse = await fetchAllRosters();
  const lockStatusesResponse = await fetchAllLockStatuses();

  const updatedRosters = await promotePlayers(rostersResponse.data, lockStatusesResponse.data);

  const groupedByTeamWeek = updatedRosters.reduce((acc, entry) => {
    const key = `${entry.teamId}-${entry.week}`;
    if (!acc[key]) {
      acc[key] = {
        teamId: entry.teamId,
        week: entry.week,
        players: [],
      };
    }
    acc[key].players.push({
      playerId: entry.player?.id ?? null,
      name: entry.player?.name ?? "",
      position: entry.position ?? "",
    });
    return acc;
  }, {});

  const changeRosterData = Object.values(groupedByTeamWeek);
  const changeRosterResponse = await updateMultipleRosters(changeRosterData);

  if (changeRosterResponse.status === 200) {
    alert("Roster updated successfully");
  } else {
    alert("Error updating roster.");
  }
};

const AdminUploadSection = ({ playerList, weekScores }) => {
    const [api, setApi] = useState("");
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
  
    const handleUploadData = async () => {
      if (!api.trim()) {
        alert("Please enter an API URL.");
        return;
      }
  
      alert("submitted");
  
      try {
        const data = await fetchAndParseApiData(api);
        setData(data);
  
        for (const entry of data) {
          const player = await getOrCreatePlayer(entry, playerList);
          await postWeekScoreIfNotExists(entry, player.id, weekScores);
        }
  
        await updateRostersAfterScoring(promotePlayers);
      } catch (error) {
        console.error("Error:", error);
        alert("Server error.");
      }
    };
  
    return (
      <div className="admin-section">
        {showForm ? (
          <div className="admin-form-card">
            <h2>Upload Data</h2>
            <input
              type="text"
              value={api}
              onChange={(e) => setApi(e.target.value)}
              placeholder="Enter API URL"
            />
            <button onClick={handleUploadData} className="admin-button">
              Upload
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="admin-button success"
          >
            Put in API URL
          </button>
        )}
      </div>
    );
  };
  
  export default AdminUploadSection;