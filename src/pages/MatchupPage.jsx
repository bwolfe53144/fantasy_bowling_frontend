import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext.jsx";
import { getMatchById } from "../utils/api.js";
import { getThemeColors } from "../utils/themeColors.js";
import {starterOrder, mapStarters, getPoints, fetchTeamRoster,} from "../utils/matchupHelpers.js";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import MatchupHeader from "../../components/MatchupHeader.jsx";
import '../styles/MatchupPage.css';

export default function MatchupPage() {
  const { id } = useParams();
  const { user, loading } = useContext(AuthContext);
  const [match, setMatch] = useState(null);
  const [team1Roster, setTeam1Roster] = useState([]);
  const [team2Roster, setTeam2Roster] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { backgroundColor, color } = getThemeColors(user?.color);
  const tableHeaderStyle = { backgroundColor, color };

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

  if (loading || !match) return <LoadingScreen />;

  return (
    <div className="pageContainer matchupPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <div>
        <h1>
          {match.matchType
            ? match.matchType === "First Round Playoff"
              ? "1st Round Playoff"
              : match.matchType === "Championship"
                ? "🏆 Championship"
              : match.matchType === "Third Place"
                ? "Third Place Game"
                : match.matchType // Displays "Championship" or "3rd Place Game" as is
            : `Week ${match.week} Matchup`}
        </h1>
          <div className="scrollWrapper">
            <MatchupHeader team1={match.team1} team2={match.team2} />
            <table className="bowlerTable">
              <thead style={tableHeaderStyle}>
                <tr>
                  <th>Bowler</th>
                  <th>Pts</th>
                  <th>Pos</th>
                  <th>Pts</th>
                  <th>Bowler</th>
                </tr>
              </thead>
              <tbody>
                {starterOrder.map(pos => (
                  <tr key={pos} className="text-center">
                    <td>{team1Map[pos]?.name || "-"}</td>
                    <td>{getPoints(team1Map[pos], match.week) ?? "-"}</td>
                    <td>{pos}</td>
                    <td>{getPoints(team2Map[pos], match.week) ?? "-"}</td>
                    <td>{team2Map[pos]?.name || "-"}</td>
                  </tr>
                ))}

                {/* Total Row */}
                {(() => {
                  const team1Total = starterOrder.reduce(
                    (sum, pos) => sum + (getPoints(team1Map[pos], match.week) || 0), 0);
                  const team2Total = starterOrder.reduce(
                    (sum, pos) => sum + (getPoints(team2Map[pos], match.week) || 0), 0);

                  const isCompleted = !!match.completed;
                  const team1Class = isCompleted && team1Total > team2Total ? "winner" : "bold";
                  const team2Class = isCompleted && team2Total > team1Total ? "winner" : "bold";

                  return (
                    <tr className="boldRow">
                      <td></td>
                      <td className={team1Class}>{team1Total}</td>
                      <td>Total</td>
                      <td className={team2Class}>{team2Total}</td>
                      <td></td>
                    </tr>
                  );
                })()}

                {/* Bench Label */}
                <tr className="boldRow">
                  <td>Bench</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>Bench</td>
                </tr>

                {/* Flex Bench Rows */}
                {(() => {
                  const getFlexBenchPlayers = (roster) => {
                    return roster
                      .filter(entry => {
                        const pos = (entry.position || entry.player?.position || "").toLowerCase();
                        return pos.startsWith("flex bench");
                      })
                      .map(entry => {
                        const player = entry.player || entry;
                        const posStr = (entry.position || player.position).toLowerCase();
                        const match = posStr.match(/flex bench (\d+)/);
                        const benchNum = match ? parseInt(match[1], 10) : Infinity;
                        return { player, pos: posStr, benchNum };
                      })
                      .sort((a, b) => a.benchNum - b.benchNum);
                  };

                  const flexTeam1 = getFlexBenchPlayers(team1Roster);
                  const flexTeam2 = getFlexBenchPlayers(team2Roster);
                  const maxBenchCount = Math.max(flexTeam1.length, flexTeam2.length);

                  const rows = [];
                  for (let i = 0; i < maxBenchCount; i++) {
                    const team1Player = flexTeam1[i];
                    const team2Player = flexTeam2[i];

                    const posLabel = team1Player?.pos || team2Player?.pos || "";
                    const posDisplay = posLabel
                      .split(" ")
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ");

                    rows.push(
                      <tr key={`flexbench-row-${i}`} className="text-center">
                        <td>
                          {team1Player
                            ? `${team1Player.player.name} (${team1Player.player.position})`
                            : "-"}
                        </td>
                        <td>{team1Player ? getPoints(team1Player.player, match.week) : "-"}</td>
                        <td>{posDisplay}</td>
                        <td>{team2Player ? getPoints(team2Player.player, match.week) : "-"}</td>
                        <td>
                          {team2Player
                            ? `${team2Player.player.name} (${team2Player.player.position})`
                            : "-"}
                        </td>
                      </tr>
                    );
                  }
                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}