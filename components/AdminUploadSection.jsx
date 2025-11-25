import React, { useState } from "react";
import {
  createPlayer,
  createWeekScore,
} from "../src/utils/api.js";

const isNullLike = (val) => {
  if (val === null || val === undefined) return true;
  if (typeof val === "string") {
    return val.trim().toLowerCase() === "null";
  }
  return false;
};

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.split(/\s+/).map((part) => part.trim()[0] || "");
  return parts.reverse().join("").toUpperCase();
};

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

const getOrCreatePlayer = async (entry, playerList, myTeam, week, incomingAvg, forceCreate) => {
  const { Name, League } = entry;
  const normalizedEntryName = normalizeName(Name);

  // 1️⃣ Local exact match
  const matchingPlayer = playerList.find(
    p => normalizeName(p.name) === normalizedEntryName && p.league.toLowerCase() === League.toLowerCase()
  );
  if (matchingPlayer) return matchingPlayer;

  console.warn(`Player not found: ${Name} (${League}, team: ${myTeam}) — checking backend.`);

  // 2️⃣ Ask backend
  let res = await createPlayer({
    name: capitalizeName(normalizedEntryName),
    league: League,
    teamId: null,
    position: "Flex",
    myTeam: myTeam || "",
    week,
    incomingAvg,
    forceCreate: false,
  });

  // 3️⃣ Normalize response if Axios wrapped it
  if (res?.data) res = res.data;
  if (Array.isArray(res)) res = { status: "multiple_matches", candidates: res };

  // 4️⃣ Handle multiple matches
  if (res.status === "multiple_matches" || res.status === "multiple_existing") {
    const candidates = res.candidates || [];
    if (!candidates.length) return null;

    const incomingGames = [entry.Game1, entry.Game2, entry.Game3].map(g => g || "-").join(" | ");
    const displayAvg = incomingAvg != null ? incomingAvg : "-";

    const choiceStr = candidates
      .map((c, i) => `${i + 1}: ${c.name} — Candidate Avg: ${c.lastAverage ?? "no score"}`)
      .join("\n");

    const selection = window.prompt(
      `Multiple players found for ${entry.Name} (${entry.League}, Team: ${myTeam}).\n` +
      `Incoming Scores: ${incomingGames} | Avg: ${displayAvg}\n\n` +
      `Choose the correct one:\n${choiceStr}\n(Cancel to skip)`
    );

    if (selection === null) return null;
    const index = parseInt(selection, 10) - 1;
    if (isNaN(index) || index < 0 || index >= candidates.length) return null;

    return candidates[index];
  }

  // 5️⃣ No match → prompt for manual input
  if (res.status === "no_match") {
    const initials = getInitials(entry.Name);
    const incomingGames = [entry.Game1, entry.Game2, entry.Game3].map(g => g || "-").join(" | ");
    const displayAvg = incomingAvg != null ? incomingAvg : "-";

    const newName = window.prompt(
      `No player found with initials "${initials}" for team "${myTeam}".\n` +
      `Incoming Games: ${incomingGames} | Incoming Avg: ${displayAvg}\n\n` +
      `Enter the FULL NAME of the new player:`,
      entry.Name
    );

    if (!newName) return null;

    const finalName = capitalizeName(normalizeName(newName));

    const createdPlayerResponse = await createPlayer({
      name: finalName,
      league: League,
      teamId: null,
      position: "Flex",
      myTeam: myTeam || "",
      week,
      incomingAvg,
      forceCreate: true,
    });
    
    // Unwrap Axios data if present
    const createdPlayer = createdPlayerResponse?.data || createdPlayerResponse;
    
    console.log("Manually created player:", createdPlayer);
    return createdPlayer;
  }

  // 6️⃣ Single match from backend → return
  return res;
};



const postWeekScoreIfNotExists = async (entry, playerId, weekScores) => {
  const { Game1, Game2, Game3, Average, Week, Opponent, Lanes, Name, myTeam, Series } = entry;
  const parsedWeek = parseInt(Week?.toString().replace(/[^0-9]/g, ""), 10) || 0;

  // Skip if series is 0 (didn't bowl)
  if (parseInt(Series) === 0) {
    console.warn(`Skipping ${Name} (Week ${parsedWeek}): Series is 0`);
    return;
  }

  const weekExists = weekScores?.some(
    (ws) => ws.playerId === playerId && ws.week === parsedWeek
  );
  if (weekExists) {
    console.log(`Score already exists for ${Name}, week ${parsedWeek}`);
    return;
  }

  // Convert games to numbers or null
  const games = [Game1, Game2, Game3].map(g => {
    const num = parseInt(g);
    return isNaN(num) ? null : num;
  });

  const seriesTotal = parseInt(Series);
  const sumGames = games.reduce((acc, g) => acc + (g || 0), 0);

  let adjustedGames = [...games];

  if (sumGames !== seriesTotal) {
    const combos = [
      [0, 1, 2],
      [0, 1],
      [0, 2],
      [1, 2],
      [0],
      [1],
      [2]
    ];

    const validCombos = combos.filter(c =>
      c.reduce((acc, idx) => acc + (games[idx] || 0), 0) === seriesTotal
    );

    if (validCombos.length === 0) {
      console.warn(`Cannot match series for ${Name} (Week ${parsedWeek}), using original games`);
    } else if (validCombos.length === 1) {
      adjustedGames = adjustedGames.map((g, idx) => (validCombos[0].includes(idx) ? g : null));
    } else {
      const gameOptions = validCombos
        .map((combo, i) => {
          const display = adjustedGames.map((g, idx) => (combo.includes(idx) ? g : "-")).join(" | ");
          return `${i + 1}: ${display}`;
        })
        .join("\n");

      const manualChoice = window.prompt(
        `Multiple game combinations match the series for ${Name} (Week ${parsedWeek}).\nSeries: ${seriesTotal}\nGames: ${games.join(
          " | "
        )}\nChoose the correct combination:\n${gameOptions}\n(Cancel to skip)`
      );

      if (manualChoice === null) {
        console.warn(`User cancelled manual selection for ${Name}, skipping this score`);
        return;
      }

      const choice = parseInt(manualChoice, 10);
      if (!isNaN(choice) && choice >= 1 && choice <= validCombos.length) {
        adjustedGames = adjustedGames.map((g, idx) =>
          validCombos[choice - 1].includes(idx) ? g : null
        );
      } else {
        console.warn(`No valid choice selected for ${Name}, skipping this score`);
        return;
      }
    }
  }

  const newScore = {
    week: parsedWeek,
    game1: adjustedGames[0],
    game2: adjustedGames[1],
    game3: adjustedGames[2],
    average: parseFloat(Average) || 0,
    playerId,
    opponent: Opponent || "",
    lanes: String(Lanes) || "",
    myTeam: myTeam || "",
  };

  const postRes = await createWeekScore(newScore);
  console.log(`Inserted score for ${Name} (week ${Week})`, postRes.data);
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
      const rawData = await fetchAndParseApiData(api);
      setData(rawData);

      // Step 1: Build lane → team map for all week/league
      const laneTeamMap = {};
      for (const entry of rawData) {
        const week = parseInt(entry.Week?.toString().replace(/[^0-9]/g, ""), 10) || 0;
        const league = entry.League;
        const lane = parseInt(entry.Lane || entry.Lanes, 10);
        if (isNaN(lane)) continue;

        if (!laneTeamMap[league]) laneTeamMap[league] = {};
        if (!laneTeamMap[league][week]) laneTeamMap[league][week] = {};

        if (!isNullLike(entry.myTeam)) {
          laneTeamMap[league][week][lane] = entry.myTeam;
        }
      }

      // Step 2: Process each player and assign lanes & opponents
      const sortedData = rawData.sort((a, b) => {
        const weekA = parseInt(a.Week?.toString().replace(/[^0-9]/g, ""), 10) || 0;
        const weekB = parseInt(b.Week?.toString().replace(/[^0-9]/g, ""), 10) || 0;
        return weekA - weekB;
      });
      
      for (const entry of sortedData) {
        let myTeam = isNullLike(entry.myTeam) ? "" : entry.myTeam;
        const week = parseInt(entry.Week?.toString().replace(/[^0-9]/g, ""), 10) || 0;
        const league = entry.League;
        let lane = parseInt(entry.Lane || entry.Lanes, 10);
        if (isNaN(lane)) continue;
      
        if (!myTeam) {
          myTeam = laneTeamMap[league][week][lane] || "";
        }
        entry.myTeam = myTeam;
      
        // ✅ Convert incoming average to number (or null if missing)
        let incomingAvg = null;
        if (entry.Average !== null && entry.Average !== undefined) {
          const parsed = parseFloat(entry.Average);
          if (!isNaN(parsed)) incomingAvg = parsed;
        }
        entry.Average = incomingAvg;

        // Debug log
        console.log(
          `Processing ${entry.Name} (Week ${week}, Team: ${myTeam}) — Incoming Avg: ${
            incomingAvg !== null ? incomingAvg : "none"
          }`
        );

        // ✅ Get or create player with average for pin tolerance
        const player = await getOrCreatePlayer(entry, playerList, myTeam, week, incomingAvg);
      
        if (!player || !player.id) {
          console.warn(
            `Skipping ${entry.Name} (Week ${week}) — no player selected or player not found.`
          );
          continue;
        }
      
        // Determine opponent
        const pairedLane = lane % 2 === 0 ? lane - 1 : lane + 1;
        const opponent = laneTeamMap[league][week][pairedLane] || "Bye";
        entry.Opponent = opponent;
      
        await postWeekScoreIfNotExists(entry, player.id, weekScores);
      }

      alert("Week scores uploaded successfully. Roster promotion will occur after week completion.");
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
