import { useContext, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import { UserContext } from "../context/UserContext";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function VerifyEmail() {
  const { token } = useParams();
  const { user, saveUser } = useContext(UserContext);

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  // El token de verificación se consume (se borra) la primera vez que se
  // usa con éxito. En desarrollo, <StrictMode> ejecuta los useEffect dos
  // veces a propósito para detectar efectos no idempotentes -- sin esta
  // guardia, la 2da ejecución llegaría con el token ya borrado y
  // mostraría "enlace no válido" aunque la verificación real sí funcionó.
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const verify = async () => {
      try {
        const response = await fetch("http://localhost:8000/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail || "No se pudo verificar el correo");
        }

        setStatus("success");
        setMessage(data.message || "Correo verificado correctamente");

        // Si el usuario ya tiene sesión activa en este navegador,
        // actualizamos su estado para que el aviso desaparezca al instante.
        if (user) {
          saveUser({ email_verified: true });
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "El enlace no es válido o ya expiró");
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="bg-secondary min-h-screen flex flex-col dark:bg-slate-900">
      <Navbar />
      <PageWrapper>
        <div className="flex flex-1 items-center justify-center pt-36 px-4">
          <div className="bg-white p-8 rounded-xl shadow w-full max-w-[400px] text-center dark:bg-slate-800">
            {status === "loading" && (
              <>
                <Loader2 className="mx-auto text-primary mb-3 animate-spin" size={40} />
                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  Verificando tu correo...
                </h2>
                <p className="text-gray-500 dark:text-gray-300 text-sm">
                  Esto solo toma un momento.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40} />
                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  ¡Correo verificado!
                </h2>
                <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
                  {message}
                </p>
                <Link
                  to="/dashboard"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:scale-105 transition duration-300"
                >
                  Ir a mi dashboard
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="mx-auto text-red-500 mb-3" size={40} />
                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  No pudimos verificar tu correo
                </h2>
                <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
                  {message}
                </p>
                <Link
                  to="/dashboard"
                  className="text-primary hover:underline text-sm"
                >
                  Volver al dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default VerifyEmail;