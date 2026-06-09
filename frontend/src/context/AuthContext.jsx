//frontend\src\context\AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("kws_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("kws_username"));
  const [loading, setLoading] = useState(true);

  // On first load, if we have a saved token, confirm it's still valid.
  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await client.get("/auth/me");
        setUsername(res.data.username);
        localStorage.setItem("kws_username", res.data.username);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    }
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearAuth() {
    setToken(null);
    setUsername(null);
    localStorage.removeItem("kws_token");
    localStorage.removeItem("kws_username");
  }

  async function login(usernameInput, password) {
    const res = await client.post("/auth/login", {
      username: usernameInput,
      password,
    });
    const { access_token, username: name } = res.data;
    localStorage.setItem("kws_token", access_token);
    localStorage.setItem("kws_username", name);
    setToken(access_token);
    setUsername(name);
    return res.data;
  }

  function logout() {
    clearAuth();
  }

  const value = {
    token,
    username,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
