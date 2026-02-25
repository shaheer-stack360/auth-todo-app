import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem("username"));

  function saveSession(username, access, refresh) {
    localStorage.setItem("username", username);
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setUser(username);
  }

  function clearSession() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, saveSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
