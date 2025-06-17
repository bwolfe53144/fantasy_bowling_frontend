import { Link } from "react-router-dom";

export const MatchupTable = ({ matches, teamName, completedWeeks, currentWeek }) => {
  return (
    <div>
      <h2>Recent Matchups</h2>
      <div className="horizontalScrollArea">
        <table className="matchupTable">
          <thead>
            <tr>
              <th>Week</th>
              <th>Opponent</th>
              <th>Score</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => {
              const isTeam1 = teamName === match.team1?.name;
              const opponent = isTeam1 ? match.team2 : match.team1;
              const myScore = isTeam1 ? match.team1Score : match.team2Score;
              const opponentScore = isTeam1 ? match.team2Score : match.team1Score;

              const isCompletedWeek = completedWeeks.includes(String(match.week));
              const isCurrentWeek = String(match.week) === String(currentWeek);

              let rowClass = "";
              if (isCompletedWeek) {
                if (myScore > opponentScore) rowClass = "win";
                else if (myScore < opponentScore) rowClass = "loss";
                else rowClass = "tie";
                rowClass += " completed-border";
              } else if (isCurrentWeek) {
                rowClass = "current-week";
              }

              return (
                <tr key={index} className={`match-row ${rowClass}`}>
                  <td>{match.week}</td>
                  <td>
                    <Link to={`/team/${opponent.name}`}>
                      {opponent.name}
                    </Link>
                  </td>
                  <td>
                    {myScore ?? 0} - {opponentScore ?? 0}
                  </td>
                  <td>
                    <Link to={`/matchup/${match.id}`}>
                      View Matchup
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};