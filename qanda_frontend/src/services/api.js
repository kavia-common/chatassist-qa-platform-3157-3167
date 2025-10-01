//
// API service for qanda_backend integration
//

const BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== "undefined" && window.location
    ? `${window.location.origin.replace(":3000", ":8000")}`
    : "http://localhost:8000");

/**
 * Helper to wrap fetch with JSON handling and error normalization.
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}/api${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const resp = await fetch(url, { ...options, headers, credentials: "include" });
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
