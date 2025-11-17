import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext.jsx";
import { getMatchById, getTeamSnapshot } from "../utils/api.js";
import { getThemeColors } from "../utils/themeColors.js";
import { ThemeContext } from "../utils/ThemeContext.jsx";
import {
  starterOrder,
  mapStarters,
  getPoints,
  fetchTeamRoster,
} from "../utils/matchupHelpers.js";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import MatchupHeader from "../../components/MatchupHeader.jsx";
import "../styles/MatchupPage.css";

export default function MatchupPage() {
  const { id } = useParams();
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [match, setMatch] = useState(null);
  const [team1Roster, setTeam1Roster] = useState([]);
  const [team2Roster, setTeam2Roster] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { backgroundColor, color } = getThemeColors(user?.color, isDarkMode);
  const tableHeaderStyle = { backgroundColor, color };
  const [team1Snapshot, setTeam1Snapshot] = useState(null);
  const [team2Snapshot, setTeam2Snapshot] = useState(null);
  const [showSnapshots, setShowSnapshots] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    if (loading) return;

    const fetchData = async () => {
      try {
        const matchRes = await getMatchById(id);
        const matchData = matchRes.data;
        setMatch(matchData);

        const [team1RosterData, team2RosterData] = await Promise.all([
          fetchTeamRoster(matchData.team1.id, matchData.team1.name, matchData.week),
          fetchTeamRoster(matchData.team2.id, matchData.team2.name, matchData.week),
        ]);

        setTeam1Roster(team1RosterData);
        setTeam2Roster(team2RosterData);
      } catch (err) {
        console.error("Error loading matchup and teams:", err);
      }
    };

    fetchData();
  }, [id, loading]);

  const team1Map = mapStarters(team1Roster);
  const team2Map = mapStarters(team2Roster);

  const handleViewSnapshots = async () => {
    if (!match) return;
    try {
      const [snap1Res, snap2Res] = await Promise.all([
        getTeamSnapshot(match.team1.id, match.week),
        getTeamSnapshot(match.team2.id, match.week),
      ]);
      setTeam1Snapshot(snap1Res.data);
      setTeam2Snapshot(snap2Res.data);
      setShowSnapshots((prev) => !prev); // toggle on/off
    } catch (err) {
      console.error("Error fetching snapshots:", err);
      alert("Unable to load snapshots.");
    }
  };

  const displayPos = (pos) => {
    if (!pos) return "";
    // Capitalize first letter, keep rest lowercase
    return pos.charAt(0).toUpperCase() + pos.slice(1).toLowerCase();
  };

  if (loading || !match) return <LoadingScreen />;

  return (
    <div className="pageContainer matchupPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <h1>
          {match.matchType
            ? match.matchType === "First Round Playoff"
              ? "1st Round Playoff"
              : match.matchType === "Championship"
              ? "🏆 Championship"
              : match.matchType === "Third Place"
              ? "Third Place Game"
              : match.matchType
            : `Week ${match.week} Matchup`}
        </h1>

        <div className="scrollWrapper">
          <MatchupHeader team1={match.team1} team2={match.team2} />

          <div style={{ marginBottom: "1rem" }}>
            <button onClick={handleViewSnapshots} className="snapshotBtn">
              {showSnapshots ? "Hide Snapshots" : "View Snapshot Lineups"}
            </button>
          </div>

          <table className="bowlerTable">
            <thead style={tableHeaderStyle}>
              <tr>
                {showSnapshots && <th>Snapshot</th>}
                <th>Bowler</th>
                <th>Pts</th>
                <th>Pos</th>
                <th>Pts</th>
                <th>Bowler</th>
                {showSnapshots && <th>Snapshot</th>}
              </tr>
            </thead>
            <tbody>
              {/* Starters */}
              {starterOrder.map((pos) => {
                const t1Player = team1Map[pos];
                const t2Player = team2Map[pos];
                const t1Snap = showSnapshots ? team1Snapshot?.snapshot?.[pos] || "" : "";
                const t2Snap = showSnapshots ? team2Snapshot?.snapshot?.[pos] || "" : "";

                return (
                  <tr key={pos} className="text-center">
                    {showSnapshots && <td>{t1Snap}</td>}
                    <td>
                      {t1Player ? (
                        <Link to={`/player/${t1Player.name}`}>
                          {t1Player.name} ({t1Player.position})
                        </Link>
                      ) : "-"}
                    </td>
                    <td>{getPoints(t1Player, match.week) ?? "-"}</td>
                    <td>{displayPos(pos)}</td>
                    <td>{getPoints(t2Player, match.week) ?? "-"}</td>
                    <td>
                      {t2Player ? (
                        <Link to={`/player/${t2Player.name}`}>
                          {t2Player.name} ({t2Player.position})
                        </Link>
                      ) : "-"}
                    </td>
                    {showSnapshots && <td>{t2Snap}</td>}
                  </tr>
                );
              })}

              {/* Total Row */}
              {(() => {
                const team1Total = starterOrder.reduce(
                  (sum, pos) => sum + (getPoints(team1Map[pos], match.week) || 0),
                  0
                );
                const team2Total = starterOrder.reduce(
                  (sum, pos) => sum + (getPoints(team2Map[pos], match.week) || 0),
                  0
                );

                const isCompleted = !!match.completed;
                const team1Class = isCompleted && team1Total > team2Total ? "winner" : "bold";
                const team2Class = isCompleted && team2Total > team1Total ? "winner" : "bold";

                return (
                  <tr className="boldRow">
                    {showSnapshots && <td></td>}
                    <td></td>
                    <td className={team1Class}>{team1Total}</td>
                    <td>Total</td>
                    <td className={team2Class}>{team2Total}</td>
                    <td></td>
                    {showSnapshots && <td></td>}
                  </tr>
                );
              })()}

              {/* Bench Label */}
              <tr className="boldRow">
                {showSnapshots && <td></td>}
                <td>Bench</td>
                <td></td>
                <td></td>
                <td></td>
                <td>Bench</td>
                {showSnapshots && <td></td>}
              </tr>

              {/* Flex Bench Rows */}
              {(() => {
                const getFlexBenchPlayers = (roster) =>
                  roster
                    .filter((entry) =>
                      (entry.position || "").toLowerCase().startsWith("flex bench")
                    )
                    .sort((a, b) => {
                      const aNum = parseInt(a.position?.match(/\d+/)?.[0] || 0, 10);
                      const bNum = parseInt(b.position?.match(/\d+/)?.[0] || 0, 10);
                      return aNum - bNum;
                    });

                const flexTeam1 = getFlexBenchPlayers(team1Roster);
                const flexTeam2 = getFlexBenchPlayers(team2Roster);
                const maxBenchCount = Math.max(flexTeam1.length, flexTeam2.length);

                return Array.from({ length: maxBenchCount }).map((_, i) => {
                  const t1 = flexTeam1[i];
                  const t2 = flexTeam2[i];
                  const t1Snap = showSnapshots ? team1Snapshot?.snapshot?.[t1?.position] || "" : "";
                  const t2Snap = showSnapshots ? team2Snapshot?.snapshot?.[t2?.position] || "" : "";

                  const posDisplay = displayPos(t1?.position || t2?.position);

                  return (
                    <tr key={`flexbench-${i}`} className="text-center">
                      {showSnapshots && <td>{t1Snap}</td>}
                      <td>
                        {t1?.player ? (
                          <Link to={`/player/${t1.player.name}`}>
                            {t1.player.name} ({t1.player.position})
                          </Link>
                        ) : "-"}
                      </td>
                      <td>{t1?.player ? getPoints(t1.player, match.week) : "-"}</td>
                      <td>{posDisplay}</td>
                      <td>{t2?.player ? getPoints(t2.player, match.week) : "-"}</td>
                      <td>
                        {t2?.player ? (
                          <Link to={`/player/${t2.player.name}`}>
                            {t2.player.name} ({t2.player.position})
                          </Link>
                        ) : "-"}
                      </td>
                      {showSnapshots && <td>{t2Snap}</td>}
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
