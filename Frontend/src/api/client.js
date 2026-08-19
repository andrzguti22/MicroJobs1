export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * El token de sesión se puede guardar en localStorage (persiste aunque
 * cierres el navegador -- "Recordarme") o en sessionStorage (se borra al
 * cerrar la pestaña/navegador). Estos helpers buscan en ambos lugares,
 * sin importar cuál se haya usado al iniciar sesión.
 */
export function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function getStoredUser() {
  const raw =
    localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");

  return raw ? JSON.parse(raw) : null;
}

/**
 * Wrapper sobre fetch() que:
 * - Adjunta automáticamente el token JWT (si existe) en el header Authorization
 * - Si el backend responde 401 (token inválido o expirado), limpia la sesión
 *   y redirige al login.
 *
 * Se usa exactamente igual que fetch(url, options).
 */
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
