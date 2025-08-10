import { useState } from "react";
import { assignPlayerBadge } from "../src/utils/api";

export default function AdminAssignBadge({ players }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [rank, setRank] = useState("");  

  const handleAssignBadge = async () => {
    if (!selectedPlayer || !name || !year || !iconUrl) {
      alert("Player, badge name, year, and icon are required.");
      return;
    }

    try {
      await assignPlayerBadge({
        playerId: selectedPlayer,
        name,
        description,
        iconUrl,
        year: parseInt(year),
        rank,  
      });
      alert("Badge assigned!");
      setName("");
      setDescription("");
      setIconUrl("");
      setRank("");  
    } catch (err) {
      console.error("Failed to assign badge:", err);
      alert("Failed to assign badge");
    }
  };

  return (
    <div className="admin-section">
      <button
        className="admin-button"
        onClick={() => setShowForm((prev) => !prev)}
        style={{ marginBottom: "1rem" }}
      >
        {showForm ? "Hide Badge Form 🔽" : "Assign Badge to Player 🔼"}
      </button>

      {showForm && (
        <div className="admin-form">
          <h3>Assign Badge</h3>

          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="admin-input"
          >
            <option value="">Select Player</option>
            {players
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.league || "No League"})
                </option>
              ))}
          </select>

          <input
            className="admin-input"
            type="text"
            placeholder="Badge Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="admin-input"
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="admin-input"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            required
          >
            <option value="">Select Icon</option>
            <option value="leaguechamp.png">leaguechamp.png</option>
            <option value="citychamp.jpg">citychamp.jpg</option>
            <option value="highAverage.png">highAverage.png</option>
            <option value="pins.png">pins.png</option>
            <option value="series.png">series.png</option>
            <option value="highfanpts.jpg">highfanpts.jpg</option>
            <option value="multileaguechamp.png">multileaguechamp.png</option>
            <option value="halloffame.png">halloffame.png</option>
            <option value="300.png">300.png</option>
            <option value="800.png">800.png</option>
          </select>

          <input
            className="admin-input"
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <select
            className="admin-input"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
          >
            <option value="">Select Rank</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
          </select>

          <button className="admin-button" onClick={handleAssignBadge}>
            Assign Badge
          </button>
        </div>
      )}
    </div>
  );
}