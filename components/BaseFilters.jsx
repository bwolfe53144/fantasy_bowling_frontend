import React, { useContext, useState, useRef, useEffect } from "react";
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

  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false);
  const leagueDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (leagueDropdownRef.current && !leagueDropdownRef.current.contains(event.target)) {
        setLeagueDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      <div className="filterItem" ref={leagueDropdownRef}>
        <label htmlFor="leagueFilter">Leagues:</label>
        <div
          className="customDropdown"
          style={{
            border: "1px solid #ccc",
            padding: "0.5rem",
            borderRadius: "5px",
            cursor: "pointer",
            position: "relative",
            minWidth: "150px"
          }}
          onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
        >
          <span title={leagueFilter.length > 0 ? leagueFilter.join(", ") : "All Leagues"}>
            {leagueFilter.length === 0
              ? "All"
              : (() => {
                  const preview = leagueFilter.slice(0, 2).map(name =>
                    name.length > 10 ? name.slice(0, 7) + "..." : name
                  );
                  const moreCount = leagueFilter.length - preview.length;
                  return preview.join(", ") + (moreCount > 0 ? ` +${moreCount} more` : "");
                })()}
          </span>
          <div
            className="dropdownMenu"
            style={{
              display: leagueDropdownOpen ? "block" : "none",
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              border: "1px solid #ccc",
              zIndex: 1000,
              maxHeight: "200px",
              overflowY: "auto"
            }}
          >
            {uniqueLeagues.map((league, idx) => {
              const isSelected = leagueFilter.includes(league);
              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLeagueFilter((prev) =>
                      prev.includes(league)
                        ? prev.filter((l) => l !== league)
                        : [...prev, league]
                    );
                  }}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: isSelected ? "#007BFF" : "white",
                    color: isSelected ? "white" : "black",
                    cursor: "pointer"
                  }}
                >
                  {league}
                </div>
              );
            })}
          </div>
        </div>
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