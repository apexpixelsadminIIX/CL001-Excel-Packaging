import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null); // null = checking, false = no, object = yes
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("excel_admin_token");
    if (!token) {
      setAdmin(false);
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => setAdmin(data))
      .catch(() => {
        localStorage.removeItem("excel_admin_token");
        setAdmin(false);
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("excel_admin_token", data.token);
    setAdmin(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("excel_admin_token");
    setAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ admin, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
