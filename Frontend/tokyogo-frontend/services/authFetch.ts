import { AUTH_API_BASE_URL } from "./config";

export class AuthRequiredError extends Error {
  constructor() {
    super("AUTH_REQUIRED");
    this.name = "AuthRequiredError";
  }
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

let refreshPromise: Promise<string> | null = null;

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
}

function saveTokens(tokens: TokenResponse) {
  localStorage.setItem("token", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthStorage();
    throw new AuthRequiredError();
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${AUTH_API_BASE_URL}/tokyo/api-auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          clearAuthStorage();
          throw new AuthRequiredError();
        }

        const tokens = (await response.json()) as TokenResponse;

        if (!tokens.accessToken || !tokens.refreshToken) {
          clearAuthStorage();
          throw new AuthRequiredError();
        }

        saveTokens(tokens);
        return tokens.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function buildHeaders(headers?: HeadersInit, token?: string): Headers {
  const finalHeaders = new Headers(headers);

  if (!finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  return finalHeaders;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();

  if (!token) {
    throw new AuthRequiredError();
  }

  const firstResponse = await fetch(input, {
    ...init,
    headers: buildHeaders(init.headers, token),
  });

  if (firstResponse.status !== 401 && firstResponse.status !== 403) {
    return firstResponse;
  }

  const newToken = await refreshAccessToken();

  return fetch(input, {
    ...init,
    headers: buildHeaders(init.headers, newToken),
  });
}

export async function refreshIfPossible(): Promise<boolean> {
  if (!getAccessToken() || !getRefreshToken()) return false;

  try {
    await refreshAccessToken();
    return true;
  } catch {
    return false;
  }
}

export async function revokeRefreshToken(): Promise<void> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) return;

  try {
    await fetch(`${AUTH_API_BASE_URL}/tokyo/api-auth/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } finally {
    clearAuthStorage();
  }
}
