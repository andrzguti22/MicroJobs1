import { createContext, useEffect, useState } from "react";
import { apiFetch, API_URL, getToken, getStoredUser } from "../api/client";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());

  const [token, setToken] = useState(getToken());

  // 🔄 REFRESCAR USUARIO

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const refreshUser = async () => {
      try {
        const response = await apiFetch(`${API_URL}/auth/me`);

        if (!response.ok || cancelled) return;

        const freshUser = await response.json();

        if (cancelled) return;

        if (localStorage.getItem("token")) {
          localStorage.setItem("currentUser", JSON.stringify(freshUser));
        } else if (sessionStorage.getItem("token")) {
          sessionStorage.setItem("currentUser", JSON.stringify(freshUser));
        }

        setUser(freshUser);
      } catch (error) {
        console.error(error);
      }
    };

    refreshUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // 🔐 LOGIN

  const loginUser = async (email, password, remember = true) => {
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

      const storage = remember ? localStorage : sessionStorage;
      const otherStorage = remember ? sessionStorage : localStorage;

      storage.setItem("currentUser", JSON.stringify(data.user));
      storage.setItem("token", data.access_token);

      otherStorage.removeItem("currentUser");
      otherStorage.removeItem("token");

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

    // Actualiza el mismo storage que ya se esté usando para esta sesión.
    if (localStorage.getItem("token")) {
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem("token")) {
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }

    setUser(updatedUser);
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("token");
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
