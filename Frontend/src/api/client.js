export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


/**
 * FastAPI puede devolver el error de dos formas: un string simple
 * ({"detail": "mensaje"}) o, cuando falla la validación de datos (422),
 * una lista de objetos ({"detail": [{type, loc, msg, input}, ...]}).
 * Intentar mostrar esa lista directo como texto en JSX rompe React
 * ("Objects are not valid as a React child"), así que la convertimos
 * siempre a un string legible antes de mostrarla.
 */
export function getErrorMessage(data, fallback = "Ocurrió un error inesperado") {
  const detail = data?.detail;

  if (!detail) return fallback;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || JSON.stringify(item))
      .join(" | ");
  }

  return fallback;
}

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
