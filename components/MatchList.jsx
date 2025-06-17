import { Link } from "react-router-dom";
import "../src/styles/MatchList.css"

export default function MatchList({ matches, championshipId, thirdPlaceId }) {
  return (
    <div className="matchListContainer">
      {matches.map((match) => {
        const isChamp = match.id === championshipId;
        const isThird = match.id === thirdPlaceId;

        const team1 = match.team1Meta || {};
        const team2 = match.team2Meta || {};

        return (
          <div key={match.id} className="matchupCard">
            <Link to={`/matchup/${match.id}`} className="matchupLink">
              {/* Team 1 Layout */}
              <div className="teamGroup">
                <div className="teamCol teamRecord">
                  {team1.wins ?? 0}-{team1.losses ?? 0}-{team1.ties ?? 0}
                </div>

                {team1.avatarUrl && (
                  <div className="teamCol">
                    <img
                      src={team1.avatarUrl}
                      alt={`${team1.name || "Team 1"} avatar`}
                      className="avatar"
                    />
                  </div>
                )}

                <div className="teamCol">
                  <div className="teamName">{team1.name || "Unknown Team"}</div>
                  <div className="teamScore">{match.team1Score ?? 0}</div>
                </div>
              </div>

              <div className="vs">VS</div>

              {/* Team 2 Layout */}
              <div className="teamGroup">
                {team2.avatarUrl && (
                  <div className="teamCol">
                    <img
                      src={team2.avatarUrl}
                      alt={`${team2.name || "Team 2"} avatar`}
                      className="avatar"
                    />
                  </div>
                )}

                <div className="teamCol">
                  <div className="teamName">{team2.name || "Unknown Team"}</div>
                  <div className="teamScore">{match.team2Score ?? 0}</div>
                </div>

                <div className="teamCol teamRecord">
                  {team2.wins ?? 0}-{team2.losses ?? 0}-{team2.ties ?? 0}
                </div>
              </div>
            </Link>

            {isChamp && <span className="matchLabel"> 🏆 Championship Game</span>}
            {isThird && <span className="matchLabel"> 🥉 3rd Place Game</span>}
          </div>
        );
      })}
    </div>
  );
}