export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function getStoredUser() {
  const raw =
    localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");

  return raw ? JSON.parse(raw) : null;
}


export async function apiFetch(url, options = {}) {
  const token = getToken();

  const headers = { ...(options.headers || {}) };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("currentUser");

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return response;
}
