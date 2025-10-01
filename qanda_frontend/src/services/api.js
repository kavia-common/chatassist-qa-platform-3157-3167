/**
 * API service for qanda_backend integration
 *
 * All requests are routed to the Django backend using the REACT_APP_BASE_URL
 * environment variable. This avoids accidentally posting to the frontend dev
 * server (e.g., http://localhost:3000) which would result in "Cannot POST /api/..."
 * HTML responses. Ensure REACT_APP_BASE_URL is set to the backend root URL
 * (e.g., http://localhost:8000 or the deployed backend origin).
 */
const BASE_URL = process.env.REACT_APP_BASE_URL;

/**
 * Helper to wrap fetch with JSON handling and error normalization.
 * Ensures we only ever call the backend host provided via env.
 */
async function request(path, options = {}) {
  if (!BASE_URL) {
    // Provide a clear error to guide configuration
    throw new Error(
      "Missing REACT_APP_BASE_URL env var. Set it to your Django backend URL (e.g., http://localhost:8000)."
    );
  }
  const normalizedBase = BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${normalizedBase}/api${normalizedPath}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const resp = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const ct = resp.headers.get("content-type") || "";
  let payload = null;
  if (ct.includes("application/json")) {
    payload = await resp.json().catch(() => null);
  } else {
    payload = await resp.text().catch(() => null);
  }

  if (!resp.ok) {
    const message =
      (payload && payload.detail) ||
      (payload && payload.error) ||
      (typeof payload === "string" ? payload : "Request failed");
    throw new Error(message);
  }
  return payload;
}

// PUBLIC_INTERFACE
export async function apiHealth() {
  /** Ping backend health check (for connectivity checks). */
  return request("/health/", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function apiSendMessage({ chat_id = null, message }) {
  /** Send a user question to the backend; returns answer and metadata. */
  return request("/chat/send/", {
    method: "POST",
    body: JSON.stringify({ chat_id, message }),
  });
}

// PUBLIC_INTERFACE
export async function apiGetHistory() {
  /** Fetch chat history list for sidebar display. */
  return request("/chat/history/", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function apiAuthStatus() {
  /** Get current auth status and user info from backend (if supported). */
  return request("/auth/status/", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function apiLogin({ username, password }) {
  /** Perform login; backend is expected to set session cookie. */
  return request("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// PUBLIC_INTERFACE
export async function apiLogout() {
  /** Logout current user. */
  return request("/auth/logout/", { method: "POST" });
}
