import { Link } from "react-router-dom";

export const DraftedTeamsContainer = ({ draftOrderBase, draftedByTeam, currentTeamOnClock }) => (
  <div className="draftedTeamsContainer">
    {draftOrderBase.map(teamName => (
      <div
        key={teamName}
        className={`draftedTeamBox ${teamName === currentTeamOnClock ? "activeDrafting" : ""}`}
      >
        <h3 className="draftedTeamName">{teamName}</h3>
        {draftedByTeam[teamName]?.length ? (
          draftedByTeam[teamName].map((player, idx) => (
            <div key={player.id ?? `${teamName}-${idx}`} className="draftedPlayerItem">
              {player.name} ({player.position})
            </div>
          ))
        ) : (
          <p className="noPicksYet">No picks yet</p>
        )}
      </div>
    ))}
  </div>
);

export const YourDraftedPlayers = ({ user, draftedByTeam }) => {
  if (!user?.team?.name) return null;

  return (
    <div className="yourDraftedPlayersContainer">
      <h2>Your Drafted Players</h2>
      {draftedByTeam[user.team.name]?.length ? (
        <div className="yourDraftedPlayersList">
          {draftedByTeam[user.team.name].map((player, idx) => (
            <div
              key={player.id ?? `${user.team.name}-${idx}`}
              className="draftedPlayerCard"
            >
              {player.name} ({player.position})
            </div>
          ))}
        </div>
      ) : (
        <p>No picks yet</p>
      )}
    </div>
  );
};

export const PickInfo = ({
  lastPick,
  currentPickIndex,
  draftOrder,
  currentTeamOnClock,
  inactiveTeams,
  currentTimer,
  picksUntilYourTurn,
  user,
  buttonBackground,
  buttonColor,
  socketRef
}) => (
  <div className="pickInfo">
    {/* Last Pick */}
    {lastPick && (
      <div className="lastPickInfo">
        <strong>Last Pick:</strong> {lastPick.playerData?.name} ({lastPick.playerData?.position})
        by {lastPick.teamName}
      </div>
    )}

    {/* Current Pick */}
    <strong>Current Pick:</strong>
    {currentPickIndex >= draftOrder.length ? (
      <>
        Draft Completed
        {user?.role === "SUPERADMIN" && (
          <button
            className="inactive-button"
            style={{
              marginLeft: "1rem",
              backgroundColor: buttonBackground,
              color: buttonColor
            }}
            onClick={() => {
              if (!socketRef.current) return;
              if (!window.confirm("Assign all drafted players to their teams?")) return;
              socketRef.current.emit("assignDraftedPlayersToTeams");
            }}
          >
            Assign Drafted Players
          </button>
        )}
      </>
    ) : (
      ` ${currentTeamOnClock} (Pick ${currentPickIndex + 1} of ${draftOrder.length})`
    )}

    {currentPickIndex < draftOrder.length && inactiveTeams.has(currentTeamOnClock) && (
      <span className="inactiveLabel">(Inactive - auto drafting)</span>
    )}

    {currentPickIndex < draftOrder.length && (
      <div>
        <strong>Time Remaining: {currentTimer} seconds</strong>
      </div>
    )}

    {picksUntilYourTurn !== null && picksUntilYourTurn > 0 && (
      <div className="pick-text">
        Your team drafts in {picksUntilYourTurn} pick{picksUntilYourTurn > 1 ? "s" : ""}
      </div>
    )}
  </div>
);

export const PlayersTable = ({
  sortedData,
  sortField,
  sortOrder,
  handleSort,
  backgroundColor,
  color,
  currentPage,
  playersPerPage,
  user,
  currentTeamOnClock,
  handlePickPlayer,
  handlePrevPage,
  handleNextPage,
  buttonBackground,
  buttonColor
}) => (
  <>
    <div className="horizontalScrollArea">
      <table className="playerStatsTable">
        <thead className="statsHeader">
          <tr>
            <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("name")}>
              Name {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
            </th>
            <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("league")}>
              League {sortField === "league" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
            </th>
            <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("position")}>
              Position {sortField === "position" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
            </th>
            <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("games")}>
              Games {sortField === "games" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
            </th>
            <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("lyGames")}>
              Games (LY) {sortField === "lyGames" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
            </th>
            <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("average")}>
              Average {sortField === "average" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
            </th>
            <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("lyAverage")}>
              Last Year Average {sortField === "lyAverage" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
            </th>
            <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("totalPoints")}>
              Total Fantasy Points {sortField === "totalPoints" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
            </th>
            <th style={{ backgroundColor, color }} className="sortableHeader" onClick={() => handleSort("avgFanppg")}>
              Avg Fan Ppg {sortField === "avgFanppg" ? (sortOrder === "asc" ? "▲" : "▼") : "●"}
            </th>
            <th style={{ backgroundColor, color }}>Pick</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan="10" className="noPlayersCell">No players found.</td>
            </tr>
          ) : (
            sortedData
              .slice(currentPage * playersPerPage, (currentPage + 1) * playersPerPage)
              .map(player => (
                <tr key={player.id}>
                  <td>
                    <Link to={`/player/${encodeURIComponent(player.name)}`} className="playerLink">
                      {player.name}
                    </Link>
                  </td>
                  <td>{player.league}</td>
                  <td>{player.position}</td>
                  <td>{player.games}</td>
                  <td>{player.lyGames}</td>
                  <td>{typeof player.average === "number" ? player.average.toFixed(2) : "-"}</td>
                  <td>{player.lyAverage ? Number(player.lyAverage).toFixed(2) : "-"}</td>
                  <td>{player.totalPoints}</td>
                  <td>{typeof player.avgFanppg === "number" ? player.avgFanppg.toFixed(2) : "-"}</td>
                  <td>
                    {user?.team?.name === currentTeamOnClock && (
                      <button className="pickButton" onClick={() => handlePickPlayer(player)}>
                        Pick
                      </button>
                    )}
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>

    {sortedData.length > playersPerPage && (
      <div className="pagination-buttons">
        <button
          className="playerButton playerPageButton"
          style={{ backgroundColor: buttonBackground, color: buttonColor }}
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          Prev
        </button>
        <span className="page-number">
          Page {currentPage + 1} / {Math.ceil(sortedData.length / playersPerPage)}
        </span>
        <button
          className="playerButton playerPageButton"
          style={{ backgroundColor: buttonBackground, color: buttonColor }}
          onClick={handleNextPage}
          disabled={(currentPage + 1) * playersPerPage >= sortedData.length}
        >
          Next
        </button>
      </div>
    )}
  </>
);
