import { createContext, useEffect, useState } from "react";
import { apiFetch, API_URL } from "../api/client";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null,
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || null,
  );

  // 🔄 REFRESCAR USUARIO
  // Al cargar la app (o tras un redeploy que recarga la página), los
  // datos del usuario guardados en localStorage pueden estar
  // desactualizados (ej. email_verified sigue en false aunque ya se
  // verificó desde otra pestaña/dispositivo). Pedimos el estado real
  // al backend en cuanto haya un token disponible.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const refreshUser = async () => {
      try {
        const response = await apiFetch(`${API_URL}/auth/me`);

        if (!response.ok || cancelled) return;

        const freshUser = await response.json();

        if (cancelled) return;

        localStorage.setItem("currentUser", JSON.stringify(freshUser));
        setUser(freshUser);
      } catch (error) {
        // Si falla (ej. sin conexión momentánea), seguimos usando lo
        // que ya había en localStorage; no rompemos la sesión por esto.
        console.error(error);
      }
    };

    refreshUser();

    return () => {
      cancelled = true;
    };
    // Solo queremos que corra cuando cambia el token (login/logout),
    // no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 🔐 LOGIN
  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return false;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("token", data.access_token);

      setUser(data.user);
      setToken(data.access_token);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // 🔐 GUARDAR SESIÓN (login o registro)
  const loginWithToken = (userData, accessToken) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);

    setUser(userData);
    setToken(accessToken);
  };

  // 💾 GUARDAR PERFIL
  const saveUser = (data) => {
    const updatedUser = { ...user, ...data };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <UserContext.Provider
      value={{ user, token, loginUser, loginWithToken, saveUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}