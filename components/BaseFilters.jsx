import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../src/utils/AuthContext";
import { getThemeColors } from "../src/utils/themeColors";
import "../src/styles/BaseFilters.css";

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
  hideLastYearToggle = false, // default to false
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
  };

  return (
    <div className="baseFilterWrapper">
      {/* Position Filter */}
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

      {/* League Filter */}
      <div className="filterItem leagueItem" ref={leagueDropdownRef}>
        <label htmlFor="leagueFilter">Leagues:</label>
        <div
          className="customDropdown"
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
          <div className={`dropdownMenu ${leagueDropdownOpen ? "open" : ""}`}>
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
                  className={`dropdownItem ${isSelected ? "selected" : ""}`}
                >
                  {league}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Season Games Filter */}
      <div className="filterItem gamesContainer">
        <label htmlFor="gamesFilter">Min Games (Current):</label>
        <input
          id="gamesFilter"
          type="number"
          value={gamesFilter || ""}
          onChange={(e) => setGamesFilter(e.target.value ? parseInt(e.target.value, 10) : null)}
        />
        <button className="resetButton" style={buttonStyle} onClick={() => setGamesFilter(null)}>
          Reset
        </button>
      </div>

      {/* Last Year Games Filter */}
      {showLastYear && (
        <div className="filterItem gamesContainer">
          <label htmlFor="lyGamesFilter">Min Games (Last Year):</label>
          <input
            id="lyGamesFilter"
            type="number"
            value={lyGamesFilter || ""}
            onChange={(e) => setLyGamesFilter(e.target.value ? parseInt(e.target.value, 10) : null)}
          />
          <button className="resetButton" style={buttonStyle} onClick={() => setLyGamesFilter(null)}>
            Reset
          </button>
        </div>
      )}

      {/* Name Search */}
      <div className="filterItem">
        <label htmlFor="nameSearch">Search Name:</label>
        <input
          id="nameSearch"
          type="text"
          className="playerSearchInput"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter player name"
        />
      </div>

      {/* Team Filter */}
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

      {/* LY Toggle Button */}
      {setShowLastYear && !hideLastYearToggle && (
        <div className="filterItem">
          <button
            className="lastYearButton"
            style={buttonStyle}
            onClick={() => setShowLastYear((prev) => !prev)}
          >
            {showLastYear ? "Hide Last Year Stats" : "Show Last Year Stats"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BaseFilters;