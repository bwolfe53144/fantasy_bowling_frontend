import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentWeek, getTeamsForHome } from "../utils/api";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import '../index.css';
import '../styles/Home.css';

export default function Home() {
  const { user, loading } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [updatedTeams, setUpdatedTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [weeksLeft, setWeeksLeft] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { buttonBackground, buttonColor } = getThemeColors(user?.color);
  
  const tableHeaderStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weekRes, teamsRes] = await Promise.all([
          getCurrentWeek(),
          getTeamsForHome()
        ]);
  
        const { totalWeeks, currentWeek, completedWeeks } = weekRes.data;
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
    const playoffTeams = teams.filter((t) => t.playoffSeed !== null && t.playoffSeed !== undefined);

    let updated;
    if (playoffTeams.length === 3) {
      const sortedByPlayoff = [...playoffTeams].sort((a, b) => a.playoffSeed - b.playoffSeed);
      const remaining = teams.filter((t) => t.playoffSeed == null).sort((a, b) => b.wins - a.wins);
  
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

      const sortedTeams = [...teams].sort((a, b) => teamScore(b) - teamScore(a));
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

  const anyClinched = updatedTeams.some(team => team.clinched);

  if (loading) {
    return  <LoadingScreen />
  }

  return (
    <div className="pageContainer homepage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage homepage">
        <h1 className="mainTitle">Fantasy Bowling League</h1>
        <div className="standingsContainer">
          <div className="standingsInner">
            <div className="standingsHeader">
              <h2 className="standingsTitle">Standings</h2>
            </div>
            <table>
              <caption className="visually-hidden">Fantasy Bowling League Standings</caption>
              <thead style={tableHeaderStyle}>
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
                    <td>
                      <Link to={`/team/${team.name}`} className="teamLink">
                        {team.trophy ? team.trophy : team.clinched}{team.name}
                      </Link>
                    </td>
                    <td>{team.record}</td>
                    <td>{team.pointsFor}</td>
                    <td>{team.pointsAgainst}</td>
                    <td>{team.streak}</td>
                    <td>{team.captain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {anyClinched && (
              <div className="clinchLegend">
                <p><strong>*</strong> Clinched Playoffs</p>
                <p><strong>**</strong> Clinched Bye</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}