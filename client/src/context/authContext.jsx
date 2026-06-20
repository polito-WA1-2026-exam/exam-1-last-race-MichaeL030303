import { createContext, useState, useEffect } from "react";
import { getSession, logOut } from "../utils/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // loading state

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const u = await getSession();
        setUser(u);
      } catch {
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const login = (user) => setUser(user);

  const logout = async () => {
    await logOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      isLoggedIn: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}