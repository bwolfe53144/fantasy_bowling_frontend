import React from "react";

const getPercentClass = (percent) => {
  if (percent === 100) return "rank-tan";
  if (percent >= 99) return "rank-pink";
  if (percent >= 95) return "rank-orange";
  if (percent >= 75) return "rank-purple";
  if (percent >= 50) return "rank-blue";
  if (percent >= 25) return "rank-green";
  return "rank-grey";
};

const PlayerRankTable = ({ players, headerBg = "#f0f0f0", headerColor = "#000", displayName }) => {
  if (!players || players.length === 0) return null;

  const heading = displayName ? `${displayName}'s Ranks by League` : "Ranks by League";

  return (
    <div className="horizontalScrollArea">
      <h2>{heading}</h2>
      <table
        className="playerStatsTable"
        style={{
          "--header-bg": headerBg,
          "--header-color": headerColor,
        }}
      >
        <thead>
          <tr>
            <th className="sticky-col">League</th>
            <th>Average Rank</th>
            <th>Fan Points Rank</th>
            <th>Fan PPG Rank</th>
            <th>Series Rank</th>
            <th>Pinfall Rank</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.league}>
              <td>{player.league}</td>
              <td>
                {player.playerRank?.avgRank > 0 ? (
                  <>
                    {player.playerRank.avgRank}{" "}
                    <span className={getPercentClass(player.playerRank.avgPercent)}>
                      ({player.playerRank.avgPercent}%)
                    </span>
                  </>
                ) : "N/A"}
              </td>
              <td>
                {player.playerRank?.fanPoints > 0 ? (
                  <>
                    {player.playerRank.fanPoints}{" "}
                    <span className={getPercentClass(player.playerRank.fanPercent)}>
                      ({player.playerRank.fanPercent}%)
                    </span>
                  </>
                ) : "N/A"}
              </td>
              <td>
                {player.playerRank?.fanPPG > 0 ? (
                  <>
                    {player.playerRank.fanPPG}{" "}
                    <span className={getPercentClass(player.playerRank.fanPPGPercent)}>
                      ({player.playerRank.fanPPGPercent}%)
                    </span>
                  </>
                ) : "N/A"}
              </td>
              <td>
                {player.playerRank?.seriesRank > 0 ? (
                  <>
                    {player.playerRank.seriesRank}{" "}
                    <span className={getPercentClass(player.playerRank.seriesPercent)}>
                      ({player.playerRank.seriesPercent}%)
                    </span>
                  </>
                ) : "N/A"}
              </td>
              <td>
                {player.playerRank?.pinfallRank > 0 ? (
                  <>
                    {player.playerRank.pinfallRank}{" "}
                    <span className={getPercentClass(player.playerRank.pinfallPercent)}>
                      ({player.playerRank.pinfallPercent}%)
                    </span>
                  </>
                ) : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerRankTable;