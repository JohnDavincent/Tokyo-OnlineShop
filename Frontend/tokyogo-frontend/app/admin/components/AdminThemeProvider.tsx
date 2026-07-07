"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AdminTheme = "light" | "dark";

const THEME_STORAGE_KEY = "tokyogo-admin-theme";

const AdminThemeContext = createContext<{
  theme: AdminTheme;
  toggleTheme: () => void;
}>({ theme: "light", toggleTheme: () => {} });

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

export default function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark") setTheme("dark");
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`admin-shell font-body min-h-screen ${theme === "dark" ? "dark" : ""}`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}
