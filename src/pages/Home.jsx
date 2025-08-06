import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentWeek, getTeamsForHome } from "../utils/api";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { ThemeContext } from "../utils/ThemeContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import '../index.css';
import '../styles/Home.css';

export default function Home() {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [teams, setTeams] = useState([]);
  const [updatedTeams, setUpdatedTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [weeksLeft, setWeeksLeft] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { backgroundColor, color } = getThemeColors(user?.color, isDarkMode);

  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAndroidApp, setIsInAndroidApp] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weekRes, teamsRes] = await Promise.all([
          getCurrentWeek(),
          getTeamsForHome()
        ]);

        const { totalWeeks, completedWeeks } = weekRes.data;
        setWeeksLeft(totalWeeks - completedWeeks - 3);
        setTeams(teamsRes.data);
      } catch (error) {
        console.error("Error fetching week or team info:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setMyTeam(user?.team?.name || null);
    } else {
      setMyTeam(null);
    }
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    // Detect platform and app mode once on mount
    const ua = navigator.userAgent || "";

    setIsAndroid(/Android/i.test(ua));
    setIsInAndroidApp(/fantasybowling\/android/i.test(ua));  // Detect Android app WebView
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsSafari(/^((?!chrome|android).)*safari/i.test(ua));

    // Standalone mode detection for PWA and iOS
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standaloneMode);
  }, []);

  useEffect(() => {
    const playoffTeams = teams.filter(
      (t) => t.playoffSeed !== null && t.playoffSeed !== undefined
    );

    let updated;
    if (playoffTeams.length === 3) {
      const sortedByPlayoff = [...playoffTeams].sort(
        (a, b) => a.playoffSeed - b.playoffSeed
      );
      const remaining = teams
        .filter((t) => t.playoffSeed == null)
        .sort((a, b) => b.wins - a.wins);

      const sortedWithTrophies = sortedByPlayoff.map((team, index) => {
        let trophy = "";
        if (index === 0) trophy = "🏆";
        else if (index === 1) trophy = "🥈";
        else if (index === 2) trophy = "🥉";
        return { ...team, trophy };
      });

      updated = [...sortedWithTrophies, ...remaining];
    } else {
      const teamScore = (team) => team.wins + 0.5 * (team.ties ?? 0);

      const sortedTeams = [...teams].sort(
        (a, b) => teamScore(b) - teamScore(a)
      );
      const seventhTeamScore = teamScore(sortedTeams[6] ?? { wins: 0, ties: 0 });
      const thirdTeamScore = teamScore(sortedTeams[2] ?? { wins: 0, ties: 0 });

      updated = sortedTeams.map((team, index) => {
        let clinched = "";

        if (weeksLeft === 0) {
          if (index < 2) clinched = "**";
          else if (index < 6) clinched = "*";
        } else {
          const canBeCaughtBy7th = teamScore(team) <= seventhTeamScore + weeksLeft;
          const canBeCaughtBy3rd = teamScore(team) <= thirdTeamScore + weeksLeft;

          const clinchedPlayoffs = index < 6 && !canBeCaughtBy7th;
          const clinchedBye = index < 2 && !canBeCaughtBy3rd;

          clinched = clinchedBye ? "**" : clinchedPlayoffs ? "*" : "";
        }

        return {
          ...team,
          clinched,
        };
      });
    }

    setUpdatedTeams(updated);
  }, [teams, weeksLeft]);

  const anyClinched = updatedTeams.some((team) => team.clinched);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="pageContainer homepage"
      style={{
        "--table-bg": backgroundColor,
        "--table-color": color,
      }}
    >
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage homepage">
        <h1 className="mainTitle">Fantasy Bowling League</h1>

        {!user && !loading && (
          <div className="signUpButtonWrapper">
            <h2>Not a user already? What are you waiting for... sign up now!</h2>
            <Link to="/signup" className="signUpButton">
              Sign Up
            </Link>
          </div>
        )}

        <div className="standingsContainer">
          <div className="standingsHeader">
            <h2 className="standingsTitle">Standings</h2>
          </div>
          <div className="horizontalScrollArea">
            <table>
              <caption className="visually-hidden">
                Fantasy Bowling League Standings
              </caption>
              <thead>
                <tr>
                  <th scope="col">Place</th>
                  <th scope="col">Team</th>
                  <th scope="col">Record</th>
                  <th scope="col">Points For</th>
                  <th scope="col">Points Against</th>
                  <th scope="col">Streak</th>
                  <th scope="col">Owner</th>
                </tr>
              </thead>
              <tbody>
                {updatedTeams.map((team, index) => (
                  <tr key={index} className={myTeam === team.name ? "highlight" : ""}>
                    <td>{index + 1}</td>
                    <td className="teamLink">
                      <Link to={`/team/${team.name}`}>
                        {team.trophy ? team.trophy : team.clinched}
                        {team.name}
                      </Link>
                    </td>
                    <td>{team.record}</td>
                    <td>{team.pointsFor}</td>
                    <td>{team.pointsAgainst}</td>
                    <td>{team.streak}</td>
                    <td>
                      {team.owner ? (
                        <Link to={`/owner/${encodeURIComponent(`${team.owner.firstname} ${team.owner.lastname}`)}`}>
                          {team.owner.firstname} {team.owner.lastname}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>                 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {anyClinched && (
            <div className="clinchLegend">
              <p>
                <strong>*</strong> Clinched Playoffs
              </p>
              <p>
                <strong>**</strong> Clinched Bye
              </p>
            </div>
          )}
        </div>
        <div className="previousYearsLink" style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/previous-standings" className="prevYearButton">
            📅 View Previous Years
          </Link>
        </div>

        {/* Android App Download Button - only show on Android and NOT in standalone or inside app */}
        {!loading && isAndroid && !isStandalone && !isInAndroidApp && !user && (
          <div className="appDownloadWrapper">
            <p style={{ fontWeight: "bold", marginTop: "1rem" }}>
              On Android? Download the app:
            </p>
            <a
              href="/downloads/FantasyBowlingApp.apk"
              className="signUpButton"
              download
              style={{ marginTop: "0.5rem" }}
            >
              📱 Download Android App
            </a>
          </div>
        )}

        {/* iOS Add to Home Screen Prompt - only on iOS Safari and not logged in */}
        {!loading && isIOS && isSafari && !isStandalone && !user && (
          <div className="iosPromptBox">
            <p>
              <strong>On iPhone?</strong> Add this site to your home screen:
            </p>
            <ol>
              <li>
                Tap <span style={{ fontSize: "1.2rem" }}>Share <i className="fas fa-share-square" /></span>
              </li>
              <li>Then tap <strong>"Add to Home Screen"</strong></li>
            </ol>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}