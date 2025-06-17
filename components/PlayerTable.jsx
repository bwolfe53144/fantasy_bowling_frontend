import { Link } from "react-router-dom";

export const PlayerTable = ({ players, sortField, sortOrder, onSort }) => {
    const renderSortableHeader = (label, field) => (
      <th
        onClick={() => onSort(field)}
        style={{ cursor: "pointer" }}
        className="border px-4 py-2 text-left"
      >
        {label} {sortField === field ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
      </th>
    );
  
    return (
      <div>
        <h2>Players</h2>
        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>League</th>
                <th>Position</th>
                {renderSortableHeader("Average", "average")}
                {renderSortableHeader("Games Bowled", "games")}
                {renderSortableHeader("Points", "totalPoints")}
                {renderSortableHeader("Avg PPG", "avgFanppg")}
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index}>
                  <td>
                    <Link to={`/player/${player.name}`}>
                      {player.name}
                    </Link>
                  </td>
                  <td>{player.league}</td>
                  <td>{player.position}</td>
                  <td>{player.average.toFixed(2)}</td>
                  <td>{player.games}</td>
                  <td>{player.totalPoints}</td>
                  <td>{player.avgFanppg.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

