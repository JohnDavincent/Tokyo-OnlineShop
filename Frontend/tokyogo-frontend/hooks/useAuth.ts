import { useState, useEffect, useCallback } from "react";

export interface UserProfile {
  id: string;
  membership: string;
  name: string;
  phoneNumber: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  const loadUser = useCallback(() => {
    if (typeof window === "undefined") {
      setIsReady(true);
      return;
    }
    const raw = sessionStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  function logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }

  return { user, isReady, logout, reloadUser: loadUser };
}
