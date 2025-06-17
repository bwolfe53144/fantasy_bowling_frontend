import { Link } from "react-router-dom";

export const TeamInfo = ({ team }) => (
    <>
      <h1>Team: {team.name}</h1>
      <Link
        to={`/fantasy-stats/${team.name}`}
        className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 transition"
      >
        View {team.name}'s Fantasy Stats
      </Link>
      <p><strong>Captain:</strong> {team.captain}</p>
      <p><strong>Record:</strong> {team.record}</p>
      <p><strong>Points For:</strong> {team.points}</p>
      <p><strong>Points Against:</strong> {team.pointsAgainst}</p>
      <p><strong>Streak:</strong> {team.streak}</p>
    </>
  );