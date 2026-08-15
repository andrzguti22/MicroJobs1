import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import { Loader2, MailCheck } from "lucide-react";
import { API_URL } from "../api/client";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [sent, setSent] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Ingresa tu correo electrónico");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!response.ok) {
        throw new Error("No se pudo procesar la solicitud");
      }

      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error, intenta de nuevo más tarde");
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
            {sent ? (
              <div className="text-center">
                <MailCheck className="mx-auto text-primary mb-3" size={40} />

                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  Revisa tu correo
                </h2>

                <p className="text-gray-500 dark:text-gray-300 text-sm">
                  Si el correo <span className="font-semibold">{email}</span> está
                  registrado, te enviamos un enlace para restablecer tu contraseña.
                  Revisa también tu carpeta de spam.
                </p>

                <Link
                  to="/login"
                  className="inline-block mt-6 text-primary hover:underline text-sm"
                >
                  Volver a iniciar sesión
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  Recuperar contraseña
                </h2>

                <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
                  Ingresa tu correo electrónico y te enviaremos instrucciones para
                  restablecer tu contraseña.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-3 border rounded-lg dark:bg-slate-700 dark:text-white"
                  />

                  {error && <span className="text-red-500 text-sm">{error}</span>}

                  <button
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? "Enviando..." : "Enviar instrucciones"}
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

export default ForgotPassword;
