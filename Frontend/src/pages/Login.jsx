import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useContext(UserContext);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();

    const success = await loginUser(form.email, form.password);

    if (!success) {
      setError("Credenciales inválidas");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="bg-secondary min-h-screen flex flex-col dark:bg-slate-900">
      <Navbar />
      <PageWrapper>
        <div className="flex flex-1 pt-36">
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <img src="/Login.png" alt="login" className="w-[350px] rounded-xl" />
          </div>

          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow w-[350px] dark:bg-slate-800">
              <h2 className="text-2xl font-bold mb-2 dark:text-white">¡Bienvenido!</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="p-3 border rounded-lg dark:bg-slate-700 dark:text-white"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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

                <div className="text-right -mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {error && <span className="text-red-500 text-sm">{error}</span>}

                <button className="bg-primary text-white py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300">
                  Iniciar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default Login;
