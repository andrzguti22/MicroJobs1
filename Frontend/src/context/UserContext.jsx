import { createContext, useState } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null,
  );

  // 🔐 LOGIN
  const loginUser = async (email, password) => {
    try {
      const response = await fetch("http://localhost:8000/auth/login", {
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

      setUser(data.user);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
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
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loginUser, saveUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}
