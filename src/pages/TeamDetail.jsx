import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { PlayerTable } from "../../components/PlayerTable.jsx";
import { TeamInfo } from "../../components/TeamInfo.jsx";
import { MatchupTable } from "../../components/MatchupTable.jsx";
import { getTotalLeagues, getTeamByName, getCurrentWeek, getRecentMatches } from "../utils/api.js";
import { processPlayerStats } from "../utils/ProcessPlayerStats.js";
import { enrichRecentMatchesWithScores } from "../utils/enrichMatches.js";
import { fetchCompletedWeeks } from "../utils/weekHelpers.js";
import "../styles/TeamDetail.css";

const TeamDetail = () => {
  const { teamName } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("average");
  const [sortOrder, setSortOrder] = useState("desc");
  const [recentMatches, setRecentMatches] = useState([]);
  const [enrichedMatches, setEnrichedMatches] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [totalLeagues, setTotalLeagues] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    const init = async () => {
      const weeks = await fetchCompletedWeeks();
      setCompletedWeeks(weeks);
    };
    init();
  }, []);

  useEffect(() => {
    const fetchTotalLeagues = async () => {
      try {
        const res = await getTotalLeagues();
        setTotalLeagues(res.data.totalLeagues.length);
      } catch (err) {
        console.error("Failed to fetch total leagues:", err);
      }
    };
    fetchTotalLeagues();
  }, []);

  useEffect(() => {
    getTeamByName(teamName)
      .then(response => {
        setTeam(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching team:", error);
        setLoading(false);
      });
  }, [teamName]);

  useEffect(() => {
    const fetchCurrentWeek = async () => {
      try {
        const res = await getCurrentWeek();
        setCurrentWeek(res.data.currentWeek);
      } catch (err) {
        console.error("Error fetching current week:", err);
      }
    };

    const fetchRecentMatches = async () => {
      try {
        const res = await getRecentMatches(teamName, currentWeek);
        setRecentMatches(res.data);
      } catch (err) {
        console.error("Error fetching recent matches:", err);
      }
    };

    fetchCurrentWeek();
    fetchRecentMatches();
  }, [teamName, currentWeek]);

  useEffect(() => {
    if (recentMatches.length > 0) {
      enrichRecentMatchesWithScores(recentMatches).then(setEnrichedMatches);
    }
  }, [recentMatches, completedWeeks]);

  const sortedPlayers = useMemo(() => {
    const rawPlayers = team?.players ?? [];
    const processed = rawPlayers.map((p) => processPlayerStats(p));
    return [...processed].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [team?.players, sortField, sortOrder]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (loading || !team) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer teamDetailPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <div className="mainGrid">
          <div className="teamInfoWrapper">
            <TeamInfo team={team} />
          </div>

          <div className="bottomHalf">
            {sortedPlayers.length > 0 && (
              <PlayerTable
                players={sortedPlayers}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            )}
          </div>

          <div className="matchupTableWrapper">
            {enrichedMatches.length > 0 && (
              <MatchupTable
                matches={enrichedMatches}
                teamName={teamName}
                completedWeeks={completedWeeks}
                currentWeek={currentWeek}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeamDetail;