import React from "react";

const PlayerBadgeDisplay = ({ players, displayName }) => {
  if (!players || players.length === 0) return null;

  // Flatten and filter out players without badges
  const allBadges = players.flatMap((p) => p.badges || []);
  if (allBadges.length === 0) return null;

  const grouped = allBadges.reduce((acc, badge) => {
    const rank = badge.rank || "Unranked";
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(badge);
    return acc;
  }, {});

  const rankOrder = ["Platinum", "Gold", "Silver", "Bronze", "Unranked"];
  const heading = displayName ? `${displayName}'s Badges` : "Badges";

  return (
    <div>
      <h2>{heading}</h2>
      {rankOrder.map((rank) =>
        grouped[rank] && grouped[rank].length > 0 ? (
          <div key={rank} className="player-badges-by-rank">
            <h3>{rank} Badges</h3>
            <div className="badges-list">
              {grouped[rank].map((badge) => (
                <div
                  key={badge.id}
                  className={`badge-circle rank-${rank.toLowerCase()}`}
                  title={`${badge.name} (${badge.year}) - ${badge.description || ""}`}
                >
                  {badge.iconUrl && (
                    <img
                      src={`/${badge.iconUrl}`}
                      alt={badge.name}
                      className="badge-icon"
                    />
                  )}
                  <div className="badge-text">
                    <div>{badge.name}</div>
                    <div style={{ fontSize: "0.7rem", marginTop: "0.3rem" }}>{badge.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default PlayerBadgeDisplay;