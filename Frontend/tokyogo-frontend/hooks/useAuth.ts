import { useState, useCallback } from "react";
import { clearAuthStorage, revokeRefreshToken } from "../services/authFetch";

export interface UserProfile {
  id: string;
  membership: string;
  name: string;
  phoneNumber: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => readStoredUser());
  const [isReady] = useState(true);

  const loadUser = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  async function logout() {
    if (typeof window === "undefined") return;
    await revokeRefreshToken().catch(() => clearAuthStorage());
    setUser(null);
    window.location.href = "/login";
  }

  return { user, isReady, logout, reloadUser: loadUser };
}

function readStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem("user");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}
