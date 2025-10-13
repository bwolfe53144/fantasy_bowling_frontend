import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../src/utils/AuthContext";

export default function useRefreshOnRouteChange() {
  const location = useLocation();
  const { lastStatsUpdate, clearStatsUpdate, loadPlayers, refreshWeekScores } =
    useContext(AuthContext);

  useEffect(() => {
    if (lastStatsUpdate) {
      loadPlayers();
      refreshWeekScores();
      clearStatsUpdate();
    }
  }, [location.pathname]);
}