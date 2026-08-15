import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { API_URL } from "../api/client";

function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "No se pudo restablecer la contraseña");
      }

      setSuccess(true);

      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error(err);
      setError(err.message || "El enlace no es válido o ya expiró");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary min-h-screen flex flex-col dark:bg-slate-900">
      <Navbar />
      <PageWrapper>
        <div className="flex flex-1 items-center justify-center pt-36 px-4">
          <div className="bg-white p-8 rounded-xl shadow w-full max-w-[400px] dark:bg-slate-800">
            {success ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40} />

                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  ¡Contraseña actualizada!
                </h2>

                <p className="text-gray-500 dark:text-gray-300 text-sm">
                  Te estamos redirigiendo al inicio de sesión...
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  Crear nueva contraseña
                </h2>

                <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
                  Ingresa y confirma tu nueva contraseña.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nueva contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="p-3 pr-11 border rounded-lg w-full dark:bg-slate-700 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="p-3 pr-11 border rounded-lg w-full dark:bg-slate-700 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {error && <span className="text-red-500 text-sm">{error}</span>}

                  <button
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? "Guardando..." : "Restablecer contraseña"}
                  </button>

                  <Link
                    to="/login"
                    className="text-center text-sm text-gray-500 hover:underline dark:text-gray-300"
                  >
                    Volver a iniciar sesión
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default ResetPassword;
