import { AUTH_API_BASE_URL } from "./config";

/**
 * Admin auth is separate from customer auth on purpose:
 * POST /tokyo/group/ad-min/login returns only an accessToken
 * (no refresh token), so expiry means re-login.
 */

const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_EMAIL_KEY = "adminEmail";

export class AdminAuthRequiredError extends Error {
  constructor() {
    super("ADMIN_AUTH_REQUIRED");
    this.name = "AdminAuthRequiredError";
  }
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_EMAIL_KEY);
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

export function clearAdminAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_EMAIL_KEY);
}

export async function adminLogin(email: string, password: string): Promise<void> {
  const response = await fetch(`${AUTH_API_BASE_URL}/tokyo/group/ad-min/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorMsg = "Login failed";
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  const data = (await response.json()) as { accessToken?: string };
  if (!data.accessToken) {
    throw new Error("Login failed: no access token returned");
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, data.accessToken);
  localStorage.setItem(ADMIN_EMAIL_KEY, email);
}

/**
 * Fetch wrapper for admin-protected endpoints. Attaches the admin Bearer
 * token; on 401/403 clears the session and throws AdminAuthRequiredError
 * so callers can redirect to /admin/login.
 * Content-Type is only defaulted for non-FormData bodies (multipart
 * requests must let the browser set the boundary).
 */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();

  if (!token) {
    throw new AdminAuthRequiredError();
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type") && init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401 || response.status === 403) {
    clearAdminAuth();
    throw new AdminAuthRequiredError();
  }

  return response;
}

export async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    if (data.message) return data.message;
  } catch {
    // Ignored
  }
  return fallback;
}
