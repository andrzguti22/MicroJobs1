export const API_URL = "http://localhost:8000";

/**
 * Wrapper sobre fetch() que:
 * - Adjunta automáticamente el token JWT (si existe) en el header Authorization
 * - Si el backend responde 401 (token inválido o expirado), limpia la sesión
 *   y redirige al login.
 *
 * Se usa exactamente igual que fetch(url, options).
 */
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = { ...(options.headers || {}) };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return response;
}
