import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext.jsx";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import MatchList from "../../components/MatchList.jsx";
import { enrichRecentMatchesWithScores } from "../utils/enrichMatches.js";
import { getThemeColors } from "../utils/themeColors.js";
import "../styles/Schedule.css"

export default function Schedule() {
  const { user } = useContext(AuthContext);
  const [schedule, setSchedule] = useState([]);
  const [playoffStartWeek, setPlayoffStartWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const { week } = useParams();
  const navigate = useNavigate();
  const selectedWeek = Number(week);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { buttonBackground, buttonColor } = getThemeColors(user?.color);

  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    width: "170px",
    minHeight: "50px",
    textAllign: "center",
    borderRadius: "12px",
    margin: "1rem 1.1rem",
  };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  const playoffWeeks = playoffStartWeek
    ? [playoffStartWeek, playoffStartWeek + 1, playoffStartWeek + 2]
    : [];

  const playoffLabels = {
    [playoffStartWeek]: "Quarterfinals",
    [playoffStartWeek + 1]: "Semifinals",
    [playoffStartWeek + 2]: "Finals",
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("http://localhost:5000/schedule");
        const data = await res.json();
        const enriched = await enrichRecentMatchesWithScores(data.schedule);
        console.log(enriched);
        setSchedule(enriched);
        setPlayoffStartWeek(data.playoffWeek);
        setLoading(false);
      } catch (err) {
        console.error("Error loading schedule:", err);
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const weeks = schedule.reduce((acc, match) => {
    acc[match.week] = acc[match.week] || [];
    acc[match.week].push(match);
    return acc;
  }, {});
  
  const allWeeks = [
    ...new Set([...Object.keys(weeks).map(Number), ...playoffWeeks]),
  ].sort((a, b) => a - b);

  const matchesThisWeek = weeks[selectedWeek] || [];

  const orderedMatches = user?.team
    ? [
        ...matchesThisWeek.filter(
          (m) => m.team1.id === user.team.id || m.team2.id === user.team.id
        ),
        ...matchesThisWeek.filter(
          (m) => m.team1.id !== user.team.id && m.team2.id !== user.team.id
        ),
      ]
    : matchesThisWeek;

  const currentIndex = allWeeks.indexOf(selectedWeek);

  const championshipMatchId = orderedMatches.find(m => m.matchType === "Championship")?.id;
  const thirdPlaceMatchId = orderedMatches.find(m => m.matchType === "Third Place")?.id;

  if (loading) return <LoadingScreen />;

  return (
    <div className="pageContainer schedule">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <div>
          <h1>Schedule</h1>
          <h3>Select Week</h3>
          <select
            value={selectedWeek}
            onChange={(e) => navigate(`/schedule/${e.target.value}`)}
          >
            {allWeeks.map((w) => (
              <option key={w} value={w}>
                {playoffLabels[w] ? playoffLabels[w] : `Week ${w}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2>
            {playoffLabels[selectedWeek]
              ? playoffLabels[selectedWeek]
              : `Week ${selectedWeek}`}
          </h2>

          {orderedMatches.length > 0 ? (
            <MatchList
              matches={orderedMatches}
              championshipId={championshipMatchId}
              thirdPlaceId={thirdPlaceMatchId}
            />
          ) : playoffWeeks.includes(selectedWeek) ? (
            <p>
              Playoffs: Matchups to be decided later.
            </p>
          ) : (
            <p>No matches scheduled for Week {selectedWeek}.</p>
          )}
        </div>

        <div>
          <button style={buttonStyle}
            onClick={() => navigate(`/schedule/${allWeeks[currentIndex - 1]}`)}
            disabled={currentIndex === 0}
          >
            ← Previous Week
          </button>
          <button style={buttonStyle}
            onClick={() => navigate(`/schedule/${allWeeks[currentIndex + 1]}`)}
            disabled={currentIndex === allWeeks.length - 1}
          >
            Next Week →
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}