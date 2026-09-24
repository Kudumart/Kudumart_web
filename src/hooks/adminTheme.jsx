import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AdminThemeContext = createContext(null);

export function AdminThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("kudu-admin-theme") === "dark" || localStorage.getItem("kudu-referral-theme") === "dark");
  useEffect(() => {
    localStorage.setItem("kudu-admin-theme", darkMode ? "dark" : "light");
    localStorage.setItem("kudu-referral-theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("kudu-admin-dark", darkMode);
    return () => document.documentElement.classList.remove("kudu-admin-dark");
  }, [darkMode]);
  const value = useMemo(() => ({ darkMode, toggleTheme: () => setDarkMode((current) => !current) }), [darkMode]);
  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme() {
  const theme = useContext(AdminThemeContext);
  if (!theme) throw new Error("useAdminTheme must be used inside AdminThemeProvider");
  return theme;
}
