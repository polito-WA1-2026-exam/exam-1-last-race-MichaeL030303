import { createContext, useEffect, useState } from "react";
import { getSession, logIn, logOut } from "../utils/api.js";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const s = await getSession();
      setUser(s ?? null);
    } finally {
      setLoading(false);
    }
  })();
}, []);

  const login = async (credentials) => {
    const u = await logIn(credentials);
    setUser(u);
    return u;
  };

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