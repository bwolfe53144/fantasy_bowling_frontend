import React, { createContext, useState, useEffect } from "react";
import { getUser, getTeams, getPlayers, getWeeks } from "./api";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [weekScores, setWeekScores] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingWeekScores, setLoadingWeekScores] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
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
  };

  const fetchTeams = async () => {
    try {
      const res = await getTeams();
      setTeams(res.data);
    } catch (error) {
      console.error("Error fetching teams", error);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await getPlayers();
      setPlayers(res.data);
    } catch (error) {
      console.error("Error fetching players", error);
      setPlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const fetchWeekScores = async () => {
    try {
      const res = await getWeeks();
      setWeekScores(res.data);
    } catch (error) {
      console.error("Error fetching week scores", error);
      setWeekScores([]);
    } finally {
      setLoadingWeekScores(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchTeams();
    fetchPlayers();
    fetchWeekScores();
  }, []);

  const loading = loadingUser || loadingTeams || loadingPlayers || loadingWeekScores;

  const login = (token) => {
    localStorage.setItem("token", token);
    setLoadingUser(true);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, teams, players, loading, weekScores, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;