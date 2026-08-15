import { createContext, useState } from "react";
import { API_URL } from "../api/client";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null,
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || null,
  );

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
