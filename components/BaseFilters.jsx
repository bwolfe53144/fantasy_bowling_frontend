import React, { useContext } from "react";
import { AuthContext } from "../src/utils/AuthContext";
import { getThemeColors } from "../src/utils/themeColors";

const BaseFilters = ({
  sortPosition,
  setSortPosition,
  leagueFilter,
  setLeagueFilter,
  uniqueLeagues,
  gamesFilter,
  setGamesFilter,
  lyGamesFilter,
  setLyGamesFilter,
  searchQuery,
  setSearchQuery,
  teamFilter,
  setTeamFilter,
  uniqueTeams = [],
  showLastYear,
  setShowLastYear,
}) => {
  const { user } = useContext(AuthContext);
  const { buttonBackground, buttonColor } = getThemeColors(user?.color);

  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    padding: ".7rem",
    minWidth: "90px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    marginLeft: "1rem",
  };

  return (
    <div className="baseFilterWrapper">
      <div className="filterItem">
        <label htmlFor="positionFilter">Position:</label>
        <select
          id="positionFilter"
          value={sortPosition}
          onChange={(e) => setSortPosition(e.target.value)}
        >
          <option value="">All</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="flex">Flex</option>
        </select>
      </div>

      <div className="filterItem">
        <label htmlFor="leagueFilter">League:</label>
        <select
          id="leagueFilter"
          value={leagueFilter}
          onChange={(e) => setLeagueFilter(e.target.value)}
        >
          <option value="">All</option>
          {uniqueLeagues.map((league, index) => (
            <option key={index} value={league}>
              {league}
            </option>
          ))}
        </select>
      </div>

      <div className="filterItem gamesContainer">
        <label htmlFor="gamesFilter">Min Games (Current):</label>
        <input
          id="gamesFilter"
          type="number"
          value={gamesFilter || ""}
          onChange={(e) =>
            setGamesFilter(e.target.value ? parseInt(e.target.value, 10) : null)
          }
          style={{ width: "80px" }}
        />
        <button style={buttonStyle} onClick={() => setGamesFilter(null)}>
          Reset
        </button>
      </div>

      {showLastYear && (
        <div className="filterItem gamesContainer">
          <label htmlFor="lyGamesFilter">Min Games (Last Year):</label>
          <input
            id="lyGamesFilter"
            type="number"
            value={lyGamesFilter || ""}
            onChange={(e) =>
              setLyGamesFilter(e.target.value ? parseInt(e.target.value, 10) : null)
            }
            style={{ width: "80px" }}
          />
          <button style={buttonStyle} onClick={() => setLyGamesFilter(null)}>
            Reset
          </button>
        </div>
      )}

      <div className="filterItem">
        <label htmlFor="nameSearch">Search Name:</label>
        <input
          id="nameSearch"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter player name"
        />
      </div>

      {teamFilter !== undefined && setTeamFilter && (
        <div className="filterItem">
          <label htmlFor="teamFilter">Team:</label>
          <select
            id="teamFilter"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="">All</option>
            {uniqueTeams.map((team, idx) => (
              <option key={idx} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      )}

      {showLastYear !== undefined && setShowLastYear && (
        <div className="filterItem">
          <button
            className="lastYearButton"
            style={buttonStyle}
            onClick={() => setShowLastYear((prev) => !prev)}
          >
            {showLastYear ? "Hide Last Year Comparison" : "Show Last Year Comparison"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BaseFilters;