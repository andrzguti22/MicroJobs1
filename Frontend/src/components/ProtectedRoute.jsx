import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

// 🔒 Requiere estar logueado (token válido en el contexto)
export function ProtectedRoute({ children }) {
  const { user, token } = useContext(UserContext);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// 🛡️ Requiere estar logueado Y tener rol de administrador
export function AdminRoute({ children }) {
  const { user, token } = useContext(UserContext);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
