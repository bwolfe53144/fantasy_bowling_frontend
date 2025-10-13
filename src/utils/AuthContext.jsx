import React, { createContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { getUser, getTeams, getPlayers, getWeeks } from "./api";

export const AuthContext = createContext();

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [weekScores, setWeekScores] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingWeekScores, setLoadingWeekScores] = useState(true);
  const [lastStatsUpdate, setLastStatsUpdate] = useState(null);

  const isAndroidApp = /fantasybowling\/android/i.test(navigator.userAgent);
  const storage = isAndroidApp ? localStorage : sessionStorage;

  // ------------------ FETCH FUNCTIONS ------------------
  const fetchUser = useCallback(async () => {
    const token = storage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const res = await getUser(token);
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user", error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, [storage]);

  const refreshUser = useCallback(async () => {
    setLoadingUser(true);
    await fetchUser();
    setLoadingUser(false);
  }, [fetchUser]);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await getTeams();
      setTeams(res.data);
    } catch (error) {
      console.error("Error fetching teams", error);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  const fetchPlayers = useCallback(async () => {
    setLoadingPlayers(true);
    try {
      const res = await getPlayers();
      setPlayers(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching players", error);
      setPlayers([]);
      return [];
    } finally {
      setLoadingPlayers(false);
    }
  }, []);

  const fetchWeekScores = useCallback(async () => {
    setLoadingWeekScores(true);
    try {
      const res = await getWeeks();
      setWeekScores(res.data);
    } catch (error) {
      console.error("Error fetching week scores", error);
      setWeekScores([]);
    } finally {
      setLoadingWeekScores(false);
    }
  }, []);

  // ------------------ INITIAL LOAD ------------------
  useEffect(() => {
    fetchUser();
    fetchTeams();
    fetchPlayers();
    fetchWeekScores();
  }, [fetchUser, fetchTeams, fetchPlayers, fetchWeekScores]);

  // ------------------ SOCKET LISTENER ------------------
  useEffect(() => {
    socket.on("statsUpdated", () => {
      console.log("📊 Stats updated — will refresh next route change or on demand");
      setLastStatsUpdate(Date.now());
    });

    return () => {
      socket.off("statsUpdated");
    };
  }, []);

  // ------------------ AUTH FUNCTIONS ------------------
  const login = (token) => {
    storage.setItem("token", token);
    setLoadingUser(true);
    fetchUser();
  };

  const logout = () => {
    storage.removeItem("token");
    setUser(null);
  };

  const loading =
    loadingUser || loadingTeams || loadingPlayers || loadingWeekScores;

  const clearStatsUpdate = () => setLastStatsUpdate(null);

  // ------------------ CONTEXT VALUE ------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        refreshUser,
        teams,
        players,
        loading,
        weekScores,
        login,
        logout,
        loadPlayers: fetchPlayers,
        refreshWeekScores: fetchWeekScores,
        lastStatsUpdate,
        clearStatsUpdate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;


