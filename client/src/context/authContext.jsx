import { createContext, useEffect, useState } from "react";
import { getSession, login as apiLogin, logOut } from "../utils/api.js";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =======================
     LOAD SESSION ON START
  ======================= */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sessionUser = await getSession();
        setUser(sessionUser);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* =======================
     LOGIN
  ======================= */
  const login = async (credentials) => {
    await apiLogin(credentials);

    // IMPORTANT: refresh session after login
    const sessionUser = await getSession();
    setUser(sessionUser);

    return sessionUser;
  };

  /* =======================
     LOGOUT
  ======================= */
  const logout = async () => {
    await logOut();
    setUser(null);
  };

  useEffect(() => {
    console.log("AUTH STATE:", { user, loading });
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}