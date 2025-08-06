import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getAllOwners } from "../utils/api";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/AllOwners.css"; 

const AllOwners = () => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [owners, setOwners] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  const { buttonBackground, buttonColor } = getThemeColors(user?.color, isDarkMode);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await getAllOwners();

        const ownersWithRank = response.data.map((owner) => {
          // Initialize totals
          let totalWins = 0;
          let totalLosses = 0;
          let totalTies = 0;

          if (owner.team) {
            totalWins += owner.team.wins || 0;
            totalLosses += owner.team.losses || 0;
            totalTies += owner.team.ties || 0;
          }

          if (owner.priorYearStandings) {
            owner.priorYearStandings.forEach((standing) => {
              totalWins += standing.wins || 0;
              totalLosses += standing.losses || 0;
              totalTies += standing.ties || 0;
            });
          }

          // 1. Points for wins - losses (winDiffPoints)
          const winDiffPoints = totalWins - totalLosses;

          // 2. Win percentage calculation including ties as half a win
          const totalGames = totalWins + totalLosses + totalTies;
          const winPercentage =
            totalGames > 0 ? ((totalWins + 0.5 * totalTies) / totalGames) * 100 : 0;
          const winPercentagePoints = Math.round(winPercentage);

          // 3. Average place points
          const placePointsArray = owner.priorYearStandings?.map(({ place }) => {
            if (place === 1) return 100;
            if (place === 2) return 80;
            if (place === 3) return 60;
            if (place <= 6) return 50;
            const outOfPlayoffs = 14 - 6; // total teams - playoff teams
            const dropPerTeam = 40 / outOfPlayoffs;
            return Math.max(10, 40 - dropPerTeam * (place - 7));
          }) || [];

          const averagePlacePoints = placePointsArray.length > 0
            ? placePointsArray.reduce((a, b) => a + b, 0) / placePointsArray.length
            : 0;

          // Round average place points
          const averagePlacePointsRounded = Math.round(averagePlacePoints);

          // 4. Bonus points for top finishes
          const places = owner.priorYearStandings?.map(s => s.place) || [];
          const firstPlaceCount = places.filter(p => p === 1).length;
          const secondPlaceCount = places.filter(p => p === 2).length;
          const thirdPlaceCount = places.filter(p => p === 3).length;

          const bonusPoints = (firstPlaceCount * 15) + (secondPlaceCount * 10) + (thirdPlaceCount * 5);

          // Final combined rank points
          const rankPoints = winDiffPoints + winPercentagePoints + averagePlacePointsRounded + bonusPoints;

          return {
            ...owner,
            rankPoints,
            totalWins,
            totalLosses,
            totalTies,
            winPercentage: Math.round(winPercentage),
          };
        });

        const sorted = ownersWithRank.sort((a, b) => b.rankPoints - a.rankPoints);
        setOwners(sorted);
      } catch (err) {
        console.error("Failed to fetch all owners:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchOwners();
  }, []);

  if (loading || loadingData) return <LoadingScreen />;

  return (
    <div
      className="pageContainer"
      style={{ "--button-bg": buttonBackground, "--button-color": buttonColor }}
    >
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>All Time Rank</h1>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Team</th>
              <th>All-Time Record</th>
              <th>Win %</th>
              <th>Prior Finishes</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner, index) => (
              <tr key={owner.username}>
                <td>{index + 1}</td>
                <td>
                  <Link to={`/owner/${encodeURIComponent(owner.firstname + " " + owner.lastname)}`}>
                    {owner.firstname} {owner.lastname}
                  </Link>
                </td>
                <td>
                  {owner.team ? (
                    <Link to={`/team/${encodeURIComponent(owner.team.name)}`}>
                      {owner.team.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{owner.totalWins}-{owner.totalLosses}-{owner.totalTies}</td>
                <td>{owner.winPercentage}%</td>
                <td>{owner.priorYearStandings?.map((s) => s.place).join(", ") || "—"}</td>
                <td>{owner.rankPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="explanation-toggle-button"
          onClick={() => setShowExplanation((prev) => !prev)}
          aria-expanded={showExplanation}
          aria-controls="score-explanation"
        >
          {showExplanation ? "Hide Score Explanation ▲" : "How Scores Are Calculated ▼"}
        </button>

        <section
          id="score-explanation"
          className={`score-explanation ${showExplanation ? "open" : ""} ${
            isDarkMode ? "dark" : "light"
          }`}
          aria-hidden={!showExplanation}
        >
          <h2>How Scores Are Calculated</h2>
          <p>Each owner’s rank score is based on three main components:</p>
          <ol>
            <li>
              <strong>Wins minus Losses:</strong> Rewards teams with more wins than losses across all
              seasons.
            </li>
            <li>
              <strong>Win Percentage:</strong> Calculated as (Wins + 0.5 × Ties) divided by total games
              played, reflecting overall consistency.
            </li>
            <li>
              <strong>Average Placement Points:</strong> Points assigned based on average finishing
              positions in prior seasons — top finishes earn more points (1st place = 100 points, 2nd =
              80, 3rd = 60, 4th–6th = 50, and lower places decrease linearly to 10 points).
            </li>
          </ol>
          <p>
            These factors combine to give a balanced all-time ranking considering longevity,
            consistency, and high performance.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AllOwners;